export type NotificationKind = 'success' | 'error' | 'info';
export const DOWNLOAD_SUCCESS_MESSAGE = 'Document downloaded successfully';
export function notify(message: string, kind: NotificationKind = 'success') { window.dispatchEvent(new CustomEvent('pdf-editor-notification', { detail: { message, kind } })); }
