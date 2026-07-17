import { useContext } from 'react';
import { PdfEngineContext } from '../context/pdfEngineStore';

export function usePdfEngine() {
    const engine = useContext(PdfEngineContext);
    if (!engine) throw new Error('usePdfEngine must be used inside PdfEngineProvider');
    return engine;
}
