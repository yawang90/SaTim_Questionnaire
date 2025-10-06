import React from 'react'
import { NodeViewWrapper, NodeViewContent, type ReactNodeViewProps } from '@tiptap/react'

export const MCEditorComponent: React.FC<ReactNodeViewProps> = () => {
    return (
        <NodeViewWrapper
            className="mc-choice"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input type="checkbox" disabled />
            <NodeViewContent />
        </NodeViewWrapper>
    )
}
