import React from 'react'
import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {Button} from '@mui/material'

export const NumericEditorComponent: React.FC<NodeViewProps> = ({ node, updateAttributes }) => {
    const mode = node.attrs.mode || 'numeric'

    return (
        <NodeViewWrapper as="span" className="numeric-editor" style={{display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 4px', border: '1px solid #ccc', borderRadius: 6, backgroundColor: '#fafafa', margin: '0 4px',}}>
            <Button variant={mode === 'numeric' ? 'contained' : 'outlined'} size="small" onClick={() => updateAttributes({ mode: 'numeric' })} sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1 }}>
                Numerisch
            </Button>
            <Button variant={mode === 'algebra' ? 'contained' : 'outlined'} size="small" onClick={() => updateAttributes({ mode: 'algebra' })} sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1 }}>
                Algebra
            </Button>
        </NodeViewWrapper>
    )
}
