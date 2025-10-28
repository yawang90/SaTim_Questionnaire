import {mergeAttributes, Node} from '@tiptap/core'
import {ReactNodeViewRenderer} from "@tiptap/react";
import {FreeTextEditorComponent} from "../FreeText/FreeTextEditorComponent.tsx";
import {MCChoiceEditorComponent} from "../MC/MCChoiceEditorComponent.tsx";
import {GeoGebraEditorComponent} from "../GeoGebra/GeoGebraEditorComponent.tsx";
import {FreeTextInlineEditorComponent} from "../FreeText/FreeTextInlineEditorComponent.tsx";
import {NumericEditorComponent} from "../Numeric/NumericEditorComponent.tsx";
import {LaTeXComponent} from "../LaTeX/LaTeXComponent.tsx";

export const MCChoice = Node.create({
    name: 'mcChoice',
    group: 'inline',
    inline: true,
    atom: false,
    content: 'block+',

    addAttributes() {
        return {
            id: { default: null },
            groupId: { default: null },
            checked: { default: false },
            allGroups: { default: [] },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-type="mcChoice"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, {
                'data-type': 'mcChoice',
                class: 'mc-choice',
            }),
            0,
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(MCChoiceEditorComponent);
    },
});

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
        return ReactNodeViewRenderer(FreeTextEditorComponent)
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
        return ReactNodeViewRenderer(GeoGebraEditorComponent);
    },
});

export const FreeTextInline = Node.create({
    name: 'freeTextInline',
    group: 'inline',
    inline: true,
    atom: true,

    addAttributes() {
        return {
            id: { default: null },
            placeholder: { default: 'Freitext Antwort' },
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
        return ReactNodeViewRenderer(FreeTextInlineEditorComponent)
    },
})

export const NumericInput = Node.create({
    name: 'numericInput',
    group: 'inline',
    inline: true,
    atom: true,
    selectable: true,

    addAttributes() {
        return {
            id: { default: null },
            mode: {
                default: 'numeric',
                parseHTML: element => element.getAttribute('data-mode') || 'numeric',
                renderHTML: attributes => ({
                    'data-mode': attributes.mode,
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
        return ReactNodeViewRenderer(NumericEditorComponent)
    },
});

export const LatexDisplay = Node.create({
    name: 'latex',

    group: 'inline',
    inline: true,
    atom: true,

    addAttributes() {
        return {
            latex: {
                default: '',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-latex]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['span', { ...HTMLAttributes, 'data-latex': HTMLAttributes.latex }, 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(LaTeXComponent);
    },
});
