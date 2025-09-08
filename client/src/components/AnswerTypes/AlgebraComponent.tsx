import React, {useState} from 'react';
import {Box, Typography} from '@mui/material';
import MathField from "../MathField.tsx";


export default function AlgebraComponent() {
    const [algebra, setAlgebra] = useState("");

    return (
        <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                {"Algebraische Gleichung"}
            </Typography>
            <MathField
                value={algebra}
                onChange={setAlgebra}
                style={{fontSize: "1.2rem", border: "1px solid #ccc", padding: 8, width: "100%"}}
            />
        </Box>
    );
}
