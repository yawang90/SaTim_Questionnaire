import React, {useEffect, useState} from 'react';
import MainLayout from '../../layouts/MainLayout.tsx';
import QuestionLayout from '../../layouts/QuestionLayout.tsx';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Paper,
    Radio,
    RadioGroup,
    Typography,
} from '@mui/material';
import {Save} from '@mui/icons-material';
import {useNavigate, useParams} from 'react-router-dom';
import {Preview} from '../../components/Editor/Preview';
import {loadQuestionForm, updateQuestionStatus} from '../../services/EditorService.tsx';
import type {JSONContent} from '@tiptap/core';
import {type Block, mapQuestionsStatus, parseContentToBlocks, PrettyTestResult} from "./AnswerUtils.tsx";
import type {useEditor} from '@tiptap/react';
import {evaluateAnswers} from "../../services/SolverService.tsx";

export default function AnswerPreviewPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [questionContent, setQuestionContent] = useState<JSONContent | null>(null);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [quizStatus, setQuizStatus] = useState<'in bearbeitung' | 'abgeschlossen' | 'gelöscht'>('in bearbeitung');
    const [loading, setLoading] = useState(false);
    const editorRef = React.useRef<ReturnType<typeof useEditor> | null>(null);
    const [testResult, setTestResult] = useState<any>(null);
    const [testDialogOpen, setTestDialogOpen] = useState(false);

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
                setQuizStatus(mapQuestionsStatus(question.status));

                const parsedBlocks: Block[] = parseContentToBlocks(content);
                setBlocks(parsedBlocks);
            } catch (err) {
                console.error('Failed to load question:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const handleTestAnswers = async () => {
        if (!id || !editorRef.current) return;
        const json = editorRef.current.getJSON();
        const answers = extractAnswersFromJson(json, blocks);
        try {
            const response = await evaluateAnswers(id, answers);
            setTestResult(response);
            setTestDialogOpen(true);
        } catch (err) {
            console.error(err);
            setTestResult({ error: 'Fehler bei der Auswertung.' });
            setTestDialogOpen(true);
        }
    };


    const handleResetAnswers = () => {
        if (!blocks) return;
        blocks.forEach(block => {
            switch (block.kind) {
                case 'sc': {
                    const checkboxNodes = document.querySelectorAll<HTMLInputElement>(
                        `div.mc-choice-wrapper input[name="group-${block.key}"]`
                    );
                    checkboxNodes.forEach(input => input.checked = false);
                    break;
                }
            }
        });
    };


    const handleSaveStatus = async () => {
        if (!id) return;
        setLoading(true);
        try {
            await updateQuestionStatus(id, quizStatus);
            navigate('/table');
        } catch (err) {
            console.error('Failed to save status:', err);
        } finally {
            setLoading(false);
        }
    };

    const extractAnswersFromJson = (doc: JSONContent, blocks: Block[]): { key: string; value: any }[] => {
        const answers: { key: string; value: any }[] = blocks
            .map(block => {
                switch (block.kind) {
                    case 'sc':
                    case 'mc':
                        return {
                            key: block.key,
                            value: block.choices.map(choice => ({ id: choice.id, selected: false })),
                        };
                    case 'freeText':
                    case 'freeTextInline':
                    case 'numeric':
                    case 'algebra':
                    case 'geoGebra':
                        return { key: block.key, value: '' };
                    default:
                        return undefined;
                }
            })
            .filter((a): a is { key: string; value: any } => a !== undefined);


        interface TipTapNode {
            type: string;
            attrs?: Record<string, any>;
            content?: TipTapNode[];
            text?: string;
        }

        const walk = (nodes: TipTapNode[]) => {
            for (const node of nodes) {
                if (!node || !node.type) continue;

                const block = blocks.find(b => b.key === node.attrs?.id || b.key === node.attrs?.groupId);
                if (!block) {
                    if (node.content) walk(node.content);
                    continue;
                }

                const answer = answers.find(a => a.key === block.key)!;

                switch (block.kind) {
                    case 'sc':
                    case 'mc':
                        { const checkboxNodes = document.querySelectorAll<HTMLInputElement>(
                            `div.mc-choice-wrapper input[name="group-${block.key}"]`
                        );
                        checkboxNodes.forEach((input, i) => {
                            if (answer.value[i]) answer.value[i].selected = input.checked;
                        });
                        break; }
                    case 'freeText':
                    case 'freeTextInline':
                        { const inputEl = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
                            `[data-node-view-wrapper] [id="${block.key}"]`
                        );
                        if (inputEl) answer.value = inputEl.value;
                        break; }
                    case 'algebra': {
                        answer.value = node.attrs?.value ?? '';
                        break;
                    }
                    case 'numeric':
                        { const numericEl = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
                            `[data-node-view-wrapper] [id="${block.key}"]`
                        );
                        if (numericEl) answer.value = numericEl.value;
                        break; }

                    case 'geoGebra':
                        answer.value = node.attrs?.materialId ?? '';
                        break;
                }

                if (node.content) walk(node.content);
            }
        };

        if (doc.content) walk(doc.content as TipTapNode[]);

        return answers;
    };


    return (
        <MainLayout>
            <QuestionLayout allowedSteps={[true, true, true, true]}>
                <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 3, px: 2, display: 'flex', flexDirection: 'column', mt: 6 }}>
                    <Paper elevation={0} sx={{ padding: 3, border: '2px solid #000' }}>
                        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                            Status setzen
                        </Typography>

                        <FormControl component="fieldset" >
                            <RadioGroup sx={{ justifyContent: 'center', display: 'flex', gap: 3 }} value={quizStatus} onChange={(e) => setQuizStatus(e.target.value as typeof quizStatus)}>
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
                                <Preview content={questionContent} editorRef={editorRef} />
                                <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                                    <Button variant="outlined" onClick={() => navigate(-1)}>
                                        Zurück
                                    </Button>
                                    <Button variant="outlined" onClick={handleTestAnswers}>
                                        Antworten testen
                                    </Button>
                                    <Button variant="outlined" onClick={handleResetAnswers}>
                                        Single Choice zurücksetzen
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
            <Dialog
                open={testDialogOpen}
                onClose={() => setTestDialogOpen(false)}
                maxWidth="sm"
                fullWidth>
                <DialogTitle>Testergebnis</DialogTitle>

                <DialogContent dividers>
                    <PrettyTestResult result={testResult} />
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setTestDialogOpen(false)}>Schließen</Button>
                </DialogActions>
            </Dialog>

        </MainLayout>
    );
}
