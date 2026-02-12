import React, {useEffect, useRef} from 'react'
import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {Box} from '@mui/material'
import 'mathlive'

export const LineEquationAnswerComponent: React.FC<NodeViewProps> = ({ node, updateAttributes }) => {
    const mathfieldRef = useRef<any>(null)

    useEffect(() => {
        if (mathfieldRef.current) {
            const mf = mathfieldRef.current
            mf.smartMode = true;
            mf.implicitMode = "auto";
            mf.menuBar = false
            mf.mathVirtualKeyboardPolicy = 'manual'
            window.mathVirtualKeyboard.layouts = {
                label: 'Custom',
                tooltip: 'Variables and numbers',
                rows: [
                    ['0','1','2','3','4','5','6','7','8','9','.', { label: '⌫', command: 'deleteBackward' }],
                    ['x', 'y'],
                    ['+', '-', '[*]', ':', '=', "\\frac{#@}{#?}", '(', ')'],
                    [], [], []
                ]
            }
            document.body.style.setProperty('--keycap-height', '32px')
            document.body.style.setProperty('--keycap-font-size', '15px')
            if (!mf.getValue()) {
                mf.value = 'y='
            }
            const handleInput = () => {
                const latex = mf.getValue('latex-expanded');
                updateAttributes({ value: latex });
            }

            mf.addEventListener('input', handleInput)
            mf.addEventListener('focusin', () => window.mathVirtualKeyboard.show())
            mf.addEventListener('focusout', () => window.mathVirtualKeyboard.hide())

            return () => {
                mf.removeEventListener('input', handleInput)
            }
        }
    }, [updateAttributes]);

    return (
        <NodeViewWrapper as="span" className="numeric-input" style={{display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 0', margin: '0 2px',}}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {/*// @ts-ignore*/}
                    <math-field
                        ref={mathfieldRef}
                        id={node.attrs.id}
                        style={{width: 380, border: '1px solid #ccc', borderRadius: 4, padding: '4px 8px', fontSize: '1rem',}}
                        virtual-keyboard-mode="manual"
                        virtual-keyboards="custom"
                        virtual-keyboard-appearance="floating"
                        virtual-keyboard-theme="material"
                    />
                </Box>
        </NodeViewWrapper>
    )
}
