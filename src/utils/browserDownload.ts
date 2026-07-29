export function downloadBlob(blob: Blob, filename: string) {
    let url: string | null = null;
    let anchor: HTMLAnchorElement | null = null;
    try {
        url = URL.createObjectURL(blob);
        anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        anchor.style.display = 'none';
        document.body.append(anchor);
        anchor.click();
    } catch {
        if (url) URL.revokeObjectURL(url);
        throw new Error('The download could not be started. Check browser download permissions and try again.');
    } finally {
        anchor?.remove();
    }
    window.setTimeout(() => {
        if (url) URL.revokeObjectURL(url);
    }, 1_000);
}
