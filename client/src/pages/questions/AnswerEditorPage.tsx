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
    IconButton,
    MenuItem,
    Paper,
    Radio,
    RadioGroup,
    Select,
    TextField,
    Typography
} from '@mui/material';
import {ExpandMore, Save } from '@mui/icons-material';
import MathField from "../../components/MathField.tsx";
import "mathlive";
import {useNavigate, useParams} from "react-router-dom";
import GeoGebraApp from "../../components/GeoGebra/GeoGebraApp.tsx";
import { Delete } from '@mui/icons-material';
import Choice from "../../components/ChoicePlugin/Choice.tsx";
import ChoiceUI from "../../components/ChoicePlugin/ChoiceUI.tsx";
import {CKEditor} from "@ckeditor/ckeditor5-react";
import {Alignment, Bold, ClassicEditor, Essentials, Font, GeneralHtmlSupport, Heading, HtmlEmbed, Italic, List, Paragraph, Table, TableCellProperties, TableProperties, TableToolbar
} from "ckeditor5";
import QuestionLayout from "../../layouts/QuestionLayout.tsx";
interface Answer {
    multipleChoice: string;
    freeText: string;
    numberInput: string;
    checkboxes: string[];
    graph: string;
}

type Operator = "equals" | "greater" | "less" | "greaterOrEqual" | "lessOrEqual";
type Connector = "and" | "or";
interface Condition {
    operator: Operator;
    value: string;
    connector?: Connector;
}

export default function AnswerEditorPage() {
    const { id } = useParams<{ id: string }>();
    const [editorData, setEditorData] = useState<string>(`
    <h2>Beispielaufgabe</h2>
    <p>Welche der folgenden Aussagen sind korrekt?</p>
    <p>Bitte kreuzen Sie die richtige(n) Lösung(en) an.</p>
`);
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
    const [conditions, setConditions] = useState<Condition[]>([
        { operator: "equals", value: "" }
    ]);
    const [latex, setLatex] = useState("\\frac{1}{2}");
    const [numberSolution, setNumberSolution] = useState("");
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

    const addCondition = () => {
        setConditions((prev) => [
            ...prev,
            { connector: "and", operator: "equals", value: "" }
        ]);
    };

    const handleOperatorChange = (index: number, newOp: Operator) => {
        setConditions((prev) =>
            prev.map((c, i) => (i === index ? { ...c, operator: newOp } : c))
        );
    };

    const handleValueChange = (index: number, newVal: string) => {
        setConditions((prev) =>
            prev.map((c, i) => (i === index ? { ...c, value: newVal } : c))
        );
    };

    const handleConnectorChange = (index: number, newConn: Connector) => {
        setConditions((prev) =>
            prev.map((c, i) => (i === index ? { ...c, connector: newConn } : c))
        );
    };


    return (
        <MainLayout>
            <QuestionLayout allowedSteps={[true, true, true, false]}>
                <Box sx={{minHeight: '100vh', backgroundColor: 'background.default', py: 3, px: 2, display: 'flex', flexDirection: 'column', mt: 6}}>
                <Paper elevation={0} sx={{padding: 3, border: '2px solid #000'}}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{textAlign: 'center', fontWeight: 'bold'}}>
                        Antworten definieren
                    </Typography>
                    <CKEditor
                        editor={ClassicEditor}
                        data={editorData}
                        disabled={true}
                        config={{
                            licenseKey: 'GPL',
                            plugins: [Essentials, Paragraph, Heading, Bold, Italic, List, Alignment, Font, Table, TableToolbar, TableCellProperties, TableProperties, Choice, ChoiceUI, GeneralHtmlSupport, HtmlEmbed],
                            toolbar: [],
                            htmlSupport: {
                                allow: [
                                    {
                                        name: /.*/,
                                        attributes: true,
                                        classes: true,
                                        styles: true
                                    }
                                ]
                            },
                            htmlEmbed: {
                                showPreviews: true
                            }
                        }}
                    />

                    {/* Single Choice Section */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore/>}>
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
                        <AccordionSummary expandIcon={<ExpandMore/>}>
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
                        <AccordionSummary expandIcon={<ExpandMore/>}>
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
                                <MathField value={latex} onChange={setLatex} style={{fontSize: "1.2rem", border: "1px solid #ccc", padding: 8}}/>

                                {conditions.map((cond, index) => (
                                    <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                                        {index > 0 && (
                                            <Select<Connector>
                                                value={cond.connector ?? "and"}
                                                onChange={(e) =>
                                                    handleConnectorChange(index, e.target.value as Connector)}
                                                size="small"
                                                sx={{ minWidth: 80 }}>
                                                <MenuItem value="and">und</MenuItem>
                                                <MenuItem value="or">oder</MenuItem>
                                            </Select>
                                        )}

                                        <Typography>Die Lösung soll</Typography>
                                        <Select<Operator>
                                            value={cond.operator}
                                            onChange={(e) => handleOperatorChange(index, e.target.value as Operator)}
                                            size="small"
                                            sx={{ minWidth: 140 }}>
                                            <MenuItem value="equals">= gleich</MenuItem>
                                            <MenuItem value="greater">&gt; größer</MenuItem>
                                            <MenuItem value="less">&lt; kleiner</MenuItem>
                                            <MenuItem value="greaterOrEqual">≥ größer gleich</MenuItem>
                                            <MenuItem value="lessOrEqual">≤ kleiner gleich</MenuItem>
                                        </Select>
                                        <Typography>(als)</Typography>
                                        <MathField
                                            value={cond.value}
                                            onChange={(val) => handleValueChange(index, val)}
                                            style={{fontSize: "1.2rem", border: "1px solid #ccc", padding: 8, width: 300,}}
                                        />
                                        <Typography>sein</Typography>
                                        <IconButton
                                            aria-label="Entfernen"
                                            onClick={() =>
                                                setConditions((prev) => {
                                                    const newConds = prev.filter((_, i) => i !== index);
                                                    if (newConds.length > 0) {
                                                        newConds[0] = { ...newConds[0], connector: undefined };
                                                    }
                                                    return newConds;})}
                                            disabled={conditions.length === 1}>
                                            <Delete />
                                        </IconButton>
                                    </Box>
                                ))}



                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={addCondition}
                                    sx={{ alignSelf: "flex-start", mt: 1 }}>
                                    Weitere Bedingung hinzufügen
                                </Button>
                            </FormControl>
                        </AccordionDetails>
                    </Accordion>

                    {/* Multiple Choice Section */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore/>}>
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
                        <AccordionSummary expandIcon={<ExpandMore/>}>
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
                            startIcon={<Save/>}
                            onClick={() => navigate(`/preview/${id}`)}
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
            </QuestionLayout>
        </MainLayout>
    );
};
