import { Plugin, ButtonView, Locale } from 'ckeditor5';

export default class ChoiceUI extends Plugin {
    public init(): void {
        const editor = this.editor;
        const t = editor.t;

        editor.ui.componentFactory.add('insertChoiceBox', (locale: Locale) => {
            const view = new ButtonView(locale);

            view.set({
                label: t('Insert choice box'),
                icon: this._getIcon(),
                tooltip: true
            });

            view.on('execute', () => {
                editor.execute('insertChoiceBox');
                editor.editing.view.focus();
            });

            return view;
        });
    }

    private _getIcon(): string {
        return `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
              <circle cx="4" cy="6" r="2" fill="currentColor"/>
              <circle cx="4" cy="12" r="2" fill="currentColor"/>
              <circle cx="4" cy="18" r="2" fill="currentColor"/>
              <rect x="8" y="5" width="10" height="2" fill="currentColor"/>
              <rect x="8" y="11" width="10" height="2" fill="currentColor"/>
              <rect x="8" y="17" width="10" height="2" fill="currentColor"/>
            </svg>
        `;
    }
}
