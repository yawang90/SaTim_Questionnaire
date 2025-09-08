import MainLayout from '../../layouts/MainLayout.tsx';
import React, {useState} from 'react';
import {Box, Paper, Typography} from '@mui/material';
import {CKEditor} from "@ckeditor/ckeditor5-react";
import {Alignment, Bold, ClassicEditor, Essentials, Font, GeneralHtmlSupport, Heading, HtmlEmbed, Italic, List, Paragraph, Table, TableCellProperties, TableProperties, TableToolbar
} from "ckeditor5";
import Choice from "../../components/ChoicePlugin/Choice.tsx";
import ChoiceUI from "../../components/ChoicePlugin/ChoiceUI.tsx";

export default function QuestionPreviewPage() {
    const [editorData, setEditorData] = useState<string>('<p>Meine Aufgabe</p>');

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
                </Paper>
            </Box>
        </MainLayout>
    );
};
