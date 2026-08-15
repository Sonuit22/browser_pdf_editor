import { PDF } from '@libpdf/core';
import { PDFDocument } from 'pdf-lib';

export type UnlockInspection = { encrypted: boolean; pageCount: number | null };
export type UnlockResult = { blob: Blob; pageCount: number };

export async function inspectUnlockPdf(file: File): Promise<UnlockInspection> {
    const bytes = new Uint8Array(await file.arrayBuffer());
    try {
        const pdf = await PDF.load(bytes);
        return { encrypted: pdf.isEncrypted, pageCount: pdf.isAuthenticated ? pdf.getPages().length : null };
    } catch (error) {
        const message = error instanceof Error ? error.message.toLowerCase() : '';
        if (message.includes('password') || message.includes('credential') || message.includes('encrypt')) return { encrypted: true, pageCount: null };
        throw new Error('This PDF is corrupted or uses unsupported protection.');
    }
}

export async function unlockPdf(file: File, password: string): Promise<UnlockResult> {
    const bytes = new Uint8Array(await file.arrayBuffer());
    let pdf: Awaited<ReturnType<typeof PDF.load>>;
    try {
        pdf = await PDF.load(bytes, { credentials: password });
    } catch (error) {
        const message = error instanceof Error ? error.message.toLowerCase() : '';
        if (message.includes('password') || message.includes('credential') || message.includes('auth')) throw new Error('INCORRECT_PASSWORD');
        if (message.includes('unsupported') || message.includes('certificate')) throw new Error('UNSUPPORTED_ENCRYPTION');
        throw error;
    }
    if (!pdf.isEncrypted) throw new Error('NOT_ENCRYPTED');
    if (!pdf.isAuthenticated) throw new Error('INCORRECT_PASSWORD');
    const pageCount = pdf.getPages().length;
    try {
        pdf.removeProtection();
    } catch (error) {
        const message = error instanceof Error ? error.message.toLowerCase() : '';
        if (message.includes('permission') || message.includes('owner')) throw new Error('INSUFFICIENT_PERMISSION');
        throw error;
    }
    const output = await pdf.save({ compressStreams: true });

    const verification = await PDF.load(output);
    if (verification.isEncrypted || !verification.isAuthenticated || verification.getPages().length !== pageCount) throw new Error('OUTPUT_VERIFICATION_FAILED');
    const independent = await PDFDocument.load(output.slice(), { ignoreEncryption: false, updateMetadata: false });
    if (independent.getPageCount() !== pageCount) throw new Error('OUTPUT_VERIFICATION_FAILED');

    return { blob: new Blob([output.slice().buffer as ArrayBuffer], { type: 'application/pdf' }), pageCount };
}

export function unlockErrorMessage(error: unknown) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'INCORRECT_PASSWORD') return 'Incorrect password. Please try again.';
    if (code === 'NOT_ENCRYPTED') return 'This PDF is not password protected.';
    if (code === 'INSUFFICIENT_PERMISSION') return 'This password opens the PDF but does not permit removing protection. Try the owner password.';
    if (code === 'UNSUPPORTED_ENCRYPTION') return 'This PDF uses an unsupported or certificate-based encryption method.';
    return 'The PDF could not be unlocked safely. Your original file is unchanged.';
}
