/**
 * Services page — lists every registered service grouped by domain,
 * and lets the operator call any of them with a JSON service_data
 * payload (POST /api/services/<domain>/<service>).
 */

import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import type { ServiceDomainView } from '../api/types.js';
import '../components/Modal.js';

function resolveToken(): string {
    if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('homecore.token');
        if (stored) return stored;
    }
    const qs = new URL(window.location.href).searchParams.get('token');
    return qs ?? 'dev-token';
}

@customElement('hc-services')
export class ServicesPage extends LitElement {
    static styles = css`
        :host { display: block; padding: 24px; color: var(--hc-text, #e6eaee); font-family: var(--hc-font-sans, 'Outfit', system-ui, sans-serif); }
        h1 { font-size: 18px; font-weight: 600; margin: 0 0 16px 0; }
        .domain { background: hsl(220 20% 10%); border: 1px solid var(--hc-border, #2a323e); border-radius: 8px; margin-bottom: 12px; padding: 14px 16px; }
        .domain h2 { font-size: 14px; font-weight: 600; margin: 0 0 8px 0; color: var(--hc-primary, #19d4e5); font-family: var(--hc-font-mono, 'JetBrains Mono', monospace); }
        ul { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; gap: 6px; }
        li {
            background: hsl(220 25% 14%);
            padding: 0;
            border-radius: 4px;
            font-family: var(--hc-font-mono, 'JetBrains Mono', monospace);
            font-size: 12px;
            color: var(--hc-text-muted, #7b899d);
            display: inline-flex;
            align-items: center;
        }
        li .name { padding: 4px 10px; }
        li button.call {
            background: hsl(220 25% 18%);
            color: var(--hc-primary, #19d4e5);
            border: none;
            border-left: 1px solid var(--hc-border, #2a323e);
            padding: 4px 10px;
            font-size: 11px;
            cursor: pointer;
            font-family: var(--hc-font-sans, 'Outfit', system-ui, sans-serif);
            font-weight: 600;
            border-radius: 0 4px 4px 0;
        }
        li button.call:hover { background: var(--hc-primary, #19d4e5); color: var(--hc-primary-fg, #0b0e13); }
        .empty { padding: 24px; border: 1px dashed var(--hc-border, #2a323e); border-radius: 8px; text-align: center; color: var(--hc-text-muted, #7b899d); }
        .err { padding: 16px; border: 1px dashed #b35a5a; border-radius: 8px; color: #f0c0c0; font-size: 13px; }
        .toast { padding: 8px 12px; background: hsl(165 60% 16%); color: hsl(165 60% 80%); border-radius: 6px; font-size: 12px; margin-bottom: 12px; }

        /* Service-call modal contents */
        .form label { display: block; margin: 6px 0 4px; font-size: 12px; color: var(--hc-text-muted, #7b899d); }
        .form code.target { color: var(--hc-primary, #19d4e5); font-family: var(--hc-font-mono, 'JetBrains Mono', monospace); font-size: 13px; }
        .form textarea {
            width: 100%; box-sizing: border-box;
            padding: 8px 10px; background: hsl(220 25% 10%);
            border: 1px solid var(--hc-border, #2a323e); border-radius: 6px;
            color: var(--hc-text, #e6eaee);
            font-family: var(--hc-font-mono, 'JetBrains Mono', monospace);
            font-size: 13px;
            min-height: 90px;
            resize: vertical;
        }
        .form textarea.invalid { border-color: hsl(0 60% 50%); }
        .form .hint { font-size: 11px; color: var(--hc-text-muted, #7b899d); margin-top: 4px; }
        .form .field-status { font-size: 11px; margin-top: 4px; }
        .form .field-status.ok { color: hsl(150 60% 55%); }
        .form .field-status.err { color: hsl(0 70% 70%); }
        .form pre {
            background: hsl(220 25% 8%);
            border: 1px solid var(--hc-border, #2a323e);
            border-radius: 6px;
            padding: 12px;
            font-family: var(--hc-font-mono, 'JetBrains Mono', monospace);
            font-size: 12px;
            white-space: pre-wrap;
            word-break: break-word;
            max-height: 240px;
            overflow-y: auto;
            margin-top: 8px;
        }
        .form .resp-ok { border-color: hsl(150 50% 35%); }
        .form .resp-err { border-color: hsl(0 50% 45%); color: #f0c0c0; }
        .form .err { padding: 10px; margin-top: 10px; border: 1px solid #b35a5a; border-radius: 6px; background: hsl(0 35% 12%); color: #f0c0c0; font-size: 12px; }

        button.btn {
            padding: 8px 16px;
            background: hsl(220 25% 14%);
            color: var(--hc-text, #e6eaee);
            border: 1px solid var(--hc-border, #2a323e);
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
            font-family: var(--hc-font-sans, 'Outfit', system-ui, sans-serif);
        }
        button.btn:hover { background: hsl(220 20% 18%); }
        button.btn.primary { background: var(--hc-primary, #19d4e5); color: var(--hc-primary-fg, #0b0e13); border-color: var(--hc-primary, #19d4e5); font-weight: 600; }
        button.btn.primary[disabled] { background: hsl(220 15% 20%); color: var(--hc-text-muted, #7b899d); border-color: var(--hc-border, #2a323e); cursor: not-allowed; }
    `;

    @state() private domains: ServiceDomainView[] = [];
    @state() private error: string | null = null;
    @state() private loading = true;
    @state() private calling: { domain: string; service: string } | null = null;
    @state() private callBody = '{}';
    @state() private callResp: { ok: boolean; text: string } | null = null;
    @state() private callErr: string | null = null;
    @state() private callPending = false;
    @state() private callToast: string | null = null;

