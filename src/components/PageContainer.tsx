import type { ReactNode } from 'react';

type PageContainerProps = {
    title: string;
    eyebrow: string;
    description: string;
    children: ReactNode;
};

export function PageContainer({ title, eyebrow, description, children }: PageContainerProps) {
    return (
        <div className="page-container">
            <header className="page-container__header">
                <p className="eyebrow">{eyebrow}</p>
                <h1>{title}</h1>
                <p>{description}</p>
            </header>
            {children}
        </div>
    );
}
