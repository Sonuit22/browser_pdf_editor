export function renderSigningVisual(text: string, options: { width: number; height: number; font: string }) {
    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    try {
        const context = canvas.getContext('2d');
        if (!context) throw new Error('This browser could not create the signing object.');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#111111';
        context.font = options.font;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(text, canvas.width / 2, canvas.height / 2);
        return { source: canvas.toDataURL('image/png'), aspectRatio: canvas.width / canvas.height };
    } finally {
        canvas.width = 0;
        canvas.height = 0;
    }
}

export function formatSigningDate(value: string) {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}
