import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout.tsx";
import {Box, Button, Card, CardActions, CardContent, CardHeader, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, IconButton, Radio, RadioGroup, Snackbar, Alert, TextField, Typography,} from "@mui/material";
import { Add, BarChart, CalendarToday, MoreVert } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { createSurvey, getSurveys } from "../../services/SurveyService.tsx";

interface Survey {
    id: string;
    title: string;
    description: string;
    createdAt: string;
    status: "Aktiv" | "Entwurf" | "Geschlossen";
    mode?: "adaptiv" | "design";
}

const DashboardPage = () => {
    const navigate = useNavigate();

    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({open: false, message: "", severity: "success" as "success" | "error",});
    const [newSurvey, setNewSurvey] = useState<{ title: string; description: string; fromDate: string; toDate: string; mode: "design"; }>({title: "", description: "", fromDate: "", toDate: "", mode: "design",});

    const handleCreateSurvey = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setCreating(true);

        try {
            const payload = {
                title: newSurvey.title,
                description: newSurvey.description,
                mode: newSurvey.mode,
                status: "IN_PROGRESS" as "ACTIVE" | "IN_PROGRESS" | "FINISHED",
            };

            const created = await createSurvey(payload);

            const survey: Survey = {
                id: created.id.toString(),
                title: created.title,
                description: created.description || "",
                createdAt: created.createdAt,
                status: mapStatus(created.status ?? "IN_PROGRESS"),
                mode: newSurvey.mode,
            };
            setSurveys([survey, ...surveys]);
            setSnackbar({open: true, message: "Erhebung erfolgreich erstellt!", severity: "success",});

            setNewSurvey({title: "", description: "", fromDate: "", toDate: "", mode: "design",});
            setIsDialogOpen(false);
        } catch (err) {
            console.log(err);
            setSnackbar({open: true, message: "Fehler beim Erstellen der Erhebung.", severity: "error",});
        } finally {
            setCreating(false);
        }
    };

    const getStatusColor = (status: Survey["status"]) => {
        switch (status) {
            case "Aktiv":
                return "info";
            case "Entwurf":
                return "primary";
            case "Geschlossen":
                return "secondary";
            default:
                return "secondary";
        }
    };

    const mapStatus = (status: "ACTIVE" | "IN_PROGRESS" | "FINISHED" | undefined): Survey["status"] => {
        switch (status) {
            case "ACTIVE":
                return "Aktiv";
            case "IN_PROGRESS":
                return "Entwurf";
            case "FINISHED":
                return "Geschlossen";
            default:
                return "Entwurf";
        }
    };

    useEffect(() => {
        const fetchSurveys = async () => {
            setLoading(true);
            try {
                const existingSurveys = await getSurveys();
                setSurveys(
                    existingSurveys.map((s) => ({
                        id: s.id.toString(),
                        title: s.title,
                        description: s.description || "",
                        createdAt: s.createdAt,
                        status: mapStatus(s.status),
                        mode: s.mode as "adaptiv" | "design",
                    }))
                );
            } catch (err) {
                console.error("Failed to load surveys:", err);
                setSnackbar({
                    open: true,
                    message: "Fehler beim Laden der Erhebungen.",
                    severity: "error",
                });
            } finally {
                setLoading(false);
            }
        };
        fetchSurveys();
    }, []);

    return (
        <MainLayout>
            <Box sx={{ minHeight: "100vh", py: 3, px: 2, display: "flex", flexDirection: "column", mt: 6 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                        <Typography variant="h4">Erhebungs Übersicht</Typography>
                        <Typography color="textSecondary">
                            Erstelle und bearbeite Erhebungen
                        </Typography>
                    </Box>
                    <Button variant="contained" startIcon={<Add />} onClick={() => setIsDialogOpen(true)}>
                        Neue Erhebung
                    </Button>
                </Box>

                <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                    <DialogTitle>Erhebung erstellen</DialogTitle>
                    <form onSubmit={handleCreateSurvey}>
                        <DialogContent sx={{ pt: 0 }}>
                            <TextField label="Titel" fullWidth required margin="normal" value={newSurvey.title} onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })}/>
                            <TextField label="Beschreibung" fullWidth required multiline rows={4} margin="normal" value={newSurvey.description} onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })}
                            />
                            <Typography variant="subtitle1" gutterBottom>
                                Modus
                            </Typography>
                            <RadioGroup row value={newSurvey.mode} onChange={(e) =>
                                setNewSurvey({
                                    ...newSurvey,
                                    mode: e.target.value as "design",
                                })}>
                                <FormControlLabel value="design" control={<Radio />} label="Design Matrix"/>
                            </RadioGroup>
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" onClick={() => setIsDialogOpen(false)}>
                                Abbrechen
                            </Button>
                            <Button type="submit" variant="contained" disabled={creating}>
                                {creating ? "Erstellen..." : "Erstellen"}
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" py={10}>
                        <CircularProgress />
                    </Box>
                ) : surveys.length === 0 ? (
                    <Box textAlign="center" py={12}>
                        <BarChart fontSize="large" color="disabled" />
                        <Typography variant="h6" mt={2}>Noch keine Erhebungen</Typography>
                        <Button variant="contained" startIcon={<Add />} onClick={() => setIsDialogOpen(true)}>Erhebung erstellen</Button>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {surveys.map((survey) => (
                            //@ts-ignore
                            <Grid item key={survey.id} sx={{ width: 350, flexGrow: 0 }}>
                                <Card>
                                    <CardHeader
                                        title={survey.title}
                                        subheader={
                                            <Chip label={survey.status} color={getStatusColor(survey.status)} size="small"/>
                                    }
                                        action={<IconButton><MoreVert /></IconButton>}
                                    />
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" fontSize="0.875rem">
                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                <CalendarToday fontSize="small" /> {"Erstellt am "}
                                                {new Date(survey.createdAt).toLocaleDateString()}
                                            </Box>
                                        </Box>
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" variant="contained" fullWidth onClick={() => navigate(`/survey/${survey.id}`)}>
                                            Bearbeiten
                                        </Button>
                                        <Button size="small" variant="outlined" fullWidth>
                                            Resultate
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                    <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ width: "100%" }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </MainLayout>
    );
};

export default DashboardPage;
