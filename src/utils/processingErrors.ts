export function getProcessingErrorMessage(error: unknown, fallback: string) {
    const message = error instanceof Error ? error.message.trim() : '';
    const normalized = `${error instanceof Error ? error.name : ''} ${message}`.toLowerCase();
    if (normalized.includes('memory') || normalized.includes('allocation') || normalized.includes('out of memory')) {
        return 'The browser ran out of memory while processing this file. Close other tabs, try fewer pages, or use a smaller file.';
    }
    if (normalized.includes('quota') || normalized.includes('storage')) {
        return 'The browser does not have enough temporary storage for this output. Free some space and try again.';
    }
    return message && message.length <= 240 ? message : fallback;
}
