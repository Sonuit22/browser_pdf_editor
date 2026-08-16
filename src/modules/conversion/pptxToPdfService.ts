import type { CancelSignal, Progress } from './conversionServices';

type Bounds = { x: number; y: number; width: number; height: number };
type TextBlock = Bounds & { kind: 'text'; text: string; color: string; fontSize: number; bold: boolean; align: CanvasTextAlign };
type Shape = Bounds & { kind: 'shape'; shape: string; fill?: string; stroke?: string; strokeWidth: number };
type Picture = Bounds & { kind: 'image'; blob: Blob };
type SlideElement = TextBlock | Shape | Picture;
type Slide = { width: number; height: number; background: string; elements: SlideElement[] };
type Deck = { slides: Slide[]; warnings: string[] };

const FALLBACK_SCHEME: Record<string, string> = {
    dk1: '#000000', lt1: '#ffffff', dk2: '#1f2937', lt2: '#f8fafc',
    accent1: '#4472c4', accent2: '#ed7d31', accent3: '#a5a5a5', accent4: '#ffc000',
    accent5: '#5b9bd5', accent6: '#70ad47', hlink: '#0563c1', folHlink: '#954f72',
};
const MIME_BY_EXTENSION: Record<string, string> = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
};

function descendants(element: Element | Document, name: string) {
    return Array.from(element.getElementsByTagNameNS('*', name));
}

function first(element: Element | Document, name: string) {
    return descendants(element, name)[0];
}

function parseXml(value: string, label: string) {
    const document = new DOMParser().parseFromString(value, 'application/xml');
    if (document.getElementsByTagName('parsererror').length) throw new Error(`${label} is invalid.`);
    return document;
}

function normalizeZipPath(baseFile: string, target: string) {
    const parts = `${baseFile.slice(0, baseFile.lastIndexOf('/') + 1)}${target}`.replace(/\\/g, '/').split('/');
    const normalized: string[] = [];
    parts.forEach((part) => {
        if (!part || part === '.') return;
        if (part === '..') normalized.pop();
        else normalized.push(part);
    });
    return normalized.join('/');
}

function relationshipPath(source: string) {
    const slash = source.lastIndexOf('/');
    return `${source.slice(0, slash + 1)}_rels/${source.slice(slash + 1)}.rels`;
}

async function relationships(zip: import('jszip'), source: string) {
    const file = zip.file(relationshipPath(source));
    if (!file) return new Map<string, { target: string; type: string }>();
    const document = parseXml(await file.async('string'), 'PowerPoint relationships');
    return new Map(descendants(document, 'Relationship').map((entry) => [
        entry.getAttribute('Id') ?? '',
        { target: normalizeZipPath(source, entry.getAttribute('Target') ?? ''), type: entry.getAttribute('Type') ?? '' },
    ]));
}

function colorFrom(element: Element | undefined, scheme: Record<string, string>, fallback?: string) {
    if (!element) return fallback;
    const srgb = first(element, 'srgbClr')?.getAttribute('val');
    if (srgb && /^[0-9a-f]{6}$/i.test(srgb)) return `#${srgb}`;
    const system = first(element, 'sysClr')?.getAttribute('lastClr');
    if (system && /^[0-9a-f]{6}$/i.test(system)) return `#${system}`;
    const schemeName = first(element, 'schemeClr')?.getAttribute('val');
    return (schemeName && scheme[schemeName]) || fallback;
}

function readBounds(element: Element | undefined): Bounds | null {
    if (!element) return null;
    const transform = first(element, 'xfrm');
    const offset = transform && first(transform, 'off');
    const extent = transform && first(transform, 'ext');
    if (!offset || !extent) return null;
    const x = Number(offset.getAttribute('x'));
    const y = Number(offset.getAttribute('y'));
    const width = Number(extent.getAttribute('cx'));
    const height = Number(extent.getAttribute('cy'));
    return [x, y, width, height].every(Number.isFinite) && width > 0 && height > 0 ? { x, y, width, height } : null;
}

