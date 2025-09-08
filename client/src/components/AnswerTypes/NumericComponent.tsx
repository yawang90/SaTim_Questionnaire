import React, {useState} from 'react';
import {Box, Typography} from '@mui/material';
import MathField from "../MathField.tsx";


export default function NumericComponent() {
    const [number, setNumber] = useState("");

    return (
        <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                {"Numerische Eingabe"}
            </Typography>
            <MathField
                value={number}
                onChange={setNumber}
                style={{fontSize: "1.2rem", border: "1px solid #ccc", padding: 8, width: "100%"}}
            />
        </Box>
    );
}
