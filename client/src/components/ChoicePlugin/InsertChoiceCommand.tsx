import { Command } from 'ckeditor5';

export default class InsertChoiceBoxCommand extends Command {
    public execute(): void {
        this.editor.model.change((writer) => {
            const choiceBox = writer.createElement('choiceBox');
            const option = writer.createElement('choiceOption');
            writer.insertText('Antwort Option', option);
            writer.append(option, choiceBox);

            this.editor.model.insertContent(choiceBox);
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

        const allowedIn = model.schema.findAllowedParent(firstPosition, 'choiceBox');
        this.isEnabled = allowedIn !== null;
    }
}
