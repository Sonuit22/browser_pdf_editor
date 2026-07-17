export function hasPdfBrowserSupport() {
    return typeof window !== 'undefined'
        && typeof File !== 'undefined'
        && typeof FileReader !== 'undefined'
        && typeof TextDecoder !== 'undefined'
        && typeof WebAssembly !== 'undefined'
        && typeof Worker !== 'undefined';
}
