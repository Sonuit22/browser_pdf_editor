import type { HighlighterSettings, PdfAnnotation, Point } from '../types/annotations';

export const HIGHLIGHTER_OPACITY_MIN = 0.1;
export const HIGHLIGHTER_OPACITY_MAX = 0.6;
export const HIGHLIGHTER_SIZE_MIN = 8;
export const HIGHLIGHTER_SIZE_MAX = 40;

const DEFAULT_HIGHLIGHTER_COLOR = '#ffe066';
const DEFAULT_DRAW_COLOR = '#178a49';
const DEFAULT_HIGHLIGHTER_OPACITY = 0.3;
const DEFAULT_HIGHLIGHTER_SIZE = 20;
const DEFAULT_DRAW_OPACITY = 0.9;
const DEFAULT_DRAW_WIDTH = 2;
const HEX_COLOR = /^#([\da-f]{3}|[\da-f]{6})$/i;

type PathAnnotation = Extract<PdfAnnotation, { type: 'draw' | 'highlight' }>;

export type PathPaint = {
    color: string;
    opacity: number;
    width: number;
    lineCap: 'butt' | 'round';
    lineJoin: 'round';
};

export type RgbColor = { r: number; g: number; b: number };

export type SmoothPathCommand =
    | { type: 'move'; point: Point }
    | { type: 'quadratic'; control: Point; end: Point };

function clamp(value: number, minimum: number, maximum: number) {
    return Math.max(minimum, Math.min(maximum, value));
}

function expandedHex(value: string) {
    const digits = value.slice(1).toLowerCase();
    return digits.length === 3
        ? `#${digits.split('').map((digit) => `${digit}${digit}`).join('')}`
        : `#${digits}`;
}

export function normalizeHexColor(value: string, fallback: string) {
    if (typeof value === 'string' && HEX_COLOR.test(value.trim())) return expandedHex(value.trim());
    if (typeof fallback === 'string' && HEX_COLOR.test(fallback.trim())) return expandedHex(fallback.trim());
    return DEFAULT_DRAW_COLOR;
}

export function hexToRgb(value: string, fallback = DEFAULT_DRAW_COLOR): RgbColor {
    const normalized = normalizeHexColor(value, fallback);
    return {
        r: Number.parseInt(normalized.slice(1, 3), 16),
        g: Number.parseInt(normalized.slice(3, 5), 16),
        b: Number.parseInt(normalized.slice(5, 7), 16),
    };
}

export function normalizeHighlighterSettings(settings: Partial<HighlighterSettings> = {}): HighlighterSettings {
    const opacity = Number.isFinite(settings.opacity) ? settings.opacity as number : DEFAULT_HIGHLIGHTER_OPACITY;
    const strokeWidth = Number.isFinite(settings.strokeWidth) ? settings.strokeWidth as number : DEFAULT_HIGHLIGHTER_SIZE;
    return {
        color: normalizeHexColor(settings.color ?? DEFAULT_HIGHLIGHTER_COLOR, DEFAULT_HIGHLIGHTER_COLOR),
        opacity: clamp(opacity, HIGHLIGHTER_OPACITY_MIN, HIGHLIGHTER_OPACITY_MAX),
        strokeWidth: clamp(strokeWidth, HIGHLIGHTER_SIZE_MIN, HIGHLIGHTER_SIZE_MAX),
    };
}

export function screenStrokeWidthToPdf(screenWidth: number, viewportScale: number) {
    const normalizedWidth = Number.isFinite(screenWidth)
        ? clamp(screenWidth, HIGHLIGHTER_SIZE_MIN, HIGHLIGHTER_SIZE_MAX)
        : DEFAULT_HIGHLIGHTER_SIZE;
    const normalizedScale = Number.isFinite(viewportScale) && viewportScale > 0 ? viewportScale : 1;
    return normalizedWidth / normalizedScale;
}

export function pathPaint(annotation: PathAnnotation, viewportScale: number): PathPaint {
    const scale = Number.isFinite(viewportScale) && viewportScale > 0 ? viewportScale : 1;
    const fallbackWidth = annotation.type === 'highlight' ? DEFAULT_HIGHLIGHTER_SIZE : DEFAULT_DRAW_WIDTH;
    const documentWidth = Number.isFinite(annotation.strokeWidth) && annotation.strokeWidth > 0
        ? annotation.strokeWidth
        : fallbackWidth;
    const opacityFallback = annotation.type === 'highlight' ? DEFAULT_HIGHLIGHTER_OPACITY : DEFAULT_DRAW_OPACITY;
    const opacity = Number.isFinite(annotation.opacity) ? annotation.opacity : opacityFallback;

    return {
        color: normalizeHexColor(annotation.color, annotation.type === 'highlight' ? DEFAULT_HIGHLIGHTER_COLOR : DEFAULT_DRAW_COLOR),
        opacity: annotation.type === 'highlight'
            ? clamp(opacity, HIGHLIGHTER_OPACITY_MIN, HIGHLIGHTER_OPACITY_MAX)
            : clamp(opacity, 0, 1),
        width: documentWidth * scale,
        lineCap: annotation.type === 'highlight' ? 'butt' : 'round',
        lineJoin: 'round',
    };
}

export function appendDistinctPathPoints(points: Point[], additions: Point[], minimumDistancePdf: number) {
    const output = [...points];
    const minimumDistance = Number.isFinite(minimumDistancePdf) ? Math.max(0, minimumDistancePdf) : 0.1;

    for (const point of additions) {
        if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;
        const previous = output[output.length - 1];
        if (!previous || Math.hypot(point.x - previous.x, point.y - previous.y) >= minimumDistance) output.push(point);
    }

    return output;
}

export function smoothPathCommands(points: Point[]): SmoothPathCommand[] {
    const finitePoints = points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
    const first = finitePoints[0];
    if (!first) return [];

    const commands: SmoothPathCommand[] = [{ type: 'move', point: { ...first } }];
    for (let index = 1; index < finitePoints.length - 1; index += 1) {
        const control = finitePoints[index];
        const following = finitePoints[index + 1];
        commands.push({
            type: 'quadratic',
            control: { ...control },
            end: { x: (control.x + following.x) / 2, y: (control.y + following.y) / 2 },
        });
    }

    const final = finitePoints[finitePoints.length - 1];
    if (finitePoints.length > 1) commands.push({ type: 'quadratic', control: { ...final }, end: { ...final } });
    return commands;
}

function svgCoordinate(value: number) {
    const rounded = Math.round(value * 1_000) / 1_000;
    return String(Object.is(rounded, -0) ? 0 : rounded);
}

export function pathCommandsToSvg(commands: SmoothPathCommand[], options: { invertY?: boolean } = {}) {
    const y = (value: number) => options.invertY ? -value : value;
    return commands.map((command) => command.type === 'move'
        ? `M ${svgCoordinate(command.point.x)} ${svgCoordinate(y(command.point.y))}`
        : `Q ${svgCoordinate(command.control.x)} ${svgCoordinate(y(command.control.y))} ${svgCoordinate(command.end.x)} ${svgCoordinate(y(command.end.y))}`
    ).join(' ');
}
