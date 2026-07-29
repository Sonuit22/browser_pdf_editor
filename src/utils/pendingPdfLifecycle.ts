import type { PendingPdfFile } from '../modules/pdf/context/pdfEngineStore';

export async function loadPendingPdfFile(
    pending: PendingPdfFile,
    getCurrentPending: () => PendingPdfFile | null,
    loadPdfFile: (file: File) => Promise<boolean>,
    clearPending: () => void,
) {
    const loaded = await loadPdfFile(pending.file);
    if (loaded && getCurrentPending() === pending) clearPending();
    return loaded;
}
