// Claude Sync - Obsidian Plugin
// Automatically imports Claude chat exports from a watched folder

const { Plugin, PluginSettingTab, Setting, Notice, TFolder, normalizePath } = require('obsidian');
const fs = require('fs');
const path = require('path');

const DEFAULT_SETTINGS = {
  watchFolder: '',
  vaultFolder: 'Claude Chats',
  deleteAfterImport: true,
  showNotifications: true,
  watchInterval: 5000, // 5 seconds
};

class ClaudeSyncPlugin extends Plugin {
  async onload() {
    console.log('Claude Sync: Loading plugin');

    await this.loadSettings();

    // Add settings tab
    this.addSettingTab(new ClaudeSyncSettingTab(this.app, this));

    // Add ribbon icon
    this.addRibbonIcon('download', 'Claude Sync', () => {
      this.manualSync();
    });

    // Add command
    this.addCommand({
      id: 'sync-now',
      name: 'Sync now',
      callback: () => this.manualSync(),
    });

    this.addCommand({
      id: 'open-watch-folder',
      name: 'Open watch folder',
      callback: () => this.openWatchFolder(),
    });

    // Start watching if configured
    if (this.settings.watchFolder) {
      this.startWatching();
    }
  }

  onunload() {
    console.log('Claude Sync: Unloading plugin');
    this.stopWatching();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

    // Set default watch folder based on OS
    if (!this.settings.watchFolder) {
      const homeDir = process.env.HOME || process.env.USERPROFILE;
      this.settings.watchFolder = path.join(homeDir, 'Downloads', 'Claude Exports');
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  startWatching() {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
    }

    console.log(`Claude Sync: Watching folder: ${this.settings.watchFolder}`);

    // Check immediately
    this.checkForNewFiles();

    // Then check periodically
    this.watchInterval = setInterval(() => {
      this.checkForNewFiles();
    }, this.settings.watchInterval);
  }

  stopWatching() {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
    }
  }

  restartWatching() {
    this.stopWatching();
    if (this.settings.watchFolder) {
      this.startWatching();
    }
  }

  async checkForNewFiles() {
    const watchFolder = this.settings.watchFolder;

    if (!watchFolder || !fs.existsSync(watchFolder)) {
      return;
    }

    try {
      const files = this.getMarkdownFiles(watchFolder);

      for (const filePath of files) {
        await this.importFile(filePath);
      }
    } catch (error) {
      console.error('Claude Sync: Error checking files:', error);
    }
  }

