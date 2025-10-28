import React, { useState, useEffect, useReducer } from 'react';
import { Editor } from '@tiptap/react';
import {
    Box,
    Button, Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    MenuItem,
    Paper,
    Select,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import ImageIcon from '@mui/icons-material/Image';
import TableChartIcon from '@mui/icons-material/TableChart';
import FunctionsIcon from '@mui/icons-material/Functions';
import { uploadImage } from '../../services/EditorService.tsx';

const fontFamilies = ['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana'];
const fontSizes = ['12px', '14px', '16px', '18px', '24px', '32px'];

interface EditorToolbarProps {
    editor: Editor | null;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
    const [, forceUpdate] = useReducer(x => x + 1, 0);
    const [open, setOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [tableDialogOpen, setTableDialogOpen] = useState(false);
    const [tableRows, setTableRows] = useState(2);
    const [tableCols, setTableCols] = useState(2);
    const [cellWidth, setCellWidth] = useState(100);
    const [latexDialogOpen, setLatexDialogOpen] = useState(false);
    const [latexCode, setLatexCode] = useState('');
    const [withHeaderRow, setWithHeaderRow] = useState(true);

    useEffect(() => {
        if (!editor) return;
        editor.on('selectionUpdate', forceUpdate);
        editor.on('transaction', forceUpdate);
        return () => {
            editor.off('selectionUpdate', forceUpdate);
            editor.off('transaction', forceUpdate);
        };
    }, [editor]);

    if (!editor) return null;

    const handleInsertImage = async (url: string) => {
        editor.chain().focus().setImage({ src: url }).run();
        setImageUrl('');
        setOpen(false);
    };

    const handleFileUpload = async (file: File) => {
        try {
            setUploading(true);
            const data = await uploadImage(file);
            await handleInsertImage(data.url);
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleInsertTable = (rows: number, cols: number, width: number, header: boolean) => {
        if (!editor) return;

        editor.chain().focus().insertTable({ rows, cols, withHeaderRow: header }).run();

        const { tr, doc } = editor.state;
        const tablePos = editor.state.selection.$from.before();
        const tableNode = doc.nodeAt(tablePos);
        if (tableNode?.type.name === 'table') {
            tableNode.descendants((node, pos) => {
                if (node.type.name === 'tableCell') {
                    tr.setNodeMarkup(pos, undefined, { colwidth: [width] });
                }
            });
            editor.view.dispatch(tr);
        }

        setTableDialogOpen(false);
    };

    const insertLatex = (code: string) => {
        editor.chain().focus().insertContent({ type: 'latex', attrs: { latex: code } }).run();
        setLatexCode('');
        setLatexDialogOpen(false);
    };

    return (
        <>
            {/* Toolbar */}
            <Paper elevation={1}
                sx={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, p: 1, mb: 2, backgroundColor: 'background.paper', borderRadius: 0,}}>
                <Select size="small" value={editor.getAttributes('textStyle').fontFamily || ''} onChange={e => editor.chain().focus().setFontFamily(e.target.value).run()} displayEmpty sx={{ minWidth: 140 }}>
                    <MenuItem value="">Schriftart</MenuItem>
                    {fontFamilies.map(font => (
                        <MenuItem key={font} value={font} sx={{ fontFamily: font }}>
                            {font}
                        </MenuItem>
                    ))}
                </Select>

                <Select size="small" value={editor.getAttributes('textStyle').fontSize || ''} onChange={e => editor.chain().focus().setFontSize(e.target.value).run()} displayEmpty sx={{ minWidth: 120 }}>
                    <MenuItem value="">Schriftgröße</MenuItem>
                    {fontSizes.map(size => (
                        <MenuItem key={size} value={size} sx={{ fontSize: size }}>
                            {size}
                        </MenuItem>
                    ))}
                </Select>

                {/* Bold/Italic/Strike */}
                <Tooltip title="Fett">
                    <IconButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        sx={{ color: editor.isActive('bold') ? 'primary.main' : 'text.secondary' }}>
                        <FormatBoldIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Kursiv">
                    <IconButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        sx={{ color: editor.isActive('italic') ? 'primary.main' : 'text.secondary' }}>
                        <FormatItalicIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Durchgestrichen">
                    <IconButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        sx={{ color: editor.isActive('strike') ? 'primary.main' : 'text.secondary' }}
                    >
                        <StrikethroughSIcon />
                    </IconButton>
                </Tooltip>

                {/* Headings */}
                <Tooltip title="Überschrift 1">
                    <IconButton
                        onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()}
                        sx={{ color: editor.isActive('heading', { level: 1 }) ? 'primary.main' : 'text.secondary' }}
                    >
                        <LooksOneIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Überschrift 2">
                    <IconButton
                        onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
                        sx={{ color: editor.isActive('heading', { level: 2 }) ? 'primary.main' : 'text.secondary' }}
                    >
                        <LooksTwoIcon />
                    </IconButton>
                </Tooltip>

                {/* Lists */}
                <Tooltip title="Aufzählung">
                    <IconButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        sx={{ color: editor.isActive('bulletList') ? 'primary.main' : 'text.secondary' }}
                    >
                        <FormatListBulletedIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Nummerierte Liste">
                    <IconButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        sx={{ color: editor.isActive('orderedList') ? 'primary.main' : 'text.secondary' }}
                    >
                        <FormatListNumberedIcon />
                    </IconButton>
                </Tooltip>

                {/* Align */}
                <Tooltip title="Links ausrichten">
                    <IconButton
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        sx={{ color: editor.isActive({ textAlign: 'left' }) ? 'primary.main' : 'text.secondary' }}
                    >
                        <FormatAlignLeftIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Zentrieren">
                    <IconButton
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        sx={{ color: editor.isActive({ textAlign: 'center' }) ? 'primary.main' : 'text.secondary' }}
                    >
                        <FormatAlignCenterIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Rechts ausrichten">
                    <IconButton
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        sx={{ color: editor.isActive({ textAlign: 'right' }) ? 'primary.main' : 'text.secondary' }}
                    >
                        <FormatAlignRightIcon />
                    </IconButton>
                </Tooltip>

                {/* Image */}
                <Tooltip title="Bild einfügen">
                    <IconButton sx={{ color: 'text.secondary' }} onClick={() => setOpen(true)}>
                        <ImageIcon />
                    </IconButton>
                </Tooltip>

                {/* Table */}
                <Tooltip title="Tabelle einfügen">
                    <IconButton sx={{ color: 'text.secondary' }} onClick={() => setTableDialogOpen(true)}>
                        <TableChartIcon />
                    </IconButton>
                </Tooltip>

                {/* LaTeX */}
                <Tooltip title="LaTeX einfügen">
                    <IconButton sx={{ color: 'text.secondary' }} onClick={() => setLatexDialogOpen(true)}>
                        <FunctionsIcon />
                    </IconButton>
                </Tooltip>
            </Paper>

            {/* Image Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Bild einfügen</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" mb={1}>
                        Fügen Sie eine Bild-URL ein oder laden Sie eine Datei hoch.
                    </Typography>
                    <TextField fullWidth label="Bild URL" size="small" value={imageUrl} onChange={e => setImageUrl(e.target.value)} sx={{ mb: 2 }}/>
                    <Box textAlign="center">
                        <Button variant="outlined" component="label" disabled={uploading}>
                            {uploading ? 'Hochladen...' : 'Datei auswählen'}
                            <input hidden type="file" accept="image/*" onChange={e => {
                                const file = e.target.files?.[0];if (file) handleFileUpload(file);}}/>
                        </Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Abbrechen</Button>
                    <Button disabled={!imageUrl} onClick={() => handleInsertImage(imageUrl)} variant="contained">
                        Einfügen
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Table Dialog */}
            <Dialog fullWidth open={tableDialogOpen} onClose={() => setTableDialogOpen(false)}>
                <DialogTitle>Neue Tabelle erstellen</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1}}>
                    <TextField
                        type="number"
                        label="Zeilen"
                        value={tableRows}
                        sx={{ mt: 2}}
                        onChange={e => setTableRows(Number(e.target.value))}
                        inputProps={{ min: 1 }}
                    />
                    <TextField
                        type="number"
                        label="Spalten"
                        value={tableCols}
                        onChange={e => setTableCols(Number(e.target.value))}
                    />
                    <TextField
                        type="number"
                        label="Zellenbreite (px)"
                        value={cellWidth}
                        onChange={e => setCellWidth(Number(e.target.value))}
                        inputProps={{ min: 10 }}
                    />
                    <FormControlLabel
                        control={<Checkbox checked={withHeaderRow} onChange={e => setWithHeaderRow(e.target.checked)} />}
                        label="Mit Kopfzeile"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTableDialogOpen(false)}>Abbrechen</Button>
                    <Button variant="contained" onClick={() => handleInsertTable(tableRows, tableCols, cellWidth, withHeaderRow)}>
                        Einfügen
                    </Button>
                </DialogActions>
            </Dialog>

            {/* LaTeX Dialog */}
            <Dialog open={latexDialogOpen} onClose={() => setLatexDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>LaTeX Formel einfügen</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" mb={1}>
                        Geben Sie die LaTeX-Formel ein (z.B. x^2 + y^2 = z^2)
                    </Typography>
                    <TextField fullWidth multiline minRows={2} label="LaTeX Code" value={latexCode} onChange={e => setLatexCode(e.target.value)}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLatexDialogOpen(false)}>Abbrechen</Button>
                    <Button disabled={!latexCode} onClick={() => insertLatex(latexCode)} variant="contained">
                        Einfügen
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default EditorToolbar;
