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
            style={{
                display: 'inline-block',
                margin: '0.25rem',
                verticalAlign: 'top',
            }}
        >
            <div
                className="mc-choice-editor"
                style={{border: '1px solid black', borderRadius: '0.5rem', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', minHeight: '2.5rem',}}
                data-group={groupId || ''}>
                <div style={{ flexShrink: 0 }}>
                    <input type="checkbox" disabled className="w-5 h-5 cursor-not-allowed" />
                </div>

                <NodeViewContent
                    className="mc-choice-content"
                    style={{display: 'inline-block', minWidth: '5rem', minHeight: '1.5em', whiteSpace: 'pre-wrap',}}
                />

                <div style={{ flexShrink: 0 }}>
                    <select value={groupId || ''} onChange={(e) => updateAttributes({ groupId: e.target.value })} className="border rounded px-2 py-1 text-sm">
                        <option value="">Keine Gruppe</option>
                        <option value="1">Group 1</option>
                        <option value="2">Group 2</option>
                        <option value="3">Group 3</option>
                    </select>
                </div>
            </div>
        </NodeViewWrapper>


    );
};
