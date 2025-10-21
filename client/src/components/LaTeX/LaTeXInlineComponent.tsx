import React from 'react';
import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react';
import {InlineMath} from 'react-katex'

export const LaTeXInlineComponent: React.FC<NodeViewProps> = ({ node }) => {
    const latex = node.attrs.latex || ''

    return (
        <NodeViewWrapper className="latex-inline" style={{ display: 'inline-block' }}>
            <InlineMath math={latex} />
        </NodeViewWrapper>
    )
}

