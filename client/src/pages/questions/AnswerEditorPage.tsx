import React, { useEffect, useState } from "react";
import {Accordion, AccordionDetails, AccordionSummary, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormGroup, Paper, TextField, Typography,
} from "@mui/material";
import { ExpandMore, Save } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import QuestionLayout from "../../layouts/QuestionLayout";
import {loadQuestionForm, updateQuestionAnswers} from "../../services/EditorService.tsx";
import { Preview } from "../../components/Editor/Preview";
import type { JSONContent } from "@tiptap/core";
import {parseContentToBlocks, type Block, type Choice} from "./AnswerUtils.tsx";

export default function AnswerEditorPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [questionContentJson, setQuestionContentJson] = useState<JSONContent>({});
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [openPreview, setOpenPreview] = useState(false);

    const initAnswersForBlocks = (parsed: Block[]) => {
        const initial: Record<string, any> = {};
        parsed.forEach((b) => {
            if (b.kind === "mc" || b.kind === "sc") initial[b.key] = [];
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
                const parsedBlocks: Block[] = parseContentToBlocks(contentJson);
                setBlocks(parsedBlocks);
                initAnswersForBlocks(parsedBlocks);
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
                            blocks.map((answerType, idx) => (
                                <Accordion key={answerType.key} sx={{ mb: 1 }}>
                                    <AccordionSummary expandIcon={<ExpandMore />}>
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
                                                                : `GeoGebra (${idx + 1})`}
                                        </Typography>
                                    </AccordionSummary>

                                    <AccordionDetails>
                                        {/* Multiple Choice */}
                                        {answerType.kind === "mc" && (
                                            <FormControl component="fieldset" fullWidth>
                                                <FormGroup>
                                                    {(answerType as any).choices.map((choice: Choice) => (
                                                        <FormControlLabel key={choice.id} control={
                                                            <Checkbox
                                                                checked={(answers[answerType.key] ?? []).includes(choice.id)}
                                                                onChange={() => toggleChoice(answerType.key, choice.id)}
                                                            />}
                                                            label={choice.text || "Option"}/>))}
                                                </FormGroup>
                                            </FormControl>
                                        )}

                                        {/* Single Choice */}
                                        {answerType.kind === "sc" && (
                                            <FormControl component="fieldset" fullWidth>
                                                <FormGroup>
                                                    {(answerType as any).choices.map((choice: Choice) => (
                                                        <FormControlLabel
                                                            key={choice.id} control={
                                                                <Checkbox checked={(answers[answerType.key] ?? [])[0] === choice.id} onChange={() =>
                                                                    setAnswers((prev) => ({
                                                                        ...prev,
                                                                        [answerType.key]: [choice.id]}))} icon={<span style={{ borderRadius: '50%', border: '1px solid gray', width: 16, height: 16 }} />} checkedIcon={<span style={{ borderRadius: '50%', backgroundColor: '#1976d2', width: 16, height: 16 }} />}/>}
                                                            label={choice.text || "Option"}/>))}
                                                </FormGroup>
                                            </FormControl>
                                        )}

                                        {/* Free Text */}
                                        {(answerType.kind === "freeText" || answerType.kind === "freeTextInline") && (
                                            <FormControl fullWidth>
                                                <TextField label="Erwartete Textantwort" value={answers[answerType.key] ?? ""} onChange={(e) => handleAnswerChange(answerType.key, e.target.value)}/>
                                            </FormControl>
                                        )}

                                        {/* Numeric */}
                                        {answerType.kind === "numeric" && (
                                            <FormControl fullWidth>
                                                <TextField label="Erwartete numerische Antwort" value={answers[answerType.key] ?? ""} onChange={(e) => handleAnswerChange(answerType.key, e.target.value)}/>
                                            </FormControl>
                                        )}

                                        {/* GeoGebra */}
                                        {answerType.kind === "geoGebra" && (
                                            <FormControl fullWidth>
                                                <TextField label="Erwarteter GeoGebra Zustand (z.B. Variablenwerte)" value={answers[answerType.key] ?? ""} onChange={(e) => handleAnswerChange(answerType.key, e.target.value)}/>
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
