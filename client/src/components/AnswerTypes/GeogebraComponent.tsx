import React, { useState } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import GeoGebraApp from "../GeoGebra/GeoGebraApp.tsx";

export default function GeogebraComponent() {
    const [materialId, setMaterialId] = useState<string>('pfeKePU3'); // default materialId

    return (
        <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Geogebra Applet
            </Typography>

            <TextField
                label="Material ID"
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
            />

            <GeoGebraApp
                materialId={materialId}
                onChange={(expr) => console.log("Formula changed:", expr)}
            />
        </Box>
    );
}
