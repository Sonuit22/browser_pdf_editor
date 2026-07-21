import type { PageViewport } from 'pdfjs-dist';
import type { PdfAnnotation } from '../types/annotations';
import { pdfBoundsToViewport, pdfPointToViewport } from '../utils/coordinates';
import { normalizeHexColor, pathPaint, smoothPathCommands } from '../utils/annotationRendering';

export type AnnotationImageCache = Map<string, Promise<HTMLImageElement>>;

export type CanvasAnnotationRenderInput = {
    context: CanvasRenderingContext2D;
    viewport: PageViewport;
    pixelRatio: number;
    annotations: PdfAnnotation[];
    formValues?: Record<string, string | boolean | string[]>;
    signal?: AbortSignal;
    imageCache?: AnnotationImageCache;
};

export function createAnnotationImageCache(): AnnotationImageCache {
    return new Map<string, Promise<HTMLImageElement>>();
}

function clamp(value: number, minimum: number, maximum: number) {
    return Math.max(minimum, Math.min(maximum, Number.isFinite(value) ? value : minimum));
}

function loadImage(source: string, cache: AnnotationImageCache) {
    const cached = cache.get(source);
    if (cached) return cached;

    const pending = new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('An annotation image could not be decoded.'));
        image.src = source;
    });
    cache.set(source, pending);
    void pending.catch(() => {
        if (cache.get(source) === pending) cache.delete(source);
    });
    return pending;
}

function withBoxTransform(context: CanvasRenderingContext2D, annotation: PdfAnnotation, viewport: PageViewport, draw: (width: number, height: number) => void) {
    const box = pdfBoundsToViewport(annotation, viewport);
    context.save();
    context.translate(box.left + box.width / 2, box.top + box.height / 2);
    context.rotate(annotation.rotation * Math.PI / 180);
    context.translate(-box.width / 2, -box.height / 2);
    draw(box.width, box.height);
    context.restore();
}

function fontFamily(annotation: Extract<PdfAnnotation, { type: 'text' }>) {
    if (annotation.fontFamily === 'Times-Roman') return 'Times New Roman, Times, serif';
    if (annotation.fontFamily === 'Courier') return 'Courier New, Courier, monospace';
    return 'Helvetica, Arial, sans-serif';
}

function measuredWidth(context: CanvasRenderingContext2D, value: string, letterSpacing: number) {
    return context.measureText(value).width + Math.max(0, value.length - 1) * letterSpacing;
}

function splitLongWord(context: CanvasRenderingContext2D, word: string, maxWidth: number, letterSpacing: number) {
    const pieces: string[] = [];
    let piece = '';
    for (const character of word) {
        const candidate = piece + character;
        if (piece && measuredWidth(context, candidate, letterSpacing) > maxWidth) {
            pieces.push(piece);
            piece = character;
        } else {
            piece = candidate;
        }
    }
    if (piece) pieces.push(piece);
    return pieces;
}

function wrappedLines(context: CanvasRenderingContext2D, text: string, maxWidth: number, letterSpacing: number) {
    const lines: string[] = [];
    for (const paragraph of text.replace(/\r\n?/g, '\n').split('\n')) {
        if (!paragraph) {
            lines.push('');
            continue;
        }
        let line = '';
        for (const rawWord of paragraph.split(/\s+/)) {
            const words = measuredWidth(context, rawWord, letterSpacing) > maxWidth
                ? splitLongWord(context, rawWord, maxWidth, letterSpacing)
                : [rawWord];
            for (const word of words) {
                const candidate = line ? `${line} ${word}` : word;
                if (line && measuredWidth(context, candidate, letterSpacing) > maxWidth) {
                    lines.push(line);
                    line = word;
                } else {
                    line = candidate;
                }
            }
        }
        lines.push(line);
    }
    return lines;
}

function drawSpacedText(context: CanvasRenderingContext2D, value: string, x: number, y: number, letterSpacing: number) {
    if (!letterSpacing) {
        context.fillText(value, x, y);
        return;
    }
    let cursor = x;
    for (const character of value) {
        context.fillText(character, cursor, y);
        cursor += context.measureText(character).width + letterSpacing;
    }
}

