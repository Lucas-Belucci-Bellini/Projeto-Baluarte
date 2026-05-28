/**
 * `<hc-entity-form>` — create / edit form for a single entity.
 *
 * Props:
 *   .entityId  — pre-populated when editing; empty for create
 *   .state     — pre-populated state value
 *   .attributes — pre-populated JSON object
 *   .editing   — true to lock entity_id (HA wire-compat doesn't rename)
 *
 * Emits:
 *   hc-entity-submit  detail: { entity_id, state, attributes }
 *   hc-entity-cancel
 *
 * Validation (client-side; backend validates again):
 *   - entity_id matches /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/
 *   - state is non-empty
 *   - attributes parses as a JSON object (not array, not scalar)
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

const ENTITY_ID_RE = /^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/;

/**
 * Known Home Assistant domain prefixes. We don't reject unknown domains
 * (the API accepts any matching the regex), but unknown ones get a
 * warning so the operator sees what's standard. Add new domains here
 * as integrations land.
 */
const KNOWN_DOMAINS = new Set([
    'sensor', 'binary_sensor', 'switch', 'light', 'climate', 'cover',
    'fan', 'media_player', 'lock', 'camera', 'vacuum', 'humidifier',
    'water_heater', 'scene', 'script', 'automation', 'input_boolean',
    'input_number', 'input_text', 'input_select', 'input_datetime',
    'person', 'device_tracker', 'zone', 'sun', 'weather', 'calendar',
    'remote', 'siren', 'select', 'number', 'text', 'button',
    'homeassistant', 'homecore', 'group', 'notify', 'tts', 'alarm_control_panel',
]);

type FieldValidity = { ok: true } | { ok: false; level: 'err' | 'warn'; msg: string };

function validateEntityId(id: string): FieldValidity {
    const trimmed = id.trim();
    if (!trimmed) return { ok: false, level: 'err', msg: 'required' };
    if (!ENTITY_ID_RE.test(trimmed)) {
        return {
            ok: false,
            level: 'err',
            msg: 'must match domain.snake_case (lowercase, digits, underscores)',
        };
    }
    const domain = trimmed.split('.')[0]!;
    if (!KNOWN_DOMAINS.has(domain)) {
        return {
            ok: false,
            level: 'warn',
            msg: `unknown domain "${domain}" — HA-standard domains include sensor / light / switch / binary_sensor / climate`,
        };
    }
    return { ok: true };
}

function validateState(s: string): FieldValidity {
    if (!s.trim()) return { ok: false, level: 'err', msg: 'required' };
    return { ok: true };
}

function validateAttrs(raw: string): FieldValidity {
    if (!raw.trim()) return { ok: true }; // empty = {}
    try {
        const parsed = JSON.parse(raw);
        if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
            return { ok: false, level: 'err', msg: 'must be a JSON object (not array, not scalar)' };
        }
        return { ok: true };
    } catch (e) {
        return { ok: false, level: 'err', msg: `JSON parse: ${e instanceof Error ? e.message : String(e)}` };
    }
}

@customElement('hc-entity-form')
export class EntityForm extends LitElement {
    @property({ type: String }) entityId = '';
    @property({ type: String }) state = '';
    @property({ type: Object }) entityAttrs: Record<string, unknown> = {};
    @property({ type: Boolean }) editing = false;

    @state() private _attrs = '';
    @state() private _err: string | null = null;
    /** Per-field live validity. `null` = haven't typed yet (no decoration). */
    @state() private _idValid: FieldValidity | null = null;
    @state() private _stateValid: FieldValidity | null = null;
    @state() private _attrsValid: FieldValidity | null = null;

    static styles = css`
        :host { display: block; font-family: var(--hc-font-sans, 'Outfit', system-ui, sans-serif); color: var(--hc-text, #e6eaee); }
        label { display: block; margin: 12px 0 4px; font-size: 12px; color: var(--hc-text-muted, #7b899d); }
        input, textarea {
            width: 100%; box-sizing: border-box;
            padding: 8px 10px; background: hsl(220 25% 10%);
            border: 1px solid var(--hc-border, #2a323e); border-radius: 6px;
            color: var(--hc-text, #e6eaee);
            font-family: var(--hc-font-mono, 'JetBrains Mono', monospace);
            font-size: 13px;
        }
        input:focus, textarea:focus { outline: 2px solid hsl(185 80% 50% / 0.5); border-color: var(--hc-primary, #19d4e5); }
        input[disabled] { opacity: 0.5; cursor: not-allowed; }
        input.invalid, textarea.invalid { border-color: hsl(0 60% 50%); }
        input.warn, textarea.warn { border-color: hsl(38 80% 55%); }
        .field-status { font-size: 11px; margin-top: 4px; display: flex; align-items: center; gap: 6px; }
        .field-status.ok { color: hsl(150 60% 55%); }
        .field-status.err { color: hsl(0 70% 70%); }
        .field-status.warn { color: hsl(38 80% 65%); }
        .field-status .sigil { display: inline-block; width: 12px; text-align: center; font-weight: 700; }
        button.primary[disabled] { background: hsl(220 15% 20%); color: var(--hc-text-muted, #7b899d); border-color: var(--hc-border, #2a323e); cursor: not-allowed; }
        textarea { min-height: 90px; resize: vertical; }
        .hint { font-size: 11px; color: var(--hc-text-muted, #7b899d); margin-top: 4px; }
        .err { margin-top: 10px; padding: 10px; border: 1px solid #b35a5a; border-radius: 6px; background: hsl(0 35% 12%); color: #f0c0c0; font-size: 12px; }
        button {
            padding: 8px 16px;
            border: 1px solid var(--hc-border, #2a323e);
            border-radius: 6px;
            background: hsl(220 25% 14%);
            color: var(--hc-text, #e6eaee);
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            font-family: inherit;
        }
        button.primary { background: var(--hc-primary, #19d4e5); color: var(--hc-primary-fg, #0b0e13); border-color: var(--hc-primary, #19d4e5); font-weight: 600; }
        button:hover { background: hsl(220 20% 18%); }
        button.primary:hover { background: hsl(185 80% 55%); }
    `;

