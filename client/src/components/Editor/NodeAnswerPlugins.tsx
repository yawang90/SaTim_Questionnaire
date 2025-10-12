import {mergeAttributes, Node} from '@tiptap/core'
import {ReactNodeViewRenderer} from "@tiptap/react";
import {FreeTextAnswerComponent} from "../FreeText/FreeTextAnswerComponent.tsx";
import {MCAnswerComponent} from "../MC/MCAnswerComponent.tsx";
import {GeoGebraAnswerNodeView} from "../GeoGebra/GeoGebraAnswerNodeView.tsx";

export const MCContainer = Node.create({
    name: 'mcContainer',
    group: 'block',
    content: 'mcChoice+',
    parseHTML: () => [{tag: 'div.mc-container'}],
    renderHTML: ({HTMLAttributes}) => ['div', mergeAttributes({class: 'mc-container'}, HTMLAttributes), 0],
})

export const MCChoice = Node.create({
    name: 'mcChoice',
    group: 'block',
    content: 'inline*',
    addAttributes() {
        return {
            id: {default: null},
        }
    },
    parseHTML: () => [{tag: 'div.mc-choice'}],
    renderHTML: ({HTMLAttributes}) => ['div', {...HTMLAttributes, class: 'mc-choice'}, 0],
    addNodeView() {
        return ReactNodeViewRenderer(MCAnswerComponent)
    },
})

export const FreeText = Node.create({
    name: 'freeText',
    group: 'block',
    content: 'inline*',
    addAttributes() {
        return {
            id: {default: null},
        }
    },
    parseHTML: () => [{tag: 'div.free-text'}],
    renderHTML: ({HTMLAttributes}) => ['div', mergeAttributes({class: 'free-text'}, HTMLAttributes), 0],
    addNodeView() {
        return ReactNodeViewRenderer(FreeTextAnswerComponent)
    },
})

export const NumericInput = Node.create({
    name: 'numericInput',
    group: 'block',
    content: 'inline*',
    parseHTML: () => [{tag: 'div.numeric-input'}],
    renderHTML: ({HTMLAttributes}) => ['div', mergeAttributes({class: 'numeric-input'}, HTMLAttributes), 0],
})

export const GeoGebra = Node.create({
    name: 'geoGebra',
    group: 'block',
    atom: true,

    addAttributes() {
        return {
            materialId: { default: '' },
            width: { default: '' },
            height: { default: '' },
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
