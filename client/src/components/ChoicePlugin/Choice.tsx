import { Plugin, toWidget, toWidgetEditable, Widget, type ModelText } from 'ckeditor5';
import InsertChoiceBoxCommand from './InsertChoiceCommand';
import { v4 as uuidv4 } from "uuid";

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
            allowAttributes: ['checked', 'id', 'label']
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
                const id = uuidv4();
                this.editor.model.change(writer => {
                    writer.setAttribute('id', id!, _modelElement);
                    writer.setAttribute('label', 'Antwort Option', _modelElement);

                });

                const label = writer.createContainerElement('label', {
                    class: 'ck-checkbox-label',
                    id,
                    style: 'display:inline-flex; align-items:center; gap:0.3em; margin-right:0.5em; cursor:pointer;'
                });

                const input = writer.createEmptyElement('input', { type: 'checkbox', class: 'ck-checkbox-input' });
                writer.insert(writer.createPositionAt(label, 0), input);

                const span = writer.createEditableElement('span', {
                    class: 'ck-checkbox-text',
                    style: 'min-width: 1em; outline: none;'
                });
                writer.insert(writer.createPositionAt(label, 1), span);

                return toWidget(label, writer, {
                    label: 'checkbox widget',
                    hasSelectionHandle: true
                });
            }
        });

        conversion.for('editingDowncast').elementToElement({
            model: 'checkboxText',
            view: (_modelElement, { writer }) => {
                return toWidgetEditable(
                    writer.createEditableElement('span', {
                        class: 'ck-checkbox-text',
                        style: 'min-width: 1em; outline: none;'
                    }),
                    writer
                );
            }
        });

        conversion.for('dataDowncast').elementToElement({
            model: 'checkbox',
            view: (modelElement, { writer }) => {
                const id = modelElement.getAttribute('id');
                const labelText = modelElement.getAttribute('label') || 'Antwort Option';
                const checked = modelElement.getAttribute('checked');

                const label = writer.createContainerElement('label', {
                    class: 'checkbox-container',
                    id,
                    style: 'display:inline-flex; align-items:center; gap:0.3em; cursor:pointer;'
                });

                const rawInput = writer.createRawElement(
                    'input',
                    { type: 'checkbox', class: 'checkbox-input', ...(checked ? { checked: 'checked' } : {}) }
                );

                const span = writer.createContainerElement('span', { class: 'checkbox-text' });
                if (typeof labelText === "string") {
                    writer.insert(writer.createPositionAt(span, 0), writer.createText(labelText));
                }

                writer.insert(writer.createPositionAt(label, 0), rawInput);
                writer.insert(writer.createPositionAt(label, 1), span);

                return label;
            }
        });

        conversion.for('dataDowncast').elementToElement({
            model: 'checkboxText',
            view: (_modelElement, { writer }) => {
                return writer.createContainerElement('span', { class: 'checkbox-text' });
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
