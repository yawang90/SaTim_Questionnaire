import React, { useEffect, useState } from "react";
import {Accordion, AccordionDetails, AccordionSummary, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormGroup, Paper, TextField, Typography,
} from "@mui/material";
import { ExpandMore, Save } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import QuestionLayout from "../../layouts/QuestionLayout";
import {loadQuestionForm, updateQuestionAnswers} from "../../services/QuestionsService";
import { Preview } from "../../components/Editor/Preview";
import type { JSONContent } from "@tiptap/core";
import { v4 as uuidv4 } from "uuid";

type Choice = { id: string; text: string };
type Block =
    | { kind: "mc"; key: string; choices: Choice[] }
    | { kind: "freeText"; key: string }
    | { kind: "freeTextInline"; key: string }
    | { kind: "numeric"; key: string }
    | { kind: "geoGebra"; key: string };

export default function AnswerEditorPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [questionContentJson, setQuestionContentJson] = useState<JSONContent>({});
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [openPreview, setOpenPreview] = useState(false);

    const extractText = (node: any): string => {
        if (!node) return "";
        if (Array.isArray(node)) return node.map(extractText).join("");
        if (node.type === "text") return node.text ?? "";
        if (node.content) return node.content.map(extractText).join("");
        return "";
    };

    const parseContentToBlocks = (doc: any): Block[] => {
        if (!doc || !doc.content) return [];

        const mcGroups: Record<string, Choice[]> = {};
        const result: Block[] = [];

        const walk = (nodes: any[]) => {
            for (const node of nodes) {
                if (!node || !node.type) continue;

                switch (node.type) {
                    case "mcChoice": {
                        const groupId = node.attrs?.groupId ?? uuidv4();
                        const id = node.attrs?.id ?? uuidv4();
                        const text = extractText(node) || "Option";
                        if (!mcGroups[groupId]) mcGroups[groupId] = [];
                        mcGroups[groupId].push({ id, text });
                        break;
                    }

                    case "freeText": {
                        const key = node.attrs?.id ?? uuidv4();
                        result.push({ kind: "freeText", key });
                        break;
                    }

                    case "freeTextInline": {
                        const key = node.attrs?.id ?? uuidv4();
                        result.push({ kind: "freeTextInline", key });
                        break;
                    }

                    case "numericInput": {
                        const key = node.attrs?.id ?? uuidv4();
                        result.push({ kind: "numeric", key });
                        break;
                    }

                    case "geoGebra": {
                        const key = node.attrs?.id ?? uuidv4();
                        result.push({ kind: "geoGebra", key });
                        break;
                    }

                    default:
                        if (node.content) walk(node.content);
                }
            }
        };

        walk(doc.content);

        Object.entries(mcGroups).forEach(([groupId, choices]) => {
            result.push({ kind: "mc", key: groupId, choices });
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
            const next = cur.includes(choiceId)
                ? cur.filter((c) => c !== choiceId)
                : [...cur, choiceId];
            return { ...prev, [blockKey]: next };
        });
    };

    const handleAnswerChange = (blockKey: string, value: string) =>
        setAnswers((prev) => ({ ...prev, [blockKey]: value }));

    const handleSaveAnswers = async () => {
        if (!id) return;
        setLoading(true);
        console.log(answers)
        try {
            await updateQuestionAnswers(id, answers);
            navigate(`/preview/${id}`);
        } catch (err) {
            console.error("Failed to save answers:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <QuestionLayout allowedSteps={[true, true, true, false]}>
                <Box
                    sx={{minHeight: "100vh", backgroundColor: "background.default", py: 3, px: 2, display: "flex", flexDirection: "column", mt: 6,}}>
                    <Paper elevation={0} sx={{ padding: 3, border: "2px solid #000" }}>
                        <Typography variant="h4" gutterBottom sx={{ textAlign: "center", fontWeight: "bold" }}>
                            Antworten definieren
                        </Typography>

                        {loading && <Typography>Loading…</Typography>}

                        {!loading && blocks.length === 0 && (
                            <Typography sx={{ my: 2 }}>
                                Keine Antwort-Blöcke im Frage-Inhalt gefunden.
                            </Typography>
                        )}

                        {!loading &&
                            blocks.map((b, idx) => (
                                <Accordion key={b.key} sx={{ mb: 1 }}>
                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                        <Typography variant="subtitle1">
                                            {b.kind === "mc"
                                                ? `Multiple Choice ${idx + 1}`
                                                : b.kind === "freeText"
                                                    ? `Freitext ${idx + 1}`
                                                    : b.kind === "freeTextInline"
                                                        ? `Freitext Inline ${idx + 1}`
                                                        : b.kind === "numeric"
                                                            ? `Numerische Eingabe ${idx + 1}`
                                                            : `GeoGebra ${idx + 1}`}
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
                                            </FormControl>
                                        )}

                                        {(b.kind === "freeText" || b.kind === "freeTextInline") && (
                                            <FormControl fullWidth>
                                                <TextField
                                                    label="Erwartete Textantwort"
                                                    value={answers[b.key] ?? ""}
                                                    onChange={(e) => handleAnswerChange(b.key, e.target.value)}
                                                />
                                            </FormControl>
                                        )}

                                        {b.kind === "numeric" && (
                                            <FormControl fullWidth>
                                                <TextField
                                                    label="Erwartete numerische Antwort"
                                                    value={answers[b.key] ?? ""}
                                                    onChange={(e) => handleAnswerChange(b.key, e.target.value)}
                                                />
                                            </FormControl>
                                        )}

                                        {b.kind === "geoGebra" && (
                                            <FormControl fullWidth>
                                                <TextField
                                                    label="Erwarteter GeoGebra Zustand (z.B. Variablenwerte)"
                                                    value={answers[b.key] ?? ""}
                                                    onChange={(e) => handleAnswerChange(b.key, e.target.value)}
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    (Hier kannst du z. B. JSON für erwartete GeoGebra-Objektwerte speichern.)
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
                            <Button variant="outlined" onClick={() => setOpenPreview(true)}>
                                Vorschau
                            </Button>
                            <Button variant="contained" startIcon={<Save />} onClick={handleSaveAnswers} disabled={loading}>
                                {loading ? "Speichern…" : "Speichern"}
                            </Button>
                        </Box>

                        <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="md" fullWidth>
                            <DialogTitle>Vorschau</DialogTitle>
                            <DialogContent dividers>
                                <Preview content={questionContentJson} />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setOpenPreview(false)}>Schließen</Button>
                            </DialogActions>
                        </Dialog>
                    </Paper>
                </Box>
            </QuestionLayout>
        </MainLayout>
    );
}
