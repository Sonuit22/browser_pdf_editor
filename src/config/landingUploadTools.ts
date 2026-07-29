import { findToolByRoute } from './toolRegistry';

export const landingUploadToolRoutes = ['/sign-pdf', '/compress', '/split', '/remove-pages', '/extract-pages', '/organize'] as const;

export const landingUploadTools = landingUploadToolRoutes
    .map((route) => findToolByRoute(route))
    .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool));
