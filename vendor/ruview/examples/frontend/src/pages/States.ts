/**
 * States page — full table view of every entity in the state machine.
 * Mirrors Home Assistant's `/developer-tools/state` view (read-only).
 */

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { HomecoreClient } from '../api/client.js';
import type { StateView } from '../api/types.js';

function resolveToken(): string {
    if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('homecore.token');
        if (stored) return stored;
    }
    const qs = new URL(window.location.href).searchParams.get('token');
    return qs ?? 'dev-token';
}

@customElement('hc-states')
export class StatesPage extends LitElement {
    static styles = css`
        :host { display: block; padding: 24px; color: var(--hc-text, #e6eaee); font-family: var(--hc-font-sans, 'Outfit', system-ui, sans-serif); }
        h1 { font-size: 18px; font-weight: 600; margin: 0 0 16px 0; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--hc-border, #2a323e); color: var(--hc-text-muted, #7b899d); font-weight: 500; }
        td { padding: 10px 12px; border-bottom: 1px solid hsl(220 15% 14%); font-family: var(--hc-font-mono, 'JetBrains Mono', monospace); }
        td.attrs { color: var(--hc-text-muted, #7b899d); font-size: 12px; max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        tr:hover td { background: hsl(220 20% 10%); }
        .state { color: var(--hc-primary, #19d4e5); }
        .err { padding: 16px; border: 1px dashed #b35a5a; border-radius: 8px; color: #f0c0c0; font-family: var(--hc-font-mono, 'JetBrains Mono', monospace); font-size: 13px; }
    `;

    @state() private states: StateView[] = [];
    @state() private error: string | null = null;
    @state() private loading = true;

    private client = new HomecoreClient({ token: resolveToken() });
    private timer?: number;

    connectedCallback(): void {
        super.connectedCallback();
        void this.refresh();
        this.timer = window.setInterval(() => void this.refresh(), 5000);
    }
    disconnectedCallback(): void {
        if (this.timer !== undefined) window.clearInterval(this.timer);
        super.disconnectedCallback();
    }

    private async refresh(): Promise<void> {
        try {
            this.states = await this.client.getStates();
            this.error = null;
        } catch (e) {
            this.error = e instanceof Error ? e.message : String(e);
        } finally {
            this.loading = false;
        }
    }

    render() {
        if (this.error) return html`<div class="err">backend unreachable — ${this.error}</div>`;
        if (this.loading) return html`<div>loading…</div>`;
        return html`
            <h1>States (${this.states.length})</h1>
            <table>
                <thead><tr><th>entity_id</th><th>state</th><th>last_changed</th><th>attributes</th></tr></thead>
                <tbody>
                    ${this.states.map(s => html`
                        <tr>
                            <td>${s.entity_id}</td>
                            <td class="state">${s.state}</td>
                            <td>${s.last_changed.replace('T', ' ').replace(/\..*$/, '')}</td>
                            <td class="attrs" title=${JSON.stringify(s.attributes)}>${JSON.stringify(s.attributes)}</td>
                        </tr>
                    `)}
                </tbody>
            </table>
        `;
    }
}

declare global { interface HTMLElementTagNameMap { 'hc-states': StatesPage; } }
