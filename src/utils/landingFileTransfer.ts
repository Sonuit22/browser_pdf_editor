import type { PendingPdfFile } from '../modules/pdf/context/pdfEngineStore';

export type LandingRouteState = { fromLandingFile?: boolean } | null;

export function shouldPreserveLandingFileTransition(
    previousPath: string,
    nextPath: string,
    routeState: LandingRouteState,
    pendingPdfFile: PendingPdfFile | null,
) {
    return previousPath === '/'
        && nextPath !== '/'
        && routeState?.fromLandingFile === true
        && pendingPdfFile?.source === 'landing-page';
}
