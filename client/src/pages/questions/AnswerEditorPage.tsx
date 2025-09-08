import MainLayout from '../../layouts/MainLayout.tsx';
import React, {useState} from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
    Paper,
    Radio,
    RadioGroup,
    TextField,
    Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MathField from "../../components/MathField.tsx";
import "mathlive";
import {useNavigate} from "react-router-dom";
import GeoGebraApp from "../../components/GeoGebra/GeoGebraApp.tsx";

interface Answer {
    multipleChoice: string;
    freeText: string;
    numberInput: string;
    checkboxes: string[];
    graph: string;
}

export default function AnswerEditorPage() {
    const [answers, setAnswers] = useState<Answer>({
        multipleChoice: '',
        freeText: '',
        numberInput: '',
        checkboxes: [],
        graph: ''
    });

    const [correctAnswers] = useState({
        multipleChoice: 'option2',
        freeText: 'react',
        numberInput: '42',
        checkboxes: ['option1', 'option3'],
        graph: '1'
    });
    const [latex, setLatex] = useState("\\frac{1}{2}");
    const navigate = useNavigate();
    const [showResults, setShowResults] = useState(false);

    const handleMultipleChoiceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAnswers(prev => ({
            ...prev,
            multipleChoice: event.target.value
        }));
    };

    const handleFreeTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAnswers(prev => ({
            ...prev,
            freeText: event.target.value
        }));
    };

    const handleNumberInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAnswers(prev => ({
            ...prev,
            numberInput: event.target.value
        }));
    };

    const handleCheckboxChange = (option: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        setAnswers(prev => ({
            ...prev,
            checkboxes: event.target.checked
                ? [...prev.checkboxes, option]
                : prev.checkboxes.filter(item => item !== option)
        }));
    };

    const checkAnswers = () => {
        setShowResults(true);
    };

    const resetQuiz = () => {
        setAnswers({
            multipleChoice: '',
            freeText: '',
            numberInput: '',
            checkboxes: [],
            graph: ''
        });
        setShowResults(false);
    };

    const isCorrect = (type: keyof Answer) => {
        switch (type) {
            case 'multipleChoice':
                return answers.multipleChoice === correctAnswers.multipleChoice;
            case 'freeText':
                return answers.freeText.toLowerCase().trim() === correctAnswers.freeText.toLowerCase();
            case 'numberInput':
                return answers.numberInput === correctAnswers.numberInput;
            case 'checkboxes':
                return answers.checkboxes.sort().join(',') === correctAnswers.checkboxes.sort().join(',');
            default:
                return false;
        }
    };

    return (
        <MainLayout>
            <Box sx={{
                minHeight: '100vh',
                backgroundColor: 'background.default',
                py: 3,
                px: 2,
                display: 'flex',
                flexDirection: 'column',
                mt: 6
            }}>
                <Paper elevation={0} sx={{padding: 3, border: '2px solid #000'}}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{textAlign: 'center', fontWeight: 'bold'}}>
                        Antwort Auswertung erfassen
                    </Typography>

                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography variant="h6">
                                Single Choice Frage
                                {showResults && (
                                    <Typography component="span"
                                                sx={{ml: 2, color: isCorrect('multipleChoice') ? 'green' : 'red'}}>
                                        {isCorrect('multipleChoice') ? '✓ Richtig' : '✗ Falsch'}
                                    </Typography>
                                )}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Frage 1?</FormLabel>
                                <RadioGroup value={answers.multipleChoice} onChange={handleMultipleChoiceChange}>
                                    <FormControlLabel value="option1" control={<Radio/>} label="Antwort 1"/>
                                    <FormControlLabel value="option2" control={<Radio/>} label="Antwort 2"/>
                                    <FormControlLabel value="option3" control={<Radio/>} label="Antwort 3"/>
                                    <FormControlLabel value="option4" control={<Radio/>} label="Antwort 4"/>
                                </RadioGroup>
                            </FormControl>
                        </AccordionDetails>
                    </Accordion>

                    {/* Free Text Section */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography variant="h6">
                                Freie Text Frage
                                {showResults && (
                                    <Typography component="span"
                                                sx={{ml: 2, color: isCorrect('freeText') ? 'green' : 'red'}}>
                                        {isCorrect('freeText') ? '✓ Richtig' : '✗ Falsch'}
                                    </Typography>
                                )}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <FormControl fullWidth>
                                <FormLabel>Freien Text eingeben?</FormLabel>
                                <TextField
                                    value={answers.freeText}
                                    onChange={handleFreeTextChange}
                                    variant="outlined"
                                    placeholder="Gib deine Beschreibung hier ein"
                                    sx={{mt: 1}}
                                />
                            </FormControl>
                        </AccordionDetails>
                    </Accordion>

                    {/* Number Input Section */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography variant="h6">
                                Algebraische Gleichung oder Numerische Eingabe
                                {showResults && (
                                    <Typography component="span"
                                                sx={{ml: 2, color: isCorrect('numberInput') ? 'green' : 'red'}}>
                                        {isCorrect('numberInput') ? '✓ Richtig' : '✗ Falsch'}
                                    </Typography>
                                )}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <FormControl fullWidth>
                                <FormLabel>Was ist die Lösung für xyz?</FormLabel>
                                <MathField
                                    value={latex}
                                    onChange={setLatex}
                                    style={{fontSize: "1.2rem", border: "1px solid #ccc", padding: 8}}
                                />
                            </FormControl>
                        </AccordionDetails>
                    </Accordion>

                    {/* Checkbox Section */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography variant="h6">
                                Multiple Choice Frage
                                {showResults && (
                                    <Typography component="span"
                                                sx={{ml: 2, color: isCorrect('checkboxes') ? 'green' : 'red'}}>
                                        {isCorrect('checkboxes') ? '✓ Richtig' : '✗ Falsch'}
                                    </Typography>
                                )}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Welcher der folgenden Antworten sind richtig?</FormLabel>
                                <FormGroup>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={answers.checkboxes.includes('option1')}
                                                onChange={handleCheckboxChange('option1')}
                                            />
                                        }
                                        label="option1"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={answers.checkboxes.includes('option2')}
                                                onChange={handleCheckboxChange('option2')}
                                            />
                                        }
                                        label="option2"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={answers.checkboxes.includes('option3')}
                                                onChange={handleCheckboxChange('option3')}
                                            />
                                        }
                                        label="option3"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={answers.checkboxes.includes('option4')}
                                                onChange={handleCheckboxChange('option4')}
                                            />
                                        }
                                        label="option4"
                                    />
                                </FormGroup>
                            </FormControl>
                        </AccordionDetails>
                    </Accordion>

                    {/* Geogebra Section */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography variant="h6">
                                Frage mit Graphen Eingabe
                                {showResults && (
                                    <Typography component="span"
                                                sx={{ml: 2, color: isCorrect('checkboxes') ? 'green' : 'red'}}>
                                        {isCorrect('checkboxes') ? '✓ Richtig' : '✗ Falsch'}
                                    </Typography>
                                )}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <FormControl component="fieldset">
                                <FormLabel component="legend">Zeichne den Graphen ein?</FormLabel>
                                <GeoGebraApp
                                    materialId="pfeKePU3"
                                    onChange={(expr) => console.log("Formula changed:", expr)}
                                />
                            </FormControl>
                        </AccordionDetails>
                    </Accordion>

                    {/* Action Buttons */}
                    <Box sx={{mt: 3, textAlign: 'center', gap: 2, display: 'flex', justifyContent: 'center'}}>
                        <Button
                            variant="outlined"
                            onClick={checkAnswers} sx={{
                            borderColor: '#000',
                            color: '#000',
                            '&:hover': {borderColor: '#333', bgcolor: '#f5f5f5'}
                        }}>
                            Antworten testen
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={resetQuiz}
                            sx={{
                                borderColor: '#000',
                                color: '#000',
                                '&:hover': {borderColor: '#333', bgcolor: '#f5f5f5'}
                            }}>
                            Antworten zurücksetzen
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/preview')}
                            sx={{bgcolor: '#000', color: '#fff', '&:hover': {bgcolor: '#333'}}}>
                            Auswertung speichern
                        </Button>
                    </Box>

                    {/* Results Summary */}
                    {showResults && (
                        <Box sx={{mt: 3, p: 2, border: '1px solid #000', backgroundColor: '#f9f9f9'}}>
                            <Typography variant="h6" gutterBottom>
                                Ergebnis:
                            </Typography>
                            <Typography>
                                Korrekte
                                Antworten: {Object.keys(correctAnswers).filter(key => isCorrect(key as keyof Answer)).length} / {Object.keys(correctAnswers).length}
                            </Typography>
                            <Box sx={{mt: 1}}>
                                <Typography variant="body2">Single Choice
                                    Frage: {isCorrect('multipleChoice') ? '✓' : '✗'}</Typography>
                                <Typography variant="body2">Freie Text
                                    Frage: {isCorrect('freeText') ? '✓' : '✗'}</Typography>
                                <Typography variant="body2">Algebra/Numerische
                                    Frage: {isCorrect('numberInput') ? '✓' : '✗'}</Typography>
                                <Typography variant="body2">Multiple Choice
                                    Frage: {isCorrect('checkboxes') ? '✓' : '✗'}</Typography>
                                <Typography variant="body2">Graphen
                                    zeichnen: {isCorrect('checkboxes') ? '✓' : '✗'}</Typography>
                            </Box>
                        </Box>
                    )}
                </Paper>
            </Box>
        </MainLayout>
    );
};
