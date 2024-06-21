import { App, Modal, Notice, Plugin, PluginSettingTab, Setting, addIcon, MarkdownView } from 'obsidian';

interface EnglishWordData {
    word: string;
    meaning: string;
    example: string;
    example_translation: string;
}

export default class EnglishLearningPlugin extends Plugin {
    async onload() {
        console.log('loading English Learning plugin');

		addIcon('english-word', `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="1.5" width="100" height="100" color="#000000"><defs><style>.cls-6374f8d9b67f094e4896c628-1{fill:none;stroke:currentColor;stroke-miterlimit:10;}</style></defs><rect class="cls-6374f8d9b67f094e4896c628-1" x="3.39" y="1.5" width="19.09" height="21"></rect><circle class="cls-6374f8d9b67f094e4896c628-1" cx="13.89" cy="8.18" r="2.86"></circle><path class="cls-6374f8d9b67f094e4896c628-1" d="M9.11,15.82l.21-1a4.65,4.65,0,0,1,4.57-3.74h0a4.64,4.64,0,0,1,4.56,3.74l.21,1"></path><line class="cls-6374f8d9b67f094e4896c628-1" x1="0.52" y1="5.32" x2="6.25" y2="5.32"></line><line class="cls-6374f8d9b67f094e4896c628-1" x1="0.52" y1="10.09" x2="6.25" y2="10.09"></line><line class="cls-6374f8d9b67f094e4896c628-1" x1="0.52" y1="14.86" x2="6.25" y2="14.86"></line><line class="cls-6374f8d9b67f094e4896c628-1" x1="0.52" y1="19.64" x2="6.25" y2="19.64"></line></svg>`);

        // add ribbon icon
        this.addRibbonIcon('english-word', 'Add English Word', this.addEnglishWord.bind(this));

        this.addCommand({
            id: 'add-english-word',
            name: 'Add English Word',
            callback: this.addEnglishWord.bind(this)
        });

        this.addSettingTab(new EnglishLearningSettingTab(this.app, this));
    }

    onunload() {
        console.log('unloading English Learning plugin');
    }

    async addEnglishWord() {
        const wordData = await this.getWordDataFromUser();
        if (wordData) {
            const formattedContent = this.formatWordData(wordData);
            await this.appendToCurrentNote(formattedContent);
            new Notice('English Word has been added');
        }
    }

    async getWordDataFromUser(): Promise<EnglishWordData | null> {
        return new Promise((resolve) => {
            const modal = new EnglishWordModal(this.app, (result) => resolve(result));
            modal.open();
        });
    }

    formatWordData(data: EnglishWordData): string {
        return `
## ${data.word}
${data.meaning}

---

${data.example}
${data.example_translation}
`;
    }

    async appendToCurrentNote(content: string) {
        const currentView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (currentView) {
            const file = currentView.file;
            if (file) {
                const currentContent = await this.app.vault.read(file);
                await this.app.vault.modify(file, currentContent + '\n' + content);
            } else {
                new Notice('The current view is not associated with a file');
            }
        } else {
            new Notice('There is no active view');
        }
    }
}

class EnglishWordModal extends Modal {
    result: EnglishWordData;
    onSubmit: (result: EnglishWordData) => void;

    constructor(app: App, onSubmit: (result: EnglishWordData) => void) {
        super(app);
        this.onSubmit = onSubmit;
        this.result = { word: '', meaning: '', example: '', example_translation: '' };
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl("h1", { text: "Add English Word" });

        new Setting(contentEl)
            .setName("English Word")
            .addText(text => text
                .setPlaceholder("Enter English word")
                .onChange(value => this.result.word = value));

        new Setting(contentEl)
            .setName("Meaning in Japanese")
            .addText(text => text
                .setPlaceholder("Enter Japanese meaning")
                .onChange(value => this.result.meaning = value));

        new Setting(contentEl)
            .setName("Some Example Text (English)")
            .addText(text => text
                .setPlaceholder("Enter English example")
                .onChange(value => this.result.example = value));

        new Setting(contentEl)
            .setName("Some Example Text (Japanese)")
            .addText(text => text
                .setPlaceholder("Enter Japanese translation")
                .onChange(value => this.result.example_translation = value));

        new Setting(contentEl)
            .addButton(btn => btn
                .setButtonText("Add")
                .setCta()
                .onClick(() => {
                    this.close();
                    this.onSubmit(this.result);
                }));
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

class EnglishLearningSettingTab extends PluginSettingTab {
    plugin: EnglishLearningPlugin;

    constructor(app: App, plugin: EnglishLearningPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;

        containerEl.empty();

        containerEl.createEl('h2', {text: 'English Learning Plugin Settings'});

        new Setting(containerEl)
            .setName('Example Setting')
            .setDesc('This is an example setting.')
            .addText(text => text
                .setPlaceholder('Enter your setting')
                .setValue('')
                .onChange(async (value) => {
                    console.log('Example setting: ' + value);
                    await this.plugin.saveData({exampleSetting: value});
                }));
    }
}
