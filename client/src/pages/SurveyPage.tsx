import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Box, Button, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, MenuItem, Radio, RadioGroup, Select, Step, StepLabel, Stepper, TextField, Typography,} from "@mui/material";
import {CheckCircle, FileCopy, Upload} from "@mui/icons-material";

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
    aufgabenFile?: File;
    designFile?: File;
    publicLink?: string;
}

export default function SurveyPage() {
    const navigate = useNavigate();

    const [survey, setSurvey] = useState<Survey>({
        id: "1",
        title: "Klasse 1A",
        description: "Schule ABC",
        responses: 247,
        createdAt: "2024-01-15",
        status: "Aktiv",
        fromDate: "2024-01-20",
        toDate: "2024-02-01",
        mode: "adaptiv",
    });

    const [uploadOpen, setUploadOpen] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const steps = ["Aufgaben Datei hochladen", "Design Matrix Datei hochladen"];
    const [activeStep, setActiveStep] = useState(0);

    const handleSave = () => {
        console.log("Saving survey:", survey);
        navigate("/");
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: "aufgabenFile" | "designFile") => {
        if (e.target.files && e.target.files[0]) {
            setSurvey({ ...survey, [key]: e.target.files[0] });
        }
    };

    const handleGenerateLink = () => {
        const token = Math.random().toString(36).substring(2, 10);
        const newLink = `${window.location.origin}/survey/${survey.id}?token=${token}`;
        setSurvey({ ...survey, publicLink: newLink });
    };

    const handleCopyLink = async () => {
        if (survey.publicLink) {
            await navigator.clipboard.writeText(survey.publicLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        }
    };

    return (
        <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", py: 6 }}>
            <Box sx={{ width: "100%", maxWidth: 800, display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h4">{survey.title}</Typography>
                        <Typography color="textSecondary">Erhebung bearbeiten</Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                        <Button variant="outlined" onClick={handleBack}>Zurück</Button>
                        <Button variant="contained" onClick={handleSave}>Speichern</Button>
                    </Box>
                </Box>

                <Card>
                    <CardHeader title="Grundeinstellungen" />
                    <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField label="Titel" fullWidth value={survey.title} onChange={e => setSurvey({ ...survey, title: e.target.value })} />
                        <TextField label="Beschreibung" fullWidth multiline rows={4} value={survey.description} onChange={e => setSurvey({ ...survey, description: e.target.value })} />

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField label="Von" type="date" fullWidth slotProps={{ inputLabel: { shrink: true }}} value={survey.fromDate || ""} onChange={e => setSurvey({ ...survey, fromDate: e.target.value })} />
                            <TextField label="Bis" type="date" fullWidth slotProps={{ inputLabel: { shrink: true }}} value={survey.toDate || ""} onChange={e => setSurvey({ ...survey, toDate: e.target.value })} />
                        </Box>

                        <FormControl fullWidth>
                            <Select value={survey.status} onChange={e => setSurvey({ ...survey, status: e.target.value as Survey["status"] })}>
                                <MenuItem value="Aktiv">Aktiv</MenuItem>
                                <MenuItem value="Entwurf">Entwurf</MenuItem>
                                <MenuItem value="Geschlossen">Geschlossen</MenuItem>
                            </Select>
                        </FormControl>

                        <Box>
                            <Typography variant="subtitle1">Modus</Typography>
                            <RadioGroup row value={survey.mode} onChange={e => setSurvey({ ...survey, mode: e.target.value as "adaptiv" | "design" })}>
                                <FormControlLabel value="adaptiv" control={<Radio />} label="Adaptiv" />
                                <FormControlLabel value="design" control={<Radio />} label="Design Matrix" />
                            </RadioGroup>
                        </Box>

                        {survey.mode === "design" && (
                            <Button variant="outlined" startIcon={<Upload />} onClick={() => setUploadOpen(true)}>Excel hochladen</Button>
                        )}

                        {/* Public Link */}
                        <Box mt={2}>
                            <Typography  sx={{ pb: 1 }} variant="subtitle1">Link zur Erhebung</Typography>
                            <Button variant="contained" onClick={handleGenerateLink} sx={{ mb: 1 }}>Link generieren</Button>
                            {survey.publicLink && (
                                <Box>
                                    <Box sx={{ p: 1, borderRadius: 1, backgroundColor: "grey.100", wordBreak: "break-all" }}>{survey.publicLink}</Box>
                                    <Button variant="outlined" onClick={handleCopyLink} sx={{ mt: 1 }}>{linkCopied ? <CheckCircle /> : <FileCopy />} Kopieren</Button>
                                </Box>
                            )}
                        </Box>
                    </CardContent>
                </Card>

                {/* File Upload Dialog */}
                <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Excel-Dateien hochladen</DialogTitle>
                    <DialogContent>
                        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                            {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                        </Stepper>

                        {activeStep === 0 && (
                            <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                                <Button component="label" variant="outlined">
                                    Aufgaben Datei auswählen
                                    <input type="file" hidden accept=".xls,.xlsx" onChange={e => handleFileChange(e, "aufgabenFile")} />
                                </Button>
                                {survey.aufgabenFile && <Typography sx={{ ml: 2 }}>{survey.aufgabenFile.name}</Typography>}
                            </Box>
                        )}

                        {activeStep === 1 && (
                            <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                                <Button component="label" variant="outlined">
                                    Design Matrix Datei auswählen
                                    <input type="file" hidden accept=".xls,.xlsx" onChange={e => handleFileChange(e, "designFile")} />
                                </Button>
                                {survey.designFile && <Typography sx={{ ml: 2 }}>{survey.designFile.name}</Typography>}
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        {activeStep > 0 && <Button onClick={() => setActiveStep(s => s - 1)}>Zurück</Button>}
                        {activeStep < steps.length - 1 ? (
                            <Button variant="contained" onClick={() => setActiveStep(s => s + 1)} disabled={(activeStep === 0 && !survey.aufgabenFile) || (activeStep === 1 && !survey.designFile)}>Weiter</Button>
                        ) : (
                            <Button variant="contained" onClick={() => setUploadOpen(false)}>Fertig</Button>
                        )}
                    </DialogActions>
                </Dialog>            </Box>
        </Box>
    );
}
