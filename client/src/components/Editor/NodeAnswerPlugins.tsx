import {mergeAttributes, Node} from '@tiptap/core'
import {ReactNodeViewRenderer} from "@tiptap/react";
import {FreeTextAnswerComponent} from "../FreeText/FreeTextAnswerComponent.tsx";
import {MCChoiceAnswerComponent} from "../MC/MCChoiceAnswerComponent.tsx";
import {GeoGebraAnswerNodeView} from "../GeoGebra/GeoGebraAnswerNodeView.tsx";
import {FreeTextInlineAnswerComponent} from "../FreeText/FreeTextInlineAnswerComponent.tsx";
import {NumericAnswerComponent} from "../Numeric/NumericAnswerComponent.tsx";

export const FreeTextInline = Node.create({
    name: 'freeTextInline',
    group: 'inline',
    inline: true,
    atom: true,
    selectable: true,

    addAttributes() {
        return {
            id: { default: null },
            placeholder: { default: 'Antwort...' },
        }
    },

    parseHTML() {
        return [{ tag: 'span[data-type="freeTextInline"]' }]
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'span',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'freeTextInline',
                class: 'free-text-inline',
            }),
            HTMLAttributes.placeholder || '',
        ]
    },

    addNodeView() {
        return ReactNodeViewRenderer(FreeTextInlineAnswerComponent)
    },
})

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
        return ReactNodeViewRenderer(GeoGebraAnswerNodeView);
    },
});

export const MCChoice = Node.create({
    name: "mcChoice",
    group: "inline",
    inline: true,
    atom: false,
    content: "block+",
    addAttributes() {
        return {
            id: { default: null },
            groupId: { default: null },
            checked: { default: false },
        };
    },
    parseHTML() {
        return [{ tag: "div[data-type='mcChoice']" }];
    },
    renderHTML({ HTMLAttributes }) {
        return [
            "div",
            mergeAttributes(HTMLAttributes, {
                "data-type": "mcChoice",
                class: "mc-choice",
            }),
            0,
        ];
    },
    addNodeView() {
        return ReactNodeViewRenderer(MCChoiceAnswerComponent);
    },
});

export const NumericInput = Node.create({
    name: 'numericInput',
    group: 'inline',
    inline: true,
    atom: true,
    selectable: true,

    addAttributes() {
        return {
            mode: {
                default: 'numeric',
                parseHTML: element => element.getAttribute('data-mode') || 'numeric',
                renderHTML: attributes => ({
                    'data-mode': attributes.mode,
                }),
            },
            value: {
                default: '',
                parseHTML: element => element.getAttribute('data-value') || '',
                renderHTML: attributes => ({
                    'data-value': attributes.value,
                }),
            },
        }
    },

    parseHTML() {
        return [{ tag: 'span[data-type="numeric-input"]' }]
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'span',
            mergeAttributes(HTMLAttributes, { 'data-type': 'numeric-input' }),
        ]
    },

    addNodeView() {
        return ReactNodeViewRenderer(NumericAnswerComponent)
    },
})
