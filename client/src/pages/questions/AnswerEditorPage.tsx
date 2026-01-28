import React, {useEffect, useState} from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormGroup,
    Paper,
    Snackbar,
    TextField,
    Typography,
} from "@mui/material";
import {ExpandMore, Save} from "@mui/icons-material";
import {useNavigate, useParams} from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import QuestionLayout from "../../layouts/QuestionLayout";
import {loadQuestionForm, updateQuestionAnswers} from "../../services/EditorService.tsx";
import {Preview} from "../../components/Editor/Preview";
import type {JSONContent} from "@tiptap/core";
import {type Block, type Choice, parseContentToBlocks} from "./AnswerUtils.tsx";
import {NumericAnswer} from "../../components/Editor/AnswerEditor/NumericAnswer.tsx";
import {LineEquationAnswer} from "../../components/Editor/AnswerEditor/LineEquationAnswer.tsx";
import {MathJax, MathJaxContext} from "better-react-mathjax";
import type {
    Condition,
    LineConditions,
    PointConditions
} from "../../components/Editor/AnswerEditor/GeoGebraAnswerTypes.tsx";
import {GeoGebraPointAnswer} from "../../components/Editor/AnswerEditor/GeoGebraPointAnswer.tsx";
import {GeoGebraLineAnswer} from "../../components/Editor/AnswerEditor/GeoGebraLineAnswer.tsx";

