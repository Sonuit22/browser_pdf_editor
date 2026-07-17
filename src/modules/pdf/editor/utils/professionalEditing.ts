import type { PdfAnnotation } from '../types/annotations';

export type Alignment = 'left' | 'right' | 'top' | 'bottom' | 'center-horizontal' | 'center-vertical' | 'distribute-horizontal' | 'distribute-vertical';

export function alignAnnotations(annotations: PdfAnnotation[], alignment: Alignment) {
    if (annotations.length < 2) return annotations;
    const left = Math.min(...annotations.map((item) => item.x));
    const right = Math.max(...annotations.map((item) => item.x + item.width));
    const bottom = Math.min(...annotations.map((item) => item.y));
    const top = Math.max(...annotations.map((item) => item.y + item.height));
    const ordered = [...annotations].sort((first, second) => alignment.endsWith('horizontal') ? first.x - second.x : first.y - second.y);
    return annotations.map((annotation) => {
        if (alignment === 'left') return { ...annotation, x: left };
        if (alignment === 'right') return { ...annotation, x: right - annotation.width };
        if (alignment === 'top') return { ...annotation, y: top - annotation.height };
        if (alignment === 'bottom') return { ...annotation, y: bottom };
        if (alignment === 'center-horizontal') return { ...annotation, x: (left + right - annotation.width) / 2 };
        if (alignment === 'center-vertical') return { ...annotation, y: (bottom + top - annotation.height) / 2 };
        if (alignment === 'distribute-horizontal') { const gap = (right - left - ordered.reduce((total, item) => total + item.width, 0)) / (ordered.length - 1); const index = ordered.findIndex((item) => item.id === annotation.id); return { ...annotation, x: left + ordered.slice(0, index).reduce((total, item) => total + item.width + gap, 0) }; }
        if (alignment === 'distribute-vertical') { const gap = (top - bottom - ordered.reduce((total, item) => total + item.height, 0)) / (ordered.length - 1); const index = ordered.findIndex((item) => item.id === annotation.id); return { ...annotation, y: bottom + ordered.slice(0, index).reduce((total, item) => total + item.height + gap, 0) }; }
        return annotation;
    }) as PdfAnnotation[];
}

export function snapValue(value: number, spacing: number) { return spacing > 0 ? Math.round(value / spacing) * spacing : value; }
