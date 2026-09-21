/**
 * Dashboard page — fetches HOMECORE state + config from the backend and
 * populates the `<hc-app-shell>` slot with a grid of `<hc-state-card>`.
 *
 * Auth: reads bearer from `localStorage["homecore.token"]`, the
 * `?token=` query string, or `HOMECORE_TOKEN` `<meta>` tag — in that
 * order. Falls back to the literal "dev-token" in DEV-mode backends
 * (any non-empty bearer is accepted when HOMECORE_TOKENS is unset).
 */

import { LitElement, html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';

import { HomecoreClient } from '../api/client.js';
import type { ApiConfig, StateView } from '../api/types.js';
import '../components/Modal.js';
import '../components/EntityForm.js';
import type { EntityForm } from '../components/EntityForm.js';

function resolveToken(): string {
    if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('homecore.token');
        if (stored) return stored;
    }
    const url = new URL(window.location.href);
    const qs = url.searchParams.get('token');
    if (qs) return qs;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="homecore-token"]');
    if (meta?.content) return meta.content;
    return 'dev-token';
}

@customElement('hc-dashboard')
export class Dashboard extends LitElement {
    static styles = css`
        :host {
            display: block;
            padding: 24px;
            color: var(--hc-fg, #e6e9ec);
            font-family: var(--hc-font-sans, 'Outfit', system-ui, sans-serif);
        }
        .meta {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            color: var(--hc-fg-dim, #8a93a0);
            font-size: 14px;
            margin-bottom: 16px;
        }
        .meta strong { color: var(--hc-fg, #e6e9ec); }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: 16px;
        }
        .empty,
        .err {
            padding: 24px;
            border: 1px dashed var(--hc-border, #2a323e);
            border-radius: 8px;
            text-align: center;
            color: var(--hc-fg-dim, #8a93a0);
        }
        .err {
            border-color: #b35a5a;
            color: #f0c0c0;
            text-align: left;
            font-family: var(--hc-font-mono, 'JetBrains Mono', monospace);
            font-size: 13px;
            white-space: pre-wrap;
        }
        .toolbar { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
        .toolbar .grow { flex: 1; }
        button.add {
            padding: 7px 14px;
            background: var(--hc-primary, #19d4e5);
            color: var(--hc-primary-fg, #0b0e13);
            border: none; border-radius: 6px;
            font-size: 13px; font-weight: 600;
            cursor: pointer;
            font-family: var(--hc-font-sans, 'Outfit', system-ui, sans-serif);
        }
        button.add:hover { background: hsl(185 80% 55%); }
        button.btn {
            padding: 7px 14px;
            background: hsl(220 25% 14%);
            color: var(--hc-text, #e6eaee);
            border: 1px solid var(--hc-border, #2a323e);
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
            font-family: var(--hc-font-sans, 'Outfit', system-ui, sans-serif);
        }
        button.btn:hover { background: hsl(220 20% 18%); }
        button.primary { background: var(--hc-primary, #19d4e5); color: var(--hc-primary-fg, #0b0e13); border-color: var(--hc-primary, #19d4e5); font-weight: 600; }
        .toast { padding: 8px 12px; background: hsl(165 60% 16%); color: hsl(165 60% 80%); border-radius: 6px; font-size: 12px; margin-bottom: 12px; }
    `;

    @state() private states: StateView[] = [];
    @state() private config: ApiConfig | null = null;
    @state() private error: string | null = null;
    @state() private loading = true;
    @state() private modalOpen = false;
    @state() private submitToast: string | null = null;
    @state() private editingState: StateView | null = null;  // null = create mode
    @state() private deletingState: StateView | null = null; // null = no confirm

    @query('hc-entity-form') private _form?: EntityForm;

    private client = new HomecoreClient({ token: resolveToken() });
    private pollTimer: number | undefined;

    connectedCallback(): void {
        super.connectedCallback();
        void this.refresh();
        this.pollTimer = window.setInterval(() => void this.refresh(), 5000);
    }

    disconnectedCallback(): void {
        if (this.pollTimer !== undefined) window.clearInterval(this.pollTimer);
        super.disconnectedCallback();
    }

    private async refresh(): Promise<void> {
        try {
            const [cfg, states] = await Promise.all([
                this.client.getConfig(),
                this.client.getStates(),
            ]);
            this.config = cfg;
            this.states = states;
            this.error = null;
        } catch (e) {
            this.error = e instanceof Error ? e.message : String(e);
        } finally {
            this.loading = false;
        }
    }

    private _openCreate() {
        this.editingState = null;
        this.modalOpen = true;
    }

    private _openEdit(e: CustomEvent<{ state: StateView }>) {
        this.editingState = e.detail.state;
        this.modalOpen = true;
    }

    private _openDeleteConfirm(e: CustomEvent<{ state: StateView }>) {
        this.deletingState = e.detail.state;
    }

