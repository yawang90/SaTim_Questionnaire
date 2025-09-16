import {useState} from "react";
import MainLayout from "../layouts/MainLayout";
import {
    Box,
    Button,
    Chip,
    Dialog,
    StepLabel,
    DialogActions,
    DialogContent,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Step,
    TextField,
    Typography,
    DialogTitle, Stepper,
} from "@mui/material";
import {Save, ArrowBack, UploadFile, Link as LinkIcon} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";

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

    const [link, setLink] = useState<string>("");
    const [uploadOpen, setUploadOpen] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const steps = ["Aufgaben hochladen", "Design Matrix hochladen"];

    const handleSave = () => {
        console.log("Saving survey:", survey);
        navigate("/dashboard");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: "aufgabenFile" | "designFile") => {
        if (e.target.files && e.target.files[0]) {
            setSurvey({...survey, [key]: e.target.files[0]});
        }
    };

    const handleGenerateLink = () => {
        const token = Math.random().toString(36).substring(2, 10);
        const newLink = `${window.location.origin}/survey/${survey.id}?token=${token}`;
        setLink(newLink);
        setSurvey({...survey, publicLink: newLink});
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
            <Box sx={{minHeight: "100vh", py: 3, px: 2, display: "flex", flexDirection: "column", mt: 6,}}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            {survey.title}
                        </Typography>
                        <Typography color="textSecondary">Erhebung bearbeiten</Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                        <Button startIcon={<ArrowBack/>} variant="outlined" onClick={() => navigate(-1)}>
                            Zurück
                        </Button>
                        <Button startIcon={<Save/>} variant="contained" onClick={handleSave}>
                            Speichern
                        </Button>
                    </Box>
                </Box>

                <Box mb={3}>
                    <Chip label={survey.status} color={getStatusColor(survey.status)} sx={{fontWeight: 500}}/>
                </Box>

                <Box component="form" sx={{display: "flex", flexDirection: "column", gap: 3, maxWidth: 700,}}>
                    <TextField label="Titel" fullWidth value={survey.title}
                               onChange={(e) => setSurvey({...survey, title: e.target.value})}/>
                    <TextField label="Beschreibung" fullWidth multiline rows={4} value={survey.description}
                               onChange={(e) => setSurvey({...survey, description: e.target.value})}/>

                    <Box display="flex" gap={2}>
                        <TextField label="Von" type="date" fullWidth slotProps={{inputLabel: {shrink: true}}}
                                   value={survey.fromDate || ""}
                                   onChange={(e) => setSurvey({...survey, fromDate: e.target.value})}/>
                        <TextField label="Bis" type="date" fullWidth slotProps={{inputLabel: {shrink: true}}}
                                   value={survey.toDate || ""}
                                   onChange={(e) => setSurvey({...survey, toDate: e.target.value})}/>
                    </Box>
                    <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select value={survey.status} label="Status"
                                onChange={(e) => setSurvey({...survey, status: e.target.value as Survey["status"]})}>
                            <MenuItem value="Aktiv">Aktiv</MenuItem>
                            <MenuItem value="Entwurf">Entwurf</MenuItem>
                            <MenuItem value="Geschlossen">Geschlossen</MenuItem>
                        </Select>
                    </FormControl>
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>Modus</Typography>
                        <RadioGroup row value={survey.mode} onChange={(e) => setSurvey({
                            ...survey,
                            mode: e.target.value as "adaptiv" | "design"
                        })}>
                            <FormControlLabel value="adaptiv" control={<Radio/>} label="Adaptiv"/>
                            <FormControlLabel value="design" control={<Radio/>} label="Design Matrix"/>
                        </RadioGroup>
                    </Box>
                    {survey.mode === "design" && (
                        <Button variant="outlined" startIcon={<UploadFile />} onClick={() => {
                            setUploadOpen(true);
                            setActiveStep(0);}}>
                            Excel hochladen
                        </Button>
                    )}

                    <Box mt={3}>
                        <Typography variant="subtitle1" gutterBottom>
                            Öffentlicher Link
                        </Typography>
                        <Button variant="contained" startIcon={<LinkIcon/>} onClick={handleGenerateLink} sx={{mb: 1}}>
                            Link generieren
                        </Button>
                        {link && (
                            <Typography variant="body2" sx={{
                                backgroundColor: "grey.100",
                                p: 1,
                                borderRadius: 1,
                                wordBreak: "break-all",
                            }}>
                                {link}
                            </Typography>
                        )}
                    </Box>
                </Box>
                <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Excel-Dateien hochladen</DialogTitle>
                    <DialogContent>
                        <Stepper activeStep={activeStep} alternativeLabel sx={{mb: 3}}>{steps.map(l => <Step
                            key={l}><StepLabel>{l}</StepLabel></Step>)}</Stepper>
                        {activeStep === 0 && (
                            <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                                <Button component="label" variant="outlined" startIcon={<UploadFile />}>
                                    Aufgaben-Datei auswählen
                                    <input type="file" hidden accept=".xlsx,.xls" onChange={e => handleFileChange(e, "aufgabenFile")} />
                                </Button>
                            </Box>
                        )}

                        {activeStep === 1 && (
                            <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                                <Button component="label" variant="outlined" startIcon={<UploadFile />}>
                                    Design Matrix-Datei auswählen
                                    <input type="file" hidden accept=".xlsx,.xls" onChange={e => handleFileChange(e, "designFile")} />
                                </Button>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>{activeStep > 0 && <Button
                        onClick={() => setActiveStep(s => s - 1)}>Zurück</Button>}{activeStep < steps.length - 1 ?
                        <Button variant="contained" onClick={() => setActiveStep(s => s + 1)}
                                disabled={(activeStep === 0 && !survey.aufgabenFile) || (activeStep === 1 && !survey.designFile)}>Weiter</Button> :
                        <Button variant="contained"
                                onClick={() => setUploadOpen(false)}>Fertig</Button>}</DialogActions>
                </Dialog>
            </Box>
        </MainLayout>
    );
}
