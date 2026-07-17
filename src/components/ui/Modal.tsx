import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { nextFocusIndex } from './accessibility';

type ModalProps = {
    title: string;
    children: ReactNode;
    onClose: () => void;
};

export function Modal({ title, children, onClose }: ModalProps) {
    const titleId = useId();
    const dialogRef = useRef<HTMLElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const openerRef = useRef<HTMLElement | null>(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const focusable = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []);
        const initialFocusFrame = window.requestAnimationFrame(() => (closeButtonRef.current ?? focusable()[0])?.focus());
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onCloseRef.current();
                return;
            }
            if (event.key !== 'Tab') return;
            const items = focusable();
            const activeIndex = items.indexOf(document.activeElement as HTMLElement);
            const nextIndex = nextFocusIndex(items.length, activeIndex, event.shiftKey);
            if (nextIndex < 0) return;
            if (activeIndex < 0 || (event.shiftKey && activeIndex === 0) || (!event.shiftKey && activeIndex === items.length - 1)) {
                event.preventDefault();
                items[nextIndex]?.focus();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.cancelAnimationFrame(initialFocusFrame);
            window.removeEventListener('keydown', onKeyDown);
            if (openerRef.current?.isConnected) openerRef.current.focus();
        };
    }, []);

    return (
        <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
            <section ref={dialogRef} className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} onMouseDown={(event) => event.stopPropagation()}>
                <div className="modal__header">
                    <h2 id={titleId}>{title}</h2>
                    <button ref={closeButtonRef} className="icon-button" type="button" onClick={onClose} aria-label="Close dialog" title="Close dialog">
                        <X size={19} aria-hidden="true" />
                    </button>
                </div>
                <div className="modal__content">{children}</div>
            </section>
        </div>
    );
}
