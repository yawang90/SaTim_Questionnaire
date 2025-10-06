import React from 'react';
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {v4 as uuidv4} from 'uuid';
import {Box, Button, Menu, MenuItem, Paper, Typography} from '@mui/material';
import QuestionLayout from '../../layouts/QuestionLayout';
import MainLayout from '../../layouts/MainLayout.tsx';
import {FreeText, MCChoice, MCContainer, NumericInput} from "../../components/TipTapPlugins.tsx";
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link'
import {Table} from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import EditorToolbar from "../../components/TipTapToolbar.tsx";
import TextAlign from '@tiptap/extension-text-align'
import {FontFamily, FontSize, TextStyle} from '@tiptap/extension-text-style'
import AddIcon from '@mui/icons-material/Add'

export default function QuestionEditorPage() {
    const editor = useEditor({
        extensions: [StarterKit.configure({bulletList: {keepMarks: true}, orderedList: {keepMarks: true},}),
            TextStyle, FontSize, FontFamily, TextAlign.configure({ types: ['heading', 'paragraph', 'bulletList', 'orderedList'] }),
            Link, Table.configure({resizable: true}), TableRow, TableCell, TableHeader, Image,
            MCContainer, MCChoice, FreeText, NumericInput],
        content: '<p>Erstelle hier deine Aufgabe...</p>',
    })
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const addMCContainer = () => {
        if (!editor) return
        editor.chain().focus().insertContent({
            type: 'mcContainer',
            content: [
                {
                    type: 'mcChoice',
                    attrs: { id: uuidv4() },
                    content: [{ type: 'text', text: 'Option 1' }],
                },
            ],
        }).run()
    }

    const addFreeText = () => {
        if (!editor) return
        editor.chain().focus().insertContent({
            type: 'freeText',
            attrs: { id: uuidv4() },
        }).run()
    }

    const addNumeric = () => {
        if (!editor) return
        editor.chain().focus().insertContent({
            type: 'numericInput',
            content: [{ type: 'text', text: 'Numerische Antwort...' }],
        }).run()
    }

    const removeNode = (pos: number) => {
        if (!editor) return
        editor.chain().focus().deleteRange({ from: pos, to: pos + 1 }).run()
    }

    const handleSave = () => {
        console.log('Saved Question HTML:', editor?.getHTML())
        alert('Question saved! Check console.')
    }

    return (
        <MainLayout>
            <QuestionLayout allowedSteps={[true, true, true, true]}>
                <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 3, px: 2, display: 'flex', flexDirection: 'column', mt: 6 }}>
                    <Paper elevation={0} sx={{ padding: 3, border: '2px solid #000' }}>
                        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                            Aufgabe Erstellen
                        </Typography>
                        <Box sx={{border: '1px solid #ccc', borderRadius: 1, minHeight: 200, '& .ProseMirror': {outline: 'none',},}}>
                            <EditorToolbar editor={editor} />
                            <EditorContent editor={editor} />
                        </Box>
                        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <Button variant="contained" onClick={handleClick} startIcon={<AddIcon />}>
                                Antwort Typen hinzufügen
                            </Button>
                            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                                <MenuItem onClick={addMCContainer}>Multiple Choice Block</MenuItem>
                                <MenuItem onClick={addFreeText}>Freitext</MenuItem>
                                <MenuItem onClick={addNumeric}>Numerische Antwort</MenuItem>
                            </Menu>
                        </Box>
                        <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Button variant="outlined" onClick={() => { }}>Zurück</Button>
                            <Button variant="contained" onClick={handleSave}>Speichern</Button>
                        </Box>

                    </Paper>
                </Box>
            </QuestionLayout>
        </MainLayout>
    )
}