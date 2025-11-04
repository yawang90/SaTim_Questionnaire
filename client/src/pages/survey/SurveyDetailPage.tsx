import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {Box, Paper, Typography, LinearProgress, Divider, Snackbar, Alert} from "@mui/material";
import MainLayout from "../../layouts/MainLayout.tsx";
import { getSurveyById } from "../../services/SurveyService.tsx";

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
}

const SurveyDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [survey, setSurvey] = useState<SurveyDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
        open: false,
        message: "",
        severity: "success",
    });

    const statusLabels: Record<SurveyDetail["status"], string> = {
        IN_PROGRESS: "Entwurf",
        ACTIVE: "Aktiv",
        FINISHED: "Geschlossen",
    };

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
                    createdBy: data.createdBy ?? { id: 0, first_name: "Unbekannt", last_name: "" },
                    updatedBy: data.updatedBy ?? { id: 0, first_name: "Unbekannt", last_name: "" },
                    status: (data.status ?? "IN_PROGRESS") as "ACTIVE" | "IN_PROGRESS" | "FINISHED",
                    mode: data.mode?.toUpperCase() === "ADAPTIV" ? "ADAPTIV" : "DESIGN",
                });
            } catch (err) {
                setSnackbar({ open: true, message: "Erhebung konnte nicht geladen werden.", severity: "error" });
                console.error("Failed to fetch survey:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSurvey();
    }, [id]);

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
                <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
                </Snackbar>
            </Box>
        </MainLayout>
    );
};

export default SurveyDetailPage;
