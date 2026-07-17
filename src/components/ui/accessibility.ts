export function nextFocusIndex(length: number, currentIndex: number, backwards: boolean) {
    if (length < 1) return -1;
    if (currentIndex < 0) return backwards ? length - 1 : 0;
    if (backwards) return currentIndex === 0 ? length - 1 : currentIndex - 1;
    return currentIndex === length - 1 ? 0 : currentIndex + 1;
}

export function cropAreaDescription(pageWidth: number, pageHeight: number, crop: { left: number; right: number; top: number; bottom: number }) {
    const width = Math.max(0, Math.round(pageWidth - crop.left - crop.right));
    const height = Math.max(0, Math.round(pageHeight - crop.top - crop.bottom));
    return `Crop area is ${width} by ${height} PDF points. Use arrow keys to move the rectangle, Shift plus arrow keys for larger moves, and Escape to cancel the current interaction.`;
}
