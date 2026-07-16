import { createContext, useContext } from 'react';

type ShellContextValue = {
    requestUpload: () => void;
};

export const ShellContext = createContext<ShellContextValue | null>(null);

export function useShell() {
    const shell = useContext(ShellContext);

    if (!shell) {
        throw new Error('useShell must be used inside AppLayout');
    }

    return shell;
}
