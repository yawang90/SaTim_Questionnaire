import React from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { Node as ProseMirrorNode } from 'prosemirror-model'

interface MCAnswerProps {
    node: ProseMirrorNode
}

export const MCAnswerComponent: React.FC<MCAnswerProps> = ({ node }) => {
    return (
        <NodeViewWrapper
            className="mc-choice"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
            <input type="checkbox" data-id={node.attrs.id}/>
            <span>{node.textContent}</span>
        </NodeViewWrapper>
    )
}
