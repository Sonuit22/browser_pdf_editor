import { describe, expect, it } from 'vitest';
import { navigationItems, workspaceRoutes } from '../src/config/navigation';

describe('current navigation', () => {
    it('does not expose AI or OCR routes', () => {
        const labels = navigationItems.map((item) => item.label.toLowerCase()).join(' ');
        const routes = Object.keys(workspaceRoutes).join(' ');
        expect(labels).not.toContain('ai');
        expect(labels).not.toContain('ocr');
        expect(routes).not.toContain('/ai');
        expect(routes).not.toContain('/ocr');
    });
});
