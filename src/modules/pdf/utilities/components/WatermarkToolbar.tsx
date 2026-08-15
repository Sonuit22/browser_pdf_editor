import { Download, Stamp } from 'lucide-react';

export function WatermarkToolbar({ onExport, exporting }: { onExport: () => void; exporting: boolean }) {
    return <div className="watermark-actions" role="toolbar" aria-label="Watermark PDF actions">
        <span><Stamp size={17} aria-hidden="true" />Apply the watermark settings above, then download the PDF.</span>
        <button type="button" disabled={exporting} onClick={onExport}><Download size={17} aria-hidden="true" />{exporting ? 'Preparing…' : 'Download Watermarked PDF'}</button>
    </div>;
}
