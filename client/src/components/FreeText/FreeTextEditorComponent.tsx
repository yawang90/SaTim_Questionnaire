import React from 'react'
import {
    NodeViewWrapper,
    NodeViewContent,
    type NodeViewProps,
} from '@tiptap/react'
import { Box, TextField, Typography } from '@mui/material'

export const FreeTextEditorComponent: React.FC<NodeViewProps> = () => {
    return (
        <NodeViewWrapper
            as="div"
            className="free-text"
            style={{border: '1px solid #ccc', borderRadius: 8, padding: 12, margin: '12px 0',}}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    Freitext Block
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    placeholder="Freitext Antwort Block"
                    disabled
                    sx={{'& .MuiInputBase-root': {backgroundColor: '#f5f5f5', color: '#777', borderRadius: 1,}, '& .MuiOutlinedInput-notchedOutline': {borderColor: '#ccc',},}}/>
                <NodeViewContent />
            </Box>
        </NodeViewWrapper>
    )
}
