import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout.tsx';
import QuestionLayout from '../../layouts/QuestionLayout.tsx';
import {
    Box,
    Button,
    Paper,
    Typography,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Checkbox,
    FormGroup,
    TextField,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { Preview } from '../../components/Editor/Preview';
import { loadQuestionForm, updateQuestionStatus } from '../../services/QuestionsService';
import type { JSONContent } from '@tiptap/core';
import { v4 as uuidv4 } from 'uuid';

type Choice = { id: string; text: string };
type Block =
    | { kind: 'mc'; key: string; choices: Choice[] }
    | { kind: 'freeText'; key: string }
    | { kind: 'numeric'; key: string };

type AnswerValue = string | number | string[];

interface TipTapNode {
    type: string;
    attrs?: { id?: string; groupId?: string };
    text?: string;
    content?: TipTapNode[];
}

export default function AnswerPreviewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [questionContent, setQuestionContent] = useState<JSONContent | null>(null);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
    const [correctAnswers, setCorrectAnswers] = useState<Record<string, AnswerValue>>({});
    const [quizStatus, setQuizStatus] = useState<'in bearbeitung' | 'abgeschlossen' | 'gelöscht'>('in bearbeitung');
    const [loading, setLoading] = useState(false);
    const [testResults, setTestResults] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        (async () => {
            try {
                const question = await loadQuestionForm(id);
                const content =
                    typeof question.contentJson === 'string'
                        ? JSON.parse(question.contentJson)
                        : question.contentJson ?? { type: 'doc', content: [] };
                setQuestionContent(content);
                setQuizStatus(question.status || 'in bearbeitung');

                const parsedBlocks: Block[] = parseContentToBlocks(content);
                setBlocks(parsedBlocks);

                const initialAnswers: Record<string, AnswerValue> = {};
                parsedBlocks.forEach((b) => {
                    initialAnswers[b.key] = b.kind === 'mc' ? [] : '';
                });
                setAnswers(initialAnswers);

                setCorrectAnswers(question.correctAnswers || {});
            } catch (err) {
                console.error('Failed to load question:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const parseContentToBlocks = (doc: JSONContent): Block[] => {
        if (!doc || !doc.content) return [];

        const mcGroups: Record<string, Choice[]> = {};
        const result: Block[] = [];

        const walk = (nodes: TipTapNode[]) => {
            for (const node of nodes) {
                if (!node || !node.type) continue;
                switch (node.type) {
                    case 'mcChoice': {
                        const groupId = node.attrs?.groupId ?? 'default';
                        const choiceId = node.attrs?.id ?? uuidv4();
                        const text = node.content?.map((c) => c.text || '').join('') || 'Option';
                        if (!mcGroups[groupId]) mcGroups[groupId] = [];
                        mcGroups[groupId].push({ id: choiceId, text });
                        break;
                    }
                    case 'freeText':
                        result.push({ kind: 'freeText', key: node.attrs?.id ?? uuidv4() });
                        break;
                    case 'numericInput':
                        result.push({ kind: 'numeric', key: node.attrs?.id ?? uuidv4() });
                        break;
                    default:
                        if (node.content) walk(node.content);
                }
            }
        };

        walk(doc.content as TipTapNode[]);

        Object.entries(mcGroups).forEach(([groupId, choices]) => {
            result.push({ kind: 'mc', key: groupId, choices });
        });

        return result;
    };

    const toggleChoice = (blockKey: string, choiceId: string) => {
        setAnswers((prev) => {
            const cur = (prev[blockKey] as string[]) ?? [];
            const next = cur.includes(choiceId) ? cur.filter((c) => c !== choiceId) : [...cur, choiceId];
            return { ...prev, [blockKey]: next };
        });
    };

    const handleAnswerChange = (blockKey: string, value: string) =>
        setAnswers((prev) => ({ ...prev, [blockKey]: value }));

    const handleTestAnswers = () => {
        const results: Record<string, boolean> = {};
        blocks.forEach((b) => {
            const user = answers[b.key];
            const correct = correctAnswers[b.key];

            if (b.kind === 'mc') {
                results[b.key] =
                    Array.isArray(user) &&
                    Array.isArray(correct) &&
                    user.length === correct.length &&
                    user.every((v) => (correct as string[]).includes(v));
            } else {
                results[b.key] = user?.toString().trim() === correct?.toString().trim();
            }
        });
        setTestResults(results);

        const correctCount = Object.values(results).filter(Boolean).length;
        const total = blocks.length;
        alert(`Richtig beantwortet: ${correctCount} / ${total}`);
    };

    const handleResetAnswers = () => {
        const reset: Record<string, AnswerValue> = {};
        blocks.forEach((b) => {
            reset[b.key] = b.kind === 'mc' ? [] : '';
        });
        setAnswers(reset);
        setTestResults({});
    };

    const handleSaveStatus = async () => {
        if (!id) return;
        setLoading(true);
        try {
            await updateQuestionStatus(id, quizStatus);
            alert('Status erfolgreich gespeichert!');
        } catch (err) {
            console.error('Failed to save status:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <QuestionLayout allowedSteps={[true, true, true, true]}>
                <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 3, px: 2, display: 'flex', flexDirection: 'column', mt: 6 }}>
                    <Paper elevation={0} sx={{ padding: 3, border: '2px solid #000' }}>
                        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                            Status setzen
                        </Typography>

                        <FormControl component="fieldset">
                                <RadioGroup row value={quizStatus} onChange={(e) => setQuizStatus(e.target.value as typeof quizStatus)}>
                                    <FormControlLabel value="in bearbeitung" control={<Radio />} label="In Bearbeitung" />
                                    <FormControlLabel value="abgeschlossen" control={<Radio />} label="Abgeschlossen" />
                                    <FormControlLabel value="gelöscht" control={<Radio />} label="Gelöscht" />
                                </RadioGroup>
                            </FormControl>

                        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                            Vorschau des Quiz
                        </Typography>

                        {loading && <Typography>Loading…</Typography>}

                        {!loading && questionContent && (
                            <>
                                <Preview content={questionContent} />

                                {blocks.map((b) => {
                                    const isCorrect = testResults[b.key];
                                    const errorStyle = isCorrect === false ? { borderColor: 'red' } : {};
                                    return (
                                        <Box key={b.key} sx={{ mt: 2 }}>
                                            {b.kind === 'mc' && (
                                                <FormControl component="fieldset" sx={errorStyle}>
                                                    <FormLabel>Multiple Choice</FormLabel>
                                                    <FormGroup>
                                                        {b.choices.map((c) => (
                                                            <FormControlLabel
                                                                key={c.id}
                                                                control={
                                                                    <Checkbox
                                                                        checked={(answers[b.key] as string[]).includes(c.id)}
                                                                        onChange={() => toggleChoice(b.key, c.id)}
                                                                    />
                                                                }
                                                                label={c.text}
                                                            />
                                                        ))}
                                                    </FormGroup>
                                                </FormControl>
                                            )}
                                            {(b.kind === 'freeText' || b.kind === 'numeric') && (
                                                <TextField
                                                    label={b.kind === 'numeric' ? 'Numerische Antwort' : 'Freitext Antwort'}
                                                    value={answers[b.key]?.toString() ?? ''}
                                                    onChange={(e) => handleAnswerChange(b.key, e.target.value)}
                                                    fullWidth
                                                    sx={{ mt: 1, ...errorStyle }}
                                                />
                                            )}
                                        </Box>
                                    );
                                })}

                                <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                                    <Button variant="outlined" onClick={() => navigate(-1)}>
                                        Zurück
                                    </Button>
                                    <Button variant="outlined" onClick={handleTestAnswers}>
                                        Antworten testen
                                    </Button>
                                    <Button variant="outlined" onClick={handleResetAnswers}>
                                        Antworten zurücksetzen
                                    </Button>
                                    <Button variant="contained" startIcon={<Save />} onClick={handleSaveStatus}>
                                        Speichern
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Paper>
                </Box>
            </QuestionLayout>
        </MainLayout>
    );
}
