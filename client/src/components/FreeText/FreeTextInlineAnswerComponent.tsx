import React, { useRef } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { Node as ProseMirrorNode } from 'prosemirror-model'
import { TextField } from '@mui/material'

interface FreeTextInlineProps {
    node: ProseMirrorNode
}

export const FreeTextInlineAnswerComponent: React.FC<FreeTextInlineProps> = ({node}) => {
    const inputRef = useRef<HTMLInputElement>(null)

    return (
        <NodeViewWrapper as="span" className="free-text-inline" style={{ display: 'inline-flex', verticalAlign: 'middle', margin: '0 2px' }}>
            <TextField inputRef={inputRef} id={node.attrs.id} placeholder="Antwort..." size="small" variant="outlined" style={{ width: '8rem', minWidth: '4rem' }}/>
        </NodeViewWrapper>
    )
}
