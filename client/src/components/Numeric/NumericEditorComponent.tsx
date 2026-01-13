import React from 'react'
import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {TextField} from '@mui/material'

export const NumericEditorComponent: React.FC<NodeViewProps> = () => {

    return (
        <NodeViewWrapper as="span" className="numeric-editor" style={{display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 4px', border: '1px solid #ccc', borderRadius: 6, backgroundColor: '#fafafa', margin: '0 4px',}}>
            <TextField
                variant="outlined"
                size="small"
                disabled={true}
                placeholder="Numerische Eingabe"
                style={{ width: '12rem', minWidth: '3rem' }}
            />
        </NodeViewWrapper>
    )
}
