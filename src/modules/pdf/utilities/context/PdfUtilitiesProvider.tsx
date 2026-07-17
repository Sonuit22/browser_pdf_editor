import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePdfEngine } from '../../hooks/usePdfEngine';
import { usePdfPageOperations } from '../../organization/hooks/usePdfPageOperations';
import { defaultUtilitySettings, type CropBox, type HeaderFooterSettings, type MetadataSettings, type PageNumberSettings, type UtilitySettings, type WatermarkSettings } from '../types/utilities';
import { PdfUtilitiesContext } from './utilityStore';

function metadataFromInfo(info: ReturnType<typeof usePdfEngine>['info']): MetadataSettings {
    const value = (item: string | undefined) => item === 'Not Available' ? '' : item ?? '';
    return { title: value(info?.title), author: value(info?.author), subject: value(info?.subject), keywords: value(info?.keywords), creator: value(info?.creator), producer: value(info?.producer) };
}

export function PdfUtilitiesProvider({ children }: { children: ReactNode }) {
    const { info } = usePdfEngine();
    const { documentId } = usePdfPageOperations();
    const [settings, setSettings] = useState<UtilitySettings>(defaultUtilitySettings);
    useEffect(() => { setSettings({ ...defaultUtilitySettings, metadata: metadataFromInfo(info) }); }, [documentId, info]);
    const updateWatermark = useCallback((patch: Partial<WatermarkSettings>) => setSettings((current) => ({ ...current, watermark: { ...current.watermark, ...patch } })), []);
    const updatePageNumbers = useCallback((patch: Partial<PageNumberSettings>) => setSettings((current) => ({ ...current, pageNumbers: { ...current.pageNumbers, ...patch } })), []);
    const updateHeaderFooter = useCallback((patch: Partial<HeaderFooterSettings>) => setSettings((current) => ({ ...current, headerFooter: { ...current.headerFooter, ...patch } })), []);
    const updateMetadata = useCallback((patch: Partial<MetadataSettings>) => setSettings((current) => ({ ...current, metadata: { ...current.metadata, ...patch } })), []);
    const applyCrop = useCallback((pageIds: string[], crop: CropBox) => setSettings((current) => ({ ...current, cropsByPageId: { ...current.cropsByPageId, ...Object.fromEntries(pageIds.map((pageId) => [pageId, crop])) } })), []);
    const resetCrop = useCallback((pageIds: string[]) => setSettings((current) => ({ ...current, cropsByPageId: Object.fromEntries(Object.entries(current.cropsByPageId).filter(([pageId]) => !pageIds.includes(pageId))) })), []);
    const resetWatermark = useCallback(() => setSettings((current) => ({ ...current, watermark: defaultUtilitySettings.watermark })), []);
    const resetPageNumbers = useCallback(() => setSettings((current) => ({ ...current, pageNumbers: defaultUtilitySettings.pageNumbers })), []);
    const resetHeaderFooter = useCallback(() => setSettings((current) => ({ ...current, headerFooter: defaultUtilitySettings.headerFooter })), []);
    const value = useMemo(() => ({ ...settings, updateWatermark, updatePageNumbers, updateHeaderFooter, updateMetadata, applyCrop, resetCrop, resetWatermark, resetPageNumbers, resetHeaderFooter }), [applyCrop, resetCrop, resetHeaderFooter, resetPageNumbers, resetWatermark, settings, updateHeaderFooter, updateMetadata, updatePageNumbers, updateWatermark]);
    return <PdfUtilitiesContext.Provider value={value}>{children}</PdfUtilitiesContext.Provider>;
}
