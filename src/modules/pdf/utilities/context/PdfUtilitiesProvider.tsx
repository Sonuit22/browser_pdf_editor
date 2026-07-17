import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePdfEngine } from '../../hooks/usePdfEngine';
import { usePdfPageOperations } from '../../organization/hooks/usePdfPageOperations';
import { defaultUtilitySettings, type CropBox, type CropSettings, type HeaderFooterSettings, type MetadataSettings, type PageNumberSettings, type UtilitySettings, type WatermarkSettings } from '../types/utilities';
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
    const updateCropSettings = useCallback((patch: Partial<CropSettings>) => setSettings((current) => ({ ...current, crop: { ...current.crop, ...patch } })), []);
    const setCropDraft = useCallback((pageId: string, crop: CropBox) => setSettings((current) => ({ ...current, crop: { ...current.crop, draftByPageId: { ...current.crop.draftByPageId, [pageId]: crop } } })), []);
    const cancelCrop = useCallback((pageId: string) => setSettings((current) => ({ ...current, crop: { ...current.crop, draftByPageId: Object.fromEntries(Object.entries(current.crop.draftByPageId).filter(([draftPageId]) => draftPageId !== pageId)) } })), []);
    const applyCrops = useCallback((cropsByPageId: Record<string, CropBox>) => setSettings((current) => ({ ...current, cropsByPageId: { ...current.cropsByPageId, ...cropsByPageId }, crop: { ...current.crop, draftByPageId: Object.fromEntries(Object.entries(current.crop.draftByPageId).filter(([pageId]) => !Object.prototype.hasOwnProperty.call(cropsByPageId, pageId))) } })), []);
    const resetCrop = useCallback((pageIds: string[]) => setSettings((current) => ({ ...current, cropsByPageId: Object.fromEntries(Object.entries(current.cropsByPageId).filter(([pageId]) => !pageIds.includes(pageId))), crop: { ...current.crop, draftByPageId: Object.fromEntries(Object.entries(current.crop.draftByPageId).filter(([pageId]) => !pageIds.includes(pageId))) } })), []);
    const resetWatermark = useCallback(() => setSettings((current) => ({ ...current, watermark: defaultUtilitySettings.watermark })), []);
    const resetPageNumbers = useCallback(() => setSettings((current) => ({ ...current, pageNumbers: defaultUtilitySettings.pageNumbers })), []);
    const resetHeaderFooter = useCallback(() => setSettings((current) => ({ ...current, headerFooter: defaultUtilitySettings.headerFooter })), []);
    const value = useMemo(() => ({ ...settings, updateWatermark, updatePageNumbers, updateHeaderFooter, updateMetadata, updateCropSettings, setCropDraft, cancelCrop, applyCrops, resetCrop, resetWatermark, resetPageNumbers, resetHeaderFooter }), [applyCrops, cancelCrop, resetCrop, resetHeaderFooter, resetPageNumbers, resetWatermark, setCropDraft, settings, updateCropSettings, updateHeaderFooter, updateMetadata, updatePageNumbers, updateWatermark]);
    return <PdfUtilitiesContext.Provider value={value}>{children}</PdfUtilitiesContext.Provider>;
}
