import { AppLayout } from './AppLayout';
import { PdfEngineProvider } from '../modules/pdf/context/PdfEngineContext';
import { PdfEditorProvider } from '../modules/pdf/editor/context/PdfEditorProvider';
import { PdfPageOperationsProvider } from '../modules/pdf/organization/context/PdfPageOperationsProvider';
import { PdfUtilitiesProvider } from '../modules/pdf/utilities/context/PdfUtilitiesProvider';

export default function ToolShell() {
    return <PdfEngineProvider><PdfPageOperationsProvider><PdfEditorProvider><PdfUtilitiesProvider><AppLayout /></PdfUtilitiesProvider></PdfEditorProvider></PdfPageOperationsProvider></PdfEngineProvider>;
}
