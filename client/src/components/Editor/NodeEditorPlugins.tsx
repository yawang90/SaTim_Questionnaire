import { Node, mergeAttributes } from '@tiptap/core'
import {ReactNodeViewRenderer} from "@tiptap/react";
import {FreeTextEditorComponent} from "../FreeText/FreeTextEditorComponent.tsx";
import {MCEditorComponent} from "../MC/MCEditorComponent.tsx";
import {MCContainerComponent} from "../MC/MCContainerComponent.tsx";
import {GeoGebraEditorComponent} from "../GeoGebra/GeoGebraEditorComponent.tsx";

export const MCContainer = Node.create({
    name: 'mcContainer',
    group: 'block',
    content: 'mcChoice+',
    parseHTML: () => [{ tag: 'div.mc-container' }],
    renderHTML: ({ HTMLAttributes }) => [
        'div',
        mergeAttributes({ class: 'mc-container' }, HTMLAttributes),
        0,
    ],
    addNodeView() {
        return ReactNodeViewRenderer(MCContainerComponent);
    },
});

export const MCChoice = Node.create({
    name: 'mcChoice',
    group: 'inline',
    inline: true,
    content: 'inline*',
    selectable: true,
    draggable: false,
    addAttributes() {
        return {
            id: { default: null },
        };
    },
    parseHTML: () => [{ tag: 'span.mc-choice' }],
    renderHTML: ({ HTMLAttributes }) => [
        'span',
        { ...HTMLAttributes, class: 'mc-choice' },
        0,
    ],
    addNodeView() {
        return ReactNodeViewRenderer(MCEditorComponent);
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
