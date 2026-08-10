import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export function RouteScrollManager() {
    const location = useLocation();
    const navigationType = useNavigationType();

    useLayoutEffect(() => {
        let frame = 0;
        const scroll = () => {
            if (location.hash) {
                let anchor = location.hash.slice(1);
                try {
                    anchor = decodeURIComponent(anchor);
                } catch {
                    // Keep malformed-but-valid URL fragments usable as literal element IDs.
                }
                const target = document.getElementById(anchor);
                if (target) {
                    target.scrollIntoView({ block: 'start' });
                    return;
                }
            }
            if (navigationType !== 'POP') window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        };
        frame = window.requestAnimationFrame(scroll);
        return () => window.cancelAnimationFrame(frame);
    }, [location.hash, location.key, location.pathname, location.search, navigationType]);

    return null;
}
