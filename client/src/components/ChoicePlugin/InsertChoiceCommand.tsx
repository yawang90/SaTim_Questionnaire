import { Command } from 'ckeditor5';

export default class InsertChoiceBoxCommand extends Command {
    public execute(): void {
        this.editor.model.change(writer => {
            const checkbox = writer.createElement('checkbox');
            const text = writer.createElement('checkboxText');

            writer.insertText('Antwort Option', text);
            writer.append(text, checkbox);

            this.editor.model.insertContent(checkbox);

            const range = writer.createRangeIn(text);
            writer.setSelection(range);
        });
    }

    public refresh(): void {
        const model = this.editor.model;
        const selection = model.document.selection;
        const firstPosition = selection.getFirstPosition();

        if (!firstPosition) {
            this.isEnabled = false;
            return;
        }

        const allowedIn = model.schema.findAllowedParent(firstPosition, 'checkbox');
        this.isEnabled = allowedIn !== null;
    }
}