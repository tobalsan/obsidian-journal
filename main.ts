import { Plugin } from "obsidian";
import { JournalSettingTab } from "./src/settings/journal-settings";
import { JournalConfig } from "./src/config/journal-config";
import { JournalManager } from "./src/journal-manager";
import { CodeBlockProcessor } from "./src/code-block/code-block-processor";

export default class JournalPlugin extends Plugin {
  private config: JournalConfig;
  private manager: JournalManager;
  async onload() {
    const appStartup = document.body.querySelector(".progress-bar") !== null;

    this.config = new JournalConfig(this);
    await this.config.load();
    this.manager = new JournalManager(this.app, this, this.config);
    this.addChild(this.manager);

    this.addSettingTab(new JournalSettingTab(this.app, this, this.manager, this.config));

    this.manager.configureRibbonIcons();

    this.registerMarkdownCodeBlockProcessor("journal", (source, el, ctx) => {
      const processor = new CodeBlockProcessor(this.manager, source, el, ctx);
      ctx.addChild(processor);
      processor.display();
    });

    this.app.workspace.onLayoutReady(async () => {
      await this.manager.reindex();
      this.manager.configureCommands();
      if (appStartup) {
        await this.manager.autoCreateNotes();
        await this.manager.openStartupNote();
      }
    });
  }
}
