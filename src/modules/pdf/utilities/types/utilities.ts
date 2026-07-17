export type UtilityPosition = 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'custom';
export type UtilityApplicationMode = 'all' | 'selected' | 'custom';
export type CropApplicationMode = 'current' | UtilityApplicationMode;
export type CropDistribution = 'absolute' | 'proportional';
export type UtilityTarget = { pageIds: string[]; applicationMode: UtilityApplicationMode; customRange: string };
export type WatermarkSettings = UtilityTarget & { enabled: boolean; kind: 'text' | 'image'; text: string; imageSource: string | null; position: UtilityPosition; x: number; y: number; fontSize: number; color: string; opacity: number; rotation: number };
export type PageNumberSettings = UtilityTarget & { enabled: boolean; numberingMode: 'physical' | 'sequential'; position: Exclude<UtilityPosition, 'center' | 'custom'>; start: number; prefix: string; suffix: string; fontSize: number; color: string; margin: number };
export type HeaderFooterSettings = UtilityTarget & { enabled: boolean; headerLeft: string; headerCenter: string; headerRight: string; footerLeft: string; footerCenter: string; footerRight: string; fontSize: number; color: string; margin: number };
export type MetadataSettings = { title: string; author: string; subject: string; keywords: string; creator: string; producer: string };
export type CropBox = { left: number; right: number; top: number; bottom: number };
export type CropSettings = { applicationMode: CropApplicationMode; customRange: string; distribution: CropDistribution; isEditing: boolean; draftByPageId: Record<string, CropBox> };
export type UtilitySettings = { watermark: WatermarkSettings; pageNumbers: PageNumberSettings; headerFooter: HeaderFooterSettings; metadata: MetadataSettings; cropsByPageId: Record<string, CropBox>; crop: CropSettings };

export const defaultUtilitySettings: UtilitySettings = {
    watermark: { enabled: false, pageIds: [], applicationMode: 'all', customRange: '', kind: 'text', text: 'CONFIDENTIAL', imageSource: null, position: 'center', x: 50, y: 50, fontSize: 42, color: '#0f6aa6', opacity: .24, rotation: 45 },
    pageNumbers: { enabled: false, pageIds: [], applicationMode: 'all', customRange: '', numberingMode: 'physical', position: 'bottom-center', start: 1, prefix: 'Page ', suffix: '', fontSize: 11, color: '#172433', margin: 28 },
    headerFooter: { enabled: false, pageIds: [], applicationMode: 'all', customRange: '', headerLeft: '', headerCenter: '', headerRight: '', footerLeft: '', footerCenter: '', footerRight: '', fontSize: 10, color: '#172433', margin: 28 },
    metadata: { title: '', author: '', subject: '', keywords: '', creator: '', producer: '' },
    cropsByPageId: {},
    crop: { applicationMode: 'current', customRange: '', distribution: 'absolute', isEditing: false, draftByPageId: {} },
};