    private async _confirmDelete() {
        const target = this.deletingState;
        if (!target) return;
        try {
            const resp = await fetch(`/api/states/${encodeURIComponent(target.entity_id)}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${resolveToken()}` },
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
            this.deletingState = null;
            this.submitToast = `Deleted ${target.entity_id}`;
            window.setTimeout(() => (this.submitToast = null), 3000);
            await this.refresh();
        } catch (err) {
            this.error = err instanceof Error ? err.message : String(err);
            this.deletingState = null;
        }
    }

    private async _onSubmit(e: CustomEvent<{ entity_id: string; state: string; attributes: Record<string, unknown> }>) {
        const { entity_id, state, attributes } = e.detail;
        const wasEditing = this.editingState !== null;
        // Clear any previous server-side error before the next attempt.
        this._form?.setSubmitError(null);
        try {
            const resp = await fetch(`/api/states/${encodeURIComponent(entity_id)}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${resolveToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ state, attributes }),
            });
            if (!resp.ok) {
                // Surface the server message inline in the form, not at
                // the top of the page — the form is what the user is
                // looking at.
                const body = await resp.text();
                this._form?.setSubmitError(`server rejected (${resp.status}): ${body || resp.statusText}`);
                return;
            }
            this.modalOpen = false;
            this.editingState = null;
            this.submitToast = `${wasEditing ? 'Updated' : 'Created'} ${entity_id} = ${state}`;
            window.setTimeout(() => (this.submitToast = null), 3000);
            await this.refresh();
        } catch (err) {
            this._form?.setSubmitError(err instanceof Error ? err.message : String(err));
        }
    }

    render() {
        if (this.error && this.states.length === 0) {
            return html`<div class="err">backend unreachable — ${this.error}\n\n
                hint: make sure homecore-server is running on :8123 and that
                the token in localStorage["homecore.token"] is accepted.
            </div>`;
        }
        if (this.loading) {
            return html`<div class="empty">loading HOMECORE state…</div>`;
        }
        const v = this.config?.version ?? '?';
        const loc = this.config?.location_name ?? 'Home';
        return html`
            ${this.submitToast ? html`<div class="toast">${this.submitToast}</div>` : ''}
            <div class="toolbar">
                <span class="grow"></span>
                <button class="add" @click=${this._openCreate}>+ Add entity</button>
            </div>
            <div class="meta">
                <span><strong>${loc}</strong></span>
                <span>HOMECORE v<strong>${v}</strong></span>
                <span><strong>${this.states.length}</strong> entities</span>
            </div>
            ${this.states.length === 0
                ? html`<div class="empty">
                      No entities registered yet. Click <strong>+ Add entity</strong>
                      above, run <code>bash scripts/homecore-seed.sh</code>,
                      or boot <code>homecore-server</code> without
                      <code>--no-seed-entities</code>.
                  </div>`
                : html`<div class="grid"
                              @hc-state-card-click=${(e: Event) => this._openEdit(e as CustomEvent)}
                              @hc-state-card-delete=${(e: Event) => this._openDeleteConfirm(e as CustomEvent)}>
                      ${this.states.map(
                          (s) => html`<hc-state-card .state=${s}></hc-state-card>`
                      )}
                  </div>`}

            <hc-modal .open=${this.deletingState !== null}
                      heading="Delete entity"
                      @hc-modal-close=${() => (this.deletingState = null)}>
                <p style="margin:0 0 12px 0; line-height:1.5;">
                    Permanently remove
                    <code style="background:hsl(220 25% 14%); padding:2px 6px; border-radius:4px;">${this.deletingState?.entity_id ?? ''}</code>
                    from the state machine?
                    <br>
                    <span style="color:var(--hc-text-muted,#7b899d); font-size:12px;">
                        This is immediate. To restore, re-create the entity via "+ Add entity".
                    </span>
                </p>
                <button slot="footer" class="btn" @click=${() => (this.deletingState = null)}>Cancel</button>
                <button slot="footer" class="btn"
                        style="background:hsl(0 50% 25%); border-color:hsl(0 50% 35%); color:hsl(0 60% 88%);"
                        @click=${this._confirmDelete}>Delete</button>
            </hc-modal>

            <hc-modal .open=${this.modalOpen}
                      heading=${this.editingState ? `Edit ${this.editingState.entity_id}` : 'Add entity'}
                      @hc-modal-close=${() => { this.modalOpen = false; this.editingState = null; }}>
                <hc-entity-form
                    .entityId=${this.editingState?.entity_id ?? ''}
                    .state=${this.editingState?.state ?? ''}
                    .entityAttrs=${this.editingState?.attributes ?? {}}
                    .editing=${this.editingState !== null}
                    @hc-entity-submit=${(e: Event) => this._onSubmit(e as CustomEvent)}
                    @hc-entity-cancel=${() => { this.modalOpen = false; this.editingState = null; }}></hc-entity-form>
                <button slot="footer" class="btn" @click=${() => this._form?.requestCancel()}>Cancel</button>
                <button slot="footer" class="btn primary" @click=${() => this._form?.requestSubmit()}>${this.editingState ? 'Save' : 'Create'}</button>
            </hc-modal>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'hc-dashboard': Dashboard;
    }
}
