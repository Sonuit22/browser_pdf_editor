export function getPdfErrorMessage(error: unknown) {
    const name = error instanceof Error ? error.name : '';
    const message = error instanceof Error ? error.message : String(error);
    const normalized = `${name} ${message}`.toLowerCase();
    if (normalized.includes('xfa')) return 'This PDF uses XFA forms, which are not supported by this browser editor.';
    if (normalized.includes('password') || normalized.includes('encrypted')) return 'This PDF is password protected and cannot be opened without its password.';
    if (normalized.includes('worker')) return 'The PDF rendering worker could not start. Please retry the document.';
    if (normalized.includes('invalid') || normalized.includes('format') || normalized.includes('corrupt')) return 'This file is not a valid, readable PDF. Please choose another document.';
    if (normalized.includes('memory') || normalized.includes('allocation')) return 'This PDF could not be opened because the browser does not have enough memory.';
    return 'The PDF could not be opened safely. Please retry or choose another document.';
}
