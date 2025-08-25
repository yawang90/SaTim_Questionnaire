import { Plugin } from '@ckeditor/ckeditor5-core';
import { Widget, toWidget } from '@ckeditor/ckeditor5-widget';
import type { ViewElement, DowncastWriter } from '@ckeditor/ckeditor5-engine';
import InsertAnswerCommand from "./InsertAnswerCommand.tsx";

type AnswerRenderer = (id: number, domElement: HTMLElement) => void;

export default class AnswerPlugin extends Plugin {
    public static get requires() {
        return [ Widget ];
    }

    public init(): void {
        this._defineSchema();
        this._defineConverters();

        this.editor.commands.add(
            'insertAnswer',
            new InsertAnswerCommand(this.editor)
        );
    }

    private _defineSchema(): void {
        const schema = this.editor.model.schema;

        schema.register('answerPreview', {
            isObject: true,
            allowWhere: '$block',
            allowAttributes: ['id']
        });
    }

    private _defineConverters(): void {
        const editor = this.editor;
        const conversion = editor.conversion;
        const renderAnswer: AnswerRenderer = editor.config.get('answer')?.answerRenderer;

        if (!renderAnswer) {
            throw new Error(
                'answerPreviewEditing: editor.config.products.answerRenderer is not defined.'
            );
        }

        // (data → model)
        conversion.for('upcast').elementToElement({
            view: {
                name: 'section',
                classes: 'product'
            },
            model: (viewElement: ViewElement, { writer: modelWriter }) => {
                const idAttr = viewElement.getAttribute('data-id');
                const id = idAttr ? parseInt(idAttr, 10) : NaN;

                return modelWriter.createElement('answerPreview', {
                    id
                });
            }
        });

        // (model → data)
        conversion.for('dataDowncast').elementToElement({
            model: 'answerPreview',
            view: (modelElement, { writer: viewWriter }: { writer: DowncastWriter }) => {
                return viewWriter.createEmptyElement('section', {
                    class: 'product',
                    'data-id': String(modelElement.getAttribute('id'))
                });
            }
        });

        // (model → editing)
        conversion.for('editingDowncast').elementToElement({
            model: 'answerPreview',
            view: (modelElement, { writer: viewWriter }: { writer: DowncastWriter }) => {
                const id = modelElement.getAttribute('id') as number;

                const section = viewWriter.createContainerElement('section', {
                    class: 'answer',
                    'data-id': String(id)
                });

                const reactWrapper = viewWriter.createRawElement(
                    'div',
                    { class: 'answer__react-wrapper' },
                    (domElement: HTMLElement) => {
                        renderAnswer(id, domElement);
                    }
                );

                viewWriter.insert(viewWriter.createPositionAt(section, 0), reactWrapper);

                return toWidget(section, viewWriter, { label: 'answer preview widget' });
            }
        });
    }
}
