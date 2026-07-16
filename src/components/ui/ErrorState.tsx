type ErrorStateProps = {
    title?: string;
    description: string;
};

export function ErrorState({ title = 'Something needs attention', description }: ErrorStateProps) {
    return (
        <div className="error-state" role="alert">
            <strong>{title}</strong>
            <p>{description}</p>
        </div>
    );
}
