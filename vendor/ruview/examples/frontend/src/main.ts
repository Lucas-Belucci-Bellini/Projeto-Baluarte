/**
 * HOMECORE frontend entry point.
 * Imports global styles, registers Lit components, and mounts the app shell.
 */

import './styles/tokens.css';
import './styles/base.css';

// Register custom elements
import './components/AppShell.js';
import './components/StateCard.js';
import './pages/Dashboard.js';
import './pages/States.js';
import './pages/Services.js';
import './pages/Settings.js';

// Tiny router: the AppShell dispatches `hc-navigate` on every nav
// click. We swap whichever page element is sitting in its <slot>
// based on the new active id. Default page on first paint = dashboard.
const NAV_TO_TAG: Record<string, string> = {
    dashboard: 'hc-dashboard',
    states: 'hc-states',
    services: 'hc-services',
    settings: 'hc-settings',
};

function mountPage(shell: Element, tag: string): void {
    // Remove any existing page (everything that isn't itself the shell).
    Array.from(shell.children).forEach((c) => c.remove());
    shell.appendChild(document.createElement(tag));
}

window.addEventListener('DOMContentLoaded', () => {
    const shell = document.querySelector('hc-app-shell');
    if (!shell) return;
    mountPage(shell, 'hc-dashboard');
    shell.addEventListener('hc-navigate', (ev) => {
        const id = (ev as CustomEvent<{ id: string }>).detail?.id;
        const tag = id ? NAV_TO_TAG[id] : undefined;
        if (tag) mountPage(shell, tag);
    });
});
