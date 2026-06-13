var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ClaudeCodeSkillsPlugin
});
module.exports = __toCommonJS(main_exports);
var fs3 = __toESM(require("fs"));
var path3 = __toESM(require("path"));
var os3 = __toESM(require("os"));
var import_obsidian3 = require("obsidian");

// src/types.ts
var DEFAULT_SETTINGS = {
  claudeBinPath: "",
  // auto-detected on first load; enter manually if needed
  workingDirectory: "",
  // must be configured — directory containing CLAUDE.md
  timeout: 12e4,
  maxBudgetUsd: 0.25,
  outputFolder: "",
  // empty = vault root
  enabledSkills: []
  // empty = all skills enabled
};

// src/skillDiscovery.ts
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var os = __toESM(require("os"));
function parseFrontmatter(content) {
  const result = {};
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return result;
  for (const line of match[1].split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    if (key && value) result[key] = value;
  }
  return result;
}
function discoverSkills() {
  var _a;
  const skillsDir = path.join(os.homedir(), ".claude", "skills");
  let entries;
  try {
    entries = fs.readdirSync(skillsDir, { withFileTypes: true });
  } catch (e) {
    return [];
  }
  const skills = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillMdPath = path.join(skillsDir, entry.name, "SKILL.md");
    let content;
    try {
      content = fs.readFileSync(skillMdPath, "utf8");
    } catch (e) {
      continue;
    }
    const fm = parseFrontmatter(content);
    if (!fm.name) continue;
    skills.push({
      id: entry.name,
      name: fm.name,
      description: (_a = fm.description) != null ? _a : ""
    });
  }
  return skills;
}

// src/contextMenu.ts
function registerContextMenu(plugin, skills, onSkillSelect) {
  plugin.registerEvent(
    plugin.app.workspace.on("editor-menu", (menu, editor) => {
      const selected = editor.getSelection();
      if (!selected || selected.trim().length === 0) return;
      if (skills.length === 0) return;
      menu.addSeparator();
      for (const skill of skills) {
        menu.addItem(
          (item) => item.setTitle(`Claude: ${skill.name}`).setSection("claude").onClick(() => onSkillSelect(skill, selected))
        );
      }
    })
  );
}

// src/claudePanel.ts
var import_obsidian = require("obsidian");

