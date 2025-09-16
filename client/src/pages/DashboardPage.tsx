import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {Box, Button, Card, CardActions, CardContent, CardHeader,
    Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, IconButton,
    RadioGroup, TextField, Typography, Radio } from "@mui/material";
import { Add, BarChart, People, CalendarToday, MoreVert } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface Survey {
    id: string;
    title: string;
    description: string;
    responses: number;
    createdAt: string;
    status: "Aktiv" | "Entwurf" | "Geschlossen";
    fromDate?: string;
    toDate?: string;
    mode?: "adaptiv" | "design";
}

const DashboardPage = () => {
    const navigate = useNavigate();
    const [surveys, setSurveys] = useState<Survey[]>([
        {
            id: "1",
            title: "Klasse 1A",
            description: "Schule ABC",
            responses: 247,
            createdAt: "2024-01-15",
            status: "Aktiv"
        },
        {
            id: "2",
            title: "Klasse 3C",
            description: "Primarschule 1234",
            responses: 89,
            createdAt: "2024-01-10",
            status: "Entwurf"
        },
        {
            id: "3",
            title: "Klasse 2D",
            description: "Primarschule Pilzhut",
            responses: 156,
            createdAt: "2024-01-05",
            status: "Geschlossen"
        }
    ]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newSurvey, setNewSurvey] = useState<{ title: string; description: string; fromDate: string; toDate: string; mode: "adaptiv" | "design"; }>({title: "", description: "", fromDate: "", toDate: "", mode: "adaptiv",});

    const handleCreateSurvey = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const survey: Survey = {
            id: Date.now().toString(),
            title: newSurvey.title,
            description: newSurvey.description,
            responses: 0,
            createdAt: new Date().toISOString().split("T")[0],
            status: "Entwurf"
        };
        setSurveys([survey, ...surveys]);
        setNewSurvey({ title: "", description: "", fromDate: "", toDate: "", mode: "adaptiv" });
        setIsDialogOpen(false);
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

    return (
        <MainLayout>
            <Box sx={{minHeight: '100vh', py: 3, px: 2, display: 'flex', flexDirection: 'column', mt: 6}}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                        <Typography variant="h4">Erhebungs Übersicht</Typography>
                        <Typography color="textSecondary">Erstelle und bearbeite Erhebungen</Typography>
                    </Box>
                    <Button variant="contained" startIcon={<Add/>} onClick={() => setIsDialogOpen(true)}>
                        Neue Erhebung
                    </Button>
                </Box>

                <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                    <DialogTitle>Erhebung erstellen</DialogTitle>
                    <form onSubmit={handleCreateSurvey}>
                        <DialogContent sx={{pt: 0}}>
                            <TextField label="Titel" fullWidth required margin="normal" value={newSurvey.title}
                                       onChange={(e) => setNewSurvey({...newSurvey, title: e.target.value})}/>
                            <TextField label="Beschreibung" fullWidth required multiline rows={4} margin="normal"
                                       value={newSurvey.description}
                                       onChange={(e) => setNewSurvey({...newSurvey, description: e.target.value})}/>
                            <Box display="flex" gap={2} mt={2} mb={2}>
                                <TextField label="Von" type="date" slotProps={{inputLabel: { shrink: true },}} fullWidth onChange={(e) => setNewSurvey({...newSurvey, fromDate: e.target.value})}/>
                                <TextField label="Bis" type="date" slotProps={{inputLabel: { shrink: true },}} fullWidth onChange={(e) => setNewSurvey({...newSurvey, toDate: e.target.value})}/>
                            </Box>

                            {/* Mode radio buttons */}
                            <Typography variant="subtitle1" gutterBottom>
                                Modus
                            </Typography>
                            <RadioGroup row onChange={(e) => setNewSurvey({...newSurvey, mode: e.target.value as "adaptiv" | "design"})}>
                                <FormControlLabel value="adaptiv" control={<Radio/>} label="Adaptiv"/>
                                <FormControlLabel value="design" control={<Radio/>} label="Design Matrix"/>
                            </RadioGroup>
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" onClick={() => setIsDialogOpen(false)}>
                                Abbrechen
                            </Button>
                            <Button type="submit" variant="contained">
                                Erstellen
                            </Button>
                        </DialogActions>
                    </form>
                </Dialog>

                <Grid container spacing={3}>
                    {surveys.map((survey) => (
                        //@ts-ignore
                        <Grid item key={survey.id} sx={{width: 350, flexGrow: 0}}>
                            <Card>
                                <CardHeader title={survey.title} subheader={<Chip label={survey.status} color={getStatusColor(survey.status)} size="small"/>}
                                    action={<IconButton><MoreVert/></IconButton>}/>
                                <CardContent>
                                    <Typography variant="body2" color="textSecondary">
                                        {survey.description}
                                    </Typography>
                                    <Box display="flex" justifyContent="space-between" fontSize="0.875rem">
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <People fontSize="small"/>
                                            {survey.responses} responses
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <CalendarToday fontSize="small"/>
                                            {new Date(survey.createdAt).toLocaleDateString()}
                                        </Box>
                                    </Box>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" variant="contained" fullWidth
                                            onClick={() => navigate(`/survey`)}>
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

                {surveys.length === 0 && (
                    <Box textAlign="center" py={12}>
                        <BarChart fontSize="large" color="disabled"/>
                        <Typography variant="h6" mt={2}>
                            Noch keine Erhebungen
                        </Typography>
                        <Button variant="contained" startIcon={<Add/>} onClick={() => setIsDialogOpen(true)}>
                            Erhebung erstellen
                        </Button>
                    </Box>
                )}
            </Box>
        </MainLayout>
    );
};

export default DashboardPage;
