import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Grid,
    Chip,
    LinearProgress,
} from "@mui/material";
import MainLayout from "../../layouts/MainLayout.tsx";
import { getSurveyById, updateSurveyFiles } from "../../services/SurveyService.tsx";

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
    status: "ACTIVE" | "IN_PROGRESS" | "FINISHED";
    mode: "DESIGN" | "ADAPTIV";
    file1?: File | null;
    file2?: File | null;
}

const SurveyDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [survey, setSurvey] = useState<SurveyDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [file1, setFile1] = useState<File | null>(null);
    const [file2, setFile2] = useState<File | null>(null);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);

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
                    status: (data.status ?? "IN_PROGRESS") as "ACTIVE" | "IN_PROGRESS" | "FINISHED",
                    mode:
                        data.mode?.toUpperCase() === "ADAPTIV"
                            ? "ADAPTIV"
                            : "DESIGN",
                    file1: null,
                    file2: null,
                });
                console.log(data)
            } catch (err) {
                console.error("Failed to fetch survey:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSurvey();
    }, [id]);

    const handleSaveFiles = async () => {
        if (!survey) return;
        if (!file1 || !file2) return;

        setSaving(true);
        try {
            await updateSurveyFiles(survey.id.toString(), file1, file2);
            setSurvey({ ...survey, file1, file2 });
            setUploadDialogOpen(false);
        } catch (err) {
            console.error("Failed to save files:", err);
        } finally {
            setSaving(false);
        }
    };

    const mapStatus = (status: SurveyDetail["status"]) => {
        switch (status) {
            case "ACTIVE":
                return "Aktiv";
            case "IN_PROGRESS":
                return "Entwurf";
            case "FINISHED":
                return "Geschlossen";
        }
    };

    if (loading) return <LinearProgress />;
    if (!survey) return <Typography>Survey not found</Typography>;

    return (
        <MainLayout>
            <Box sx={{minHeight: '100vh', py: 3, px: 2, display: 'flex', flexDirection: 'column', mt: 6}}>
                <Card>
                    <CardHeader title={survey.title} />
                    <CardContent>
                        <Typography variant="body1" gutterBottom>
                            {survey.description}
                        </Typography>

                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2">Erstellt von:</Typography>
                                <Typography>
                                    {survey.createdBy.first_name} {survey.createdBy.last_name} am{" "}
                                    {new Date(survey.createdAt).toLocaleDateString()}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2">
                                    Zuletzt bearbeitet von:
                                </Typography>
                                <Typography>
                                    {survey.updatedBy.first_name} {survey.updatedBy.last_name} am{" "}
                                    {new Date(survey.updatedAt).toLocaleDateString()}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2">Status:</Typography>
                                <Chip
                                    label={mapStatus(survey.status)}
                                    color={
                                        survey.status === "ACTIVE" ? "info" : survey.status === "IN_PROGRESS" ? "primary" : "secondary"}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2">Modus:</Typography>
                                <Chip label={survey.mode === "DESIGN" ? "Design Matrix" : "Adaptiv"}/>
                            </Grid>
                        </Grid>

                        {survey.mode === "DESIGN" && (
                            <Box mt={3}>
                                <Typography variant="h6">Design Matrix Dateien</Typography>
                                <Button variant="contained" sx={{ mt: 1 }} onClick={() => setUploadDialogOpen(true)}>
                                    {survey.file1 && survey.file2
                                        ? "Dateien bearbeiten"
                                        : "Dateien hochladen"}
                                </Button>
                            </Box>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Excel Dateien hochladen</DialogTitle>
                    <DialogContent>
                        <Box display="flex" flexDirection="column" gap={2} mt={1}>
                            <Button variant={file1 ? "contained" : "outlined"} component="label">
                                {file1 ? `Datei 1: ${file1.name}` : "Upload Datei 1"}
                                <input hidden type="file" accept=".xlsx, .xls" onChange={(e) => e.target.files && setFile1(e.target.files[0])}/>
                            </Button>

                            <Button variant={file2 ? "contained" : "outlined"} component="label">
                                {file2 ? `Datei 2: ${file2.name}` : "Upload Datei 2"}
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
            </Box>
        </MainLayout>
    );
};

export default SurveyDetailPage;