    connectedCallback(): void {
        super.connectedCallback();
        void this.refresh();
    }

    private async refresh(): Promise<void> {
        try {
            const r = await fetch('/api/services', { headers: { 'Authorization': `Bearer ${resolveToken()}` } });
            if (!r.ok) throw new Error(`/api/services -> HTTP ${r.status}`);
            this.domains = await r.json();
            this.error = null;
        } catch (e) {
            this.error = e instanceof Error ? e.message : String(e);
        } finally {
            this.loading = false;
        }
    }

    private _openCall(domain: string, service: string) {
        this.calling = { domain, service };
        this.callBody = '{}';
        this.callResp = null;
        this.callErr = null;
    }

    private _closeCall() {
        this.calling = null;
        this.callBody = '{}';
        this.callResp = null;
        this.callErr = null;
        this.callPending = false;
    }

    private _validateBody(): { ok: boolean; data?: unknown; msg?: string } {
        const raw = this.callBody.trim();
        if (!raw) return { ok: true, data: {} };
        try {
            const parsed = JSON.parse(raw);
            if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
                return { ok: false, msg: 'service_data must be a JSON object (not array, not scalar)' };
            }
            return { ok: true, data: parsed };
        } catch (e) {
            return { ok: false, msg: `JSON parse: ${e instanceof Error ? e.message : String(e)}` };
        }
    }

    private async _doCall() {
        if (!this.calling) return;
        const v = this._validateBody();
        if (!v.ok) {
            this.callErr = v.msg ?? 'invalid';
            this.callResp = null;
            return;
        }
        this.callPending = true;
        this.callErr = null;
        const { domain, service } = this.calling;
        try {
            const r = await fetch(`/api/services/${encodeURIComponent(domain)}/${encodeURIComponent(service)}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${resolveToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(v.data ?? {}),
            });
            const text = await r.text();
            if (r.ok) {
                let pretty = text;
                try { pretty = JSON.stringify(JSON.parse(text), null, 2); } catch { /* leave raw */ }
                this.callResp = { ok: true, text: pretty };
                this.callToast = `Called ${domain}.${service} → 200`;
                window.setTimeout(() => (this.callToast = null), 3000);
            } else {
                this.callResp = { ok: false, text: `HTTP ${r.status}\n${text}` };
            }
        } catch (e) {
            this.callErr = e instanceof Error ? e.message : String(e);
        } finally {
            this.callPending = false;
        }
    }

    render() {
        if (this.error) return html`<div class="err">backend unreachable — ${this.error}</div>`;
        if (this.loading) return html`<div>loading services…</div>`;
        if (this.domains.length === 0) {
            return html`
                <h1>Services (0 domains)</h1>
                <div class="empty">
                    No services registered. Services are registered by plugins
                    (Wasmtime or InProcess) or by integrations that call
                    <code>services::register()</code> on boot.
                </div>
            `;
        }
        const validity = this._validateBody();
        return html`
            ${this.callToast ? html`<div class="toast">${this.callToast}</div>` : ''}
            <h1>Services (${this.domains.length} domain${this.domains.length === 1 ? '' : 's'})</h1>
            ${this.domains.map(d => html`
                <div class="domain">
                    <h2>${d.domain}</h2>
                    <ul>
                        ${Object.keys(d.services).map(name => html`
                            <li>
                                <span class="name">${name}</span>
                                <button class="call"
                                        @click=${() => this._openCall(d.domain, name)}
                                        title="Call ${d.domain}.${name}">▶ Call</button>
                            </li>
                        `)}
                    </ul>
                </div>
            `)}

            <hc-modal .open=${this.calling !== null}
                      heading=${this.calling ? `Call ${this.calling.domain}.${this.calling.service}` : ''}
                      @hc-modal-close=${this._closeCall}>
                <div class="form">
                    <label>target</label>
                    <div><code class="target">POST /api/services/${this.calling?.domain ?? ''}/${this.calling?.service ?? ''}</code></div>

                    <label for="body">service_data (JSON object)</label>
                    <textarea id="body"
                              class=${validity.ok ? '' : 'invalid'}
                              .value=${this.callBody}
                              @input=${(e: Event) => (this.callBody = (e.target as HTMLTextAreaElement).value)}
                              placeholder='{ "entity_id": "light.kitchen_ceiling", "brightness": 200 }'></textarea>
                    <div class="hint">leave blank for <code>{}</code> — these handlers are no-op echoes, they round-trip whatever you send</div>
                    ${validity.ok
                        ? (this.callBody.trim()
                            ? html`<div class="field-status ok">✓ service_data OK</div>`
                            : html`<div class="hint">empty → will send <code>{}</code></div>`)
                        : html`<div class="field-status err">✗ ${validity.msg}</div>`}

                    ${this.callErr ? html`<div class="err">${this.callErr}</div>` : ''}
                    ${this.callResp
                        ? html`<label>response</label>
                               <pre class=${this.callResp.ok ? 'resp-ok' : 'resp-err'}>${this.callResp.text}</pre>`
                        : ''}
                </div>
                <button slot="footer" class="btn" @click=${this._closeCall}>Close</button>
                <button slot="footer" class="btn primary"
                        ?disabled=${!validity.ok || this.callPending}
                        @click=${this._doCall}>
                    ${this.callPending ? 'Calling…' : 'Call'}
                </button>
            </hc-modal>
        `;
    }
}

declare global { interface HTMLElementTagNameMap { 'hc-services': ServicesPage; } }
