import type { DrawSettings, EditorTool, HighlighterSettings, PdfAnnotation, Point, ShapeSettings, TextSettings } from '../types/annotations';
import { createAnnotationId } from './annotationUtils';
import { normalizeHighlighterSettings, screenStrokeWidthToPdf } from './annotationRendering';
import { formatSigningDate, renderSigningVisual } from './signingVisual';

const base = (pageId: string, type: PdfAnnotation['type'], point: Point): Omit<PdfAnnotation, 'type'> & { type: PdfAnnotation['type'] } => ({
    id: createAnnotationId(), pageId, type, x: point.x, y: point.y, width: 2, height: 2,
    zIndex: Date.now(), opacity: type === 'highlight' ? .3 : .9, rotation: 0,
    strokeColor: '#178a49', strokeWidth: 2, fillColor: 'transparent',
    createdAt: Date.now(), updatedAt: Date.now(),
} as PdfAnnotation);

export function createAnnotation(tool: EditorTool, pageId: string, point: Point, highlighter: HighlighterSettings = { color: '#ffe066', opacity: .3, strokeWidth: 20 }, viewportScale = 1, settings?: { text: TextSettings; draw: DrawSettings; shape: ShapeSettings }): PdfAnnotation | null {
    if (tool === 'text') return { ...base(pageId, 'text', point), type: 'text', width: 180, height: 72, text: '', fontSize: settings?.text.fontSize ?? 16, fontFamily: 'Helvetica', bold: false, italic: false, underline: false, color: settings?.text.color ?? '#111111', backgroundColor: '#ffffff', backgroundOpacity: 0, borderColor: '#178a49', borderWidth: 0, padding: 6, lineHeight: 1.3, letterSpacing: 0, align: 'left' };
    if (tool === 'checkmark' || tool === 'date') {
        const dateValue = tool === 'date' ? new Date().toISOString().slice(0, 10) : undefined;
        const visual = renderSigningVisual(tool === 'date' ? formatSigningDate(dateValue ?? '') : '✓', tool === 'date' ? { width: 560, height: 160, font: '600 64px Arial, sans-serif' } : { width: 180, height: 180, font: '700 132px Arial, sans-serif' });
        const width = tool === 'date' ? 150 : 52;
        return { ...base(pageId, 'signature', point), type: 'signature', source: visual.source, signatureKind: tool, aspectRatio: visual.aspectRatio, dateValue, width, height: width / visual.aspectRatio, opacity: 1 };
    }
    if (tool === 'highlight') {
        const settings = normalizeHighlighterSettings(highlighter);
        return { ...base(pageId, 'highlight', point), type: 'highlight', color: settings.color, opacity: settings.opacity, strokeWidth: screenStrokeWidthToPdf(settings.strokeWidth, viewportScale), points: [point] };
    }
    if (tool === 'draw') return { ...base(pageId, 'draw', point), type: 'draw', points: [point], color: settings?.draw.color ?? '#178a49', opacity: settings?.draw.opacity ?? .9, strokeWidth: settings?.draw.strokeWidth ?? 2 };
    if (['rectangle', 'rounded-rectangle', 'ellipse', 'line', 'arrow', 'triangle'].includes(tool)) return { ...base(pageId, tool as 'rectangle' | 'rounded-rectangle' | 'ellipse' | 'line' | 'arrow' | 'triangle', point), type: tool as 'rectangle' | 'rounded-rectangle' | 'ellipse' | 'line' | 'arrow' | 'triangle', ...(settings ? settings.shape : {}) };
    if (tool === 'stamp') return { ...base(pageId, 'stamp', point), type: 'stamp', width: 150, height: 52, text: 'APPROVED', color: '#16794c', opacity: .82 };
    if (tool === 'form-text') return { ...base(pageId, 'form-text', point), type: 'form-text', width: 180, height: 30, name: `text_${Date.now()}`, required: false, multiline: false, defaultValue: '' };
    if (tool === 'form-checkbox') return { ...base(pageId, 'form-checkbox', point), type: 'form-checkbox', width: 22, height: 22, name: `checkbox_${Date.now()}`, required: false, defaultValue: false };
    if (tool === 'form-signature') return { ...base(pageId, 'form-signature', point), type: 'form-signature', width: 180, height: 42, name: `signature_${Date.now()}`, required: false, defaultValue: '' };
    return null;
}
