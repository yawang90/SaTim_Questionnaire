import {useState} from "react";
import {Box, Button, Card, CardActions, CardContent, CardHeader, Grid, IconButton, Typography} from "@mui/material";
import {Add, BarChart, BorderColor, CheckCircleOutline, MoreVert, Visibility} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

interface Question {
    id: string;
    title: string;
    description: string;
    createDone?: boolean;
    answersDone?: boolean;
    previewDone?: boolean;
}

export default function QuestionsPage() {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<Question[]>([
        { id: "1", title: "Aufgabe 1", description: "Aufgabe mit Gleichung", createDone: true, answersDone: true, previewDone: false },
        { id: "2", title: "Aufgabe 2", description: "Aufgabe mit Begründung", createDone: true, answersDone: false, previewDone: false },
        { id: "3", title: "Aufgabe 3", description: "Aufgabe mit Gleichung", createDone: false, answersDone: false, previewDone: false }
    ]);

    const handleCreateQuestion = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    };


    return (
        <MainLayout>
            <Box sx={{ minHeight: '100vh', py: 3, px: 2, display: 'flex', flexDirection: 'column', mt: 6 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                        <Typography variant="h4">Aufgaben in Bearbeitung</Typography>
                        <Typography color="textSecondary">Alle aktuell in Bearbeitung befindlichen Aufgaben</Typography>
                    </Box>
                    <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/meta')}>
                        Neue Aufgabe erstellen
                    </Button>
                </Box>

                <Grid container spacing={3}>
                    {questions.map((question) => (
                        //@ts-ignore
                        <Grid item key={question.id} sx={{ width: 350, flexGrow: 0}}>
                            <Card>
                                <CardHeader title={question.title} action={<IconButton><MoreVert /></IconButton>}></CardHeader>
                                <CardContent>
                                    <Box display="flex" flexDirection="column" sx={{pt: 1}}>
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                                    <Box display="flex" alignItems="center" justifyContent="center" width={32} height={32} borderRadius="50%" border={2} sx={{bgcolor: question.createDone ? "primary.main" : "background.paper", color: question.createDone ? "primary.contrastText" : "text.disabled", borderColor: question.createDone ? "primary.main" : "text.disabled", transition: "all 0.2s ease",}}>
                                                        <BorderColor fontSize="small" />
                                                    </Box>
                                                    <Typography variant="body2" color={question.createDone ? "text.primary" : "text.secondary"}>
                                                        {"Aufgabe stellen"}
                                                    </Typography>
                                                </Box>
                                    </Box>
                                    <Box display="flex" flexDirection="column" sx={{pt: 1}}>
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            <Box display="flex" alignItems="center" justifyContent="center" width={32} height={32} borderRadius="50%" border={2} sx={{bgcolor: question.answersDone ? "primary.main" : "background.paper", color: question.answersDone ? "primary.contrastText" : "text.disabled", borderColor: question.answersDone ? "primary.main" : "text.disabled", transition: "all 0.2s ease",}}>
                                                <CheckCircleOutline fontSize="small" />
                                            </Box>
                                            <Typography variant="body2" color={question.answersDone ? "text.primary" : "text.secondary"}>
                                                {"Antworten definieren"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box display="flex" flexDirection="column" sx={{pt: 1}}>
                                        <Box display="flex" alignItems="center" gap={1.5}>
                                            <Box display="flex" alignItems="center" justifyContent="center" width={32} height={32} borderRadius="50%" border={2} sx={{bgcolor: question.previewDone ? "primary.main" : "background.paper", color: question.previewDone ? "primary.contrastText" : "text.disabled", borderColor: question.previewDone ? "primary.main" : "text.disabled", transition: "all 0.2s ease",}}>
                                                <Visibility fontSize="small" />
                                            </Box>
                                            <Typography variant="body2" color={question.previewDone ? "text.primary" : "text.secondary"}>
                                                {"Prüfen & testen"}
                                            </Typography>
                                        </Box>
                                    </Box>

                                </CardContent>
                                <CardActions>
                                    <Button size="small" variant="contained" fullWidth onClick={() => navigate(`/editor`)}>
                                        Bearbeiten
                                    </Button>
                                    <Button size="small" variant="outlined" fullWidth>
                                        Löschen
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {questions.length === 0 && (
                    <Box textAlign="center" py={12}>
                        <BarChart fontSize="large" color="disabled" />
                        <Typography variant="h6" mt={2}>
                            Noch keine Aufgaben
                        </Typography>
                        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('editor')}>
                            Aufgabe erstellen
                        </Button>
                    </Box>
                )}
            </Box>
        </MainLayout>
    );
};