  getMarkdownFiles(folderPath, recursive = true) {
    const files = [];

    if (!fs.existsSync(folderPath)) {
      return files;
    }

    const entries = fs.readdirSync(folderPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(folderPath, entry.name);

      if (entry.isDirectory() && recursive) {
        // Recurse into subdirectories
        files.push(...this.getMarkdownFiles(fullPath, recursive));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  async importFile(sourcePath) {
    try {
      const fileName = path.basename(sourcePath);
      const relativePath = path.relative(this.settings.watchFolder, sourcePath);
      const subFolder = path.dirname(relativePath);

      // Build destination path (use normalizePath for cross-platform compatibility)
      let destFolder = this.settings.vaultFolder;
      if (subFolder && subFolder !== '.') {
        destFolder = normalizePath(destFolder + '/' + subFolder);
      } else {
        destFolder = normalizePath(destFolder);
      }

      // Ensure destination folder exists in vault
      await this.ensureFolder(destFolder);

      // Read file content
      const content = fs.readFileSync(sourcePath, 'utf8');

      // Destination path in vault (normalized for Obsidian)
      const destPath = normalizePath(destFolder + '/' + fileName);

      // Check if file already exists
      const existingFile = this.app.vault.getAbstractFileByPath(destPath);
      if (existingFile) {
        // File already imported, skip
        if (this.settings.deleteAfterImport) {
          fs.unlinkSync(sourcePath);
        }
        return;
      }

      // Create file in vault
      await this.app.vault.create(destPath, content);

      console.log(`Claude Sync: Imported ${fileName}`);

      if (this.settings.showNotifications) {
        new Notice(`Claude Sync: Imported "${fileName}"`);
      }

      // Delete source file if configured
      if (this.settings.deleteAfterImport) {
        fs.unlinkSync(sourcePath);

        // Clean up empty directories
        this.cleanEmptyDirs(path.dirname(sourcePath));
      }
    } catch (error) {
      console.error(`Claude Sync: Error importing ${sourcePath}:`, error);

      if (this.settings.showNotifications) {
        new Notice(`Claude Sync: Failed to import file`);
      }
    }
  }

  async ensureFolder(folderPath) {
    // Normalize and split path (handles both / and \ separators)
    const normalized = normalizePath(folderPath);
    const folders = normalized.split('/').filter(f => f.length > 0);
    let currentPath = '';

    for (const folder of folders) {
      currentPath = currentPath ? normalizePath(currentPath + '/' + folder) : folder;

      const existing = this.app.vault.getAbstractFileByPath(currentPath);
      if (!existing) {
        await this.app.vault.createFolder(currentPath);
      }
    }
  }

  cleanEmptyDirs(dirPath) {
    // Don't delete the watch folder itself
    if (dirPath === this.settings.watchFolder) {
      return;
    }

    try {
      const files = fs.readdirSync(dirPath);
      if (files.length === 0) {
        fs.rmdirSync(dirPath);
        // Recursively clean parent
        this.cleanEmptyDirs(path.dirname(dirPath));
      }
    } catch (error) {
      // Ignore errors
    }
  }

  async manualSync() {
    if (!this.settings.watchFolder) {
      new Notice('Claude Sync: Please configure the watch folder in settings');
      return;
    }

    if (!fs.existsSync(this.settings.watchFolder)) {
      new Notice(`Claude Sync: Watch folder not found: ${this.settings.watchFolder}`);
      return;
    }

    const files = this.getMarkdownFiles(this.settings.watchFolder);

    if (files.length === 0) {
      new Notice('Claude Sync: No files to import');
      return;
    }

    new Notice(`Claude Sync: Importing ${files.length} file(s)...`);

    for (const filePath of files) {
      await this.importFile(filePath);
    }

    new Notice('Claude Sync: Import complete');
  }

  openWatchFolder() {
    const folder = this.settings.watchFolder;

    if (!folder) {
      new Notice('Claude Sync: Watch folder not configured');
      return;
    }

    // Create folder if it doesn't exist
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    // Open in system file manager
    const { shell } = require('electron');
    shell.openPath(folder);
  }
}

class ClaudeSyncSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Claude Sync Settings' });

    // Description
    containerEl.createEl('p', {
      text: 'Automatically imports Claude chat exports from a folder on your computer into your vault.',
      cls: 'setting-item-description'
    });

    // Watch folder
    new Setting(containerEl)
      .setName('Watch folder')
      .setDesc('Folder to watch for new Claude exports (full path)')
      .addText(text => text
        .setPlaceholder('/Users/you/Downloads/Claude Exports')
        .setValue(this.plugin.settings.watchFolder)
        .onChange(async (value) => {
          this.plugin.settings.watchFolder = value;
          await this.plugin.saveSettings();
          this.plugin.restartWatching();
        }));

    // Vault folder
    new Setting(containerEl)
      .setName('Vault folder')
      .setDesc('Folder inside your vault where chats will be saved')
      .addText(text => text
        .setPlaceholder('Claude Chats')
        .setValue(this.plugin.settings.vaultFolder)
        .onChange(async (value) => {
          this.plugin.settings.vaultFolder = value || 'Claude Chats';
          await this.plugin.saveSettings();
        }));

    // Delete after import
    new Setting(containerEl)
      .setName('Delete after import')
      .setDesc('Remove files from watch folder after importing to vault')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.deleteAfterImport)
        .onChange(async (value) => {
          this.plugin.settings.deleteAfterImport = value;
          await this.plugin.saveSettings();
        }));

    // Show notifications
    new Setting(containerEl)
      .setName('Show notifications')
      .setDesc('Display a notification when files are imported')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showNotifications)
        .onChange(async (value) => {
          this.plugin.settings.showNotifications = value;
          await this.plugin.saveSettings();
        }));

    // Watch interval
    new Setting(containerEl)
      .setName('Check interval')
      .setDesc('How often to check for new files (in seconds)')
      .addSlider(slider => slider
        .setLimits(1, 60, 1)
        .setValue(this.plugin.settings.watchInterval / 1000)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.watchInterval = value * 1000;
          await this.plugin.saveSettings();
          this.plugin.restartWatching();
        }));

    // Manual actions
    containerEl.createEl('h3', { text: 'Actions' });

    new Setting(containerEl)
      .setName('Sync now')
      .setDesc('Manually import all files from the watch folder')
      .addButton(button => button
        .setButtonText('Sync Now')
        .onClick(() => this.plugin.manualSync()));

    new Setting(containerEl)
      .setName('Open watch folder')
      .setDesc('Open the watch folder in your file manager')
      .addButton(button => button
        .setButtonText('Open Folder')
        .onClick(() => this.plugin.openWatchFolder()));

    // Status
    containerEl.createEl('h3', { text: 'Status' });

    const watchFolder = this.plugin.settings.watchFolder;
    const folderExists = watchFolder && fs.existsSync(watchFolder);
    const fileCount = folderExists ? this.plugin.getMarkdownFiles(watchFolder).length : 0;

    const statusEl = containerEl.createEl('div', { cls: 'claude-sync-status' });

    if (!watchFolder) {
      statusEl.createEl('p', { text: '⚠️ Watch folder not configured' });
    } else if (!folderExists) {
      statusEl.createEl('p', { text: `⚠️ Watch folder not found: ${watchFolder}` });
    } else {
      statusEl.createEl('p', { text: `✓ Watching: ${watchFolder}` });
      statusEl.createEl('p', { text: `📄 Files waiting: ${fileCount}` });
    }
  }
}

module.exports = ClaudeSyncPlugin;

/* nosourcemap */