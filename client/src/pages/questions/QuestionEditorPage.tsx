import React, {useEffect, useState} from 'react';
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {v4 as uuidv4} from 'uuid';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Menu,
    MenuItem,
    Paper,
    Typography
} from '@mui/material';
import QuestionLayout from '../../layouts/QuestionLayout';
import MainLayout from '../../layouts/MainLayout.tsx';
import {FreeText, FreeTextInline, GeoGebra, MCChoice, NumericInput} from "../../components/Editor/NodeEditorPlugins.tsx";
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {Table} from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import EditorToolbar from "../../components/Editor/EditorToolbar.tsx";
import TextAlign from '@tiptap/extension-text-align';
import {FontFamily, FontSize, TextStyle} from '@tiptap/extension-text-style';
import AddIcon from '@mui/icons-material/Add';
import {Preview} from "../../components/Editor/Preview.tsx";
import {loadQuestionForm, updateQuestionContent} from '../../services/QuestionsService.tsx';
import {useNavigate, useParams} from "react-router-dom";
import {Save as SaveIcon} from "@mui/icons-material";

export default function QuestionEditorPage() {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({bulletList: {keepMarks: true}, orderedList: {keepMarks: true}}),
            TextStyle, FontSize, FontFamily, TextAlign.configure({ types: ['heading', 'paragraph', 'bulletList', 'orderedList'] }),
            Link, Table.configure({resizable: true}), TableRow, TableCell, TableHeader, Image,
            MCChoice, FreeText, FreeTextInline, NumericInput, GeoGebra, MCChoice
        ],
        content: '<p>Erstelle hier deine Aufgabe...</p>',
    });
    const navigate = useNavigate();
    const { id } = useParams();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);
    const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
    const handleCloseMenu = () => setAnchorEl(null);
    const [openPreview, setOpenPreview] = React.useState(false);
    const handleOpenPreview = () => setOpenPreview(true);
    const handleClosePreview = () => setOpenPreview(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error",
    });

    const addMCChoiceBlock = () => {
        if (!editor) return;

        editor.chain().focus().insertContent({
            type: 'mcChoice',
            attrs: {
                id: uuidv4(),
                groupId: '',
                checked: false,
            },
            content: [
                {
                    type: 'paragraph',
                    content: [
                        { type: 'text', text: 'Option 1' }
                    ]
                }
            ]
        }).run();
    };

    const addFreeText = () => {
        if (!editor) return;
        editor.chain().focus().insertContent({
            type: 'freeText',
            attrs: { id: uuidv4() },
        }).run();
    };

    const addFreeTextInline = () => {
        if (!editor) return;
        editor.chain().focus().insertContent({
            type: 'freeTextInline',
            attrs: { id: uuidv4(), placeholder: 'Antwort...' },
        }).run();
    };

    const addNumeric = () => {
        if (!editor) return;
        editor.chain().focus().insertContent({
            type: 'numericInput',
            content: [{ type: 'text', text: 'Numerische Antwort...' }],
        }).run();
    };

    const addGeoGebra = () => {
        if (!editor) return;
        editor.chain().focus().insertContent({
            type: 'geoGebra',
            attrs: { id: uuidv4(), materialId: '' },
        }).run();
    };

    const handleSave = async () => {
        if (!editor || !id) return;
        const contentJson = editor.getJSON();
        const contentHtml = editor.getHTML();

        try {
            await updateQuestionContent(id, contentJson, contentHtml);
            navigate(`/answers/${id}`)
        } catch (err) {
            console.error("Failed to save question:", err);
            setSnackbar({
                open: true,
                message: "Fehler beim Speichern der Aufgabe.",
                severity: "error",
            });
        }
    };

    useEffect(() => {
        if (!id || !editor) return;
        (async () => {
            try {
                const question = await loadQuestionForm(id);
                question.groupId = 999;
                if (editor && question.contentJson) {
                    editor.commands.setContent(question.contentJson);
                }
            } catch (err) {
                console.error("Failed to load question:", err);
            }
        })();
    }, [id, editor]);

    return (
        <MainLayout>
            <QuestionLayout allowedSteps={[true, true, true, true]}>
                <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 3, px: 2, display: 'flex', flexDirection: 'column', mt: 6 }}>
                    <Paper elevation={0} sx={{ padding: 3, border: '2px solid #000' }}>
                        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                            Aufgabe Erstellen
                        </Typography>
                        <Box sx={{border: '1px solid #ccc', borderRadius: 1, minHeight: 200, '& .ProseMirror': {outline: 'none'}}}>
                            <EditorToolbar editor={editor} />
                            <EditorContent editor={editor} />
                        </Box>

                        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Button variant="contained" onClick={handleClickMenu} startIcon={<AddIcon />}>
                                Antwort Typen hinzufügen
                            </Button>
                            <Menu anchorEl={anchorEl} open={openMenu} onClose={handleCloseMenu}>
                                <MenuItem onClick={addMCChoiceBlock}>Multiple Choice Option</MenuItem>
                                <MenuItem onClick={addFreeText}>Freitext Block</MenuItem>
                                <MenuItem onClick={addFreeTextInline}>Freitext Inline</MenuItem>
                                <MenuItem onClick={addNumeric}>Numerische Antwort</MenuItem>
                                <MenuItem onClick={addGeoGebra}>GeoGebra Applet</MenuItem>
                            </Menu>
                        </Box>

                        <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Button variant="outlined" onClick={() => {navigate(`/meta/${id}`)}}>Zurück</Button>
                            <Button variant="outlined" onClick={handleOpenPreview}>Vorschau</Button>
                            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>Speichern</Button>
                        </Box>

                        <Dialog open={openPreview} onClose={handleClosePreview} maxWidth="md" fullScreen>
                            <DialogTitle>Vorschau</DialogTitle>
                            <DialogContent dividers>
                                <Preview content={editor?.getJSON() || ''} />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClosePreview}>Schließen</Button>
                            </DialogActions>
                        </Dialog>
                    </Paper>
                </Box>
            </QuestionLayout>
        </MainLayout>
    );
}
