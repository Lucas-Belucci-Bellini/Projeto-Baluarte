/**
 * Settings page — backend config + bearer-token editor with
 * probe-before-persist validation.
 *
 * The save flow probes `/api/config` with the new token BEFORE writing
 * it to localStorage. If the probe fails (401 wrong token, network
 * error, etc.) the bad token is NOT persisted and the operator sees
 * an inline error. This avoids the foot-gun where saving a typo'd
 * token would lock the UI out of the backend until the operator
 * cleared localStorage by hand.
 */

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { HomecoreClient } from '../api/client.js';
import type { ApiConfig } from '../api/types.js';

const TOKEN_LS_KEY = 'homecore.token';

function resolveToken(): string {
    if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(TOKEN_LS_KEY);
        if (stored) return stored;
    }
    const qs = new URL(window.location.href).searchParams.get('token');
    return qs ?? 'dev-token';
}

function maskToken(t: string): string {
    if (!t) return '(empty)';
    if (t.length <= 8) return '•'.repeat(t.length);
    return t.slice(0, 4) + '…' + t.slice(-3) + '  (' + t.length + ' chars)';
}

type ProbeResult =
    | { kind: 'idle' }
    | { kind: 'probing' }
    | { kind: 'ok'; ms: number; serverVersion: string }
    | { kind: 'err'; status?: number; msg: string };

@customElement('hc-settings')
export class SettingsPage extends LitElement {
    static styles = css`
        :host { display: block; padding: 24px; color: var(--hc-text, #e6eaee); font-family: var(--hc-font-sans, 'Outfit', system-ui, sans-serif); }
        h1 { font-size: 18px; font-weight: 600; margin: 0 0 16px 0; }
        section { background: hsl(220 20% 10%); border: 1px solid var(--hc-border, #2a323e); border-radius: 8px; padding: 16px; margin-bottom: 16px; }
        h2 { font-size: 14px; font-weight: 600; margin: 0 0 12px 0; color: var(--hc-primary, #19d4e5); }
        dl { display: grid; grid-template-columns: max-content 1fr; gap: 6px 18px; margin: 0; font-size: 13px; font-family: var(--hc-font-mono, 'JetBrains Mono', monospace); }
        dt { color: var(--hc-text-muted, #7b899d); }
        dd { margin: 0; word-break: break-all; }
        label { display: block; margin-bottom: 6px; font-size: 13px; color: var(--hc-text-muted, #7b899d); }
        input {
            width: 100%; box-sizing: border-box;
            padding: 8px 12px;
            background: hsl(220 25% 14%);
            border: 1px solid var(--hc-border, #2a323e);
            border-radius: 6px;
            color: var(--hc-text, #e6eaee);
            font-family: var(--hc-font-mono, 'JetBrains Mono', monospace);
            font-size: 13px;
        }
        input:focus { outline: 2px solid hsl(185 80% 50% / 0.5); border-color: var(--hc-primary, #19d4e5); }
        input.invalid { border-color: hsl(0 60% 50%); }
        .actions { margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap; }
        button {
            padding: 8px 16px;
            border-radius: 6px;
            border: 1px solid var(--hc-border, #2a323e);
            background: hsl(220 25% 14%);
            color: var(--hc-text, #e6eaee);
            font-family: var(--hc-font-sans, 'Outfit', system-ui, sans-serif);
            font-size: 13px;
            cursor: pointer;
        }
        button:hover { background: hsl(220 20% 18%); }
        button.primary { background: var(--hc-primary, #19d4e5); color: var(--hc-primary-fg, #0b0e13); border-color: var(--hc-primary, #19d4e5); font-weight: 600; }
        button.primary:hover { background: hsl(185 80% 55%); }
        button[disabled] { background: hsl(220 15% 20%); color: var(--hc-text-muted, #7b899d); cursor: not-allowed; }
        .hint { font-size: 11px; color: var(--hc-text-muted, #7b899d); margin-top: 6px; }
        .field-status { font-size: 12px; margin-top: 6px; display: flex; align-items: center; gap: 6px; }
        .field-status.ok { color: hsl(150 60% 55%); }
        .field-status.err { color: hsl(0 70% 70%); }
        .field-status.probing { color: var(--hc-text-muted, #7b899d); }
        .toast { font-size: 12px; color: var(--hc-primary, #19d4e5); margin-top: 8px; }
        .err { padding: 12px; border: 1px solid #b35a5a; border-radius: 6px; color: #f0c0c0; background: hsl(0 35% 12%); font-size: 13px; margin-top: 8px; }
        .saved-meta { font-size: 11px; color: var(--hc-text-muted, #7b899d); margin-top: 4px; font-family: var(--hc-font-mono, 'JetBrains Mono', monospace); }
    `;

