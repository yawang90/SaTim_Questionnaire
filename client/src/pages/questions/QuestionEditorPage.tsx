import React, {type JSX, useEffect, useRef, useState} from 'react';
import MainLayout from '../../layouts/MainLayout.tsx';
import {
    Box,
    Button,
    CardContent,
    Dialog,
    DialogTitle,
    IconButton,
    List,
    ListItemButton,
    ListItemText,
    Paper,
    Typography
} from '@mui/material';
import {Add, Clear, Save as SaveIcon, Visibility as VisibilityIcon,} from '@mui/icons-material';
import {CKEditor} from '@ckeditor/ckeditor5-react';
import {
    Alignment,
    Bold,
    ClassicEditor,
    Essentials,
    Font,
    GeneralHtmlSupport,
    Heading,
    HtmlEmbed,
    Image,
    ImageCaption,
    ImageInsert,
    ImageResize,
    ImageStyle,
    ImageToolbar,
    Indent,
    IndentBlock,
    Italic,
    LinkImage,
    List as ListPlugin,
    ListProperties,
    Paragraph,
    SimpleUploadAdapter,
    SourceEditing,
    SpecialCharacters,
    SpecialCharactersEssentials,
    Table,
    TableCellProperties,
    TableProperties,
    TableToolbar
} from 'ckeditor5';
// @ts-ignore
import 'ckeditor5/ckeditor5.css';
import Choice from "../../components/ChoicePlugin/Choice.tsx";
import ChoiceUI from "../../components/ChoicePlugin/ChoiceUI.tsx";
import {useTranslation} from "react-i18next";
import {useNavigate, useParams} from "react-router-dom";
import ChoiceComponent from "../../components/AnswerTypes/ChoiceComponent.tsx";
import "mathlive";
import NumericComponent from "../../components/AnswerTypes/NumericComponent.tsx";
import AlgebraComponent from "../../components/AnswerTypes/AlgebraComponent.tsx";
import GeogebraComponent from "../../components/AnswerTypes/GeogebraComponent.tsx";
import TextComponent from "../../components/AnswerTypes/TextComponent.tsx";
import {MathJaxContext} from "better-react-mathjax";
import QuestionLayout from '../../layouts/QuestionLayout.tsx';
// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL;
declare global {
    interface Window {
        MathJax?: {
            typesetPromise?: (elements?: HTMLElement[]) => Promise<void>;
        };
    }
}
const AnswerOptions = ['Single Choice', 'Multiple Choice', 'Freitext', 'Numerische Eingabe', 'Algebraische Gleichung', 'Geogebra Applet', 'Tabellarische Eingabe', 'Drag and Drop'];

