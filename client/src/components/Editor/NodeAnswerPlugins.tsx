import {mergeAttributes, Node} from '@tiptap/core'
import {ReactNodeViewRenderer} from "@tiptap/react";
import {FreeTextAnswerComponent} from "../FreeText/FreeTextAnswerComponent.tsx";
import {GeoGebraEditorComponent} from "../GeoGebra/GeoGebraEditorComponent.tsx";
import {MCChoiceAnswerComponent} from "../MC/MCChoiceAnswerComponent.tsx";

export const FreeText = Node.create({
    name: 'freeText',
    group: 'block',
    content: 'inline*',
    addAttributes() {
        return {
            id: { default: null },
        }
    },
    parseHTML: () => [{ tag: 'div.free-text' }],
    renderHTML: ({ HTMLAttributes }) => ['div', mergeAttributes({ class: 'free-text' }, HTMLAttributes), 0],
    addNodeView() {
        return ReactNodeViewRenderer(FreeTextAnswerComponent)
    },
})

export const NumericInput = Node.create({
    name: 'numericInput',
    group: 'block',
    content: 'inline*',
    parseHTML: () => [{ tag: 'div.numeric-input' }],
    renderHTML: ({ HTMLAttributes }) => ['div', mergeAttributes({ class: 'numeric-input' }, HTMLAttributes), 0],
})


export const GeoGebra = Node.create({
    name: 'geoGebra',
    group: 'block',
    atom: true,

    addAttributes() {
        return {
            id: { default: null },
            materialId: { default: '' },
            width: { default: '800' },
            height: { default: '600' },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-type="geoGebra"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'geoGebra' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(GeoGebraEditorComponent);
    },
});

export const MCChoice = Node.create({
    name: 'mcChoice',
    group: 'inline',
    inline: true,
    atom: true,

    addAttributes() {
        return {
            id: { default: null },
            groupId: { default: null },
            label: { default: 'Option' },
            checked: { default: false },
        }
    },

    parseHTML() {
        return [{ tag: 'span[data-type="mcChoice"]' }]
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'span',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'mcChoice',
                class: 'mc-choice',
            }),
            HTMLAttributes.label || 'Option',
        ]
    },

    addNodeView() {
        return ReactNodeViewRenderer(MCChoiceAnswerComponent)
    },
})
