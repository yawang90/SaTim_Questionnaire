import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, Divider,
    Grid,
    LinearProgress,
    MenuItem,
    Paper,
    Snackbar,
    TextField, Tooltip,
    Typography,
} from "@mui/material";
import MainLayout from "../../layouts/MainLayout.tsx";
import {
    type Booklet,
    getSurveyBooklets,
    getSurveyById,
    updateSurvey,
    uploadSurveyExcels
} from "../../services/SurveyService.tsx";

export type surveyStatus = "ACTIVE" | "PREPARED" | "IN_PROGRESS" | "FINISHED";

interface UserRef {
    id: number;
    first_name: string;
    last_name: string;
}

interface SurveyDetail {
    id: number;
    title: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    createdBy: UserRef;
    updatedBy: UserRef;
    status: surveyStatus;
    mode: "DESIGN" | "ADAPTIV";
    file1?: File | null;
    file2?: File | null;
    hasActiveInstance?: boolean;
}

const statusLabels: Record<SurveyDetail["status"], string> = {
    IN_PROGRESS: "Entwurf",
    PREPARED: "Vorbereitet",
    ACTIVE: "Aktiv",
    FINISHED: "Geschlossen",
};

const SurveyUpdatePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [survey, setSurvey] = useState<SurveyDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [file1, setFile1] = useState<File | null>(null);
    const [file2, setFile2] = useState<File | null>(null);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
        open: false,
        message: "",
        severity: "success",
    });
    const [booklets, setBooklets] = useState<Booklet[]>([]);
    const [bookletDialogOpen, setBookletDialogOpen] = useState(false);

    useEffect(() => {
        const fetchSurvey = async () => {
            if (!id) return;
            try {
                const data = await getSurveyById(id);
                setSurvey({
                    id: data.id,
                    title: data.title,
                    description: data.description ?? "",
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    createdBy: data.createdBy
                        ? { id: data.createdBy.id, first_name: data.createdBy.first_name, last_name: data.createdBy.last_name }
                        : { id: 0, first_name: "Unbekannt", last_name: "" },
                    updatedBy: data.updatedBy
                        ? { id: data.updatedBy.id, first_name: data.updatedBy.first_name, last_name: data.updatedBy.last_name }
                        : { id: 0, first_name: "Unbekannt", last_name: "" },
                    status: (data.status ?? "IN_PROGRESS") as surveyStatus,
                    mode: data.mode?.toUpperCase() === "ADAPTIV" ? "ADAPTIV" : "DESIGN",
                    file1: null,
                    file2: null,
                    hasActiveInstance: data.hasActiveInstance
                });
            } catch (err) {
                console.error("Failed to fetch survey:", err);
                setSnackbar({ open: true, message: "Erhebung konnte nicht geladen werden.", severity: "error" });
            } finally {
                setLoading(false);
            }
        };
        fetchSurvey();
    }, [id]);

    const handleSaveFiles = async () => {
        setSaving(true);
        if (!survey || !file1 || !file2) {
            setSaving(false);
            return;
        }
        try {
            await uploadSurveyExcels(survey.id.toString(), file1, file2);
            setSnackbar({ open: true, message: "Dateien erfolgreich hochgeladen.", severity: "success" });
            setUploadDialogOpen(false);
            setSurvey({ ...survey, file1, file2 });
        } catch (err: any) {
            if (err?.details) {
                const msg = err.details
                    .map((e:any) =>
                        `Booklet ${e.bookletId}: Fehlende Aufgaben -> ${e.missingQuestionIds.join(", ")}`
                    ).join("\n");
                setSnackbar({open: true, message: msg, severity: "error"});
            } else {
                setSnackbar({open: true, message: "Fehler beim Hochladen der Dateien.", severity: "error"});
            }
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (!survey) return;

        const fetchBooklets = async () => {
            try {
                const data = await getSurveyBooklets(survey.id.toString());
                console.log(data)
                setBooklets(data);
            } catch (err) {
                console.log(err);
                setSnackbar({ open: true, message: "Booklets konnten nicht geladen werden.", severity: "error" });
            }
        };

        fetchBooklets();
    }, [survey]);

    const handleSaveChanges = async () => {
        if (!survey) return;
        setSaving(true);
        try {
            await updateSurvey(survey.id.toString(), {
                title: survey.title,
                description: survey.description,
                status: survey.status,
            });
            setSnackbar({ open: true, message: "Änderungen erfolgreich gespeichert.", severity: "success" });
        } catch (err) {
            console.error("Failed to update survey:", err);
            setSnackbar({ open: true, message: "Fehler beim Speichern der Änderungen.", severity: "error" });
        } finally {
            setSaving(false);
        }
    };

    const uniqueQuestionCount = Array.from(
        new Set(booklets.flatMap(b => b.BookletQuestion.map(q => q.id)))
    ).length;

    if (loading) return <LinearProgress />;
    if (!survey) return <Typography>Survey not found</Typography>;
    return (
        <MainLayout>
            <Box sx={{ minHeight: "100vh", py: 3, px: 2, mt: 6, display: "flex", flexDirection: "column", gap: 3 }}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        Erhebung Details
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Typography variant="subtitle1"><strong>Titel:</strong> {survey.title}</Typography>
                    <Typography variant="subtitle1"><strong>Status:</strong> {statusLabels[survey.status]}</Typography>
                    <Typography variant="subtitle1"><strong>Modus:</strong> {survey.mode}</Typography>
                    <Typography variant="subtitle1" sx={{ mt: 2 }}><strong>Beschreibung:</strong></Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mb: 2 }}>{survey.description}</Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1">
                        <strong>Erstellt von:</strong> {survey.createdBy.first_name} {survey.createdBy.last_name}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        <strong>Erstellt am:</strong> {new Date(survey.createdAt).toLocaleString()}
                    </Typography>

                    <Typography variant="subtitle1">
                        <strong>Zuletzt geändert von:</strong> {survey.updatedBy.first_name} {survey.updatedBy.last_name}
                    </Typography>
                    <Typography variant="subtitle1">
                        <strong>Zuletzt geändert am:</strong> {new Date(survey.updatedAt).toLocaleString()}
                    </Typography>
                </Paper>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h5" sx={{ pb: 3 }}  gutterBottom>
                        Erhebung bearbeiten
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Titel"
                                fullWidth
                                value={survey.title}
                                onChange={(e) => setSurvey({ ...survey, title: e.target.value })}/>
                        </Grid>

                        {survey.status === "PREPARED" && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    select
                                    label="Status"
                                    fullWidth
                                    value={survey.status}
                                    onChange={(e) =>
                                        setSurvey({ ...survey, status: e.target.value as surveyStatus })
                                    }>
                                    <MenuItem value="PREPARED">Vorbereitet</MenuItem>
                                    <MenuItem value="FINISHED">Geschlossen</MenuItem>
                                </TextField>
                            </Grid>
                        )}

                        <Grid size={{ xs: 12 }}>
                            <TextField label="Beschreibung" fullWidth multiline rows={4} value={survey.description} onChange={(e) => setSurvey({ ...survey, description: e.target.value })}/>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                                <Button variant="outlined" onClick={() => navigate(-1)}>
                                    Zurück
                                </Button>
                                <Button variant="contained" onClick={handleSaveChanges} disabled={saving}>
                                    {saving ? "Speichern..." : "Änderungen speichern"}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {survey.mode === "DESIGN" && (
                <Paper sx={{ p: 3 }}>
                    <Typography sx={{ pb: 3 }} variant="h5" gutterBottom>Aufgaben Zuordnung (Booklet)</Typography>
                    <Tooltip title={survey.hasActiveInstance ? "Die Design-Matrix kann nicht geändert werden, solange aktive Durchführungen existieren." : ""} arrow>
                       <span>
                        <Button disabled={survey.hasActiveInstance || saving} variant="contained" color="primary" onClick={() => {setFile1(null);setFile2(null);setUploadDialogOpen(true);}}>
                            Design-Matrix hochladen
                        </Button></span>
                    </Tooltip>
                </Paper> )}

                {survey.mode === "DESIGN" && booklets.length > 0 && (
                    <Paper sx={{ p: 3 }}>
                        <Typography sx={{ pb: 3 }} variant="h5">Booklets</Typography>
                        <Typography sx={{ pb: 1 }}>Zuvor hochgeladene Booklets werden hier angezeigt. Bei erneutem hochladen der Design-Matrix, werden alte Booklets automatisch gelöscht und die Versions Zahl erhöht.</Typography>
                        <Typography sx={{ pb: 1 }}>
                            {booklets.length > 0 && `Booklet Version: ${booklets[0].version}`}
                        </Typography>
                        <Typography sx={{ pb: 1 }}>  {booklets.length > 0 && `Anzahl Slots: ${uniqueQuestionCount}`}</Typography>
                        <Typography sx={{ pb: 1 }}>  {booklets.length > 0 && `Anzahl Booklets: ${booklets.length}`}</Typography>

                        <Button variant="outlined" onClick={() => setBookletDialogOpen(true)}>
                            Booklets anzeigen ({booklets.length})
                        </Button>
                        <Dialog open={bookletDialogOpen} onClose={() => setBookletDialogOpen(false)} fullScreen maxWidth="sm">
                            <DialogTitle>Booklets</DialogTitle>
                            <DialogContent>
                                {booklets.map((b) => (
                                    <Box key={b.id} sx={{ mb: 2, p: 1, border: "1px solid #ccc", borderRadius: 1 }}>
                                        <Typography variant="subtitle1">Booklet {b.bookletId}</Typography>
                                        <Typography variant="body2">Fragen: {b.BookletQuestion.map(q => `ID: ${q.questionId}`).join(", ")}</Typography>
                                        <Typography variant="body2">Erstellt am: {new Date(b.createdAt).toLocaleDateString()}</Typography>
                                        {b.excelFileUrl && (
                                            <Button variant="text" href={b.excelFileUrl} target="_blank">Excel herunterladen</Button>
                                        )}
                                    </Box>
                                ))}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setBookletDialogOpen(false)}>Schließen</Button>
                            </DialogActions>
                        </Dialog>
                    </Paper>
                )}

                <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Excel Dateien hochladen</DialogTitle>
                    <DialogContent>
                        <Box display="flex" flexDirection="column" gap={2} mt={1}>
                            <Button variant={file1 ? "contained" : "outlined"} component="label">
                                {file1 ? `Datei 1: ${file1.name}` : "Upload: TestId - Testheft"}
                                <input hidden type="file" accept=".xlsx, .xls" onChange={(e) => e.target.files && setFile1(e.target.files[0])}/>
                            </Button>

                            <Button variant={file2 ? "contained" : "outlined"} component="label">
                                {file2 ? `Datei 2: ${file2.name}` : "Upload: Designmatrix (Booklet - Testheft)"}
                                <input hidden type="file" accept=".xlsx, .xls" onChange={(e) => e.target.files && setFile2(e.target.files[0])}/>
                            </Button>

                            {(!file1 || !file2) && (
                                <Typography color="error">
                                    Beide Dateien müssen hochgeladen werden!
                                </Typography>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setUploadDialogOpen(false)}>Abbrechen</Button>
                        <Button variant="contained" onClick={handleSaveFiles} disabled={!file1 || !file2 || saving}>
                            {saving ? "Speichern..." : "Speichern"}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
                </Snackbar>
            </Box>
        </MainLayout>
    );
};

export default SurveyUpdatePage;