export default function EditorPage() {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [editorData, setEditorData] = useState<string>('<p>Editiere hier deine Aufgabe...</p>');
    const [showPreview, setShowPreview] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [answerComponents, setAnswerComponents] = useState<JSX.Element[]>([]);
    const mathJaxConfig = {
        loader: { load: ["input/tex", "output/chtml"] },
        tex: {
            inlineMath: [["$", "$"], ["\\(", "\\)"]],
            displayMath: [["$$", "$$"], ["\\[", "\\]"]],
        },
    };
    const saveQuestion = () => {
        navigate(`/answers/${id}`)
    }
    const containerRef = useRef<HTMLDivElement>(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        window.MathJax?.typesetPromise?.([containerRef.current!]);
    }, [editorData]);

    const handleOptionClick = (option: string) => {
        setDialogOpen(false);
        switch(option) {
            case 'Single Choice':
                setAnswerComponents(prev => [...prev, <ChoiceComponent key={prev.length} title="Single Choice Frage" />]);
                break;
            case 'Multiple Choice':
                setAnswerComponents(prev => [...prev, <ChoiceComponent key={prev.length} title="Multiple Choice Frage"/>]);
                break;
            case 'Freitext':
                setAnswerComponents(prev => [...prev, <TextComponent key={prev.length}/>]);
                break;
            case 'Numerische Eingabe':
                setAnswerComponents(prev => [...prev, <NumericComponent/>]);
                break;
            case 'Algebraische Gleichung':
                setAnswerComponents(prev => [...prev, <AlgebraComponent/>]);
                break;
            case 'Geogebra Applet':
                setAnswerComponents(prev => [...prev, <GeogebraComponent/>]);
                break;
        }
    };

    return (
        <MainLayout>
            <QuestionLayout allowedSteps={[true, true, false, false]}>
                <Box sx={{minHeight: '100vh', backgroundColor: 'background.default', py: 3, px: 2, display: 'flex', flexDirection: 'column', mt: 6}}>
                <Paper elevation={0} sx={{padding: 3, border: '2px solid #000'}}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{textAlign: 'center', fontWeight: 'bold'}}>
                        Aufgabe erstellen
                    </Typography>

                    <CardContent sx={{p: 3, display: 'flex', flexDirection: 'column', gap: 3}}>
                        <CKEditor
                            editor={ClassicEditor}
                            config={{
                                licenseKey: 'GPL',
                                plugins: [Essentials, Paragraph, Heading, Bold, Italic, ListPlugin, ListProperties, SourceEditing, Indent, IndentBlock, Font, SpecialCharacters, SpecialCharactersEssentials, Image, ImageInsert, Alignment, Table, TableToolbar, TableCellProperties, TableProperties, Choice, ChoiceUI, ImageCaption, ImageResize, ImageStyle, ImageToolbar, LinkImage, SimpleUploadAdapter, GeneralHtmlSupport, HtmlEmbed],
                                toolbar: {
                                    items: ['undo', 'redo', '|', 'heading', 'alignment', 'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', 'bold', 'italic', '|', 'numberedList', 'bulletedList', 'outdent', 'indent', '|', 'insertTable', 'specialCharacters', 'insertImage', 'sourceEditing',
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
                                    tableProperties: {},
                                    tableCellProperties: {}
                                },
                                list: {
                                    properties: {
                                        styles: true
                                    }
                                },
                                // @ts-ignore
                                choice: {
                                    label: t('editor.choice')
                                },
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
                                },
                                simpleUpload: {
                                    uploadUrl: API_URL + '/api/editor/imageUpload',
                                    headers: {
                                        'X-CSRF-TOKEN': 'CSRF-Token',
                                        "Authorization": `Bearer ${token}`
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
                                    insert: {
                                        type: 'inline'
                                    }
                                },
                                initialData: '<p>Editiere hier deine Aufgabe...</p>'
                            }}

                            onChange={(_, editor) => setEditorData(editor.getData())}
                        />
                        <Box sx={{borderBottom: '1px solid', borderColor: 'divider'}}></Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {answerComponents.map((component, idx) => (
                                <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                    <IconButton aria-label="Entfernen" onClick={() => setAnswerComponents(prev => prev.filter((_, i) => i !== idx))}>
                                        <Clear />
                                    </IconButton>
                                    <Box sx={{ flexGrow: 1 }}>
                                        {component}
                                    </Box>
                                </Box>
                            ))}
                        </Box>

                        <Button variant="contained" startIcon={<Add/>} onClick={() => setDialogOpen(true)}>Antwort Typ hinzufügen</Button>

                        <Box sx={{display: 'flex', gap: 2}}>
                            <Button onClick={() => setShowPreview(!showPreview)} variant="outlined" fullWidth
                                    startIcon={<VisibilityIcon/>}>
                                {showPreview ? 'Vorschau verstecken' : 'Vorschau'}
                            </Button>
                            <Button variant="contained" fullWidth startIcon={<SaveIcon/>}
                                    onClick={() => saveQuestion()}>
                                Frage speichern
                            </Button>
                        </Box>

                        {showPreview && (
                            <Box>
                                <Typography variant="h6" sx={{mb: 1}}>
                                    Vorschau
                                </Typography>
                                <MathJaxContext config={mathJaxConfig}>
                                    <div ref={containerRef}>
                                        <CKEditor
                                            editor={ClassicEditor}
                                            data={editorData}
                                            disabled={true}
                                            config={{
                                                licenseKey: 'GPL',
                                                plugins: [Essentials, Paragraph, Heading, Bold, Italic, ListPlugin, Alignment, Font, Table, TableToolbar, TableCellProperties, TableProperties, Choice, ChoiceUI, GeneralHtmlSupport, HtmlEmbed],
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
                                        <div className="ck-content" dangerouslySetInnerHTML={{ __html: editorData }} />
                                    </div>
                                </MathJaxContext>
                            </Box>
                        )}
                    </CardContent>
                    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                        <DialogTitle>Antwort Typ auswählen</DialogTitle>
                        <List>
                            {AnswerOptions.map((option) => (
                                <ListItemButton key={option} onClick={() => handleOptionClick(option)}>
                                    <ListItemText primary={option}/>
                                </ListItemButton>
                            ))}
                        </List>
                    </Dialog>
                </Paper>
            </Box>
            </QuestionLayout>
        </MainLayout>
    );
}
