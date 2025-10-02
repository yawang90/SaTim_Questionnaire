import React from 'react';
import {Editor} from '@tiptap/react';
import {IconButton, Paper, Tooltip} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import TitleIcon from '@mui/icons-material/Title';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import ImageIcon from '@mui/icons-material/Image';
import TableRowsIcon from '@mui/icons-material/TableRows';

interface EditorToolbarProps {
    editor: Editor | null;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
    if (!editor) return null;

    return (
        <Paper elevation={1} sx={{display: 'flex', gap: 1, p: 1, mb: 2, flexWrap: 'wrap', backgroundColor: 'background.paper',}}>
            <Tooltip title="Bold">
                <IconButton onClick={() => editor.chain().focus().toggleBold().run()} color={editor.isActive('bold') ? 'primary' : 'default'}>
                    <FormatBoldIcon />
                </IconButton>
            </Tooltip>

            <Tooltip title="Italic">
                <IconButton onClick={() => editor.chain().focus().toggleItalic().run()} color={editor.isActive('italic') ? 'primary' : 'default'}>
                    <FormatItalicIcon />
                </IconButton>
            </Tooltip>

            <Tooltip title="Strike">
                <IconButton onClick={() => editor.chain().focus().toggleStrike().run()} color={editor.isActive('strike') ? 'primary' : 'default'}>
                    <StrikethroughSIcon />
                </IconButton>
            </Tooltip>

            <Tooltip title="Paragraph">
                <IconButton onClick={() => editor.chain().focus().setParagraph().run()} color={editor.isActive('paragraph') ? 'primary' : 'default'}>
                    <TitleIcon />
                </IconButton>
            </Tooltip>

            <Tooltip title="Heading 2">
                <IconButton onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()} color={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}>
                    <LooksOneIcon />
                </IconButton>
            </Tooltip>

            <Tooltip title="Insert Image">
                <IconButton
                    onClick={() => {
                        const url = prompt('Enter image URL');
                        if (url) editor.chain().focus().setImage({ src: url }).run();
                    }}>
                    <ImageIcon />
                </IconButton>
            </Tooltip>

            <Tooltip title="Insert Table">
                <IconButton onClick={() => editor.chain().focus().insertTable({ rows: 2, cols: 2, withHeaderRow: true }).run()}>
                    <TableRowsIcon />
                </IconButton>
            </Tooltip>
        </Paper>
    );
};

export default EditorToolbar;
