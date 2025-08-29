import {useState} from 'react';
import MainLayout from '../layouts/MainLayout.tsx';
import {Box, Button, Card, CardContent, CardHeader, Typography} from '@mui/material';
import {Save as SaveIcon, Visibility as VisibilityIcon,} from '@mui/icons-material';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import {Bold, ClassicEditor, Essentials, Alignment, Heading, Italic, List, ListProperties, SpecialCharacters, SpecialCharactersEssentials, Paragraph, SourceEditing, Indent, IndentBlock, Font } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import Choice from "../components/ChoicePlugin/Choice.tsx";
import ChoiceUI from "../components/ChoicePlugin/ChoiceUI.tsx";
import {useTranslation} from "react-i18next";

const API_URL = import.meta.env.VITE_API_URL;

export default function EditorPage() {
    const [editorData, setEditorData] = useState<string>('<p>Editiere hier deine Aufgabe...</p>');
    const [showPreview, setShowPreview] = useState(false);
    const {t} = useTranslation();

    return (
        <MainLayout>
            <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 3, px: 2, display: 'flex', flexDirection: 'column', mt: 6 }}>
                <Box sx={{ width: '100%', pl: 3 }}>
                    <Card>
                        <CardHeader
                            title={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="h4">Aufgabe erstellen</Typography>
                                </Box>
                            }
                            sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
                        />
                        <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <CKEditor
                                editor={ ClassicEditor }
                                config={ {
                                    licenseKey: 'GPL',
                                    plugins: [ Essentials, Paragraph, Heading, Bold, Italic, List, ListProperties, SourceEditing, Indent, IndentBlock, Font, SpecialCharacters, SpecialCharactersEssentials, Alignment, Choice, ChoiceUI],
                                    toolbar: {
                                        items: ['undo', 'redo', '|', 'heading', 'alignment', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', 'bold', 'italic', '|', 'numberedList', 'bulletedList',  'outdent', 'indent', '|' , 'specialCharacters', 'sourceEditing',
                                            '-',
                                            {
                                                label: t('editor.addAnswer'),
                                                icon: 'plus',
                                                tooltip: t('editor.answerTooltip'),
                                                withText: true,
                                                items: ['insertChoiceBox', '-']
                                            }
                                        ],
                                        shouldNotGroupWhenFull: true
                                    },
                                    list: {
                                        properties: {
                                            styles: true}
                                    },
                                    choice: {
                                        label: t('editor.choice')
                                    },
                                    initialData: '<p>Editiere hier deine Aufgabe...</p>'}}

                                onChange={(_, editor) => setEditorData(editor.getData())}
                            />
                            <Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }}></Box>
                            <Typography variant="h5">Prüfen & speichern</Typography>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button onClick={() => setShowPreview(!showPreview)} variant="outlined" fullWidth startIcon={<VisibilityIcon />}>
                                    {showPreview ? 'Vorschau verstecken' : 'Vorschau'}
                                </Button>
                                <Button variant="contained" fullWidth startIcon={<SaveIcon />}>
                                    Frage speichern
                                </Button>
                            </Box>

                            {showPreview && (
                                <Box>
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        Vorschau
                                    </Typography>
                                    <CKEditor
                                        editor={ClassicEditor}
                                        data={editorData}
                                        disabled={true}
                                        config={{
                                            licenseKey: 'GPL',
                                            plugins: [Essentials, Paragraph, Choice, ChoiceUI],
                                            toolbar: []
                                        }}
                                    />

                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </MainLayout>
    );
}
