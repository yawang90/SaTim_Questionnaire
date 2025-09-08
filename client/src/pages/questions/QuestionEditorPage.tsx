import {useState} from 'react';
import MainLayout from '../../layouts/MainLayout.tsx';
import {Box, Button, Card, CardContent, CardHeader, Typography} from '@mui/material';
import {Save as SaveIcon, Visibility as VisibilityIcon,} from '@mui/icons-material';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import {Bold, ClassicEditor, Essentials, Alignment, Heading, Italic, Table, TableToolbar, TableCellProperties, TableProperties, List, ListProperties, SpecialCharacters, SpecialCharactersEssentials, Paragraph, SourceEditing, Indent, IndentBlock, Font, Image, ImageInsert,ImageCaption, ImageResize, ImageStyle, ImageToolbar, LinkImage,  SimpleUploadAdapter} from 'ckeditor5';
// @ts-ignore
import 'ckeditor5/ckeditor5.css';
import Choice from "../../components/ChoicePlugin/Choice.tsx";
import ChoiceUI from "../../components/ChoicePlugin/ChoiceUI.tsx";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router-dom";

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL;

export default function EditorPage() {
    const [editorData, setEditorData] = useState<string>('<p>Editiere hier deine Aufgabe...</p>');
    const [showPreview, setShowPreview] = useState(false);
    const {t} = useTranslation();
    const navigate = useNavigate();

    const saveQuestion = () => {
        navigate('/answers')
    }
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
                                    plugins: [ Essentials, Paragraph, Heading, Bold, Italic, List, ListProperties, SourceEditing, Indent, IndentBlock, Font, SpecialCharacters, SpecialCharactersEssentials, Image, ImageInsert, Alignment, Table, TableToolbar, TableCellProperties, TableProperties, Choice, ChoiceUI,ImageCaption, ImageResize, ImageStyle, ImageToolbar, LinkImage, SimpleUploadAdapter],
                                    toolbar: {
                                        items: ['undo', 'redo', '|', 'heading', 'alignment', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', 'bold', 'italic', '|', 'numberedList', 'bulletedList',  'outdent', 'indent', '|' , 'insertTable', 'specialCharacters', 'insertImage', 'sourceEditing',
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
                                    table: {
                                        contentToolbar: [
                                            'tableColumn', 'tableRow', 'mergeTableCells',
                                            'tableProperties', 'tableCellProperties'
                                        ],
                                        tableProperties: {
                                        },
                                        tableCellProperties: {
                                        }
                                    },
                                    list: {
                                        properties: {
                                            styles: true}
                                    },
                                    // @ts-ignore
                                    choice: {
                                        label: t('editor.choice')
                                    },
                                    simpleUpload: {
                                        uploadUrl: API_URL + '/api/editor/imageUpload',
                                        headers: {
                                            'X-CSRF-TOKEN': 'CSRF-Token',
                                            Authorization: 'Bearer <JSON Web Token>'
                                        }
                                    },
                                    image: {
                                        toolbar: [
                                            'imageStyle:inline',
                                            'imageStyle:alignLeft',
                                            'imageStyle:alignRight',
                                            'imageStyle:alignCenter',
                                            '|',
                                            'toggleImageCaption',
                                            'imageTextAlternative',
                                            '|',
                                            'linkImage'
                                        ],
                                        insert : {
                                            type: 'inline'
                                        }
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
                                <Button variant="contained" fullWidth startIcon={<SaveIcon />} onClick={() => saveQuestion()}>
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
                                            plugins: [
                                                Essentials,
                                                Paragraph,
                                                Heading,
                                                Bold,
                                                Italic,
                                                List,
                                                Alignment,
                                                Font,
                                                Table,
                                                TableToolbar,
                                                TableCellProperties,
                                                TableProperties,
                                                Choice,
                                                ChoiceUI
                                            ],
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
