import { Command } from '@ckeditor/ckeditor5-core';
import type { Writer } from '@ckeditor/ckeditor5-engine';

export default class InsertAnswerCommand extends Command {
    public execute(id: number): void {
        this.editor.model.change((writer: Writer) => {
            this.editor.model.insertContent(
                writer.createElement('answerPreview', { id })
            );
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

        const allowedIn = model.schema.findAllowedParent(firstPosition, 'answerPreview');

        this.isEnabled = allowedIn !== null;
    }
}
