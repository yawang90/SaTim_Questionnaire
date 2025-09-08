import React from 'react';
import {Box, Typography} from '@mui/material';
import GeoGebraApp from "../GeoGebra/GeoGebraApp.tsx";


export default function GeogebraComponent() {
    return (
        <Box sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                {"Geogebra Applet"}
            </Typography>
            <GeoGebraApp
                materialId="pfeKePU3"
                onChange={(expr) => console.log("Formula changed:", expr)}
            />
        </Box>
    );
}