function placeholderKey(shape: Element) {
    const placeholder = first(shape, 'ph');
    if (!placeholder) return '';
    return `${placeholder.getAttribute('idx') ?? ''}:${placeholder.getAttribute('type') ?? ''}`;
}

function layoutPlaceholders(layout: Document | null) {
    const map = new Map<string, Bounds>();
    if (!layout) return map;
    descendants(layout, 'sp').forEach((shape) => {
        const key = placeholderKey(shape);
        const bounds = readBounds(first(shape, 'spPr'));
        if (key && bounds) map.set(key, bounds);
    });
    return map;
}

function shapeText(shape: Element, bounds: Bounds, scheme: Record<string, string>): TextBlock | null {
    const body = first(shape, 'txBody');
    if (!body) return null;
    const paragraphs = descendants(body, 'p');
    const lines = paragraphs.map((paragraph) => {
        const value = descendants(paragraph, 't').map((node) => node.textContent ?? '').join('');
        const bullet = first(paragraph, 'buChar')?.getAttribute('char');
        return `${bullet ? `${bullet} ` : ''}${value}`.trimEnd();
    }).filter((line) => line.trim());
    if (!lines.length) return null;
    const runProperties = first(body, 'rPr') ?? first(body, 'defRPr') ?? first(body, 'endParaRPr');
    const paragraphProperties = first(body, 'pPr');
    const size = Number(runProperties?.getAttribute('sz') ?? 1800) / 100;
    const alignValue = paragraphProperties?.getAttribute('algn');
    return {
        kind: 'text', ...bounds, text: lines.join('\n'),
        color: colorFrom(runProperties, scheme, '#111827') ?? '#111827',
        fontSize: Number.isFinite(size) && size > 0 ? size : 18,
        bold: runProperties?.getAttribute('b') === '1',
        align: alignValue === 'ctr' ? 'center' : alignValue === 'r' ? 'right' : 'left',
    };
}

function shapeGraphic(shape: Element, bounds: Bounds, scheme: Record<string, string>): Shape | null {
    const properties = first(shape, 'spPr');
    if (!properties) return null;
    const preset = first(properties, 'prstGeom')?.getAttribute('prst') ?? 'rect';
    const fill = first(properties, 'noFill') ? undefined : colorFrom(first(properties, 'solidFill'), scheme);
    const line = first(properties, 'ln');
    const stroke = line && !first(line, 'noFill') ? colorFrom(first(line, 'solidFill'), scheme) : undefined;
    const strokeWidth = Number(line?.getAttribute('w') ?? 12700);
    if (!fill && !stroke) return null;
    return { kind: 'shape', ...bounds, shape: preset, fill, stroke, strokeWidth: Number.isFinite(strokeWidth) ? strokeWidth : 12700 };
}

async function themeColors(zip: import('jszip')) {
    const scheme = { ...FALLBACK_SCHEME };
    const file = zip.file('ppt/theme/theme1.xml');
    if (!file) return scheme;
    const document = parseXml(await file.async('string'), 'PowerPoint theme');
    const colorScheme = first(document, 'clrScheme');
    if (!colorScheme) return scheme;
    Array.from(colorScheme.children).forEach((entry) => {
        const color = colorFrom(entry, scheme);
        if (color) scheme[entry.localName] = color;
    });
    return scheme;
}

