import React, {useEffect, useRef, useState} from 'react'
import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {Box, TextField} from '@mui/material'
import 'mathlive'

export const NumericAnswerComponent: React.FC<NodeViewProps> = ({ node, updateAttributes }) => {
    const mode: 'numeric' | 'algebra' = node.attrs.mode || 'numeric'
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const mathfieldRef = useRef<any>(null)
    const [value, setValue] = useState(node.attrs.value || '')

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }, [value])

    useEffect(() => {
        if (mode === 'algebra' && mathfieldRef.current) {
            const mf = mathfieldRef.current

            mf.menuBar = false
            mf.smartMode = false
            mf.mathVirtualKeyboardPolicy = 'manual'
            window.mathVirtualKeyboard.layouts = {
                label: 'Custom',
                tooltip: 'Variables and numbers',
                rows: [
                    ['a', 'b', 'c', 'x', 'y', 'z', '\\alpha', '\\beta', '\\gamma'],
                    ['+', '-', '[*]', '[/]', '=', '\\sqrt{#0}','#@^{#?}', '(', ')']
                ]
            }
            document.body.style.setProperty('--keycap-height', '32px')
            document.body.style.setProperty('--keycap-font-size', '15px')

            mf.value = value || ''

            const handleInput = () => {
                const latex = mf.getValue('latex')
                setValue(latex)
                updateAttributes({ value: latex })
            }

            mf.addEventListener('input', handleInput)
            mf.addEventListener('focusin', () => window.mathVirtualKeyboard.show())
            mf.addEventListener('focusout', () => window.mathVirtualKeyboard.hide())

            return () => {
                mf.removeEventListener('input', handleInput)
            }
        }
    }, [mode])


    return (
        <NodeViewWrapper as="span" className="numeric-input" style={{display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 0', margin: '0 2px',}}>
            {mode === 'numeric' ? (
                <TextField value={value} id={node.attrs.id} onChange={e => {
                    const cleaned = e.target.value.replace(/[^0-9.,-]/g, '')
                    setValue(cleaned)
                    updateAttributes({ value: cleaned })}} placeholder="123.." size="small" variant="outlined" inputRef={textareaRef} sx={{ width: 380 }}/>
            ) : (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {/*// @ts-ignore*/}
                    <math-field
                        ref={mathfieldRef}
                        id={node.attrs.id}
                        style={{width: 380, border: '1px solid #ccc', borderRadius: 4, padding: '4px 8px', fontSize: '1rem',}}
                        virtual-keyboard-mode="manual"
                        virtual-keyboards="custom"
                    />
                </Box>
            )}
        </NodeViewWrapper>
    )
}
