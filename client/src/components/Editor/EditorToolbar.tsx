import React, {useState} from 'react';
import { Editor } from '@tiptap/react';
import {
    IconButton,
    Paper,
    Tooltip,
    MenuItem,
    Select,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
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
import {uploadImage} from "../../services/QuestionsService.tsx";

const fontFamilies = ['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana'];
const fontSizes = ['12px', '14px', '16px', '18px', '24px', '32px'];

interface EditorToolbarProps {
    editor: Editor | null;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({ editor }) => {
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    const [open, setOpen] = React.useState(false);
    const [imageUrl, setImageUrl] = React.useState('');
    const [uploading, setUploading] = React.useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error",
    });
    const [tableDialogOpen, setTableDialogOpen] = useState(false);
    const [tableRows, setTableRows] = useState(2);
    const [tableCols, setTableCols] = useState(2);
    const [cellWidth, setCellWidth] = useState(100);


    React.useEffect(() => {
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
            const imageUrl = data.url;
            await handleInsertImage(imageUrl);
        } catch (err) {
            console.error(err);
            setSnackbar({
                open: true,
                message: "Fehler beim Hochladen des Bildes.",
                severity: "error",
            });        } finally {
            setUploading(false);
        }
    };

    const handleInsertTable = (rows: number, cols: number, width: number) => {
        if (!editor) return;

        const tableContent = Array.from({ length: tableRows }).map(() => ({
            type: 'tableRow',
            content: Array.from({ length: tableCols }).map(() => ({
                type: 'tableCell',
                attrs: { colwidth: [cellWidth] },
                content: [{ type: 'paragraph', content: [{ type: 'text', text: ' ' }] }]
            })),
        }));

        editor.chain().focus().insertContent({
            type: 'table',
            attrs: { rows: tableRows, cols: tableCols, withHeaderRow: true },
            content: tableContent,
        }).run();

        setTableDialogOpen(false);
    };

    return (
        <>
            {/* Toolbar */}
            <Paper
                elevation={1}
                sx={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, p: 1, mb: 2, backgroundColor: 'background.paper', borderRadius: 0,}}>
                {/* Font Family */}
                <Select size="small" value={editor.getAttributes('textStyle').fontFamily || ''} onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()} displayEmpty sx={{ minWidth: 140 }}>
                    <MenuItem value="">Schriftart</MenuItem>
                    {fontFamilies.map((font) => (
                        <MenuItem key={font} value={font} sx={{ fontFamily: font }}>
                            {font}
                        </MenuItem>
                    ))}
                </Select>

                {/* Font Size */}
                <Select size="small" value={editor.getAttributes('textStyle').fontSize || ''} onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()} displayEmpty sx={{ minWidth: 120 }}>
                    <MenuItem value="">Schriftgröße</MenuItem>
                    {fontSizes.map((size) => (
                        <MenuItem key={size} value={size} sx={{ fontSize: size }}>
                            {size}
                        </MenuItem>
                    ))}
                </Select>

                {/* Bold */}
                <Tooltip title="Fett">
                    <IconButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        sx={{ color: editor.isActive('bold') ? 'primary.main' : 'text.secondary' }}>
                        <FormatBoldIcon />
                    </IconButton>
                </Tooltip>

                {/* Italic */}
                <Tooltip title="Kursiv">
                    <IconButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        sx={{ color: editor.isActive('italic') ? 'primary.main' : 'text.secondary' }}>
                        <FormatItalicIcon />
                    </IconButton>
                </Tooltip>

                {/* Strike */}
                <Tooltip title="Durchgestrichen">
                    <IconButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        sx={{ color: editor.isActive('strike') ? 'primary.main' : 'text.secondary' }}>
                        <StrikethroughSIcon />
                    </IconButton>
                </Tooltip>

                {/* Headings */}
                <Tooltip title="Überschrift 1">
                    <IconButton
                        onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()}
                        sx={{ color: editor.isActive('heading', { level: 1 }) ? 'primary.main' : 'text.secondary' }}>
                        <LooksOneIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Überschrift 2">
                    <IconButton
                        onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
                        sx={{ color: editor.isActive('heading', { level: 2 }) ? 'primary.main' : 'text.secondary' }}>
                        <LooksTwoIcon />
                    </IconButton>
                </Tooltip>

                {/* Lists */}
                <Tooltip title="Aufzählung">
                    <IconButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        sx={{ color: editor.isActive('bulletList') ? 'primary.main' : 'text.secondary' }}>
                        <FormatListBulletedIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Nummerierte Liste">
                    <IconButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        sx={{ color: editor.isActive('orderedList') ? 'primary.main' : 'text.secondary' }}>
                        <FormatListNumberedIcon />
                    </IconButton>
                </Tooltip>

                {/* Alignment */}
                <Tooltip title="Links ausrichten">
                    <IconButton
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        sx={{ color: editor.isActive({ textAlign: 'left' }) ? 'primary.main' : 'text.secondary' }}>
                        <FormatAlignLeftIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Zentrieren">
                    <IconButton
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        sx={{ color: editor.isActive({ textAlign: 'center' }) ? 'primary.main' : 'text.secondary' }}>
                        <FormatAlignCenterIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Rechts ausrichten">
                    <IconButton
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        sx={{ color: editor.isActive({ textAlign: 'right' }) ? 'primary.main' : 'text.secondary' }}>
                        <FormatAlignRightIcon />
                    </IconButton>
                </Tooltip>

                {/* Image Button */}
                <Tooltip title="Bild einfügen">
                    <IconButton sx={{ color: 'text.secondary' }} onClick={() => setOpen(true)}>
                        <ImageIcon />
                    </IconButton>
                </Tooltip>

                {/* Table */}
                <Tooltip title="Tabelle einfügen">
                    <IconButton sx={{ color: 'text.secondary' }} onClick={() => setTableDialogOpen(true)}>
                        <TableChartIcon/>
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
                    <TextField fullWidth label="Bild URL" size="small" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} sx={{ mb: 2 }}/>
                    <Box textAlign="center">
                        <Button variant="outlined" component="label" disabled={uploading}>
                            {uploading ? 'Hochladen...' : 'Datei auswählen'}
                            <input hidden type="file" accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file);
                                }}
                            />
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

            <Dialog fullWidth maxWidth="sm" open={tableDialogOpen} onClose={() => setTableDialogOpen(false)}>
                <DialogTitle>Neue Tabelle erstellen</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                    <TextField sx={{ mt: 1 }}
                        type="number"
                        label="Zeilen"
                        value={tableRows}
                        onChange={(e) => setTableRows(Number(e.target.value))}
                        slotProps={{ input: { inputProps: { min: 1 } } }}
                    />
                    <TextField
                        type="number"
                        label="Spalten"
                        value={tableCols}
                        onChange={(e) => setTableCols(Number(e.target.value))}
                    />
                    <TextField
                        type="number"
                        label="Zellenbreite (px)"
                        value={cellWidth}
                        onChange={(e) => setCellWidth(Number(e.target.value))}
                        slotProps={{ input: { inputProps: { min: 10 } } }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTableDialogOpen(false)}>Abbrechen</Button>
                    <Button variant="contained" onClick={() => handleInsertTable(tableRows, tableCols, cellWidth)}>
                        Einfügen
                    </Button>
                </DialogActions>
            </Dialog>

        </>
    );
};

export default EditorToolbar;
