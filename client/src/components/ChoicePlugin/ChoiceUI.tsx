import {ButtonView, Locale, Plugin} from 'ckeditor5';

export default class ChoiceUI extends Plugin {
    public init(): void {
        const editor = this.editor;

        editor.ui.componentFactory.add('insertChoiceBox', (locale: Locale) => {
            const view = new ButtonView(locale);
            view.set({
                label: editor.config.get('choice.label') ?? 'Choice',
                icon: this._getIcon(),
                withText: true
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
      <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24">
        <path d="M19 3H5c-1.1 0-2 .9-2 
        2v14c0 1.1.9 2 2 
        2h14c1.1 0 2-.9 
        2-2V5c0-1.1-.9-2-2-2zm-10 
        14l-5-5 1.41-1.41L9 
        14.17l9.59-9.59L20 6l-11 11z"/>
      </svg>
    `;
    }

}
