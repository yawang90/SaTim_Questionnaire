import React from 'react';
import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from '@tiptap/react';

export const MCChoiceEditorComponent: React.FC<NodeViewProps> = ({ node, updateAttributes }) => {
    const { groupId } = node.attrs as { groupId?: string };

    const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateAttributes({ groupId: e.target.value });
    };

    return (
        <NodeViewWrapper
            className="mc-choice-wrapper"
            style={{display: 'inline-flex', flexDirection: 'row', alignItems: 'center', border: '1px solid black', borderRadius: '0.5rem', padding: '0.5rem 1rem', marginRight: '0.5rem', minHeight: '2.5rem', verticalAlign: 'top', gap: '0.5rem',}}
            data-group={groupId || ''}>
            <input type="checkbox" disabled className="w-5 h-5 cursor-not-allowed" />
            <NodeViewContent
                className="mc-choice-content"
                style={{display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem', whiteSpace: 'pre-wrap',}}
            />
            <select value={groupId || ''} onChange={handleGroupChange} className="border rounded px-2 py-1 text-sm mt-1">
                <option value="">Keine Gruppe</option>
                <option value="1">Group 1</option>
                <option value="2">Group 2</option>
                <option value="3">Group 3</option>
            </select>
        </NodeViewWrapper>
    );
};
