import { useEffect, useRef, useState } from 'react';
import { CalendarDays, Check, Download, MousePointer2, RotateCcw, Type } from 'lucide-react';
import { usePdfEditor } from '../editor/hooks/usePdfEditor';
import { usePdfPageOperations } from '../organization/hooks/usePdfPageOperations';
import { inspectNativeFormFields } from './fillFormService';

export function FillFormToolbar({ onExport, exporting }: { onExport: () => void; exporting: boolean }) {
    const editor = usePdfEditor();
    const { activeTool, clearForm, hydrateForm, setTool } = editor;
    const { documentId, pages, getSourceFile } = usePdfPageOperations();
    const inspectedDocument = useRef<string | null>(null);
    const [inspection, setInspection] = useState<{ supported: number; unsupported: number } | null>(null);
    const [inspectionError, setInspectionError] = useState('');

    useEffect(() => {
        if (!documentId || !pages.length || inspectedDocument.current === documentId) return;
        const sourceDocumentId = pages.find((page) => page.sourceDocumentId)?.sourceDocumentId;
        const file = sourceDocumentId ? getSourceFile(sourceDocumentId) : null;
        if (!file) return;
        inspectedDocument.current = documentId;
        let cancelled = false;
        void inspectNativeFormFields(file, pages).then((result) => {
            if (cancelled) return;
            hydrateForm(result.annotationsByPageId, result.formValues);
            setInspection({ supported: result.supportedFieldCount, unsupported: result.unsupportedFieldCount });
        }).catch(() => {
            if (!cancelled) setInspectionError('Native form fields could not be inspected. You can still add text, dates, and checkmarks.');
        });
        return () => { cancelled = true; };
    }, [documentId, getSourceFile, hydrateForm, pages]);

    const tool = (value: 'select' | 'text' | 'checkmark' | 'date') => () => setTool(value);
    return <div className="fill-form-toolbar-wrap">
        <p className="fill-form-privacy">🔒 Processed locally in your browser.</p>
        <div className="fill-form-actions" role="toolbar" aria-label="Fill form tools">
            <button type="button" className={activeTool === 'select' ? 'is-active' : ''} aria-pressed={activeTool === 'select'} onClick={tool('select')}><MousePointer2 size={17} />Select</button>
            <button type="button" className={activeTool === 'text' ? 'is-active' : ''} aria-pressed={activeTool === 'text'} onClick={tool('text')}><Type size={17} />Add Text</button>
            <button type="button" className={activeTool === 'checkmark' ? 'is-active' : ''} aria-pressed={activeTool === 'checkmark'} onClick={tool('checkmark')}><Check size={17} />Add Checkmark</button>
            <button type="button" className={activeTool === 'date' ? 'is-active' : ''} aria-pressed={activeTool === 'date'} onClick={tool('date')}><CalendarDays size={17} />Add Date</button>
            <button type="button" onClick={clearForm}><RotateCcw size={17} />Clear</button>
            <button type="button" className="fill-form-download" disabled={exporting} onClick={onExport}><Download size={17} />{exporting ? 'Preparing…' : 'Download Filled PDF'}</button>
        </div>
        <p className="fill-form-status" role="status">{inspectionError || (inspection ? inspection.supported ? `${inspection.supported} native form field${inspection.supported === 1 ? '' : 's'} ready.${inspection.unsupported ? ` ${inspection.unsupported} unsupported field${inspection.unsupported === 1 ? '' : 's'} preserved.` : ''}` : 'No native AcroForm fields found. Add text, dates, and checkmarks where needed.' : 'Checking for native form fields…')}</p>
    </div>;
}