    @state() private config: ApiConfig | null = null;
    @state() private configErr: string | null = null;
    @state() private token = resolveToken();
    @state() private storedToken = resolveToken();
    @state() private probe: ProbeResult = { kind: 'idle' };
    @state() private savedAt = 0;

    private client = new HomecoreClient({ token: resolveToken() });

    connectedCallback(): void {
        super.connectedCallback();
        void this.refreshConfig();
    }

    private async refreshConfig(): Promise<void> {
        try {
            this.config = await this.client.getConfig();
            this.configErr = null;
        } catch (e) {
            this.configErr = e instanceof Error ? e.message : String(e);
        }
    }

    /** Hit /api/config with the given token; return success or 4xx/5xx kind. */
    private async _probe(token: string): Promise<ProbeResult> {
        if (!token.trim()) return { kind: 'err', msg: 'token must not be empty' };
        const started = performance.now();
        try {
            const r = await fetch('/api/config', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!r.ok) {
                return { kind: 'err', status: r.status, msg: r.statusText || `HTTP ${r.status}` };
            }
            const cfg = await r.json() as ApiConfig;
            return { kind: 'ok', ms: Math.round(performance.now() - started), serverVersion: cfg.version };
        } catch (e) {
            return { kind: 'err', msg: e instanceof Error ? e.message : String(e) };
        }
    }

    private async _testToken() {
        this.probe = { kind: 'probing' };
        this.probe = await this._probe(this.token);
    }

    private async _saveToken() {
        const result = await this._probe(this.token);
        this.probe = result;
        if (result.kind !== 'ok') return;  // refuse to persist a bad token
        localStorage.setItem(TOKEN_LS_KEY, this.token);
        this.storedToken = this.token;
        this.savedAt = Date.now();
        // Rebuild the client with the new token + refresh the config readout.
        this.client = new HomecoreClient({ token: this.token });
        await this.refreshConfig();
    }

    private _clearToken() {
        localStorage.removeItem(TOKEN_LS_KEY);
        this.storedToken = '';
        this.token = '';
        this.probe = { kind: 'idle' };
        this.savedAt = 0;
    }

    private _renderProbe() {
        switch (this.probe.kind) {
            case 'idle':
                return html`<div class="hint">click Test token to probe /api/config with the value above</div>`;
            case 'probing':
                return html`<div class="field-status probing">⋯ probing /api/config…</div>`;
            case 'ok':
                return html`<div class="field-status ok">✓ token accepted (${this.probe.ms} ms) — server v${this.probe.serverVersion}</div>`;
            case 'err':
                return html`<div class="field-status err">✗ ${this.probe.status ? `HTTP ${this.probe.status}: ` : ''}${this.probe.msg}</div>`;
        }
    }

    render() {
        const isEmpty = !this.token.trim();
        const inputClass = isEmpty || this.probe.kind === 'err' ? 'invalid' : '';
        return html`
            <h1>Settings</h1>
            <section>
                <h2>backend</h2>
                ${this.configErr
                    ? html`<div class="err">unreachable — ${this.configErr}</div>`
                    : this.config
                    ? html`<dl>
                          <dt>location</dt><dd>${this.config.location_name}</dd>
                          <dt>version</dt><dd>${this.config.version}</dd>
                          <dt>state</dt><dd>${this.config.state}</dd>
                          <dt>components</dt><dd>${this.config.components.join(', ')}</dd>
                      </dl>`
                    : html`loading…`}
            </section>
            <section>
                <h2>auth — bearer token</h2>
                <label for="tok">localStorage["homecore.token"] — must be accepted by /api/config before save is allowed</label>
                <input id="tok" type="password" .value=${this.token}
                       class=${inputClass}
                       @input=${(e: Event) => { this.token = (e.target as HTMLInputElement).value; this.probe = { kind: 'idle' }; }} />
                <div class="saved-meta">currently stored: ${maskToken(this.storedToken)}</div>
                ${this._renderProbe()}
                <div class="actions">
                    <button @click=${this._testToken} ?disabled=${isEmpty}>Test token</button>
                    <button class="primary" @click=${this._saveToken} ?disabled=${isEmpty}>Probe &amp; Save</button>
                    <button @click=${this._clearToken}>Clear</button>
                </div>
                ${this.savedAt > 0
                    ? html`<div class="toast">✓ saved at ${new Date(this.savedAt).toLocaleTimeString()} — backend config refreshed with new token</div>`
                    : ''}
            </section>
        `;
    }
}

declare global { interface HTMLElementTagNameMap { 'hc-settings': SettingsPage; } }
