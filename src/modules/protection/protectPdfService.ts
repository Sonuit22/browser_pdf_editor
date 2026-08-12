import { PDF } from '@libpdf/core';

export type ProtectInspection = { encrypted: boolean; pageCount: number | null };

export async function inspectProtectPdf(file: File): Promise<ProtectInspection> {
    const bytes = new Uint8Array(await file.arrayBuffer());
    try {
        const pdf = await PDF.load(bytes);
        return { encrypted: pdf.isEncrypted, pageCount: pdf.getPages().length };
    } catch (error) {
        const message = error instanceof Error ? error.message.toLowerCase() : '';
        if (message.includes('password') || message.includes('credential') || message.includes('encrypt')) return { encrypted: true, pageCount: null };
        throw new Error('This PDF is corrupted or cannot be read safely.');
    }
}

export async function protectPdf(file: File, password: string) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const pdf = await PDF.load(bytes);
    if (pdf.isEncrypted) throw new Error('This PDF is already password protected.');
    pdf.setProtection({ userPassword: password, algorithm: 'AES-256', encryptMetadata: true });
    const output = await pdf.save({ compressStreams: true });
    const verification = await PDF.load(output, { credentials: password });
    if (!verification.isEncrypted || !verification.isAuthenticated) throw new Error('The encrypted output could not be verified.');
    return new Blob([output.slice().buffer as ArrayBuffer], { type: 'application/pdf' });
}
