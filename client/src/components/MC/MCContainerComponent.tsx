import React from 'react';
import {
    NodeViewWrapper,
    NodeViewContent,
    type NodeViewProps,
} from '@tiptap/react';
import { Button, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { v4 as uuidv4 } from 'uuid';

export const MCContainerComponent: React.FC<NodeViewProps> = ({editor, node, getPos,}) => {
    const addChoice = () => {
        if (!getPos) return;
        const pos = getPos?.();
        if (pos === undefined) return;

        const containerSize = node.nodeSize;

        editor
            .chain()
            .focus()
            .insertContentAt(pos + containerSize - 1, {
                type: 'mcChoice',
                attrs: { id: uuidv4() },
                content: [{ type: 'text', text: 'Neue Option' }],
            })
            .run();
    };

    return (
        <NodeViewWrapper as="div" className="mc-container" style={{border: '1px solid #ccc', borderRadius: 8, padding: 12, margin: '12px 0',}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1,}}>
                <strong>Multiple Choice Block</strong>
                <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addChoice}>
                    Option hinzufügen
                </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <NodeViewContent />
            </Box>
        </NodeViewWrapper>
    );
};