export default function AnswerEditorPage() {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [questionContentJson, setQuestionContentJson] = useState<JSONContent>({});
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [openPreview, setOpenPreview] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const initAnswersForBlocks = (parsed: Block[], persisted?: Record<string, any>) => {
        const initial: Record<string, any> = {};

        parsed.forEach((b) => {
            switch (b.kind) {
                case "mc":
                    initial[b.key] = [];
                    break;
                case "sc":
                    initial[b.key] = null;
                    break;
                case "numeric":
                    initial[b.key] = [{operator: "=", value: ""}];
                    break;
                case "lineEquation":
                    initial[b.key] = {
                        m: [{operator: "=", value: ""}],
                        c: [{operator: "=", value: ""}]
                    };
                    break;
                case "freeText":
                case "freeTextInline":
                    initial[b.key] = "";
                    break;
                case "geoGebra": {
                    const maxPoints = b.attrs?.maxPoints ?? 0;
                    const maxLines = b.attrs?.maxLines ?? 0;

                    const points: Record<string, PointConditions> = {};
                    const lines: Record<string, LineConditions> = {};

                    for (let i = 0; i < maxPoints; i++) {
                        const name = `P${i + 1}`;
                        points[name] = {
                            x: [{ operator: "=", value: "", logic: "and" }],
                            y: [{ operator: "=", value: "", logic: "and" }]
                        };
                    }

                    for (let i = 0; i < maxLines; i++) {
                        const name = `L${i + 1}`;
                        lines[name] = {
                            m: [{ operator: "=", value: "", logic: "and" }],
                            c: [{ operator: "=", value: "", logic: "and" }]
                        };
                    }

                    initial.geoGebraPoints = points;
                    initial.geoGebraLines = lines;
                    break;
                }
            }
        });

        if (persisted) {
            Object.entries(persisted).forEach(([key, obj]) => {
                if (key === "geoGebra") {
                    if (obj.value?.points) initial.geoGebraPoints = { ...initial.geoGebraPoints, ...obj.value.points };
                    if (obj.value?.lines) initial.geoGebraLines = { ...initial.geoGebraLines, ...obj.value.lines };
                } else if (key in initial) {
                    initial[key] = obj.value ?? initial[key];
                }
            });
        }

        setAnswers(initial);
    };

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        (async () => {
            try {
                const question = await loadQuestionForm(id);
                const contentJson =
                    typeof question.contentJson === "string"
                        ? JSON.parse(question.contentJson)
                        : question.contentJson ?? {type: "doc", content: []};

                setQuestionContentJson(contentJson);
                const parsedBlocks: Block[] = parseContentToBlocks(contentJson);
                setBlocks(parsedBlocks);
                const persisted = question.correctAnswers ?? {};
                initAnswersForBlocks(parsedBlocks, persisted);
            } catch (err) {
                console.error("Failed to load question:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const toggleChoice = (blockKey: string, choiceId: string) => {
        setAnswers(prev => {
            const block = blocks.find(b => b.key === blockKey);
            if (!block) return prev;

            if (block.kind === "sc") {
                return {...prev, [blockKey]: choiceId};
            }

            if (block.kind === "mc") {
                const arr = prev[blockKey] ?? [];
                const newArr = arr.includes(choiceId)
                    ? arr.filter((id: string) => id !== choiceId)
                    : [...arr, choiceId];

                return {...prev, [blockKey]: newArr};
            }

            return prev;
        });
    };

    const handleAnswerChange = (blockKey: string, value: any) => setAnswers((prev) => ({...prev, [blockKey]: value}));

    const handleSaveAnswers = async () => {
        if (!id) return;
        const errors = validateAnswersBeforeSave();
        if (errors.length > 0) {
            setSnackbarMessage(errors.join("\n"));
            setSnackbarOpen(true);
            return;
        }
        setLoading(true);
        try {
            const payload: Record<string, any> = {};
            blocks.forEach((b) => {
                const val = answers[b.key];
                switch (b.kind) {
                    case "mc":
                        payload[b.key] = {type: "mc", value: val ?? []};
                        break;
                    case "sc":
                        payload[b.key] = {type: "sc", value: val ?? null};
                        break;
                    case "numeric":
                        payload[b.key] = {
                            type: "numeric",
                            value: Array.isArray(val) ? val : [{operator: "=", value: ""}]
                        };
                        break;
                    case "lineEquation":
                        payload[b.key] = {
                            type: "lineEquation",
                            value: {
                                m: Array.isArray(val?.m) ? val.m : [{operator: "=", value: ""}],
                                c: Array.isArray(val?.c) ? val.c : [{operator: "=", value: ""}]
                            }
                        };
                        break;
                    case "freeText":
                    case "freeTextInline":
                        payload[b.key] = {type: b.kind, value: val ?? ""};
                        break;
                    case "geoGebra":
                        payload[b.key] = {
                            type: "geoGebra",
                            value: {
                                points: answers.geoGebraPoints,
                                lines: answers.geoGebraLines
                            }
                        };
                        break;
                    }
            });
            await updateQuestionAnswers(id, payload);
            navigate(`/preview/${id}`);
        } catch (err) {
            console.error("Failed to save answers:", err);
        } finally {
            setLoading(false);
        }
    };

    const hasValid = (conds: any[]) =>
        Array.isArray(conds) &&
        conds.every(c =>
            c.value !== undefined &&
            c.value !== null &&
            String(c.value).trim() !== ""
        );

    const hasValidConditions = (conds: Condition[]) =>
        Array.isArray(conds) &&
        conds.every(c => c.value !== undefined && c.value !== null && String(c.value).trim() !== "");

    const validateAnswersBeforeSave = () => {
        const errors: string[] = [];
        blocks.forEach((b) => {
            const val = answers[b.key];
            switch (b.kind) {
                case "mc":
                    if (!val || val.length === 0) {
                        errors.push(`Multiple Choice (${b.key}) braucht mindestens eine richtige Auswahl.`);
                    }
                    break;
                case "sc":
                    if (val === null) {
                        errors.push(`Single Choice (${b.key}) braucht eine richtige Auswahl.`);
                    }
                    break;
                case "numeric":
                    if (!Array.isArray(val) || val.length === 0 || !val.every((c: any) => c.value?.toString().trim())) {
                        errors.push(`Numerische Eingabe (${b.key}) braucht gültige Werte für alle Bedingungen.`);
                    }
                    break;
                case "lineEquation":
                    if (!val?.m || !hasValid(val.m)) {
                        errors.push(`Geradengleichung (${b.key}): m braucht eine Bedingung.`);
                    }
                    if (!val?.c || !hasValid(val.c)) {
                        errors.push(`Geradengleichung (${b.key}): c braucht eine Bedingung.`);
                    }
                    break;
                case "freeText":
                case "freeTextInline":
                    if (!val || !val.trim()) {
                        errors.push(`Freitext (${b.key}) darf nicht leer sein.`);
                    }
                    break;

                case "geoGebra": {
                    const points = val?.points as Record<string, { x: Condition[]; y: Condition[] }> | undefined;
                    Object.entries(points ?? {}).forEach(([name, conds]) => {
                        if (!hasValidConditions(conds.x) || !hasValidConditions(conds.y)) {
                            errors.push(`GeoGebra Punkt ${name} (${b.key}) braucht gültige Bedingungen für x und y.`);
                        }
                    });

                    const lines = val?.lines as Record<string, { m: Condition[]; c: Condition[] }> | undefined;
                    Object.entries(lines ?? {}).forEach(([name, conds]) => {
                        if (!hasValidConditions(conds.m) || !hasValidConditions(conds.c)) {
                            errors.push(`GeoGebra Linie ${name} (${b.key}) braucht gültige Bedingungen für m und c.`);
                        }
                    });
                    break;
                }
            }
        });

        return errors;
    };

    return (
        <MainLayout>
            <QuestionLayout allowedSteps={[true, true, true, false]}>
                <MathJaxContext>
                    <Box sx={{
                        minHeight: "100vh",
                        backgroundColor: "background.default",
                        py: 3,
                        px: 2,
                        display: "flex",
                        flexDirection: "column",
                        mt: 6
                    }}>
                        <Paper elevation={0} sx={{padding: 3, border: "2px solid #000"}}>
                            <Typography variant="h4" gutterBottom sx={{textAlign: "center", fontWeight: "bold"}}>
                                Antworten definieren
                            </Typography>

                            {loading && <Typography>Loading…</Typography>}

                            {!loading && blocks.length === 0 && (
                                <Typography sx={{my: 2}}>Keine Antwort-Blöcke im Frage-Inhalt gefunden.</Typography>
                            )}
                            {!loading &&
                                blocks.map((answerType, idx) => (
                                    <Accordion key={answerType.key} sx={{mb: 1}}>
                                        <AccordionSummary expandIcon={<ExpandMore/>}>
                                            <Typography variant="subtitle1">
                                                {answerType.kind === "mc"
                                                    ? `Multiple Choice (${answerType.key})`
                                                    : answerType.kind === "sc"
                                                        ? `Single Choice (${answerType.key})`
                                                        : answerType.kind === "freeText"
                                                            ? `Freitext (${idx + 1})`
                                                            : answerType.kind === "freeTextInline"
                                                                ? `Freitext Inline (${idx + 1})`
                                                                : answerType.kind === "numeric"
                                                                    ? `Numerische Eingabe (${idx + 1})`
                                                                    : answerType.kind === "lineEquation"
                                                                        ? `Geradengleichung (${idx + 1})`
                                                                        : `GeoGebra (${idx + 1})`}
                                            </Typography>
                                        </AccordionSummary>

                                        <AccordionDetails>
                                            {/* Multiple Choice */}
                                            {answerType.kind === "mc" && (
                                                <FormControl component="fieldset" fullWidth>
                                                    <FormGroup>
                                                        {(answerType as any).choices.map((choice: Choice) => (
                                                            <FormControlLabel
                                                                key={choice.id}
                                                                control={
                                                                    <Checkbox
                                                                        checked={(answers[answerType.key] ?? []).includes(choice.id)}
                                                                        onChange={() => toggleChoice(answerType.key, choice.id)}/>}
                                                                label={<MathJax dynamic><span
                                                                    dangerouslySetInnerHTML={{__html: choice.html || choice.text,}}/></MathJax>}/>
                                                        ))}
                                                    </FormGroup>
                                                </FormControl>
                                            )}

                                            {/* Single Choice */}
                                            {answerType.kind === "sc" && (
                                                <FormControl component="fieldset" fullWidth>
                                                    <FormGroup>
                                                        {(answerType as any).choices.map((choice: Choice) => (
                                                            <FormControlLabel
                                                                key={choice.id}
                                                                control={
                                                                    <Checkbox
                                                                        checked={(answers[answerType.key] ?? null) === choice.id}
                                                                        onChange={() => toggleChoice(answerType.key, choice.id)}
                                                                        icon={<span style={{
                                                                            borderRadius: "50%",
                                                                            border: "1px solid gray",
                                                                            width: 16,
                                                                            height: 16
                                                                        }}/>}
                                                                        checkedIcon={<span style={{
                                                                            borderRadius: "50%",
                                                                            backgroundColor: "#1976d2",
                                                                            width: 16,
                                                                            height: 16
                                                                        }}/>}
                                                                    />
                                                                }
                                                                label={<MathJax dynamic><span
                                                                    dangerouslySetInnerHTML={{__html: choice.html || choice.text,}}/></MathJax>
                                                                }
                                                            />
                                                        ))}
                                                    </FormGroup>
                                                </FormControl>
                                            )}

                                            {/* Free Text */}
                                            {(answerType.kind === "freeText" || answerType.kind === "freeTextInline") && (
                                                <FormControl fullWidth>
                                                    <TextField
                                                        label="Erwartete Textantwort"
                                                        value={answers[answerType.key] ?? ""}
                                                        onChange={(e) => handleAnswerChange(answerType.key, e.target.value)}
                                                    />
                                                    <Typography variant="caption" color="text.secondary">
                                                        Lassen Sie das Feld frei, falls keine spezifische Antwort
                                                        erwartet wird
                                                    </Typography>
                                                </FormControl>
                                            )}

                                            {/* Numeric */}
                                            {answerType.kind === "numeric" && (
                                                <NumericAnswer
                                                    conditions={answers[answerType.key] ?? [{operator: "=", value: ""}]}
                                                    onChange={(val) => handleAnswerChange(answerType.key, val)}
                                                />
                                            )}

                                            {/* LineEquation */}
                                            {answerType.kind === "lineEquation" && (
                                                <FormControl fullWidth>
                                                    <LineEquationAnswer
                                                        conditions={answers[answerType.key] ?? [{
                                                            operator: "=",
                                                            value: ""
                                                        }]}
                                                        onChange={(val) => handleAnswerChange(answerType.key, val)}
                                                    />
                                                </FormControl>
                                            )}

                                            {answerType.kind === "geoGebra" && (
                                                <Box>
                                                    <Typography variant="h6" sx={{ mb: 1 }}>Punkte definieren</Typography>
                                                    {/* GeoGebra Points */}
                                                    {Object.entries(answers.geoGebraPoints as Record<string, PointConditions> ?? {}).map(([name, conds]) => (
                                                        <GeoGebraPointAnswer key={name} data={{ name }} conditions={conds}
                                                            onChange={(next) =>
                                                                setAnswers(prev => ({
                                                                    ...prev,
                                                                    geoGebraPoints: {
                                                                        ...prev.geoGebraPoints,
                                                                        [name]: next
                                                                    }
                                                                }))
                                                            }
                                                        />
                                                    ))}

                                                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Linien definieren</Typography>
                                                    {/* GeoGebra Lines */}
                                                    {Object.entries(answers.geoGebraLines as Record<string, LineConditions> ?? {}).map(([name, conds]) => (
                                                        <GeoGebraLineAnswer key={name} data={{ name }} conditions={conds}
                                                            onChange={(next) =>
                                                                setAnswers(prev => ({
                                                                    ...prev,
                                                                    geoGebraLines: {
                                                                        ...prev.geoGebraLines,
                                                                        [name]: next
                                                                    }
                                                                }))
                                                            }
                                                        />
                                                    ))}

                                                </Box>
                                            )}

                                        </AccordionDetails>
                                    </Accordion>
                                ))}

                            <Box sx={{mt: 3, textAlign: "center", gap: 2, display: "flex", justifyContent: "center"}}>
                                <Button variant="outlined" onClick={() => navigate(`/editor/${id}`)}>
                                    Zurück
                                </Button>
                                <Button variant="outlined" onClick={() => setOpenPreview(true)}>
                                    Vorschau
                                </Button>
                                <Button variant="contained" startIcon={<Save/>} onClick={handleSaveAnswers}
                                        disabled={loading}>
                                    {loading ? "Speichern…" : "Speichern"}
                                </Button>
                            </Box>

                            <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="md" fullWidth>
                                <DialogTitle>Vorschau</DialogTitle>
                                <DialogContent dividers>
                                    <Preview content={questionContentJson}/>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => setOpenPreview(false)}>Schließen</Button>
                                </DialogActions>
                            </Dialog>
                        </Paper>
                    </Box>
                    <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}
                              anchorOrigin={{vertical: "bottom", horizontal: "center"}}>
                        <Alert onClose={() => setSnackbarOpen(false)} severity="error" variant="filled"
                               sx={{whiteSpace: "pre-line"}}>
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>
                </MathJaxContext>
            </QuestionLayout>
        </MainLayout>
    );
}
