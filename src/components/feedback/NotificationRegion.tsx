import { useEffect, useState } from 'react';
import type { NotificationKind } from './notifications';

type Notice = { id: number; message: string; kind: NotificationKind };
export function NotificationRegion() {
    const [notices, setNotices] = useState<Notice[]>([]);
    useEffect(() => {
        const onNotice = (event: Event) => { const detail = (event as CustomEvent<Omit<Notice, 'id'>>).detail; const id = Date.now(); setNotices((current) => [...current, { ...detail, id }].slice(-3)); window.setTimeout(() => setNotices((current) => current.filter((notice) => notice.id !== id)), 4200); };
        window.addEventListener('pdf-editor-notification', onNotice);
        return () => window.removeEventListener('pdf-editor-notification', onNotice);
    }, []);
    return <div className="notification-region" aria-relevant="additions">{notices.map((notice) => <div key={notice.id} className={`notification notification--${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>{notice.message}</div>)}</div>;
}
