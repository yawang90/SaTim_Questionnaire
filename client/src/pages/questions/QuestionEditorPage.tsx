import React, {useEffect} from 'react';
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {v4 as uuidv4} from 'uuid';
import {Box, Button, Menu, MenuItem, Paper, Typography, Dialog, DialogTitle, DialogContent, DialogActions} from '@mui/material';
import QuestionLayout from '../../layouts/QuestionLayout';
import MainLayout from '../../layouts/MainLayout.tsx';
import {FreeText, MCChoice, MCContainer, NumericInput} from "../../components/NodeEditorPlugins.tsx";
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {Table} from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import EditorToolbar from "../../components/TipTapToolbar.tsx";
import TextAlign from '@tiptap/extension-text-align';
import {FontFamily, FontSize, TextStyle} from '@tiptap/extension-text-style';
import AddIcon from '@mui/icons-material/Add';
import {Preview} from "../../components/Preview.tsx";
import { loadQuestionForm, updateQuestionContent } from '../../services/QuestionsService.tsx';
import {useParams} from "react-router-dom";

export default function QuestionEditorPage() {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({bulletList: {keepMarks: true}, orderedList: {keepMarks: true}}),
            TextStyle, FontSize, FontFamily, TextAlign.configure({ types: ['heading', 'paragraph', 'bulletList', 'orderedList'] }),
            Link, Table.configure({resizable: true}), TableRow, TableCell, TableHeader, Image,
            MCContainer, MCChoice, FreeText, NumericInput
        ],
        content: '<p>Erstelle hier deine Aufgabe...</p>',
    });
    const { id } = useParams();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);
    const handleClickMenu = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
    const handleCloseMenu = () => setAnchorEl(null);

    const [openPreview, setOpenPreview] = React.useState(false);
    const handleOpenPreview = () => setOpenPreview(true);
    const handleClosePreview = () => setOpenPreview(false);

    const addMCContainer = () => {
        if (!editor) return;
        editor.chain().focus().insertContent({
            type: 'mcContainer',
            content: [
                {
                    type: 'mcChoice',
                    attrs: { id: uuidv4() },
                    content: [{ type: 'text', text: 'Option 1' }],
                },
            ],
        }).run();
    };

    const addFreeText = () => {
        if (!editor) return;
        editor.chain().focus().insertContent({
            type: 'freeText',
            attrs: { id: uuidv4() },
        }).run();
    };

    const addNumeric = () => {
        if (!editor) return;
        editor.chain().focus().insertContent({
            type: 'numericInput',
            content: [{ type: 'text', text: 'Numerische Antwort...' }],
        }).run();
    };

    const handleSave = async () => {
        if (!editor || !id) return;
        const contentJson = editor.getJSON();
        const contentHtml = editor.getHTML();

        try {
            await updateQuestionContent(id, contentJson, contentHtml);
            alert("Question saved successfully!");
        } catch (err) {
            console.error("Failed to save question:", err);
            alert("Failed to save question. Check console.");
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
                                <MenuItem onClick={addMCContainer}>Multiple Choice Block</MenuItem>
                                <MenuItem onClick={addFreeText}>Freitext</MenuItem>
                                <MenuItem onClick={addNumeric}>Numerische Antwort</MenuItem>
                            </Menu>
                        </Box>

                        <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Button variant="outlined" onClick={() => { }}>Zurück</Button>
                            <Button variant="outlined" onClick={handleOpenPreview}>Vorschau</Button>
                            <Button variant="contained" onClick={handleSave}>Speichern</Button>
                        </Box>

                        {/* Preview Dialog */}
                        <Dialog open={openPreview} onClose={handleClosePreview} maxWidth="md" fullWidth>
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