function drawText(context: CanvasRenderingContext2D, annotation: Extract<PdfAnnotation, { type: 'text' }>, viewport: PageViewport) {
    withBoxTransform(context, annotation, viewport, (width, height) => {
        const scale = viewport.scale;
        const padding = Math.max(0, annotation.padding * scale);
        const fontSize = Math.max(1, annotation.fontSize * scale);
        const lineHeight = fontSize * clamp(annotation.lineHeight, .5, 4);
        const letterSpacing = annotation.letterSpacing * scale;
        const availableWidth = Math.max(1, width - padding * 2);

        if (annotation.backgroundOpacity > 0) {
            context.save();
            context.globalAlpha = clamp(annotation.opacity, 0, 1) * clamp(annotation.backgroundOpacity, 0, 1);
            context.fillStyle = normalizeHexColor(annotation.backgroundColor, '#ffffff');
            context.fillRect(0, 0, width, height);
            context.restore();
        }
        if (annotation.borderWidth > 0) {
            context.save();
            context.globalAlpha = clamp(annotation.opacity, 0, 1);
            context.strokeStyle = normalizeHexColor(annotation.borderColor, '#178a49');
            context.lineWidth = annotation.borderWidth * scale;
            context.strokeRect(0, 0, width, height);
            context.restore();
        }

        context.save();
        context.globalAlpha = clamp(annotation.opacity, 0, 1);
        context.fillStyle = normalizeHexColor(annotation.color, '#111111');
        context.strokeStyle = context.fillStyle;
        context.font = `${annotation.italic ? 'italic ' : ''}${annotation.bold ? '700' : '400'} ${fontSize}px ${fontFamily(annotation)}`;
        context.textBaseline = 'top';
        const lines = wrappedLines(context, annotation.text, availableWidth, letterSpacing);
        for (let index = 0; index < lines.length; index += 1) {
            const y = padding + index * lineHeight;
            if (y + fontSize > height - padding + .5) break;
            const value = lines[index];
            const lineWidth = measuredWidth(context, value, letterSpacing);
            const x = annotation.align === 'center' ? (width - lineWidth) / 2 : annotation.align === 'right' ? width - padding - lineWidth : padding;
            drawSpacedText(context, value, x, y, letterSpacing);
            if (annotation.underline && value) {
                context.lineWidth = Math.max(1, fontSize / 16);
                context.beginPath();
                context.moveTo(x, y + fontSize + 1);
                context.lineTo(x + lineWidth, y + fontSize + 1);
                context.stroke();
            }
        }
        context.restore();
    });
}

function drawPath(context: CanvasRenderingContext2D, annotation: Extract<PdfAnnotation, { type: 'draw' | 'highlight' }>, viewport: PageViewport) {
    if (annotation.points.length < 2) return;
    const paint = pathPaint(annotation, viewport.scale);
    const commands = smoothPathCommands(annotation.points);
    context.save();
    context.globalAlpha = paint.opacity;
    context.strokeStyle = paint.color;
    context.lineWidth = paint.width;
    context.lineCap = paint.lineCap;
    context.lineJoin = paint.lineJoin;
    context.beginPath();
    for (const command of commands) {
        if (command.type === 'move') {
            const point = pdfPointToViewport(command.point, viewport);
            context.moveTo(point.x, point.y);
        } else {
            const control = pdfPointToViewport(command.control, viewport);
            const end = pdfPointToViewport(command.end, viewport);
            context.quadraticCurveTo(control.x, control.y, end.x, end.y);
        }
    }
    context.stroke();
    context.restore();
}

function drawShape(context: CanvasRenderingContext2D, annotation: Extract<PdfAnnotation, { type: 'rectangle' | 'rounded-rectangle' | 'ellipse' | 'line' | 'arrow' | 'triangle' }>, viewport: PageViewport) {
    withBoxTransform(context, annotation, viewport, (width, height) => {
        const strokeWidth = Math.max(.25, annotation.strokeWidth * viewport.scale);
        context.save();
        context.globalAlpha = clamp(annotation.opacity, 0, 1);
        context.strokeStyle = normalizeHexColor(annotation.strokeColor, '#178a49');
        context.fillStyle = annotation.fillColor === 'transparent' ? 'transparent' : normalizeHexColor(annotation.fillColor, '#ffffff');
        context.lineWidth = strokeWidth;
        context.lineJoin = 'round';
        context.beginPath();
        if (annotation.type === 'ellipse') {
            context.ellipse(width / 2, height / 2, Math.max(0, width / 2 - strokeWidth / 2), Math.max(0, height / 2 - strokeWidth / 2), 0, 0, Math.PI * 2);
        } else if (annotation.type === 'rectangle' || annotation.type === 'rounded-rectangle') {
            const inset = strokeWidth / 2;
            const rectangleWidth = Math.max(0, width - strokeWidth);
            const rectangleHeight = Math.max(0, height - strokeWidth);
            if (annotation.type === 'rounded-rectangle') {
                context.roundRect(inset, inset, rectangleWidth, rectangleHeight, Math.min(10, rectangleWidth / 2, rectangleHeight / 2));
            } else {
                context.rect(inset, inset, rectangleWidth, rectangleHeight);
            }
        } else if (annotation.type === 'triangle') {
            context.moveTo(width / 2, strokeWidth / 2);
            context.lineTo(width - strokeWidth / 2, height - strokeWidth / 2);
            context.lineTo(strokeWidth / 2, height - strokeWidth / 2);
            context.closePath();
        } else {
            context.moveTo(strokeWidth / 2, height - strokeWidth / 2);
            context.lineTo(width - strokeWidth / 2, strokeWidth / 2);
        }
        if (!['line', 'arrow'].includes(annotation.type) && annotation.fillColor !== 'transparent') context.fill();
        context.stroke();
        if (annotation.type === 'arrow') {
            const arrowSize = Math.max(4, Math.min(10 * viewport.scale, width / 3, height / 3));
            context.beginPath();
            context.moveTo(width - strokeWidth / 2, strokeWidth / 2);
            context.lineTo(width - arrowSize, strokeWidth / 2 + arrowSize * .22);
            context.lineTo(width - arrowSize * .22, arrowSize);
            context.closePath();
            context.fillStyle = context.strokeStyle;
            context.fill();
        }
        context.restore();
    });
}

