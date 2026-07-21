param([string]$Workspace)
$ErrorActionPreference = 'Stop'
$edgePath = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
$pdfPath = Join-Path $Workspace 'tmp\pdfs\editor-workflow-input.pdf'
$downloadPath = Join-Path $Workspace 'tmp\browser-downloads'
$profilePath = Join-Path $Workspace ('tmp\browser-test\edge-' + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
$viteOut = Join-Path $Workspace 'tmp\browser-test\vite.out.log'
$viteErr = Join-Path $Workspace 'tmp\browser-test\vite.err.log'
$vite = $null
$edge = $null
$socket = $null
$script:requestId = 0
$script:browserErrors = [System.Collections.Generic.List[string]]::new()
function Receive-Cdp([System.Net.WebSockets.ClientWebSocket]$Socket) {
    $memory = [System.IO.MemoryStream]::new()
    try {
        do {
            $buffer = New-Object byte[] 65536
            $segment = [ArraySegment[byte]]::new($buffer)
            $result = $Socket.ReceiveAsync($segment, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
            if ($result.MessageType -eq [System.Net.WebSockets.WebSocketMessageType]::Close) { throw 'Edge closed the DevTools socket.' }
            $memory.Write($buffer, 0, $result.Count)
        } until ($result.EndOfMessage)
        return [Text.Encoding]::UTF8.GetString($memory.ToArray()) | ConvertFrom-Json
    } finally { $memory.Dispose() }
}
function Send-Cdp([string]$Method, [hashtable]$Params = @{}) {
    $script:requestId++
    $id = $script:requestId
    $json = @{ id = $id; method = $Method; params = $Params } | ConvertTo-Json -Compress -Depth 30
    $bytes = [Text.Encoding]::UTF8.GetBytes($json)
    $socket.SendAsync([ArraySegment[byte]]::new($bytes), [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
    while ($true) {
        $message = Receive-Cdp $socket
        if ($message.method -eq 'Runtime.exceptionThrown') { $script:browserErrors.Add(($message.params.exceptionDetails.text | Out-String).Trim()) }
        if ($message.method -eq 'Log.entryAdded' -and $message.params.entry.level -eq 'error') { $script:browserErrors.Add([string]$message.params.entry.text) }
        if ($message.id -eq $id) {
            if ($message.error) { throw "CDP $Method failed: $($message.error.message)" }
            return $message.result
        }
    }
}
function Eval([string]$Expression) {
    $response = Send-Cdp 'Runtime.evaluate' @{ expression = $Expression; returnByValue = $true; awaitPromise = $true }
    if ($response.exceptionDetails) { throw "JavaScript failed: $($response.exceptionDetails.text)" }
    return $response.result.value
}
function Wait-Js([string]$Expression, [int]$Seconds = 20) {
    $deadline = (Get-Date).AddSeconds($Seconds)
    do {
        try { if (Eval $Expression) { return } } catch {}
        Start-Sleep -Milliseconds 200
    } while ((Get-Date) -lt $deadline)
    throw "Timed out waiting for: $Expression"
}
function Dispatch-Mouse([string]$Type, [double]$X, [double]$Y, [string]$Button = 'none') {
    $params = @{ type = $Type; x = $X; y = $Y; button = $Button; clickCount = 1 }
    Send-Cdp 'Input.dispatchMouseEvent' $params | Out-Null
}
function Get-Rect([string]$Selector) {
    return Eval "(()=>{const e=document.querySelector('$Selector');if(!e)return null;const r=e.getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height,right:r.right,bottom:r.bottom};})()"
}
try {
    New-Item -ItemType Directory -Force $downloadPath, $profilePath | Out-Null
    $vite = Start-Process -FilePath 'npm.cmd' -ArgumentList @('run','dev','--','--host','127.0.0.1','--port','4174','--strictPort') -WorkingDirectory $Workspace -WindowStyle Hidden -RedirectStandardOutput $viteOut -RedirectStandardError $viteErr -PassThru
    $deadline = (Get-Date).AddSeconds(30)
    do {
        try { $ok = (Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:4174/edit').StatusCode -eq 200 } catch { $ok = $false }
        if ($ok) { break }
        Start-Sleep -Milliseconds 250
    } while ((Get-Date) -lt $deadline)
    if (-not $ok) { throw 'Vite did not start.' }
    $edgeArgs = @('--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=9224','--window-size=1440,1000',"--user-data-dir=$profilePath",'http://127.0.0.1:4174/edit')
    $edge = Start-Process -FilePath $edgePath -ArgumentList $edgeArgs -WindowStyle Hidden -PassThru
    $deadline = (Get-Date).AddSeconds(20)
    do {
        try { $targets = Invoke-RestMethod 'http://127.0.0.1:9224/json/list'; $target = $targets | Where-Object { $_.type -eq 'page' -and $_.url -like 'http://127.0.0.1:4174/*' } | Select-Object -First 1 } catch { $target = $null }
        if ($target) { break }
        Start-Sleep -Milliseconds 250
    } while ((Get-Date) -lt $deadline)
    if (-not $target) { throw 'Edge DevTools target did not appear.' }
    $socket = [System.Net.WebSockets.ClientWebSocket]::new()
    $socket.ConnectAsync([Uri]$target.webSocketDebuggerUrl, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
    Send-Cdp 'Runtime.enable' | Out-Null
    Send-Cdp 'DOM.enable' | Out-Null
    Send-Cdp 'Log.enable' | Out-Null
    Send-Cdp 'Browser.setDownloadBehavior' @{ behavior = 'allow'; downloadPath = $downloadPath; eventsEnabled = $true } | Out-Null
    Wait-Js "document.querySelector('input[type=file]')!==null"
    $doc = Send-Cdp 'DOM.getDocument' @{ depth = 2 }
    $input = Send-Cdp 'DOM.querySelector' @{ nodeId = $doc.root.nodeId; selector = '.upload-area input[type=file]' }
    if (-not $input.nodeId) { throw 'Upload input not found.' }
    Send-Cdp 'DOM.setFileInputFiles' @{ nodeId = $input.nodeId; files = @($pdfPath) } | Out-Null
    Wait-Js "document.querySelector('.annotation-overlay')!==null" 30
    $overlay = Get-Rect '.annotation-overlay'
    if (-not $overlay -or $overlay.width -lt 100) { throw 'PDF overlay did not render.' }
    $hx = [Math]::Round($overlay.left + [Math]::Min(280, $overlay.width * .35), 1)
    $hy = [Math]::Round($overlay.top + [Math]::Min(180, $overlay.height * .25), 1)
    Eval "[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Highlighter').click();true" | Out-Null
    Wait-Js "document.querySelector('#highlighter-settings-popover')!==null"
    Eval "document.querySelector('button[aria-label=\"Light Green highlighter\"]').click();const r=document.querySelectorAll('#highlighter-settings-popover input[type=range]');r[0].value='42';r[0].dispatchEvent(new Event('input',{bubbles:true}));r[1].value='28';r[1].dispatchEvent(new Event('input',{bubbles:true}));true" | Out-Null
    Dispatch-Mouse 'mouseMoved' $hx $hy
    Start-Sleep -Milliseconds 150
    $cursor = Eval "(()=>{const e=document.querySelector('.highlighter-pointer-indicator');return e?{background:e.style.backgroundColor,width:e.style.width}:null})()"
    if (-not $cursor -or $cursor.width -ne '28px' -or $cursor.background -notmatch '155, 231, 165') { throw "Highlighter cursor did not reflect settings: $($cursor | ConvertTo-Json -Compress)" }
    Dispatch-Mouse 'mousePressed' $hx $hy 'left'
    1..8 | ForEach-Object { Dispatch-Mouse 'mouseMoved' ($hx + $_ * 22) ($hy + [Math]::Sin($_) * 5) 'left' }
    Dispatch-Mouse 'mouseReleased' ($hx + 176) $hy 'left'
    Wait-Js "document.querySelectorAll('.annotation-highlight-path path[data-annotation-id]').length===1"
    $highlightState = Eval "({popover:!!document.querySelector('#highlighter-settings-popover'),cursor:!!document.querySelector('.highlighter-pointer-indicator'),selectActive:document.querySelector('button[aria-label=\"Select objects\"]').getAttribute('aria-pressed'),thumbnailInk:(()=>{const c=document.querySelector('.pdf-thumbnail__annotation-canvas');if(!c||!c.width)return 0;const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]){n++;if(n>10)break}return n})()})"
    if ($highlightState.popover -or $highlightState.cursor -or $highlightState.selectActive -ne 'true' -or $highlightState.thumbnailInk -le 0) { throw "Highlighter completion state failed: $($highlightState | ConvertTo-Json -Compress)" }
    Eval "[...document.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')==='Add Shape').click();true" | Out-Null
    $sx = $hx + 40; $sy = $hy + 90
    Dispatch-Mouse 'mousePressed' $sx $sy 'left'; Dispatch-Mouse 'mouseMoved' ($sx + 150) ($sy + 90) 'left'; Dispatch-Mouse 'mouseReleased' ($sx + 150) ($sy + 90) 'left'
    Wait-Js "document.querySelector('.annotation-shape-wrap.annotation-item--selected')!==null"
    if ((Eval "document.querySelector('button[aria-label=\"Select objects\"]').getAttribute('aria-pressed')") -ne 'true') { throw 'Shape creation did not return to Select.' }
    $shapeBefore = Get-Rect '.annotation-shape-wrap'
    $cx = $shapeBefore.left + $shapeBefore.width/2; $cy = $shapeBefore.top + $shapeBefore.height/2
    Dispatch-Mouse 'mousePressed' $cx $cy 'left'; Dispatch-Mouse 'mouseMoved' ($cx + 70) ($cy + 35) 'left'; Dispatch-Mouse 'mouseReleased' ($cx + 70) ($cy + 35) 'left'
    $shapeMoved = Get-Rect '.annotation-shape-wrap'
    if ([Math]::Abs($shapeMoved.left - $shapeBefore.left) -lt 40) { throw 'Shape did not move.' }
    $handle = Get-Rect '.annotation-shape-wrap .resize-handle--se'
    Dispatch-Mouse 'mousePressed' ($handle.left+$handle.width/2) ($handle.top+$handle.height/2) 'left'; Dispatch-Mouse 'mouseMoved' ($handle.left+$handle.width/2+60) ($handle.top+$handle.height/2+45) 'left'; Dispatch-Mouse 'mouseReleased' ($handle.left+$handle.width/2+60) ($handle.top+$handle.height/2+45) 'left'
    $shapeResized = Get-Rect '.annotation-shape-wrap'
    if ($shapeResized.width -le $shapeMoved.width + 30) { throw 'Shape did not resize.' }
    Dispatch-Mouse 'mousePressed' ($overlay.left+15) ($overlay.top+15) 'left'; Dispatch-Mouse 'mouseReleased' ($overlay.left+15) ($overlay.top+15) 'left'
    if (Eval "document.querySelector('.annotation-shape-wrap').classList.contains('annotation-item--selected')") { throw 'Shape did not deselect.' }
    $shape = Get-Rect '.annotation-shape-wrap'; Dispatch-Mouse 'mousePressed' ($shape.left+$shape.width/2) ($shape.top+$shape.height/2) 'left'; Dispatch-Mouse 'mouseReleased' ($shape.left+$shape.width/2) ($shape.top+$shape.height/2) 'left'
    if (-not (Eval "document.querySelector('.annotation-shape-wrap').classList.contains('annotation-item--selected')")) { throw 'Shape did not reselect.' }
    Eval "document.querySelector('button[aria-label=\"Delete selected object\"]').click();true" | Out-Null
    Wait-Js "document.querySelector('.annotation-shape-wrap')===null"
    Eval "document.querySelector('button[aria-label=\"Add Text\"]').click();true" | Out-Null
    $tx=$hx+10; $ty=$hy+210
    Dispatch-Mouse 'mousePressed' $tx $ty 'left'; Dispatch-Mouse 'mouseReleased' $tx $ty 'left'
    Wait-Js "document.querySelector('.annotation-text textarea')!==null"
    Eval "const t=document.querySelector('.annotation-text textarea');t.value='Browser tested text';t.dispatchEvent(new Event('input',{bubbles:true}));t.blur();true" | Out-Null
    $textBefore=Get-Rect '.annotation-text'; $tcx=$textBefore.left+$textBefore.width/2; $tcy=$textBefore.top+$textBefore.height/2
    Dispatch-Mouse 'mousePressed' $tcx $tcy 'left'; Dispatch-Mouse 'mouseMoved' ($tcx+45) ($tcy+20) 'left'; Dispatch-Mouse 'mouseReleased' ($tcx+45) ($tcy+20) 'left'
    $textOnce=Get-Rect '.annotation-text'; $tcx=$textOnce.left+$textOnce.width/2; $tcy=$textOnce.top+$textOnce.height/2
    Dispatch-Mouse 'mousePressed' $tcx $tcy 'left'; Dispatch-Mouse 'mouseMoved' ($tcx+35) ($tcy+15) 'left'; Dispatch-Mouse 'mouseReleased' ($tcx+35) ($tcy+15) 'left'
    $textTwice=Get-Rect '.annotation-text'
    if ($textTwice.left -le $textBefore.left + 50) { throw 'Text did not move twice.' }
    $textHandle=Get-Rect '.annotation-text .resize-handle--se'
    Dispatch-Mouse 'mousePressed' ($textHandle.left+$textHandle.width/2) ($textHandle.top+$textHandle.height/2) 'left'; Dispatch-Mouse 'mouseMoved' ($textHandle.left+$textHandle.width/2+50) ($textHandle.top+$textHandle.height/2+25) 'left'; Dispatch-Mouse 'mouseReleased' ($textHandle.left+$textHandle.width/2+50) ($textHandle.top+$textHandle.height/2+25) 'left'
    $resizedWidth=(Get-Rect '.annotation-text').width
    Eval "document.querySelector('button[aria-label=\"Undo\"]').click();true" | Out-Null; Start-Sleep -Milliseconds 100
    $undoWidth=(Get-Rect '.annotation-text').width
    Eval "document.querySelector('button[aria-label=\"Redo\"]').click();true" | Out-Null; Start-Sleep -Milliseconds 100
    $redoWidth=(Get-Rect '.annotation-text').width
    if (-not ($undoWidth -lt $resizedWidth -and [Math]::Abs($redoWidth-$resizedWidth) -lt 2)) { throw "Undo/redo resize failed: $undoWidth $resizedWidth $redoWidth" }
    Eval "document.querySelector('button[aria-label=\"Export edited PDF\"]').click();true" | Out-Null
    $expected = Join-Path $downloadPath 'editor-workflow-input-edited.pdf'
    $deadline=(Get-Date).AddSeconds(30); do { if (Test-Path $expected) { break }; Start-Sleep -Milliseconds 250 } while ((Get-Date)-lt $deadline)
    if (-not (Test-Path $expected)) { throw 'Edited PDF was not downloaded.' }
    if ($script:browserErrors.Count) { throw ('Browser runtime errors: ' + ($script:browserErrors -join ' | ')) }
    [pscustomobject]@{ highlighterCursor=$cursor; highlighter=$highlightState; shapeMovedPixels=[Math]::Round($shapeMoved.left-$shapeBefore.left,1); shapeResizedPixels=[Math]::Round($shapeResized.width-$shapeMoved.width,1); textMovedPixels=[Math]::Round($textTwice.left-$textBefore.left,1); undoWidth=$undoWidth; redoWidth=$redoWidth; downloaded=$expected; browserErrors=$script:browserErrors.Count } | ConvertTo-Json -Depth 8
} finally {
    if ($socket) { try { $socket.Dispose() } catch {} }
    if ($edge -and -not $edge.HasExited) { Stop-Process -Id $edge.Id -Force -ErrorAction SilentlyContinue }
    if ($vite -and -not $vite.HasExited) { Stop-Process -Id $vite.Id -Force -ErrorAction SilentlyContinue }
    try { $listener = Get-NetTCPConnection -LocalPort 4174 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1; if ($listener) { Stop-Process -Id $listener.OwningProcess -Force -ErrorAction SilentlyContinue } } catch {}
}