import { useContext } from 'react';
import { PdfPageOperationsContext } from '../context/pageOperationsStore';

export function usePdfPageOperations() {
    const operations = useContext(PdfPageOperationsContext);
    if (!operations) throw new Error('usePdfPageOperations must be used inside PdfPageOperationsProvider');
    return operations;
}
