import React from 'react';
import {Box, Typography} from '@mui/material';


export default function TextComponent() {

    return (
        <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                {"Freitext"}
            </Typography>
            <input
                type="text"
                placeholder="Freitext"
                style={{ padding: '8px', fontSize: '1rem', width: '100%' }}
            />
        </Box>
    );
}
