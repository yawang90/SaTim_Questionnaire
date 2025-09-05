import {Plugin, toWidget, Widget, toWidgetEditable} from 'ckeditor5';
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

        schema.register('checkbox', {
            allowWhere: '$text',
            isObject: true,
            isInline: true,
            allowChildren: ['checkboxText'],
            allowAttributes: ['checked']
        });

        schema.register('checkboxText', {
            allowIn: 'checkbox',
            allowContentOf: '$text',
            isLimit: true
        });

        schema.extend('$text', { allowIn: 'checkboxText' });
    }

    private _defineConverters(): void {
        const conversion = this.editor.conversion;

        conversion.for('editingDowncast').elementToElement({
            model: 'checkbox',
            view: (_modelElement, { writer }) => {
                const label = writer.createContainerElement('label', {
                    class: 'ck-checkbox-label',
                    style: 'display:inline-flex; align-items:center; gap:0.3em; margin-right:0.5em; cursor:pointer;'
                });

                const input = writer.createEmptyElement('input', {
                    type: 'checkbox',
                    class: 'ck-checkbox-input'
                });

                writer.insert(writer.createPositionAt(label, 0), input);

                return toWidget(label, writer, {
                    label: 'checkbox widget',
                    hasSelectionHandle: true
                });
            }
        });

        conversion.for('dataDowncast').elementToElement({
            model: 'checkbox',
            view: (_modelElement, { writer }) => {
                return writer.createContainerElement('label', {
                    class: 'checkbox-container',
                    style: 'display:inline-flex; align-items:center; gap:0.3em;'
                });
            }
        });

        conversion.for('editingDowncast').elementToElement({
            model: 'checkboxText',
            view: (_modelElement, { writer }) => {
                const span = writer.createEditableElement('span', {
                    class: 'ck-checkbox-text',
                    style: 'min-width: 1em; outline: none;'
                });
                return toWidgetEditable(span, writer);
            }
        });

        conversion.for('dataDowncast').elementToElement({
            model: 'checkboxText',
            view: (_modelElement, { writer }) => {
                return writer.createContainerElement('span', {
                    class: 'checkbox-text'
                });
            }
        });

        conversion.for('upcast').elementToElement({
            view: {
                name: 'label',
                classes: /^(ck-checkbox-label|checkbox-container)$/
            },
            model: 'checkbox'
        });

        conversion.for('upcast').elementToElement({
            view: {
                name: 'span',
                classes: /^(ck-checkbox-text|checkbox-text)$/
            },
            model: 'checkboxText'
        });
    }
}
