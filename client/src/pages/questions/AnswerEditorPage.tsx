import React, { useEffect, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Checkbox, Dialog, DialogActions, DialogContent, DialogTitle,
    FormControl,
    FormControlLabel,
    FormGroup,
    Paper,
    TextField,
    Typography,
} from "@mui/material";
import { ExpandMore, Save } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout.tsx";
import QuestionLayout from "../../layouts/QuestionLayout.tsx";
import { loadQuestionForm } from "../../services/QuestionsService.tsx";
import {Preview} from "../../components/Editor/Preview.tsx";
import type {JSONContent} from "@tiptap/core";

type Choice = { id: string; text: string };
type Block =
    | { kind: "mc"; key: string; choices: Choice[] }
    | { kind: "freeText"; key: string }
    | { kind: "numeric"; key: string };

export default function AnswerEditorPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [questionContentJson, setQuestionContentJson] = useState<JSONContent>({});
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [openPreview, setOpenPreview] = React.useState(false);
    const handleOpenPreview = () => setOpenPreview(true);
    const handleClosePreview = () => setOpenPreview(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error",
    });
    const extractText = (node: any): string => {
        if (!node) return "";
        if (Array.isArray(node)) return node.map(extractText).join("");
        if (node.type === "text") return node.text ?? "";
        if (node.content) return node.content.map(extractText).join("");
        return "";
    };

    const parseContentToBlocks = (doc: any): Block[] => {
        if (!doc || !doc.content) return [];
        const result: Block[] = [];
        doc.content.forEach((node: any, idx: number) => {
            if (!node || !node.type) return;
            if (node.type === "mcContainer") {
                const choices: Choice[] =
                    (node.content ?? [])
                        .filter((c: any) => c.type === "mcChoice")
                        .map((c: any, i: number) => {
                            const id = c.attrs?.id ?? `mc-${idx}-choice-${i}`;
                            const text = extractText(c);
                            return { id, text: text || `Option ${i + 1}` };
                        }) ?? [];

                const key = node.attrs?.id ?? `mc-${idx}`;
                if (choices.length > 0) {
                    result.push({ kind: "mc", key, choices });
                }
            } else if (node.type === "freeText") {
                const key = node.attrs?.id ?? `free-${idx}`;
                result.push({ kind: "freeText", key });
            } else if (node.type === "numericInput") {
                const key = node.attrs?.id ?? `num-${idx}`;
                result.push({ kind: "numeric", key });
            }
        });

        return result;
    };

    const initAnswersForBlocks = (parsed: Block[]) => {
        const initial: Record<string, any> = {};
        parsed.forEach((b) => {
            if (b.kind === "mc") initial[b.key] = [];
            else initial[b.key] = "";
        });
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
                        : question.contentJson ?? { type: "doc", content: [] };
                setQuestionContentJson(contentJson);
                const parsed = parseContentToBlocks(contentJson);
                setBlocks(parsed);
                initAnswersForBlocks(parsed);
            } catch (err) {
                console.error("Failed to load question:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const toggleChoice = (blockKey: string, choiceId: string) => {
        setAnswers((prev) => {
            const cur: string[] = prev[blockKey] ?? [];
            const next = cur.includes(choiceId) ? cur.filter((c) => c !== choiceId) : [...cur, choiceId];
            return { ...prev, [blockKey]: next };
        });
    };

    const setFreeTextAnswer = (blockKey: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [blockKey]: value }));
    };

    const setNumericAnswer = (blockKey: string, value: string) => {
        setAnswers((prev) => ({ ...prev, [blockKey]: value }));
    };

    const handleSaveAnswers = async () => {
        console.log("Saving answers for question", id, answers);

        // await saveCorrectAnswers(id, answers);

        // navigate away or show success
        navigate(`/preview/${id}`);
    };

    return (
        <MainLayout>
            <QuestionLayout allowedSteps={[true, true, true, false]}>
                <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", py: 3, px: 2, display: "flex", flexDirection: "column", mt: 6 }}>
                    <Paper elevation={0} sx={{ padding: 3, border: "2px solid #000" }}>
                        <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: "center", fontWeight: "bold" }}>
                            Antworten definieren
                        </Typography>

                        {loading && <Typography>Loading…</Typography>}

                        {!loading && blocks.length === 0 && (
                            <Typography sx={{ my: 2 }}>Keine Antwort-Blöcke im Frage-Inhalt gefunden.</Typography>
                        )}

                        {!loading &&
                            blocks.map((b, idx) => (
                                <Accordion key={b.key} sx={{ mb: 1 }}>
                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                        <Typography variant="subtitle1">
                                            {b.kind === "mc" ? `Multiple Choice ${idx + 1}` : b.kind === "freeText" ? `Freitext ${idx + 1}` : `Numerische Eingabe ${idx + 1}`}
                                        </Typography>
                                    </AccordionSummary>

                                    <AccordionDetails>
                                        {b.kind === "mc" && (
                                            <FormControl component="fieldset" fullWidth>
                                                <FormGroup>
                                                    {(b as any).choices.map((choice: Choice) => (
                                                        <FormControlLabel
                                                            key={choice.id}
                                                            control={
                                                                <Checkbox
                                                                    checked={(answers[b.key] ?? []).includes(choice.id)}
                                                                    onChange={() => toggleChoice(b.key, choice.id)}
                                                                />
                                                            }
                                                            label={choice.text || "Option"}
                                                        />
                                                    ))}
                                                </FormGroup>
                                                <Typography variant="caption" color="text.secondary">
                                                    Markiere die korrekten Antwort(en).
                                                </Typography>
                                            </FormControl>
                                        )}

                                        {b.kind === "freeText" && (
                                            <FormControl fullWidth>
                                                <TextField
                                                    label="Erwartete Antwort (Freitext)"
                                                    value={answers[b.key] ?? ""}
                                                    onChange={(e) => setFreeTextAnswer(b.key, e.target.value)}
                                                    fullWidth
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    Trage hier die erwartete/n richtige/n Textantwort(en) ein.
                                                </Typography>
                                            </FormControl>
                                        )}

                                        {b.kind === "numeric" && (
                                            <FormControl fullWidth>
                                                <TextField
                                                    label="Erwartete numerische Antwort"
                                                    value={answers[b.key] ?? ""}
                                                    onChange={(e) => setNumericAnswer(b.key, e.target.value)}
                                                    fullWidth
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    Numerische Lösung (z. B. "42" oder ein Ausdruck).
                                                </Typography>
                                            </FormControl>
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            ))}

                        <Box sx={{ mt: 3, textAlign: "center", gap: 2, display: "flex", justifyContent: "center" }}>
                            <Button variant="outlined" onClick={() => navigate(`/editor/${id}`)}>
                                Zurück
                            </Button>
                            <Button variant="outlined" onClick={handleOpenPreview}>Vorschau</Button>
                            <Button variant="contained" startIcon={<Save />} onClick={handleSaveAnswers}>
                                Speichern
                            </Button>
                        </Box>

                        <Dialog open={openPreview} onClose={handleClosePreview} maxWidth="md" fullWidth>
                            <DialogTitle>Vorschau</DialogTitle>
                            <DialogContent dividers>
                                <Preview content={questionContentJson} />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClosePreview}>Schließen</Button>
                            </DialogActions>
                        </Dialog>
                    </Paper>
                </Box>
            </QuestionLayout>
        </MainLayout>
    );
}
