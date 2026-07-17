import { useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { FileUp } from 'lucide-react';
import { usePdfEngine } from '../../modules/pdf/hooks/usePdfEngine';
import { MAX_PDF_FILE_SIZE } from '../../modules/pdf/types/pdf';
import { Button } from '../ui/Button';

export function UploadArea() {
    const { openFile, openFilePicker, setUploadError } = usePdfEngine();
    const onRejected = useCallback((rejections: FileRejection[]) => {
        const code = rejections[0]?.errors[0]?.code;
        if (code === 'file-too-large') setUploadError(`The selected PDF is larger than the ${Math.round(MAX_PDF_FILE_SIZE / 1024 / 1024)} MB limit.`);
        else if (code === 'file-invalid-type') setUploadError('Only PDF files can be opened in this viewer.');
        else setUploadError('The selected file could not be accepted. Please choose one PDF file.');
    }, [setUploadError]);
    const { getInputProps, getRootProps, isDragActive } = useDropzone({
        accept: { 'application/pdf': ['.pdf'] }, maxSize: MAX_PDF_FILE_SIZE, maxFiles: 1, multiple: false, noClick: true,
        onDropAccepted: ([file]) => { if (file) void openFile(file); }, onDropRejected: onRejected,
    });

    return (
        <section {...getRootProps({ className: `upload-area${isDragActive ? ' is-dragging' : ''}`, 'aria-labelledby': 'upload-title' })}>
            <input {...getInputProps()} />
            <FileUp className="upload-area__icon" size={42} strokeWidth={1.4} aria-hidden="true" />
            <p className="eyebrow">No document selected</p>
            <h2 id="upload-title">Drop PDF Here</h2>
            <p>or</p>
            <Button type="button" onClick={(event) => { event.stopPropagation(); openFilePicker(); }}>Click to Upload</Button>
            <dl className="upload-area__meta"><div><dt>Maximum file size</dt><dd>{Math.round(MAX_PDF_FILE_SIZE / 1024 / 1024)} MB</dd></div><div><dt>Supported formats</dt><dd>PDF only</dd></div></dl>
        </section>
    );
}
