import type { WorkingPage } from '../../organization/types/pages';
import type { UtilitySettings } from '../types/utilities';
import { resolveUtilityTarget } from './utilityTargeting';

export function watermarkSettingsForExport(utilities: UtilitySettings, pages: WorkingPage[], selectedPageIds: string[], activePageId: string | null) {
    const target = resolveUtilityTarget({ ...utilities.watermark, pages, selectedPageIds, activePageId });
    if (!target.canApply) throw new Error(target.errors[0] ?? 'Choose at least one page for the watermark.');
    if (utilities.watermark.kind === 'text' && !utilities.watermark.text.trim()) throw new Error('Enter watermark text before downloading.');
    if (utilities.watermark.kind === 'image' && !utilities.watermark.imageSource) throw new Error('Choose a watermark image before downloading.');
    const watermark = { ...utilities.watermark, enabled: true, pageIds: target.pageIds };
    return { settings: { ...utilities, watermark }, watermark };
}