async function drawImage(context: CanvasRenderingContext2D, annotation: Extract<PdfAnnotation, { type: 'image' | 'signature' }>, viewport: PageViewport, cache: AnnotationImageCache, signal?: AbortSignal) {
    const image = await loadImage(annotation.source, cache);
    if (signal?.aborted) return;
    withBoxTransform(context, annotation, viewport, (width, height) => {
        context.save();
        context.globalAlpha = clamp(annotation.opacity, 0, 1);
        context.drawImage(image, 0, 0, width, height);
        context.restore();
    });
}

function drawStamp(context: CanvasRenderingContext2D, annotation: Extract<PdfAnnotation, { type: 'stamp' }>, viewport: PageViewport) {
    withBoxTransform(context, annotation, viewport, (width, height) => {
        const color = normalizeHexColor(annotation.color, '#16794c');
        context.save();
        context.globalAlpha = clamp(annotation.opacity, 0, 1);
        context.strokeStyle = color;
        context.fillStyle = color;
        context.lineWidth = Math.max(1, 2 * viewport.scale);
        context.strokeRect(0, 0, width, height);
        context.font = `800 ${Math.max(6, Math.min(18, annotation.height / 2) * viewport.scale)}px Helvetica, Arial, sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(annotation.text, width / 2, height / 2, Math.max(1, width - 8 * viewport.scale));
        context.restore();
    });
}

function drawFormField(context: CanvasRenderingContext2D, annotation: Extract<PdfAnnotation, { type: 'form-text' | 'form-signature' | 'form-checkbox' }>, viewport: PageViewport, formValues: Record<string, string | boolean | string[]>) {
    withBoxTransform(context, annotation, viewport, (width, height) => {
        const value = formValues[annotation.name] ?? annotation.defaultValue;
        const strokeWidth = Math.max(1, annotation.strokeWidth * viewport.scale);
        context.save();
        context.globalAlpha = clamp(annotation.opacity, 0, 1);
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
        context.strokeStyle = normalizeHexColor(annotation.strokeColor, '#178a49');
        context.lineWidth = strokeWidth;
        context.strokeRect(strokeWidth / 2, strokeWidth / 2, Math.max(0, width - strokeWidth), Math.max(0, height - strokeWidth));
        context.fillStyle = '#172433';
        if (annotation.type === 'form-checkbox') {
            if (value) {
                context.lineCap = 'round';
                context.lineJoin = 'round';
                context.lineWidth = Math.max(1.5, Math.min(width, height) * .12);
                context.beginPath();
                context.moveTo(width * .22, height * .52);
                context.lineTo(width * .43, height * .72);
                context.lineTo(width * .8, height * .27);
                context.stroke();
            }
        } else {
            const text = Array.isArray(value) ? value.join(', ') : String(value || (annotation.type === 'form-signature' ? 'Signature' : ''));
            const padding = Math.max(2, 4 * viewport.scale);
            context.font = `${Math.max(7, Math.min(14 * viewport.scale, height * .55))}px Helvetica, Arial, sans-serif`;
            context.textBaseline = 'middle';
            context.fillText(text, padding, height / 2, Math.max(1, width - padding * 2));
        }
        context.restore();
    });
}

export async function renderAnnotationsToCanvas({ context, viewport, pixelRatio, annotations, formValues = {}, signal, imageCache }: CanvasAnnotationRenderInput) {
    const ratio = Number.isFinite(pixelRatio) && pixelRatio > 0 ? pixelRatio : 1;
    const cache = imageCache ?? createAnnotationImageCache();
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.restore();
    if (signal?.aborted) return;

    context.save();
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    try {
        for (const annotation of annotations) {
            if (signal?.aborted) return;
            if (annotation.type === 'text') drawText(context, annotation, viewport);
            else if (annotation.type === 'draw' || annotation.type === 'highlight') drawPath(context, annotation, viewport);
            else if (annotation.type === 'image' || annotation.type === 'signature') await drawImage(context, annotation, viewport, cache, signal);
            else if (annotation.type === 'stamp') drawStamp(context, annotation, viewport);
            else if (annotation.type === 'form-text' || annotation.type === 'form-signature' || annotation.type === 'form-checkbox') drawFormField(context, annotation, viewport, formValues);
            else drawShape(context, annotation, viewport);
            if (signal?.aborted) return;
        }
    } finally {
        context.restore();
    }
}
