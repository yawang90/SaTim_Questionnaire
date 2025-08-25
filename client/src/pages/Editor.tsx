import {useState} from 'react';
import MainLayout from '../layouts/MainLayout.tsx';
import {Box, Button, Card, CardContent, CardHeader, Typography,} from '@mui/material';
import {Save as SaveIcon, Visibility as VisibilityIcon,} from '@mui/icons-material';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import {Bold, ClassicEditor, Essentials, Heading, Italic, List, Paragraph} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import Choice from "../components/ChoicePlugin/Choice.tsx";
import ChoiceUI from "../components/ChoicePlugin/ChoiceUI.tsx";

const API_URL = import.meta.env.VITE_API_URL;

export default function EditorPage() {
    const [editorData, setEditorData] = useState<string>('<p>Editiere hier deine Aufgabe...</p>');
    const [showPreview, setShowPreview] = useState(false);

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
                                    plugins: [ Essentials, Paragraph, Heading, Bold, Italic, List, Choice, ChoiceUI],
                                    toolbar: [ 'undo', 'redo', '|', 'heading', 'bold', 'italic', '|', 'numberedList', 'bulletedList', 'insertChoiceBox' ],
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
                                    <Box sx={{ border: '1px solid #ccc', p: 2, borderRadius: 1, backgroundColor: '#fafafa' }} dangerouslySetInnerHTML={{ __html: editorData }}/>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </MainLayout>
    );
}