async function loadDeck(file: File): Promise<Deck> {
    if (/\.ppt$/i.test(file.name)) throw new Error('Old .ppt files are not supported. Save the presentation as .pptx first.');
    if (!/\.pptx$/i.test(file.name)) throw new Error('Choose a .pptx PowerPoint file.');
    const JSZip = (await import('jszip')).default;
    let zip: import('jszip');
    try {
        zip = await JSZip.loadAsync(await file.arrayBuffer());
    } catch {
        throw new Error('This PPTX is corrupted or cannot be opened.');
    }
    const presentationFile = zip.file('ppt/presentation.xml');
    if (!presentationFile) throw new Error('This file is not a valid PPTX presentation.');
    const presentation = parseXml(await presentationFile.async('string'), 'PowerPoint presentation');
    const presentationRelationships = await relationships(zip, 'ppt/presentation.xml');
    const slideSize = first(presentation, 'sldSz');
    const width = Number(slideSize?.getAttribute('cx') ?? 12192000);
    const height = Number(slideSize?.getAttribute('cy') ?? 6858000);
    const slidePaths = descendants(presentation, 'sldId').map((entry) => {
        const id = entry.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id') ?? entry.getAttribute('r:id') ?? '';
        return presentationRelationships.get(id)?.target;
    }).filter((path): path is string => Boolean(path));
    if (!slidePaths.length) throw new Error('No slides were found in this presentation.');
    const scheme = await themeColors(zip);
    const warnings = new Set<string>();
    const slides: Slide[] = [];
    for (const slidePath of slidePaths) {
        const slideFile = zip.file(slidePath);
        if (!slideFile) continue;
        const document = parseXml(await slideFile.async('string'), 'PowerPoint slide');
        const rels = await relationships(zip, slidePath);
        const layoutTarget = Array.from(rels.values()).find((entry) => entry.type.endsWith('/slideLayout'))?.target;
        const layoutFile = layoutTarget ? zip.file(layoutTarget) : null;
        const layout = layoutFile ? parseXml(await layoutFile.async('string'), 'PowerPoint slide layout') : null;
        const placeholderBounds = layoutPlaceholders(layout);
        const background = colorFrom(first(document, 'bg'), scheme, '#ffffff') ?? '#ffffff';
        const elements: SlideElement[] = [];
        const tree = first(document, 'spTree');
        for (const item of tree ? Array.from(tree.children) : []) {
            if (item.localName === 'sp') {
                const bounds = readBounds(first(item, 'spPr')) ?? placeholderBounds.get(placeholderKey(item));
                if (!bounds) continue;
                const graphic = shapeGraphic(item, bounds, scheme);
                const text = shapeText(item, bounds, scheme);
                if (graphic) elements.push(graphic);
                if (text) elements.push(text);
            } else if (item.localName === 'pic') {
                const bounds = readBounds(first(item, 'spPr'));
                const blip = first(item, 'blip');
                const id = blip?.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'embed') ?? blip?.getAttribute('r:embed') ?? '';
                const target = rels.get(id)?.target;
                const imageFile = target && zip.file(target);
                if (!bounds || !target || !imageFile) continue;
                const extension = target.split('.').pop()?.toLowerCase() ?? '';
                const mime = MIME_BY_EXTENSION[extension];
                if (!mime) {
                    warnings.add('Some unsupported image formats were omitted.');
                    continue;
                }
                elements.push({ kind: 'image', ...bounds, blob: new Blob([await imageFile.async('arraybuffer')], { type: mime }) });
            } else if (item.localName === 'graphicFrame' || item.localName === 'grpSp') {
                warnings.add('Charts, SmartArt, tables, and grouped objects may not appear exactly as authored.');
            }
        }
        slides.push({ width, height, background, elements });
    }
    if (!slides.length) throw new Error('No readable slides were found in this presentation.');
    return { slides, warnings: [...warnings] };
}

async function imageFromBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    try {
        const image = new Image();
        image.decoding = 'async';
        image.src = url;
        await image.decode();
        return image;
    } finally {
        // Safari can retain decoded pixels after the source URL is released.
        URL.revokeObjectURL(url);
    }
}

function wrappedLines(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
    const output: string[] = [];
    text.split('\n').forEach((paragraph) => {
        const words = paragraph.split(/\s+/).filter(Boolean);
        if (!words.length) { output.push(''); return; }
        let line = words.shift() ?? '';
        words.forEach((word) => {
            const next = `${line} ${word}`;
            if (context.measureText(next).width <= maxWidth) line = next;
            else { output.push(line); line = word; }
        });
        output.push(line);
    });
    return output;
}

