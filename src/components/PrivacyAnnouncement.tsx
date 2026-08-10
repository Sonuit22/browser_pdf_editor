import { ShieldCheck } from 'lucide-react';

const message = <>
    <ShieldCheck size={14} aria-hidden="true" />
    <span>Because your documents matter <b aria-hidden="true">•</b> Private PDF tools <b aria-hidden="true">•</b> Files stay on your device</span>
</>;

export function PrivacyAnnouncement() {
    return <aside className="privacy-announcement" aria-label="Privacy announcement">
        <div className="privacy-announcement__track">
            <span className="privacy-announcement__message">{message}</span>
            <span className="privacy-announcement__message" aria-hidden="true">{message}</span>
        </div>
    </aside>;
}
