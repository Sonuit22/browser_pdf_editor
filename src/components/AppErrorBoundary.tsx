import { Component, type ReactNode } from 'react';

type AppErrorBoundaryProps = { children: ReactNode };
type AppErrorBoundaryState = { hasError: boolean };

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
    state: AppErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(): AppErrorBoundaryState {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return <main className="app-recovery" aria-labelledby="app-recovery-title"><section className="error-state" role="alert"><h1 id="app-recovery-title">The editor could not continue</h1><p>Your PDF stays on this device. Reload the page to start a fresh local session.</p><button className="button button--primary" type="button" onClick={() => window.location.reload()}>Reload editor</button></section></main>;
        }
        return this.props.children;
    }
}
