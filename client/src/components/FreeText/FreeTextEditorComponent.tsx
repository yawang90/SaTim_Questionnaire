import React from 'react'
import { NodeViewWrapper, NodeViewContent, type ReactNodeViewProps } from '@tiptap/react'

export const FreeTextEditorComponent: React.FC<ReactNodeViewProps> = () => {
    return (
        <NodeViewWrapper className="free-text" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="text" placeholder="Freitext Antwort Block" disabled style={{ flex: 1, padding: '4px 8px' }} />
            <NodeViewContent />
        </NodeViewWrapper>
    )
}
