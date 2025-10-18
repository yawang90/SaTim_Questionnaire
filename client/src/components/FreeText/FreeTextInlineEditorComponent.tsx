import React from 'react'
import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from '@tiptap/react'
import { TextField } from '@mui/material'

export const FreeTextInlineEditorComponent: React.FC<NodeViewProps> = () => {
    return (
        <NodeViewWrapper
            as="span"
            className="free-text-inline"
            style={{
                display: 'inline-flex',
                verticalAlign: 'middle',
                margin: '0 2px',
                border: '1px solid #ccc',
                borderRadius: 4,
                padding: '2px 4px',
                backgroundColor: '#fefefe',
            }}
        >
            <TextField
                variant="outlined"
                size="small"
                placeholder="Freitext"
                style={{ width: '6rem', minWidth: '3rem' }}
            />
            <NodeViewContent />
        </NodeViewWrapper>
    )
}
