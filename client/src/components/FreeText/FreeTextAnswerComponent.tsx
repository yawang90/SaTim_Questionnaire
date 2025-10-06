import React from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import type { Node as ProseMirrorNode } from 'prosemirror-model'

interface FreeTextProps {
    node: ProseMirrorNode
}

export const FreeTextAnswerComponent: React.FC<FreeTextProps> = ({ node }) => {
    return (
        <NodeViewWrapper className="free-text">
            <input
                type="text"
                data-id={node.attrs.id}
                placeholder="Antwort hier eingeben..."
            />
        </NodeViewWrapper>
    )
}
