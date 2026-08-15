import { ShieldCheck } from 'lucide-react';
import { PdfViewer } from '../../viewer/PdfViewer';
import { WatermarkSection } from './UtilityWorkspace';

export function WatermarkWorkspace() {
    return <section className="utility-workspace watermark-workspace" aria-label="Watermark PDF controls">
        <div className="utility-workspace__intro"><div><p className="eyebrow">Local PDF watermarking</p><h2>Add a watermark</h2><p><ShieldCheck size={16} aria-hidden="true" /> Add text or an image to selected PDF pages. Your document stays in this browser.</p></div></div>
        <div className="utility-grid utility-grid--watermark"><WatermarkSection /></div>
        <PdfViewer />
    </section>;
}