    protected updated(changed: Map<string, unknown>): void {
        if (changed.has('entityAttrs')) {
            this._attrs = JSON.stringify(this.entityAttrs, null, 2);
        }
    }

    /** Allow the host (Dashboard) to surface a server-side error inline. */
    public setSubmitError(msg: string | null): void {
        this._err = msg;
    }

    /** True iff every field is valid (warnings are OK, errors block). Public so the host can bind a disabled state on the submit button. */
    public isValid(): boolean {
        const checks = [
            validateEntityId(this.entityId),
            validateState(this.state),
            validateAttrs(this._attrs),
        ];
        return !checks.some((c) => !c.ok && c.level === 'err');
    }

    private _onIdInput(v: string) {
        this.entityId = v;
        this._idValid = validateEntityId(v);
    }
    private _onStateInput(v: string) {
        this.state = v;
        this._stateValid = validateState(v);
    }
    private _onAttrsInput(v: string) {
        this._attrs = v;
        this._attrsValid = validateAttrs(v);
    }

    private _statusLine(label: string, v: FieldValidity | null) {
        if (v === null) return html``;
        if (v.ok) return html`<div class="field-status ok"><span class="sigil">✓</span>${label} OK</div>`;
        return html`<div class="field-status ${v.level}">
            <span class="sigil">${v.level === 'warn' ? '!' : '✗'}</span>${v.msg}
        </div>`;
    }

    private _fieldClass(v: FieldValidity | null): string {
        if (v === null || v.ok) return '';
        return v.level;
    }

    /** Public — call from host to trigger validation + emit submit event. */
    public requestSubmit(): void { this._submit(); }

    /** Public — call from host to dispatch cancel. */
    public requestCancel(): void { this._cancel(); }

    private _submit() {
        const id = this.entityId.trim();
        if (!ENTITY_ID_RE.test(id)) {
            this._err = `entity_id must match domain.snake_case (got "${id}")`;
            return;
        }
        const stateVal = this.state.trim();
        if (!stateVal) {
            this._err = 'state must not be empty';
            return;
        }
        let attrs: Record<string, unknown> = {};
        if (this._attrs.trim()) {
            try {
                const parsed = JSON.parse(this._attrs);
                if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
                    this._err = 'attributes must be a JSON object (not array, not scalar)';
                    return;
                }
                attrs = parsed as Record<string, unknown>;
            } catch (e) {
                this._err = `attributes JSON parse failed: ${e instanceof Error ? e.message : String(e)}`;
                return;
            }
        }
        this._err = null;
        this.dispatchEvent(new CustomEvent('hc-entity-submit', {
            detail: { entity_id: id, state: stateVal, attributes: attrs },
            bubbles: true, composed: true,
        }));
    }

    private _cancel() {
        this._err = null;
        this.dispatchEvent(new CustomEvent('hc-entity-cancel', { bubbles: true, composed: true }));
    }

    render() {
        return html`
            <form @submit=${(e: Event) => { e.preventDefault(); this._submit(); }}>
                <label for="eid">entity_id</label>
                <input id="eid" .value=${this.entityId}
                       class=${this._fieldClass(this._idValid)}
                       ?disabled=${this.editing}
                       @input=${(e: Event) => this._onIdInput((e.target as HTMLInputElement).value)}
                       placeholder="light.kitchen_ceiling" />
                <div class="hint">format: <code>domain.snake_case</code> — domain like sensor / light / switch / binary_sensor</div>
                ${this._statusLine('entity_id', this._idValid)}

                <label for="state">state</label>
                <input id="state" .value=${this.state}
                       class=${this._fieldClass(this._stateValid)}
                       @input=${(e: Event) => this._onStateInput((e.target as HTMLInputElement).value)}
                       placeholder="on / off / 42 / 14.5 / detected" />
                ${this._statusLine('state', this._stateValid)}

                <label for="attrs">attributes (JSON object)</label>
                <textarea id="attrs" .value=${this._attrs}
                          class=${this._fieldClass(this._attrsValid)}
                          @input=${(e: Event) => this._onAttrsInput((e.target as HTMLTextAreaElement).value)}
                          placeholder='{ "friendly_name": "Kitchen Ceiling", "brightness": 230 }'></textarea>
                <div class="hint">optional; leave blank for <code>{}</code></div>
                ${this._statusLine('attributes', this._attrsValid)}

                ${this._err ? html`<div class="err">${this._err}</div>` : ''}
            </form>
        `;
    }
}

declare global { interface HTMLElementTagNameMap { 'hc-entity-form': EntityForm; } }
