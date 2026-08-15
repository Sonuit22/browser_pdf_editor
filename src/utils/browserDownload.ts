let lastDownload: { key: string; startedAt: number } | null = null;

export function downloadBlob(blob: Blob, filename: string) {
    const key = `${filename}:${blob.type}:${blob.size}`;
    const now = Date.now();
    if (lastDownload?.key === key && now - lastDownload.startedAt < 1_000) return false;
    let url: string | null = null;
    let anchor: HTMLAnchorElement | null = null;
    try {
        url = URL.createObjectURL(blob);
        anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        anchor.style.display = 'none';
        document.body.append(anchor);
        anchor.click();
        lastDownload = { key, startedAt: now };
    } catch {
        if (url) URL.revokeObjectURL(url);
        throw new Error('The download could not be started. Check browser download permissions and try again.');
    } finally {
        anchor?.remove();
    }
    window.setTimeout(() => {
        if (url) URL.revokeObjectURL(url);
    }, 60_000);
    return true;
}
