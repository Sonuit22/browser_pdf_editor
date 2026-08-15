import type { PageViewport } from 'pdfjs-dist';
import { usePdfUtilities } from '../hooks/usePdfUtilities';
import { expandTemplate, formatPageNumber, isPageTargeted } from '../utils/utilityFormatters';
import { watermarkPreviewStyle } from '../utils/watermarkPreviewStyle';

type UtilityPreviewOverlayProps = { pageId: string; pageNumber: number; pageCount: number; filename: string; pageWidth: number; pageHeight: number; viewport: PageViewport };

export function UtilityPreviewOverlay({ pageId, pageNumber, pageCount, filename, pageWidth, pageHeight, viewport }: UtilityPreviewOverlayProps) {
    const { watermark, pageNumbers, headerFooter } = usePdfUtilities();
    const values = { page: pageNumber, pages: pageCount, totalPages: pageCount, filename, date: new Date().toISOString().slice(0, 10) };
    const watermarkTargeted = watermark.enabled && isPageTargeted(watermark.pageIds, pageId);
    const showTextWatermark = watermarkTargeted && watermark.kind === 'text' && Boolean(watermark.text.trim());
    const showImageWatermark = watermarkTargeted && watermark.kind === 'image' && Boolean(watermark.imageSource);
    const showNumbers = pageNumbers.enabled && isPageTargeted(pageNumbers.pageIds, pageId);
    const showHeaderFooter = headerFooter.enabled && isPageTargeted(headerFooter.pageIds, pageId);
    if (!showTextWatermark && !showImageWatermark && !showNumbers && !showHeaderFooter) return null;
    const watermarkStyle = watermarkPreviewStyle(watermark, pageWidth, pageHeight, viewport);
    return <div className="utility-preview" aria-hidden="true">
        {showTextWatermark && <span className="utility-preview__watermark" style={watermarkStyle}>{watermark.text}</span>}
        {showImageWatermark && <img className="utility-preview__watermark utility-preview__watermark-image" style={watermarkStyle} src={watermark.imageSource ?? undefined} alt="" />}
        {showNumbers && <span className={`utility-preview__number utility-preview__number--${pageNumbers.position}`}>{formatPageNumber(pageNumbers, pageNumber - 1, pageNumbers.pageIds.indexOf(pageId))}</span>}
        {showHeaderFooter && <><PreviewRow placement="header" values={values} left={headerFooter.headerLeft} center={headerFooter.headerCenter} right={headerFooter.headerRight} /><PreviewRow placement="footer" values={values} left={headerFooter.footerLeft} center={headerFooter.footerCenter} right={headerFooter.footerRight} /></>}
    </div>;
}

function PreviewRow({ placement, values, left, center, right }: { placement: 'header' | 'footer'; values: { page: number; pages: number; totalPages: number; filename: string; date: string }; left: string; center: string; right: string }) {
    return <div className={`utility-preview__row utility-preview__row--${placement}`}><span>{expandTemplate(left, values)}</span><span>{expandTemplate(center, values)}</span><span>{expandTemplate(right, values)}</span></div>;
}
