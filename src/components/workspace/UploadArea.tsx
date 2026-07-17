import { useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
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
            <h2 id="upload-title">Drop a PDF here</h2>
            <p>or</p>
            <Button type="button" onClick={(event) => { event.stopPropagation(); openFilePicker(); }}>Open PDF</Button>
            <p className="upload-area__privacy">Your file stays on your device. No server upload required.</p>
            <p className="upload-area__hint">PDF only, up to {Math.round(MAX_PDF_FILE_SIZE / 1024 / 1024)} MB.</p>
        </section>
    );
}
