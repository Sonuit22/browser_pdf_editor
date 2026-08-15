import type { CSSProperties } from 'react';
import type { PageViewport } from 'pdfjs-dist';
import type { WatermarkSettings } from '../types/utilities';
import { watermarkPlacement, watermarkSize } from './utilityFormatters';

export function watermarkPreviewStyle(watermark: WatermarkSettings, pageWidth: number, pageHeight: number, viewport: PageViewport): CSSProperties {
    const size = watermarkSize(watermark.kind, watermark.text, watermark.fontSize, { width: watermark.imageWidth, height: watermark.imageHeight });
    const placement = watermarkPlacement(pageWidth, pageHeight, watermark.position, size, 36, { x: watermark.x, y: watermark.y });
    const [left, top] = viewport.convertToViewportPoint(placement.x, placement.y + size.height);
    return {
        left,
        top,
        width: size.width * viewport.scale,
        height: size.height * viewport.scale,
        color: watermark.color,
        fontSize: watermark.fontSize * viewport.scale,
        lineHeight: 1,
        opacity: watermark.opacity,
        transform: `rotate(${-watermark.rotation}deg)`,
        transformOrigin: 'left bottom',
    };
}
