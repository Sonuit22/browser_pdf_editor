import type { WorkspaceRoute } from '../types/navigation';
import { toolRegistry } from './toolRegistry';

export const navigationItems = toolRegistry.filter((tool) => tool.enabled).map(({ title: label, route: path, icon }) => ({ label, path, icon, section: 'Workspace' as const }));
export const workspaceRoutes: Record<string, WorkspaceRoute> = Object.fromEntries(toolRegistry.map((tool) => [tool.route, {
    title: tool.title, eyebrow: 'Browser tool', description: tool.description,
}]));
