import { Node, mergeAttributes } from '@tiptap/core'

export const MCContainer = Node.create({
    name: 'mcContainer',
    group: 'block',
    content: 'mcChoice+',
    parseHTML: () => [{ tag: 'div.mc-container' }],
    renderHTML: ({ HTMLAttributes }) => {
        return ['div', mergeAttributes({ class: 'mc-container' }, HTMLAttributes), 0]
    }})

export const MCChoice = Node.create({
    name: 'mcChoice',
    group: 'block',
    content: 'inline*',
    addAttributes() {
        return {
            id: { default: null },
        }
    },
    parseHTML: () => [{ tag: 'div.mc-choice' }],
    renderHTML: ({ HTMLAttributes }) => ['div', mergeAttributes({ class: 'mc-choice' }, HTMLAttributes), 0],
})

export const FreeText = Node.create({
    name: 'freeText',
    group: 'block',
    content: 'inline*',
    parseHTML: () => [{ tag: 'div.free-text' }],
    renderHTML: ({ HTMLAttributes }) => ['div', mergeAttributes({ class: 'free-text' }, HTMLAttributes), 0],
})

export const NumericInput = Node.create({
    name: 'numericInput',
    group: 'block',
    content: 'inline*',
    parseHTML: () => [{ tag: 'div.numeric-input' }],
    renderHTML: ({ HTMLAttributes }) => ['div', mergeAttributes({ class: 'numeric-input' }, HTMLAttributes), 0],
})