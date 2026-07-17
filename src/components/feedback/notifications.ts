export type NotificationKind = 'success' | 'error' | 'info';
export function notify(message: string, kind: NotificationKind = 'success') { window.dispatchEvent(new CustomEvent('pdf-editor-notification', { detail: { message, kind } })); }
