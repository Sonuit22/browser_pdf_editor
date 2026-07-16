import { FileUp } from 'lucide-react';
import { Button } from '../ui/Button';

type UploadAreaProps = { onRequestUpload: () => void };

export function UploadArea({ onRequestUpload }: UploadAreaProps) {
    return (
        <section className="upload-area" aria-labelledby="upload-title">
            <FileUp className="upload-area__icon" size={42} strokeWidth={1.4} aria-hidden="true" />
            <p className="eyebrow">No document selected</p>
            <h2 id="upload-title">Drop PDF Here</h2>
            <p>or</p>
            <Button type="button" onClick={onRequestUpload}>Click to Upload</Button>
            <dl className="upload-area__meta">
                <div><dt>Maximum file size</dt><dd>Coming soon</dd></div>
                <div><dt>Supported formats</dt><dd>PDF only</dd></div>
            </dl>
        </section>
    );
}