async function renderSlide(slide: Slide, targetWidth: number) {
    const canvas = document.createElement('canvas');
    const scale = targetWidth / slide.width;
    canvas.width = Math.max(1, Math.round(targetWidth));
    canvas.height = Math.max(1, Math.round(slide.height * scale));
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Canvas rendering is unavailable in this browser.');
    context.fillStyle = slide.background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (const element of slide.elements) {
        const x = element.x * scale; const y = element.y * scale;
        const width = element.width * scale; const height = element.height * scale;
        if (element.kind === 'image') {
            try { context.drawImage(await imageFromBlob(element.blob), x, y, width, height); } catch { /* Preserve the rest of the slide. */ }
        } else if (element.kind === 'shape') {
            context.beginPath();
            if (/ellipse|oval/i.test(element.shape)) context.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
            else if (/roundRect/i.test(element.shape)) context.roundRect(x, y, width, height, Math.min(width, height) * .08);
            else { context.rect(x, y, width, height); }
            if (element.fill) { context.fillStyle = element.fill; context.fill(); }
            if (element.stroke) { context.strokeStyle = element.stroke; context.lineWidth = Math.max(1, element.strokeWidth * scale); context.stroke(); }
        } else {
            const fontSize = Math.max(8, element.fontSize * 12700 * scale);
            context.font = `${element.bold ? '700' : '400'} ${fontSize}px Arial, sans-serif`;
            context.fillStyle = element.color;
            context.textAlign = element.align;
            context.textBaseline = 'top';
            const padding = Math.max(2, fontSize * .2);
            const anchorX = element.align === 'center' ? x + width / 2 : element.align === 'right' ? x + width - padding : x + padding;
            const lineHeight = fontSize * 1.2;
            wrappedLines(context, element.text, Math.max(1, width - padding * 2)).slice(0, Math.max(1, Math.floor(height / lineHeight))).forEach((line, index) => {
                context.fillText(line, anchorX, y + padding + index * lineHeight, Math.max(1, width - padding * 2));
            });
        }
    }
    return canvas;
}

function canvasBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
    return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('A slide could not be encoded.')), type, quality));
}

export async function inspectPptx(file: File, progress: Progress, signal: CancelSignal) {
    const deck = await loadDeck(file);
    const thumbnails: Blob[] = [];
    for (let index = 0; index < deck.slides.length; index += 1) {
        if (signal.cancelled) throw new DOMException('Conversion cancelled.', 'AbortError');
        progress(index + 1, deck.slides.length, `Preparing slide ${index + 1}`);
        const canvas = await renderSlide(deck.slides[index], 360);
        try { thumbnails.push(await canvasBlob(canvas, 'image/jpeg', .72)); }
        finally { canvas.width = 0; canvas.height = 0; }
    }
    return { thumbnails, warnings: deck.warnings };
}

export async function pptxToPdf(file: File, selectedSlides: number[], progress: Progress, signal: CancelSignal) {
    const deck = await loadDeck(file);
    const selected = selectedSlides.length ? selectedSlides : deck.slides.map((_, index) => index + 1);
    const { jsPDF } = await import('jspdf');
    let pdf: InstanceType<typeof jsPDF> | null = null;
    for (let index = 0; index < selected.length; index += 1) {
        if (signal.cancelled) throw new DOMException('Conversion cancelled.', 'AbortError');
        const slide = deck.slides[selected[index] - 1];
        if (!slide) continue;
        progress(index + 1, selected.length, `Converting slide ${selected[index]}`);
        const widthPt = slide.width / 12700;
        const heightPt = slide.height / 12700;
        const canvas = await renderSlide(slide, Math.min(1920, Math.max(1280, Math.round(slide.width / 9525))));
        try {
            const image = canvas.toDataURL('image/jpeg', .92);
            if (!pdf) pdf = new jsPDF({ unit: 'pt', format: [widthPt, heightPt], orientation: widthPt >= heightPt ? 'landscape' : 'portrait', compress: true });
            else pdf.addPage([widthPt, heightPt], widthPt >= heightPt ? 'landscape' : 'portrait');
            pdf.addImage(image, 'JPEG', 0, 0, widthPt, heightPt, undefined, 'FAST');
        } finally { canvas.width = 0; canvas.height = 0; }
    }
    if (!pdf) throw new Error('Select at least one slide.');
    return pdf.output('blob');
}
