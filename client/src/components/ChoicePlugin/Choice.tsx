import { Plugin, toWidgetEditable, Widget, ViewDowncastWriter } from 'ckeditor5';
import InsertChoiceBoxCommand from './InsertChoiceCommand';

export default class Choice extends Plugin {
    public static get requires() {
        return [Widget];
    }

    public init(): void {
        this._defineSchema();
        this._defineConverters();
        this.editor.commands.add('insertChoiceBox', new InsertChoiceBoxCommand(this.editor));
    }

    private _defineSchema(): void {
        const schema = this.editor.model.schema;

        schema.register('choiceBox', {
            isObject: true,
            allowWhere: '$block'
        });

        schema.register('choiceOption', {
            isLimit: true,
            allowIn: 'choiceBox',
            allowContentOf: '$block'
        });
    }

    private _defineConverters(): void {
        const conversion = this.editor.conversion;

        conversion.for('upcast').elementToElement({
            model: 'choiceBox',
            view: { name: 'section', classes: 'choice-box' }
        });
        conversion.for('dataDowncast').elementToElement({
            model: 'choiceBox',
            view: { name: 'section', classes: 'choice-box' }
        });
        conversion.for('editingDowncast').elementToElement({
            model: 'choiceBox',
            view: (_modelElement, { writer }: { writer: ViewDowncastWriter }) => {
                const section = writer.createContainerElement('section', { class: 'choice-box' });
                return toWidgetEditable(section, writer, { label: 'multiple choice box' });
            }
        });

        conversion.for('upcast').elementToElement({
            model: 'choiceOption',
            view: { name: 'div', classes: 'choice-option' }
        });
        conversion.for('dataDowncast').elementToElement({
            model: 'choiceOption',
            view: { name: 'div', classes: 'choice-option' }
        });
        conversion.for('editingDowncast').elementToElement({
            model: 'choiceOption',
            view: (_modelElement, { writer }) => {
                const label = writer.createContainerElement('label', { class: 'choice-option' });
                const checkbox = writer.createUIElement('input', { type: 'checkbox' });
                const span = writer.createEditableElement('span');

                writer.insert(writer.createPositionAt(label, 0), checkbox);
                writer.insert(writer.createPositionAt(label, 1), span);
                return toWidgetEditable(label, writer, { label: 'Choice Antwort' });
            }
        });



    }
}
