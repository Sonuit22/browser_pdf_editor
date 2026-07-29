import { downloadBlob } from '../../../../utils/browserDownload';

export function downloadPdf(bytes: Uint8Array, filename: string) {
    downloadBlob(new Blob([bytes.slice().buffer as ArrayBuffer], { type: 'application/pdf' }), filename);
}
