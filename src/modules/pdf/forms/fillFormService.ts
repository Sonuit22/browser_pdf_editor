import {
    PDFCheckBox,
    PDFDocument,
    PDFDropdown,
    PDFOptionList,
    PDFRadioGroup,
    PDFTextField,
} from 'pdf-lib';
import type { WorkingPage } from '../organization/types/pages';
import type { EditorPresent, PdfAnnotation } from '../editor/types/annotations';
import { applyAcroForm, drawAnnotations } from '../editor/services/pdfExportService';
import { safePdfFilename } from '../organization/utils/pageUtils';

export type NativeFormInspection = {
    annotationsByPageId: Record<string, PdfAnnotation[]>;
    formValues: EditorPresent['formValues'];
    supportedFieldCount: number;
    unsupportedFieldCount: number;
};

const annotationBase = (id: string, pageId: string, rect: { x: number; y: number; width: number; height: number }, readOnly: boolean) => ({
    id, pageId, ...rect, zIndex: 1_000_000, opacity: 1, rotation: 0, strokeColor: '#178a49', strokeWidth: 1,
    fillColor: 'transparent', locked: true, native: true, readOnly, createdAt: Date.now(), updatedAt: Date.now(),
});

function pageIndexForWidget(pdf: PDFDocument, pageRef: string | undefined) {
    if (!pageRef) return -1;
    return pdf.getPages().findIndex((page) => page.ref.toString() === pageRef);
}

function addAnnotation(target: Record<string, PdfAnnotation[]>, annotation: PdfAnnotation) {
    target[annotation.pageId] = [...(target[annotation.pageId] ?? []), annotation];
}

export async function inspectNativeFormFields(file: File, pages: WorkingPage[]): Promise<NativeFormInspection> {
    const pdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: false, updateMetadata: false });
    const annotationsByPageId: Record<string, PdfAnnotation[]> = {};
    const formValues: EditorPresent['formValues'] = {};
    let supportedFieldCount = 0;
    let unsupportedFieldCount = 0;
    const workingPageId = (sourcePageIndex: number) => pages.find((page) => page.sourcePageIndex === sourcePageIndex)?.id;

    for (const field of pdf.getForm().getFields()) {
        const name = field.getName();
        const widgets = field.acroField.getWidgets();
        const readOnly = field.isReadOnly();
        const required = field.isRequired();
        if (field instanceof PDFTextField) formValues[name] = field.getText() ?? '';
        else if (field instanceof PDFCheckBox) formValues[name] = field.isChecked();
        else if (field instanceof PDFRadioGroup) formValues[name] = field.getSelected() ?? '';
        else if (field instanceof PDFDropdown || field instanceof PDFOptionList) formValues[name] = field.getSelected();
        else { unsupportedFieldCount += 1; continue; }

        let mappedWidgets = 0;
        widgets.forEach((widget, widgetIndex) => {
            const sourcePageIndex = pageIndexForWidget(pdf, widget.P()?.toString());
            const pageId = workingPageId(sourcePageIndex);
            if (!pageId) return;
            const rect = widget.getRectangle();
            const id = `native-form-${field.ref.toString()}-${widgetIndex}`;
            const base = annotationBase(id, pageId, rect, readOnly);
            if (field instanceof PDFTextField) addAnnotation(annotationsByPageId, { ...base, type: 'form-text', name, required, multiline: field.isMultiline(), defaultValue: field.getText() ?? '' });
            else if (field instanceof PDFCheckBox) addAnnotation(annotationsByPageId, { ...base, type: 'form-checkbox', name, required, defaultValue: field.isChecked() });
            else if (field instanceof PDFRadioGroup) {
                const option = widget.getOnValue()?.decodeText() ?? field.getOptions()[widgetIndex] ?? `Option ${widgetIndex + 1}`;
                addAnnotation(annotationsByPageId, { ...base, type: 'form-radio', name, required, option, defaultValue: field.getSelected() ?? '' });
            } else {
                const choice = field as PDFDropdown | PDFOptionList;
                addAnnotation(annotationsByPageId, { ...base, type: 'form-choice', name, required, options: choice.getOptions(), multiple: field instanceof PDFOptionList && field.isMultiselect(), defaultValue: choice.getSelected() });
            }
            mappedWidgets += 1;
        });
        if (mappedWidgets) supportedFieldCount += 1;
        else unsupportedFieldCount += 1;
    }
    return { annotationsByPageId, formValues, supportedFieldCount, unsupportedFieldCount };
}

export async function createFilledPdf(file: File, pages: WorkingPage[], annotationsByPageId: Record<string, PdfAnnotation[]>, formValues: EditorPresent['formValues']) {
    const pdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: false, updateMetadata: false });
    applyAcroForm(pdf, formValues, false);
    for (const workingPage of pages) {
        if (workingPage.sourcePageIndex === null) continue;
        const page = pdf.getPage(workingPage.sourcePageIndex);
        await drawAnnotations(pdf, page, (annotationsByPageId[workingPage.id] ?? []).filter((annotation) => !annotation.native));
    }
    const bytes = await pdf.save();
    const verification = await PDFDocument.load(bytes.slice(), { ignoreEncryption: false, updateMetadata: false });
    if (verification.getPageCount() !== pdf.getPageCount()) throw new Error('The filled PDF output could not be verified.');
    return bytes;
}

export function filledFilename(filename: string) {
    return safePdfFilename(filename, 'filled');
}
