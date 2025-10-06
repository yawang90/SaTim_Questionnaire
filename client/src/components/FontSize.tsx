import { Extension } from '@tiptap/core'

const FontSize = Extension.create({
    name: 'fontSize',

    addGlobalAttributes() {
        return [
            {
                types: ['textStyle'],
                attributes: {
                    fontSize: {
                        default: null,
                        renderHTML: attrs => {
                            if (!attrs.fontSize) return {}
                            return { style: `font-size: ${attrs.fontSize}` }
                        },
                        parseHTML: element => ({ fontSize: element.style.fontSize || null }),
                    },
                },
            },
        ]
    },

    addCommands() {
        return {
            setFontSize:
                (fontSize: string) =>
                    ({ chain }) => chain().setMark('textStyle', { fontSize }).run(),
            unsetFontSize:
                () =>
                    ({ chain }) => chain().setMark('textStyle', { fontSize: null }).run(),
        }
    },
})

export default FontSize
