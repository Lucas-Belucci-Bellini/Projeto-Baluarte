/**
 * `<hc-modal>` — minimal accessible overlay modal.
 *
 * Open / close by setting the `open` property. Closes on Escape and
 * on backdrop click. Content goes in the default slot; an optional
 * named "footer" slot is rendered below the content.
 *
 * Emits `hc-modal-close` on close so the host can clean up.
 */

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('hc-modal')
export class Modal extends LitElement {
    @property({ type: Boolean, reflect: true }) open = false;
    @property({ type: String }) heading = '';

    static styles = css`
        :host { display: contents; }
        .backdrop {
            position: fixed;
            inset: 0;
            background: hsl(220 25% 4% / 0.65);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            padding: 16px;
        }
        .dialog {
            background: var(--hc-bg, #0b0e13);
            border: 1px solid var(--hc-border, #2a323e);
            border-radius: 10px;
            box-shadow: 0 24px 64px hsl(220 25% 2% / 0.6);
            width: min(560px, calc(100vw - 32px));
            max-height: calc(100vh - 32px);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            font-family: var(--hc-font-sans, 'Outfit', system-ui, sans-serif);
            color: var(--hc-text, #e6eaee);
        }
        header {
            padding: 14px 18px;
            border-bottom: 1px solid var(--hc-border, #2a323e);
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-weight: 600;
            font-size: 15px;
        }
        button.close {
            background: transparent;
            border: none;
            color: var(--hc-text-muted, #7b899d);
            cursor: pointer;
            font-size: 18px;
            line-height: 1;
            padding: 4px 8px;
            border-radius: 4px;
        }
        button.close:hover { background: hsl(220 20% 14%); color: var(--hc-text, #e6eaee); }
        .body { padding: 16px 18px; overflow-y: auto; }
        .footer {
            padding: 12px 18px;
            border-top: 1px solid var(--hc-border, #2a323e);
            display: flex;
            justify-content: flex-end;
            gap: 8px;
        }
    `;

    connectedCallback(): void {
        super.connectedCallback();
        this._onKey = this._onKey.bind(this);
        window.addEventListener('keydown', this._onKey);
    }
    disconnectedCallback(): void {
        window.removeEventListener('keydown', this._onKey);
        super.disconnectedCallback();
    }

    private _onKey(e: KeyboardEvent) {
        if (this.open && e.key === 'Escape') this._close();
    }

    private _close() {
        this.open = false;
        this.dispatchEvent(new CustomEvent('hc-modal-close', { bubbles: true, composed: true }));
    }

    render() {
        if (!this.open) return html``;
        return html`
            <div class="backdrop" @click=${(e: Event) => { if (e.target === e.currentTarget) this._close(); }}>
                <div class="dialog" role="dialog" aria-modal="true" aria-label=${this.heading}>
                    <header>
                        <span>${this.heading}</span>
                        <button class="close" @click=${this._close} aria-label="Close">×</button>
                    </header>
                    <div class="body"><slot></slot></div>
                    <div class="footer"><slot name="footer"></slot></div>
                </div>
            </div>
        `;
    }
}

declare global { interface HTMLElementTagNameMap { 'hc-modal': Modal; } }
