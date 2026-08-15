import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { protectPdf } from '../src/modules/protection/protectPdfService';
import { inspectUnlockPdf, unlockPdf } from '../src/modules/protection/unlockPdfService';
import { createFilledPdf, inspectNativeFormFields } from '../src/modules/pdf/forms/fillFormService';
import type { SignatureAnnotation, TextAnnotation } from '../src/modules/pdf/editor/types/annotations';
import type { WorkingPage } from '../src/modules/pdf/organization/types/pages';
import { filterTools, toolRegistry } from '../src/config/toolRegistry';
import { getSeoForPath } from '../src/config/seo';

const asFile = (bytes: Uint8Array, name = 'document.pdf') => Object.assign(new Blob([bytes.slice().buffer as ArrayBuffer], { type: 'application/pdf' }), { name, lastModified: 0 }) as File;
const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEAQH/2p7nGQAAAABJRU5ErkJggg==';

describe('Unlock PDF', () => {
    it('is searchable and exposed only through its real local workspace', () => {
        expect(filterTools('All', 'remove pdf password').map((tool) => tool.id)).toContain('unlock');
        expect(toolRegistry.find((tool) => tool.id === 'unlock')).toMatchObject({ status: 'available', surface: 'unlock-workspace' });
        expect(getSeoForPath('/unlock-pdf').index).toBe(true);
    });
    it('requires the correct password and exports a verified unencrypted PDF', async () => {
        const source = await PDFDocument.create();
        source.addPage([300, 400]).drawText('Private document');
        const protectedBlob = await protectPdf(asFile(await source.save()), 'Correct-Password-42!');
        const protectedFile = asFile(new Uint8Array(await protectedBlob.arrayBuffer()), 'private.pdf');
        expect(await inspectUnlockPdf(protectedFile)).toMatchObject({ encrypted: true });
        await expect(unlockPdf(protectedFile, 'wrong-password')).rejects.toThrow('INCORRECT_PASSWORD');

        const result = await unlockPdf(protectedFile, 'Correct-Password-42!');
        const output = await PDFDocument.load(await result.blob.arrayBuffer(), { ignoreEncryption: false });
        expect(result.pageCount).toBe(1);
        expect(output.getPageCount()).toBe(1);
    });
});

describe('Fill Form PDF', () => {
    it('registers Fill Form as Beta and keeps Translate honestly unavailable', () => {
        expect(filterTools('All', 'complete pdf form').map((tool) => tool.id)).toContain('fill-form');
        expect(filterTools('All', 'pdf language translator').map((tool) => tool.id)).toContain('translate');
        expect(toolRegistry.find((tool) => tool.id === 'fill-form')).toMatchObject({ status: 'beta', surface: 'pdf-workspace' });
        expect(toolRegistry.find((tool) => tool.id === 'translate')).toMatchObject({ status: 'coming-soon', enabled: false, surface: 'tool-info' });
        expect(getSeoForPath('/translate-pdf').index).toBe(false);
    });
    it('detects native fields and preserves native values plus manual objects in export', async () => {
        const source = await PDFDocument.create();
        const page = source.addPage([612, 792]);
        const form = source.getForm();
        const name = form.createTextField('applicant.name'); name.addToPage(page, { x: 60, y: 680, width: 220, height: 28 });
        const accepted = form.createCheckBox('terms.accepted'); accepted.addToPage(page, { x: 60, y: 630, width: 22, height: 22 });
        const plan = form.createDropdown('plan'); plan.addOptions(['Student', 'Office']); plan.addToPage(page, { x: 60, y: 580, width: 150, height: 28 });
        const bytes = await source.save();
        const file = asFile(bytes, 'application.pdf');
        const workingPage: WorkingPage = { id: 'page-1', kind: 'source', sourceDocumentId: 'source-1', sourcePageIndex: 0, width: 612, height: 792, rotation: 0, duplicatedFromPageId: null };
        const inspection = await inspectNativeFormFields(file, [workingPage]);
        expect(inspection.supportedFieldCount).toBe(3);
        expect(inspection.unsupportedFieldCount).toBe(0);
        expect(inspection.annotationsByPageId[workingPage.id]).toHaveLength(3);

        const base = { pageId: workingPage.id, zIndex: 10, opacity: 1, rotation: 0, strokeColor: '#178a49', strokeWidth: 0, fillColor: 'transparent', createdAt: 1, updatedAt: 1 };
        const text: TextAnnotation = { ...base, id: 'manual-text', type: 'text', x: 60, y: 500, width: 180, height: 40, text: 'Submitted online', fontSize: 15, fontFamily: 'Helvetica', bold: false, italic: false, underline: false, color: '#111111', backgroundColor: '#ffffff', backgroundOpacity: 0, borderColor: '#178a49', borderWidth: 0, padding: 4, lineHeight: 1.2, letterSpacing: 0, align: 'left' };
        const date: SignatureAnnotation = { ...base, id: 'manual-date', type: 'signature', x: 60, y: 450, width: 120, height: 30, source: png, signatureKind: 'date', aspectRatio: 4, dateValue: '2026-08-15' };
        const checkmark: SignatureAnnotation = { ...base, id: 'manual-check', type: 'signature', x: 250, y: 450, width: 28, height: 28, source: png, signatureKind: 'checkmark', aspectRatio: 1 };
        const outputBytes = await createFilledPdf(file, [workingPage], { [workingPage.id]: [...inspection.annotationsByPageId[workingPage.id], text, date, checkmark] }, { ...inspection.formValues, 'applicant.name': 'Asha Kumar', 'terms.accepted': true, plan: ['Student'] });
        const output = await PDFDocument.load(outputBytes);
        expect(output.getForm().getTextField('applicant.name').getText()).toBe('Asha Kumar');
        expect(output.getForm().getCheckBox('terms.accepted').isChecked()).toBe(true);
        expect(output.getForm().getDropdown('plan').getSelected()).toEqual(['Student']);
        expect(output.getPageCount()).toBe(1);
        expect(outputBytes.byteLength).toBeGreaterThan(bytes.byteLength);
    });
});
