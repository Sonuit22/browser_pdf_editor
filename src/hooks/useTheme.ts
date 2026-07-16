import { useContext } from 'react';
import { ThemeContext } from '../contexts/themeStore';

export function useTheme() {
    const theme = useContext(ThemeContext);

    if (!theme) {
        throw new Error('useTheme must be used within ThemeProvider');
    }

    return theme;
}