// src/executor.ts
var import_child_process = require("child_process");
var fs2 = __toESM(require("fs"));
var path2 = __toESM(require("path"));
var os2 = __toESM(require("os"));
var VALID_BINARY_NAMES = ["claude", "claude-code", "claude.cmd"];
function validatePaths(settings) {
  const name = path2.basename(settings.claudeBinPath);
  if (!VALID_BINARY_NAMES.includes(name)) {
    throw new Error(
      `Unexpected binary name "${name}". Expected one of: ${VALID_BINARY_NAMES.join(", ")}`
    );
  }
  try {
    fs2.accessSync(settings.claudeBinPath, fs2.constants.X_OK);
  } catch (e) {
    throw new Error(`Binary not found or not executable: ${settings.claudeBinPath}`);
  }
  if (settings.workingDirectory.trim()) {
    try {
      const stat = fs2.statSync(settings.workingDirectory);
      if (!stat.isDirectory()) {
        throw new Error(`Working directory is not a directory: ${settings.workingDirectory}`);
      }
    } catch (err) {
      if (err.code === "ENOENT") {
        throw new Error(`Working directory does not exist: ${settings.workingDirectory}`);
      }
      throw err;
    }
  }
}
function buildSpawnTarget(claudeBin, claudeArgs) {
  const shell = process.platform === "win32";
  return { command: claudeBin, args: claudeArgs, shell };
}
function runWithSkillStreaming(skillId, text, settings, sessionId, onChunk, onDone, onError) {
  try {
    validatePaths(settings);
  } catch (err) {
    onError(err);
    return () => {
    };
  }
  const message = skillId ? `/${skillId}

${text}` : text;
  const claudeArgs = [
    "--print",
    "--output-format",
    "stream-json",
    "--include-partial-messages",
    "--verbose"
  ];
  if (settings.maxBudgetUsd > 0) {
    claudeArgs.push("--max-budget-usd", String(settings.maxBudgetUsd));
  }
  if (sessionId) {
    claudeArgs.push("--resume", sessionId);
  }
  const { command, args, shell } = buildSpawnTarget(settings.claudeBinPath, claudeArgs);
  const cwd = settings.workingDirectory.trim() || os2.homedir();
  const proc = (0, import_child_process.spawn)(command, args, {
    cwd,
    shell,
    env: { ...process.env, HOME: os2.homedir(), CLAUDE_OBSIDIAN_PLUGIN: "1" }
  });
  proc.stdin.write(message);
  proc.stdin.end();
  let buffer = "";
  let finalResult = "";
  let capturedSessionId = null;
  let killed = false;
  const timeoutId = activeWindow.setTimeout(() => {
    if (!killed) {
      killed = true;
      proc.kill();
      onError(new Error(`Claude timed out after ${settings.timeout / 1e3}s`));
    }
  }, settings.timeout);
  proc.stdout.on("data", (rawChunk) => {
    var _a;
    buffer += rawChunk.toString("utf8");
    const lines = buffer.split("\n");
    buffer = (_a = lines.pop()) != null ? _a : "";
    for (const line of lines) {
      if (!line.trim()) continue;
      let event;
      try {
        event = JSON.parse(line);
      } catch (e) {
        continue;
      }
      if (event.type === "stream_event" && event.event && typeof event.event === "object") {
        const inner = event.event;
        if (inner.type === "content_block_delta" && inner.delta && typeof inner.delta === "object") {
          const delta = inner.delta;
          if (delta.type === "text_delta" && typeof delta.text === "string" && delta.text) {
            onChunk(delta.text);
          }
        }
      }
      if (event.type === "result") {
        if (typeof event.result === "string") {
          finalResult = event.result;
        }
        if (typeof event.session_id === "string") {
          capturedSessionId = event.session_id;
        }
      }
    }
  });
  proc.on("close", () => {
    activeWindow.clearTimeout(timeoutId);
    if (!killed) {
      onDone(finalResult, capturedSessionId);
    }
  });
  proc.on("error", (err) => {
    activeWindow.clearTimeout(timeoutId);
    if (!killed) {
      killed = true;
      onError(err);
    }
  });
  return () => {
    if (!killed) {
      killed = true;
      activeWindow.clearTimeout(timeoutId);
      proc.kill();
    }
  };
}

