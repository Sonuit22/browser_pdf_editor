import { useContext } from 'react';
import { PdfUtilitiesContext } from '../context/utilityStore';

export function usePdfUtilities() {
    const utilities = useContext(PdfUtilitiesContext);
    if (!utilities) throw new Error('usePdfUtilities must be used inside PdfUtilitiesProvider');
    return utilities;
}
