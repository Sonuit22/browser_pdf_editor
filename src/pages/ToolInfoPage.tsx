import { useRef, useState } from 'react';
import { ArrowLeft, FileUp, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { toolRegistry } from '../config/toolRegistry';

const compressionLevels = ['20%', '40%', '60%', '80%', 'Maximum Compression'];

export default function ToolInfoPage() {
    const { pathname } = useLocation();
    const tool = toolRegistry.find((item) => item.route === pathname);
    const input = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [level, setLevel] = useState('');
    if (!tool) return null;
    const isCompress = tool.id === 'compress';
    return <section className="tool-page">
        <Link className="back-link" to="/"><ArrowLeft size={17} aria-hidden="true" />All tools</Link>
        <div className="tool-page__heading"><tool.icon size={28} aria-hidden="true" /><div><p>Local browser tool</p><h1>{tool.title}</h1></div></div>
        <div className="tool-upload">
            <input ref={input} className="sr-only" type="file" accept={isCompress || tool.id.startsWith('pdf-') || tool.id === 'protect' ? 'application/pdf,.pdf' : undefined} onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            <FileUp size={28} aria-hidden="true" /><h2>{file ? file.name : 'Choose a file'}</h2>
            {file && <p>{(file.size / 1024 / 1024).toFixed(2)} MB</p>}
            <button className="button" type="button" onClick={() => input.current?.click()}>{file ? 'Choose another file' : 'Choose File'}</button>
            <p><ShieldCheck size={15} aria-hidden="true" /> Your file stays on this device.</p>
        </div>
        {isCompress && file && <fieldset className="compression-options"><legend>Compression strength</legend><p>Higher strength aims for a smaller file. Actual compression varies by document.</p><div>{compressionLevels.map((item) => <label key={item}><input type="radio" name="compression" value={item} checked={level === item} onChange={() => setLevel(item)} /><span>{item}</span></label>)}</div><button className="button" type="button" disabled={!level} title="Reliable local compression is not yet available">Compress PDF</button></fieldset>}
        <div className="limitation-note" role="note"><strong>Browser-only availability</strong><p>{tool.limitation}</p><p>No file is uploaded or sent to a third party. This tool will remain unavailable until it can run reliably on your device.</p></div>
    </section>;
}
