import { createContext, useContext } from 'react';

type ShellContextValue = {
    requestUpload: () => void;
    resetToolWorkspace: () => void;
    requestNavigation: (destination: string | 'back') => void;
};

export const ShellContext = createContext<ShellContextValue | null>(null);

export function useShell() {
    const shell = useContext(ShellContext);

    if (!shell) {
        throw new Error('useShell must be used inside AppLayout');
    }

    return shell;
}
