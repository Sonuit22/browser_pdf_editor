import { usePdfUtilities } from '../hooks/usePdfUtilities';
import { expandTemplate, formatPageNumber, isPageTargeted } from '../utils/utilityFormatters';

type UtilityPreviewOverlayProps = { pageId: string; pageNumber: number; pageCount: number; filename: string };

export function UtilityPreviewOverlay({ pageId, pageNumber, pageCount, filename }: UtilityPreviewOverlayProps) {
    const { watermark, pageNumbers, headerFooter } = usePdfUtilities();
    const values = { page: pageNumber, pages: pageCount, totalPages: pageCount, filename, date: new Date().toISOString().slice(0, 10) };
    const showWatermark = watermark.enabled && isPageTargeted(watermark.pageIds, pageId) && watermark.kind === 'text' && watermark.text.trim();
    const showNumbers = pageNumbers.enabled && isPageTargeted(pageNumbers.pageIds, pageId);
    const showHeaderFooter = headerFooter.enabled && isPageTargeted(headerFooter.pageIds, pageId);
    if (!showWatermark && !showNumbers && !showHeaderFooter) return null;
    return <div className="utility-preview" aria-hidden="true">
        {showWatermark && <span className={`utility-preview__watermark utility-preview__watermark--${watermark.position}`}>{watermark.text}</span>}
        {showNumbers && <span className={`utility-preview__number utility-preview__number--${pageNumbers.position}`}>{formatPageNumber(pageNumbers, pageNumber - 1, pageNumbers.pageIds.indexOf(pageId))}</span>}
        {showHeaderFooter && <><PreviewRow placement="header" values={values} left={headerFooter.headerLeft} center={headerFooter.headerCenter} right={headerFooter.headerRight} /><PreviewRow placement="footer" values={values} left={headerFooter.footerLeft} center={headerFooter.footerCenter} right={headerFooter.footerRight} /></>}
    </div>;
}

function PreviewRow({ placement, values, left, center, right }: { placement: 'header' | 'footer'; values: { page: number; pages: number; totalPages: number; filename: string; date: string }; left: string; center: string; right: string }) {
    return <div className={`utility-preview__row utility-preview__row--${placement}`}><span>{expandTemplate(left, values)}</span><span>{expandTemplate(center, values)}</span><span>{expandTemplate(right, values)}</span></div>;
}
