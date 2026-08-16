import { useState } from 'react';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import { PdfViewer } from '../../viewer/PdfViewer';
import { WatermarkSection } from './UtilityWorkspace';

export function WatermarkWorkspace() {
    const [settingsOpen, setSettingsOpen] = useState(true);
    const collapseSettingsOnPhone = () => {
        if (window.matchMedia('(max-width: 767px)').matches) setSettingsOpen(false);
    };
    return <section className="utility-workspace watermark-workspace" aria-label="Watermark PDF controls">
        <div className="utility-workspace__intro"><div><p className="eyebrow">Local PDF watermarking</p><h2>Add a watermark</h2><p><ShieldCheck size={16} aria-hidden="true" /> Add text or an image to selected PDF pages. Your document stays in this browser.</p></div></div>
        <div className="watermark-workspace__layout">
            <details className="watermark-settings" open={settingsOpen} onToggle={(event) => setSettingsOpen(event.currentTarget.open)}>
                <summary><span>Watermark settings<small>Choose pages, appearance and position</small></span><ChevronDown size={18} aria-hidden="true" /></summary>
                <div className="utility-grid utility-grid--watermark"><WatermarkSection onApplied={collapseSettingsOnPhone} /></div>
            </details>
            <div className="watermark-preview-panel"><div className="watermark-preview-panel__heading"><strong>Document preview</strong><span>Apply settings to update the preview.</span></div><PdfViewer /></div>
        </div>
    </section>;
}
