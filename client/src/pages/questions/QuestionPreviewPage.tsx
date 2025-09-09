import MainLayout from '../../layouts/MainLayout.tsx';
import React, {useState} from 'react';
import {Box, Button, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Paper, Typography} from '@mui/material';
import {CKEditor} from "@ckeditor/ckeditor5-react";
import {Alignment, Bold, ClassicEditor, Essentials, Font, GeneralHtmlSupport, Heading, HtmlEmbed, Italic, List, Paragraph, Table, TableCellProperties, TableProperties, TableToolbar
} from "ckeditor5";
import Choice from "../../components/ChoicePlugin/Choice.tsx";
import ChoiceUI from "../../components/ChoicePlugin/ChoiceUI.tsx";
import { Save } from '@mui/icons-material';
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";

export default function QuestionPreviewPage() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [editorData, setEditorData] = useState<string>(`
    <h2>Beispielaufgabe</h2>
    <p>Welche der folgenden Aussagen sind korrekt?</p>
    <p>Bitte kreuzen Sie die richtige(n) Lösung(en) an.</p>
`);

    return (
        <MainLayout>
            <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 3, px: 2, display: 'flex', flexDirection: 'column', mt: 6 }}>
                <Paper elevation={0} sx={{padding: 3, border: '2px solid #000'}}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{textAlign: 'center', fontWeight: 'bold'}}>
                        Prüfen und Testen
                    </Typography>
                    <CKEditor
                        editor={ClassicEditor}
                        data={editorData}
                        disabled={true}
                        config={{
                            licenseKey: 'GPL',
                            plugins: [Essentials, Paragraph, Heading, Bold, Italic, List, Alignment, Font, Table, TableToolbar, TableCellProperties, TableProperties, Choice, ChoiceUI, GeneralHtmlSupport, HtmlEmbed],
                            toolbar: [],
                            htmlSupport: {
                                allow: [
                                    {
                                        name: /.*/,
                                        attributes: true,
                                        classes: true,
                                        styles: true
                                    }
                                ]
                            },
                            htmlEmbed: {
                                showPreviews: true
                            }
                        }}
                    />
                    <FormControl component="fieldset">
                        <FormGroup>
                            <FormControlLabel control={<Checkbox/>} label="Option 1"/>
                            <FormControlLabel control={<Checkbox/>} label="Option 2"/>
                            <FormControlLabel control={<Checkbox/>} label="Option 3"/>
                            <FormControlLabel control={<Checkbox/>} label="Option 4"/>
                        </FormGroup>
                    </FormControl>

                    <Box sx={{mt: 3, textAlign: 'center', gap: 2, display: 'flex', justifyContent: 'center'}}>
                        <Button variant="outlined" sx={{ borderColor: '#000', color: '#000', '&:hover': {borderColor: '#333', bgcolor: '#f5f5f5'} }}> Antworten testen </Button>
                        <Button variant="outlined" sx={{ borderColor: '#000', color: '#000', '&:hover': {borderColor: '#333', bgcolor: '#f5f5f5'} }}> Antworten zurücksetzen </Button>
                        <Button variant="contained" startIcon={<Save/>} onClick={() => navigate('/questions')} sx={{bgcolor: '#000', color: '#fff', '&:hover': {bgcolor: '#333'}}}> Abschliessen </Button>
                    </Box>
                </Paper>
            </Box>
        </MainLayout>
    );
};
