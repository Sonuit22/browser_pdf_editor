import { useEffect, useRef, useState } from 'react';
import type { NotificationKind } from './notifications';

type Notice = { id: number; message: string; kind: NotificationKind };
export function NotificationRegion() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const nextId = useRef(0);
    useEffect(() => {
        const timers = new Set<number>();
        const onNotice = (event: Event) => {
            const detail = (event as CustomEvent<Omit<Notice, 'id'>>).detail;
            const id = ++nextId.current;
            setNotices((current) => [...current, { ...detail, id }].slice(-3));
            const timer = window.setTimeout(() => {
                timers.delete(timer);
                setNotices((current) => current.filter((notice) => notice.id !== id));
            }, 4200);
            timers.add(timer);
        };
        window.addEventListener('pdf-editor-notification', onNotice);
        return () => {
            window.removeEventListener('pdf-editor-notification', onNotice);
            timers.forEach((timer) => window.clearTimeout(timer));
        };
    }, []);
    return <div className="notification-region" aria-relevant="additions">{notices.map((notice) => <div key={notice.id} className={`notification notification--${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}>{notice.message}</div>)}</div>;
}
