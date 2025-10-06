import MainLayout from '../../layouts/MainLayout.tsx';
import React, {useState} from 'react';
import {Box, Button, Checkbox, FormControl, FormControlLabel, FormGroup, Paper, Typography} from '@mui/material';
import {Save} from '@mui/icons-material';
import {useTranslation} from "react-i18next";
import {useNavigate, useParams} from "react-router-dom";
import QuestionLayout from "../../layouts/QuestionLayout.tsx";

export default function QuestionPreviewPage() {
    const {id} = useParams<{ id: string }>();
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [editorData, setEditorData] = useState<string>(`
    <h2>Beispielaufgabe</h2>
    <p>Welche der folgenden Aussagen sind korrekt?</p>
    <p>Bitte kreuzen Sie die richtige(n) Lösung(en) an.</p>
`);

    return (
        <MainLayout>
            <QuestionLayout allowedSteps={[true, true, true, true]}>
                <Box sx={{
                    minHeight: '100vh',
                    backgroundColor: 'background.default',
                    py: 3,
                    px: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    mt: 6
                }}>
                    <Paper elevation={0} sx={{padding: 3, border: '2px solid #000'}}>
                        <Typography variant="h4" component="h1" gutterBottom
                                    sx={{textAlign: 'center', fontWeight: 'bold'}}>
                            Prüfen und Testen
                        </Typography>
                        <FormControl component="fieldset">
                            <FormGroup>
                                <FormControlLabel control={<Checkbox/>} label="Option 1"/>
                                <FormControlLabel control={<Checkbox/>} label="Option 2"/>
                                <FormControlLabel control={<Checkbox/>} label="Option 3"/>
                                <FormControlLabel control={<Checkbox/>} label="Option 4"/>
                            </FormGroup>
                        </FormControl>

                        <Box sx={{mt: 3, textAlign: 'center', gap: 2, display: 'flex', justifyContent: 'center'}}>
                            <Button variant="outlined" sx={{
                                borderColor: '#000',
                                color: '#000',
                                '&:hover': {borderColor: '#333', bgcolor: '#f5f5f5'}
                            }}> Antworten testen </Button>
                            <Button variant="outlined" sx={{
                                borderColor: '#000',
                                color: '#000',
                                '&:hover': {borderColor: '#333', bgcolor: '#f5f5f5'}
                            }}> Antworten zurücksetzen </Button>
                            <Button variant="contained" startIcon={<Save/>} onClick={() => navigate('/questions')} sx={{
                                bgcolor: '#000',
                                color: '#fff',
                                '&:hover': {bgcolor: '#333'}
                            }}> Abschliessen </Button>
                        </Box>
                    </Paper>
                </Box>
            </QuestionLayout>
        </MainLayout>
    );
};
