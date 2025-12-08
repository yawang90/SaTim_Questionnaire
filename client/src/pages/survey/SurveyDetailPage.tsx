import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    LinearProgress,
    Paper,
    Snackbar,
    TextField,
    Typography
} from "@mui/material";
import MainLayout from "../../layouts/MainLayout.tsx";
import {
    createSurveyInstance,
    getSurveyById,
    getSurveyInstances,
    updateSurveyInstance
} from "../../services/SurveyService.tsx";
import dayjs, {Dayjs} from "dayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {Add} from "@mui/icons-material";
import type {surveyStatus} from "./SurveyUpdatePage.tsx";

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
}

interface SurveyInstance {
    id: number;
    name: string;
    validFrom: string;
    validTo: string;
}

interface NewInstanceInput {
    name: string;
    validFrom: Dayjs | null;
    validTo: Dayjs | null;
}
const SurveyDetailPage = () => {
    const { id } = useParams<{ id: string }>();

    const [survey, setSurvey] = useState<SurveyDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
        open: false,
        message: "",
        severity: "success",
    });

    const statusLabels: Record<SurveyDetail["status"], string> = {
        IN_PROGRESS: "Entwurf",
        PREPARED: "Vorbereitet",
        ACTIVE: "Aktiv",
        FINISHED: "Geschlossen",
    };

    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [selectedInstance, setSelectedInstance] = useState<SurveyInstance | null>(null);
    const [generatedLink, setGeneratedLink] = useState("");
    const [instances, setInstances] = useState<SurveyInstance[]>([]);
    const [instanceDialogOpen, setInstanceDialogOpen] = useState(false);
    const [newInstance, setNewInstance] = useState<NewInstanceInput>({ name: "", validFrom: null, validTo: null });
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editInstance, setEditInstance] = useState<SurveyInstance | null>(null);
    const [editData, setEditData] = useState<NewInstanceInput>({
        name: "",
        validFrom: null,
        validTo: null
    });


    useEffect(() => {
        fetchSurvey();
    }, [id]);

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
                createdBy: data.createdBy ?? { id: 0, first_name: "Unbekannt", last_name: "" },
                updatedBy: data.updatedBy ?? { id: 0, first_name: "Unbekannt", last_name: "" },
                status: (data.status ?? "IN_PROGRESS") as surveyStatus,
                mode: data.mode?.toUpperCase() === "ADAPTIV" ? "ADAPTIV" : "DESIGN",
            });

            const inst = await getSurveyInstances(data.id);
            setInstances(inst);
        } catch (err) {
            setSnackbar({ open: true, message: "Erhebung konnte nicht geladen werden.", severity: "error" });
            console.error("Failed to fetch survey:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenLinkDialog = (instance: SurveyInstance) => {
        setSelectedInstance(instance);
        const url = `${window.location.origin}/survey/${survey?.id}/instance/${instance.id}`;
        setGeneratedLink(url);
        setLinkDialogOpen(true);
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(generatedLink);
            setSnackbar({ open: true, message: "Link kopiert!", severity: "success" });
        } catch {
            setSnackbar({ open: true, message: "Fehler beim Kopieren des Links.", severity: "error" });
        }
    };

    const handleCreateInstance = async () => {
        if (!survey || !newInstance.name || !newInstance.validFrom || !newInstance.validTo) {
            setSnackbar({ open: true, message: "Bitte alle Felder ausfüllen.", severity: "error" });
            return;
        }
        if (newInstance.validTo.isBefore(newInstance.validFrom)) {
            setSnackbar({ open: true, message: "Das Enddatum muss nach dem Startdatum liegen.", severity: "error" });
            return;
        }
        setLoading(true);
        try {
            await createSurveyInstance(survey.id, {
                name: newInstance.name,
                validFrom: newInstance.validFrom.toISOString(),
                validTo: newInstance.validTo.toISOString(),
            });
            setSnackbar({ open: true, message: "Test Instanz erfolgreich erstellt.", severity: "success" });
            setInstanceDialogOpen(false);
            setNewInstance({ name: "", validFrom: null, validTo: null });
            await fetchSurvey();
        } catch (err) {
            console.error("Failed to create instance:", err);
            setSnackbar({ open: true, message: "Fehler beim Erstellen der Instanz.", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateInstance = async () => {
        if (!survey || !editInstance) return;

        if (!editData.name || !editData.validFrom || !editData.validTo) {
            setSnackbar({ open: true, message: "Bitte alle Felder ausfüllen.", severity: "error" });
            return;
        }

        if (editData.validTo.isBefore(editData.validFrom)) {
            setSnackbar({ open: true, message: "Das Enddatum muss nach dem Startdatum liegen.", severity: "error" });
            return;
        }

        setLoading(true);
        try {
            await updateSurveyInstance(editInstance.id, {
                name: editData.name,
                validFrom: editData.validFrom.toISOString(),
                validTo: editData.validTo.toISOString(),
            });

            setSnackbar({ open: true, message: "Instanz aktualisiert.", severity: "success" });
            setEditDialogOpen(false);
            setEditInstance(null);

            await fetchSurvey();
        } catch (err) {
            console.error("Failed to update instance:", err);
            setSnackbar({ open: true, message: "Fehler beim Aktualisieren.", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

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
                    <Typography variant="h5" gutterBottom>Instanzen</Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => setInstanceDialogOpen(true)}> Neue Instanz erstellen</Button>
                    <Divider sx={{ my: 2 }} />

                    {instances.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">Keine Instanzen vorhanden.</Typography>
                    ) : (
                        <Grid container spacing={2}>
                            {instances.map((inst) => {
                                const now = dayjs();
                                const from = dayjs(inst.validFrom);
                                const to = dayjs(inst.validTo);

                                let chipLabel: string;
                                let chipColor: "success" | "info" | "default" | undefined;

                                if (now.isBefore(from)) {
                                    chipLabel = "Zukünftig";
                                    chipColor = "info";
                                } else if (now.isAfter(to)) {
                                    chipLabel = "Vergangen";
                                    chipColor = "default";
                                } else {
                                    chipLabel = "Aktiv";
                                    chipColor = "success";
                                }
                                return (
                                    <Grid size={{ xs: 12, sm: 4 }} key={inst.id}>
                                        <Paper sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {inst.name}
                                                </Typography>
                                                <Chip label={chipLabel} color={chipColor} sx={{ ml: 1, height: 20, fontSize: "0.7rem" }}/>
                                            </Box>
                                            <Typography variant="body2">
                                                Von: {from.format("DD.MM.YYYY")} — Bis: {to.format("DD.MM.YYYY")}
                                            </Typography>
                                            <Button size="small" variant="contained" onClick={() => handleOpenLinkDialog(inst)}>
                                                Test URL generieren
                                            </Button>
                                            <Button size="small" variant="outlined" onClick={() => {
                                                setEditInstance(inst);
                                                setEditData({
                                                    name: inst.name,
                                                    validFrom: dayjs(inst.validFrom),
                                                    validTo: dayjs(inst.validTo)
                                                });
                                                setEditDialogOpen(true);}}>
                                                Bearbeiten
                                            </Button>
                                        </Paper>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}
                </Paper>
                <Dialog open={instanceDialogOpen} onClose={() => setInstanceDialogOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Neue Instanz erstellen</DialogTitle>
                    <DialogContent>
                        <Box display="flex" flexDirection="column" gap={2} mt={1}>
                            <TextField
                                label="Name"
                                fullWidth
                                value={newInstance.name}
                                onChange={(e) => setNewInstance({ ...newInstance, name: e.target.value })}
                            />
                            <DatePicker
                                label="Gültig von"
                                value={newInstance.validFrom}
                                onChange={(date) => setNewInstance({ ...newInstance, validFrom: date })}
                            />
                            <DatePicker
                                label="Gültig bis"
                                value={newInstance.validTo}
                                onChange={(date) => setNewInstance({ ...newInstance, validTo: date })}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setInstanceDialogOpen(false)}>Abbrechen</Button>
                        <Button
                            variant="contained"
                            onClick={handleCreateInstance}
                            disabled={!newInstance.name || !newInstance.validFrom || !newInstance.validTo || loading}>
                            {loading ? "Speichern..." : "Erstellen"}
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Test Instanz-Link</DialogTitle>
                    <DialogContent>
                        <Typography gutterBottom>
                            Diesen Link kannst du teilen, um die Umfrageinstanz aufzurufen:
                        </Typography>
                        <TextField fullWidth value={generatedLink} InputProps={{ readOnly: true }} sx={{ mt: 1 }}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setLinkDialogOpen(false)}>Schließen</Button>
                        <Button variant="contained" onClick={handleCopyLink}>Kopieren</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Instanz bearbeiten</DialogTitle>
                    <DialogContent>
                        <Box display="flex" flexDirection="column" gap={2} mt={1}>
                            <TextField label="Name" fullWidth value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })}/>
                            <DatePicker label="Gültig von" value={editData.validFrom} onChange={(date) => setEditData({ ...editData, validFrom: date })}/>
                            <DatePicker label="Gültig bis" value={editData.validTo} onChange={(date) => setEditData({ ...editData, validTo: date })}/>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditDialogOpen(false)}>Abbrechen</Button>
                        <Button variant="contained" onClick={handleUpdateInstance} disabled={!editData.name || !editData.validFrom || !editData.validTo || loading}>
                            {loading ? "Speichern..." : "Aktualisieren"}
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

export default SurveyDetailPage;
