import { Component, type ReactNode } from 'react';

type AppErrorBoundaryProps = { children: ReactNode };
type AppErrorBoundaryState = { hasError: boolean };

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
    state: AppErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(): AppErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error) {
        if (import.meta.env.DEV) console.error('Unexpected application error', error);
    }

    render() {
        if (this.state.hasError) {
            return <main className="app-recovery" aria-labelledby="app-recovery-title"><section className="error-state" role="alert"><h1 id="app-recovery-title">PDF by ib could not continue</h1><p>An unexpected interface error occurred. File content is not included in this message.</p><div className="modal-actions"><button className="button button--secondary" type="button" onClick={() => { window.location.href = '/'; }}>Return home</button><button className="button button--primary" type="button" onClick={() => window.location.reload()}>Reload</button></div></section></main>;
        }
        return this.props.children;
    }
}
