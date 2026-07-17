import { createContext } from 'react';
import type { CropBox, CropSettings, HeaderFooterSettings, MetadataSettings, PageNumberSettings, UtilitySettings, WatermarkSettings } from '../types/utilities';

export type PdfUtilitiesValue = UtilitySettings & {
    updateWatermark: (patch: Partial<WatermarkSettings>) => void;
    updatePageNumbers: (patch: Partial<PageNumberSettings>) => void;
    updateHeaderFooter: (patch: Partial<HeaderFooterSettings>) => void;
    updateMetadata: (patch: Partial<MetadataSettings>) => void;
    updateCropSettings: (patch: Partial<CropSettings>) => void;
    setCropDraft: (pageId: string, crop: CropBox) => void;
    cancelCrop: (pageId: string) => void;
    applyCrops: (cropsByPageId: Record<string, CropBox>) => void;
    resetCrop: (pageIds: string[]) => void;
    resetWatermark: () => void;
    resetPageNumbers: () => void;
    resetHeaderFooter: () => void;
};

export const PdfUtilitiesContext = createContext<PdfUtilitiesValue | null>(null);
