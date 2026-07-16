import { useEffect, useId, type ReactNode } from 'react';
import { X } from 'lucide-react';

type ModalProps = {
    title: string;
    children: ReactNode;
    onClose: () => void;
};

export function Modal({ title, children, onClose }: ModalProps) {
    const titleId = useId();

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    return (
        <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
            <section className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} onMouseDown={(event) => event.stopPropagation()}>
                <div className="modal__header">
                    <h2 id={titleId}>{title}</h2>
                    <button className="icon-button" type="button" onClick={onClose} aria-label="Close dialog" title="Close dialog">
                        <X size={19} aria-hidden="true" />
                    </button>
                </div>
                <div className="modal__content">{children}</div>
            </section>
        </div>
    );
}
