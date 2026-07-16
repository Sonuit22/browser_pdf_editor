type LoadingSpinnerProps = {
    label?: string;
};

export function LoadingSpinner({ label = 'Loading workspace' }: LoadingSpinnerProps) {
    return <span className="loading-spinner" role="status" aria-label={label} />;
}