// src/claudePanel.ts
var CLAUDE_PANEL_VIEW_TYPE = "claude-skills-chat";
var ClaudePanel = class extends import_obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.sessionId = null;
    this.cancelFn = null;
    this.isStreaming = false;
    this.lastResponseText = "";
    this.conversationLog = [];
    // full transcript for Create Note
    this.activeSkillName = null;
    this.hasFirstChunk = false;
    this.loadingEl = null;
    this.currentStreamPre = null;
    this.currentStreamContainer = null;
    this.plugin = plugin;
  }
  getViewType() {
    return CLAUDE_PANEL_VIEW_TYPE;
  }
  getDisplayText() {
    return "Claude";
  }
  getIcon() {
    return "bot";
  }
  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("claude-panel-root");
    const sessionBar = contentEl.createDiv({ cls: "claude-panel-session-bar" });
    this.skillLabelEl = sessionBar.createDiv({ cls: "claude-panel-skill-label" });
    this.skillLabelEl.setText("No active session");
    this.messagesEl = contentEl.createDiv({ cls: "claude-panel-messages" });
    const footer = contentEl.createDiv({ cls: "claude-panel-footer" });
    const inputRow = footer.createDiv({ cls: "claude-panel-input-row" });
    this.inputEl = inputRow.createEl("textarea", {
      cls: "claude-panel-input",
      attr: { placeholder: "Ask a follow-up... (Enter to send, Shift+Enter for newline)" }
    });
    this.sendBtn = inputRow.createEl("button", {
      cls: "claude-panel-send-btn",
      text: "\u2192"
    });
    this.sendBtn.addEventListener("click", () => this.handleSend());
    this.inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });
    const actionRow = footer.createDiv({ cls: "claude-panel-action-row" });
    const copyBtn = actionRow.createEl("button", { text: "Copy last" });
    copyBtn.addEventListener("click", () => {
      if (this.lastResponseText) {
        navigator.clipboard.writeText(this.lastResponseText).then(() => new import_obsidian.Notice("Copied to clipboard")).catch(() => new import_obsidian.Notice("Copy failed \u2014 check clipboard permissions"));
      }
    });
    const createNoteBtn = actionRow.createEl("button", { text: "Create note" });
    createNoteBtn.addEventListener("click", () => void this.createNote());
    const closeBtn = actionRow.createEl("button", {
      cls: "claude-close-session-btn",
      text: "Close session"
    });
    closeBtn.addEventListener("click", () => this.closeSession());
    this.updateInputState();
  }
  async onClose() {
    var _a;
    (_a = this.cancelFn) == null ? void 0 : _a.call(this);
    this.cancelFn = null;
  }
  // ── Public entry points ────────────────────────────────────────────────────
  /**
   * Called from context menu: starts a new conversation with the given skill
   * and selected text. Adds a visual separator if a previous session exists.
   */
  startConversation(skill, selectedText) {
    var _a;
    if (!this.messagesEl) return;
    (_a = this.cancelFn) == null ? void 0 : _a.call(this);
    this.isStreaming = false;
    const hasHistory = this.messagesEl.childElementCount > 0;
    if (hasHistory) {
      this.messagesEl.createEl("hr", { cls: "claude-panel-separator" });
    }
    this.sessionId = null;
    this.conversationLog = [];
    this.activeSkillName = skill.name;
    this.skillLabelEl.setText(`Skill: ${skill.name}`);
    const preview = selectedText.length > 300 ? selectedText.slice(0, 300) + "\u2026" : selectedText;
    this.addUserBubble(preview);
    this.send(skill.id, selectedText);
  }
  /**
   * Called from ribbon/command palette: opens the panel in freeform chat mode.
   * The user types a message in the input box.
   */
  startFreeform() {
    var _a;
    if (!this.messagesEl) return;
    this.skillLabelEl.setText(this.sessionId ? "Chat (session active)" : "Chat");
    (_a = this.inputEl) == null ? void 0 : _a.focus();
  }
  // ── Internal send / stream ─────────────────────────────────────────────────
  handleSend() {
    const text = this.inputEl.value.trim();
    if (!text || this.isStreaming) return;
    this.inputEl.value = "";
    this.addUserBubble(text);
    this.send(null, text);
  }
  send(skillId, text) {
    var _a;
    this.isStreaming = true;
    this.hasFirstChunk = false;
    this.updateInputState();
    const skillContext = (_a = this.activeSkillName) != null ? _a : "Chat";
    this.skillLabelEl.setText(`${skillContext} \xB7 connecting\u2026`);
    this.skillLabelEl.addClass("is-streaming");
    const assistantDiv = this.messagesEl.createDiv({ cls: "claude-msg-assistant" });
    assistantDiv.createDiv({ cls: "claude-msg-label" }).setText("Claude");
    this.currentStreamContainer = assistantDiv.createDiv({ cls: "claude-msg-content" });
    this.loadingEl = this.currentStreamContainer.createDiv({ cls: "claude-loading-dots" });
    this.loadingEl.createSpan();
    this.loadingEl.createSpan();
    this.loadingEl.createSpan();
    this.currentStreamPre = null;
    this.scrollToBottom();
    const cancel = runWithSkillStreaming(
      skillId,
      text,
      this.plugin.settings,
      this.sessionId,
      (chunk) => this.appendChunk(chunk),
      (fullText, sid) => void this.finalize(fullText, sid),
      (err) => {
        var _a2;
        this.isStreaming = false;
        this.cancelFn = null;
        (_a2 = this.loadingEl) == null ? void 0 : _a2.remove();
        this.loadingEl = null;
        this.skillLabelEl.removeClass("is-streaming");
        this.skillLabelEl.setText(`${skillContext} \xB7 error`);
        this.updateInputState();
        new import_obsidian.Notice(`Claude error: ${err.message}`);
        if (this.currentStreamContainer) {
          this.currentStreamContainer.empty();
          this.currentStreamContainer.createSpan({
            cls: "claude-error",
            text: `Error: ${err.message}`
          });
        }
        this.currentStreamPre = null;
        this.currentStreamContainer = null;
      }
    );
    this.cancelFn = cancel;
  }
  appendChunk(text) {
    var _a, _b, _c;
    if (!this.hasFirstChunk) {
      this.hasFirstChunk = true;
      (_a = this.loadingEl) == null ? void 0 : _a.remove();
      this.loadingEl = null;
      if (this.currentStreamContainer) {
        this.currentStreamPre = this.currentStreamContainer.createEl("pre", {
          cls: "claude-streaming"
        });
      }
      this.skillLabelEl.setText(`${(_b = this.activeSkillName) != null ? _b : "Chat"} \xB7 streaming\u2026`);
    }
    if (this.currentStreamPre) {
      this.currentStreamPre.textContent = ((_c = this.currentStreamPre.textContent) != null ? _c : "") + text;
      this.scrollToBottom();
    }
  }
  async finalize(fullText, sessionId) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    this.isStreaming = false;
    this.cancelFn = null;
    (_a = this.loadingEl) == null ? void 0 : _a.remove();
    this.loadingEl = null;
    this.skillLabelEl.removeClass("is-streaming");
    if (sessionId) this.sessionId = sessionId;
    const textToRender = fullText || ((_c = (_b = this.currentStreamPre) == null ? void 0 : _b.textContent) != null ? _c : "");
    if (textToRender) {
      this.lastResponseText = textToRender;
      this.conversationLog.push(`**Claude:**

${textToRender}`);
    }
    const container = this.currentStreamContainer;
    this.currentStreamPre = null;
    this.currentStreamContainer = null;
    if (container) {
      container.empty();
      const renderedEl = container.createDiv({ cls: "claude-result-rendered" });
      const sourcePath = (_e = (_d = this.app.workspace.getActiveFile()) == null ? void 0 : _d.path) != null ? _e : "";
      await import_obsidian.MarkdownRenderer.render(
        this.app,
        textToRender,
        renderedEl,
        sourcePath,
        this
      ).catch(() => {
        renderedEl.empty();
        renderedEl.createEl("pre").setText(textToRender);
      });
    }
    this.skillLabelEl.setText(
      this.sessionId ? `${(_f = this.activeSkillName) != null ? _f : "Chat"} \xB7 session active` : (_g = this.activeSkillName) != null ? _g : "Chat"
    );
    this.updateInputState();
    this.scrollToBottom();
    (_h = this.inputEl) == null ? void 0 : _h.focus();
  }
  // ── Close session ──────────────────────────────────────────────────────────
  closeSession() {
    var _a;
    (_a = this.cancelFn) == null ? void 0 : _a.call(this);
    this.cancelFn = null;
    this.sessionId = null;
    this.isStreaming = false;
    this.lastResponseText = "";
    this.conversationLog = [];
    this.activeSkillName = null;
    this.leaf.detach();
  }
  // ── Helpers ────────────────────────────────────────────────────────────────
  addUserBubble(text) {
    const div = this.messagesEl.createDiv({ cls: "claude-msg-user" });
    div.createDiv({ cls: "claude-msg-label" }).setText("You");
    div.createDiv({ cls: "claude-msg-content" }).setText(text);
    this.conversationLog.push(`**You:** ${text}`);
    this.scrollToBottom();
  }
  scrollToBottom() {
    if (this.messagesEl) {
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }
  }
  updateInputState() {
    if (!this.inputEl || !this.sendBtn) return;
    this.inputEl.disabled = this.isStreaming;
    this.sendBtn.disabled = this.isStreaming;
    this.sendBtn.textContent = this.isStreaming ? "\u2026" : "\u2192";
  }
  async createNote() {
    var _a, _b;
    if (this.conversationLog.length === 0) return;
    const noteContent = this.conversationLog.join("\n\n---\n\n");
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const skillPart = ((_a = this.activeSkillName) != null ? _a : "Chat").replace(/[/\\:*?"<>|]/g, "-");
    const fileName = `Claude - ${skillPart} - ${timestamp}.md`;
    const folder = this.plugin.settings.outputFolder.trim().replace(/^\/+|\/+$/g, "");
    const filePath = (0, import_obsidian.normalizePath)(folder ? `${folder}/${fileName}` : fileName);
    if (folder) {
      const folderPath = (0, import_obsidian.normalizePath)(folder);
      if (!this.app.vault.getAbstractFileByPath(folderPath)) {
        try {
          await this.app.vault.createFolder(folderPath);
        } catch (err) {
          const msg = (_b = err.message) != null ? _b : "";
          if (!msg.toLowerCase().includes("already exist")) {
            new import_obsidian.Notice(`Could not create folder "${folderPath}": ${msg}`);
            return;
          }
        }
      }
    }
    try {
      const file = await this.app.vault.create(filePath, noteContent);
      await this.app.workspace.openLinkText(file.path, "", true);
      new import_obsidian.Notice(`Created: ${file.path}`);
    } catch (err) {
      new import_obsidian.Notice(`Failed to create note: ${err.message}`);
    }
  }
};

// src/settings.ts
var import_obsidian2 = require("obsidian");
var ClaudeSkillsSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian2.Setting(containerEl).setName("Claude binary path").setDesc(
      "Full path to the claude CLI binary. Run 'which claude' in a terminal to find it. Auto-detected on first load if left empty."
    ).addText(
      (text) => text.setPlaceholder("e.g. /usr/local/bin/claude").setValue(this.plugin.settings.claudeBinPath).onChange((value) => {
        this.plugin.settings.claudeBinPath = value.trim();
        void this.plugin.saveSettings();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("Working directory").setDesc(
      "Directory passed as cwd to the claude subprocess. Must contain a CLAUDE.md file for project context to load. Skills use this path to resolve !`cmd` expansions."
    ).addText(
      (text) => text.setPlaceholder("e.g. /home/user/Documents/ClaudeCode").setValue(this.plugin.settings.workingDirectory).onChange((value) => {
        this.plugin.settings.workingDirectory = value.trim();
        void this.plugin.saveSettings();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("Timeout (ms)").setDesc(
      "Maximum milliseconds to wait for a response before killing the subprocess."
    ).addText(
      (text) => text.setPlaceholder("120000").setValue(String(this.plugin.settings.timeout)).onChange((value) => {
        const n = parseInt(value.trim(), 10);
        if (!isNaN(n) && n > 0) {
          this.plugin.settings.timeout = n;
          void this.plugin.saveSettings();
        }
      })
    );
    new import_obsidian2.Setting(containerEl).setName("Max budget per query").setDesc(
      "Hard API spend cap per skill invocation. The subprocess is killed if this is exceeded. Set to 0 to disable."
    ).addText(
      (text) => text.setPlaceholder("0.25").setValue(String(this.plugin.settings.maxBudgetUsd)).onChange((value) => {
        const n = parseFloat(value.trim());
        if (!isNaN(n) && n >= 0) {
          this.plugin.settings.maxBudgetUsd = n;
          void this.plugin.saveSettings();
        }
      })
    );
    new import_obsidian2.Setting(containerEl).setName("Output folder").setDesc(
      "Folder inside your vault where 'Create note' saves results. Created automatically if it does not exist. Leave empty to save to the vault root."
    ).addText(
      (text) => text.setPlaceholder("Outputs").setValue(this.plugin.settings.outputFolder).onChange((value) => {
        this.plugin.settings.outputFolder = value.trim();
        void this.plugin.saveSettings();
      })
    );
    new import_obsidian2.Setting(containerEl).setName("Skills").setHeading();
    const skills = this.plugin.skills;
    if (skills.length === 0) {
      containerEl.createEl("p", {
        text: "No skills found in ~/.claude/skills/. Add skill folders there and reload the plugin.",
        cls: "setting-item-description"
      });
    } else {
      containerEl.createEl("p", {
        text: "Toggle which skills appear in the editor context menu. All skills are enabled by default.",
        cls: "setting-item-description"
      });
      for (const skill of skills) {
        const isEnabled = this.plugin.settings.enabledSkills.length === 0 || this.plugin.settings.enabledSkills.includes(skill.id);
        new import_obsidian2.Setting(containerEl).setName(skill.name).setDesc(skill.description || skill.id).addToggle(
          (toggle) => toggle.setValue(isEnabled).onChange((value) => {
            const current = this.plugin.settings.enabledSkills;
            if (value) {
              const next = current.filter((id) => id !== skill.id).concat(skill.id);
              this.plugin.settings.enabledSkills = next.length === skills.length ? [] : next;
            } else {
              const base = current.length === 0 ? skills.map((s) => s.id) : current;
              this.plugin.settings.enabledSkills = base.filter((id) => id !== skill.id);
            }
            void this.plugin.saveSettings();
          })
        );
      }
    }
  }
};

// src/main.ts
function detectClaudeBinary() {
  const home = os3.homedir();
  const candidates = process.platform === "win32" ? [
    path3.join(home, "AppData", "Roaming", "npm", "claude.cmd"),
    path3.join(home, "AppData", "Roaming", "npm", "claude")
  ] : [
    path3.join(home, ".local", "bin", "claude"),
    // npm --prefix ~/.local (Linux)
    "/usr/local/bin/claude",
    // npm global standard
    "/usr/bin/claude",
    // system package
    path3.join(home, ".npm-global", "bin", "claude"),
    "/opt/homebrew/bin/claude",
    // macOS Homebrew
    path3.join(home, ".nvm", "current", "bin", "claude")
    // nvm
  ];
  for (const p of candidates) {
    try {
      fs3.accessSync(p, fs3.constants.X_OK);
      return p;
    } catch (e) {
      continue;
    }
  }
  return "";
}
var ClaudeCodeSkillsPlugin = class extends import_obsidian3.Plugin {
  constructor() {
    super(...arguments);
    this.skills = [];
  }
  async onload() {
    await this.loadSettings();
    if (!this.settings.claudeBinPath) {
      const detected = detectClaudeBinary();
      if (detected) {
        this.settings.claudeBinPath = detected;
        await this.saveSettings();
        new import_obsidian3.Notice(`Claude binary auto-detected at ${detected}`);
      } else {
        new import_obsidian3.Notice(
          "Claude binary not found. Set the path in plugin settings."
        );
      }
    }
    this.skills = discoverSkills();
    if (this.skills.length === 0) {
      new import_obsidian3.Notice("No skills found in ~/.claude/skills/");
    }
    this.registerView(
      CLAUDE_PANEL_VIEW_TYPE,
      (leaf) => new ClaudePanel(leaf, this)
    );
    registerContextMenu(this, this.getEnabledSkills(), (skill, selectedText) => {
      void this.openPanel().then((panel) => panel.startConversation(skill, selectedText));
    });
    this.addRibbonIcon("bot", "Open skills panel", () => {
      void this.openPanel().then((panel) => panel.startFreeform());
    });
    this.addCommand({
      id: "open-claude-panel",
      name: "Open panel",
      callback: () => {
        void this.openPanel().then((panel) => panel.startFreeform());
      }
    });
    this.addSettingTab(new ClaudeSkillsSettingTab(this.app, this));
  }
  onunload() {
  }
  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  /**
   * Returns the subset of discovered skills that are enabled in settings.
   * An empty enabledSkills list means all skills are enabled.
   */
  getEnabledSkills() {
    if (this.settings.enabledSkills.length === 0) return this.skills;
    return this.skills.filter((s) => this.settings.enabledSkills.includes(s.id));
  }
  /**
   * Opens the Claude side panel in the right sidebar.
   * Reuses the existing leaf if the panel is already open.
   */
  async openPanel() {
    const { workspace } = this.app;
    const existing = workspace.getLeavesOfType(CLAUDE_PANEL_VIEW_TYPE);
    if (existing.length > 0) {
      await workspace.revealLeaf(existing[0]);
      return existing[0].view;
    }
    const leaf = workspace.getRightLeaf(false);
    if (!leaf) {
      throw new Error("Claude Code Skills: could not open a sidebar panel");
    }
    await leaf.setViewState({ type: CLAUDE_PANEL_VIEW_TYPE, active: true });
    await workspace.revealLeaf(leaf);
    return leaf.view;
  }
};

/* nosourcemap */