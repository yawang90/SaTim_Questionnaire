import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import {v4 as uuidv4} from "uuid";
import {type AnswerDTO, getQuiz, type Quiz as QuizType, submitAnswer} from "../../services/QuizService.tsx";
import GeneralLayout from "../../layouts/GeneralLayout.tsx";
import type {useEditor} from "@tiptap/react";
import {type GeoGebraAnswer, Preview} from "../../components/Editor/Preview.tsx";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import {Alert, Button, CircularProgress, Snackbar, Stack} from '@mui/material';
import {
    type Answer,
    type Block,
    extractAnswersFromJson,
    type LineEquationAnswer,
    mergeGeoGebraAnswers,
    mergeLineEquationAnswers,
    parseContentToBlocks
} from '../questions/AnswerUtils.tsx';

export default function QuizPage() {
    const { id } = useParams<{ id: string }>();
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [totalQuestions, setTotalQuestions] = useState<number>(0);
    const [answeredQuestions, setAnsweredQuestions] = useState<number>(0);
    const [quiz, setQuiz] = useState<QuizType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const editorRef = React.useRef<ReturnType<typeof useEditor> | null>(null);
    const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
    const [quizFinished, setQuizFinished] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [geoGebraAnswers, setGeoGebraAnswers] = useState<GeoGebraAnswer[]>([]);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'error' | 'success' | 'info'
    }>({
        open: false,
        message: '',
        severity: 'info',
    });
    const handleGeoGebraChange = (answer: GeoGebraAnswer) => {
        setGeoGebraAnswers(prev => {
            const idx = prev.findIndex(a => a.id === answer.id);
            if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = answer;
                return updated;
            }
            return [...prev, answer];
        });
    };

    useEffect(() => {
        const key = "quizUserId";
        const expiryKey = "quizUserIdExpiry";

        let storedUser = localStorage.getItem(key);
        const expiry = localStorage.getItem(expiryKey);
        const now = new Date().getTime();

        if (!storedUser || !expiry || now > parseInt(expiry)) {
            storedUser = uuidv4();
            const fourteenDays = 14 * 24 * 60 * 60 * 1000;
            localStorage.setItem(key, storedUser);
            localStorage.setItem(expiryKey, (now + fourteenDays).toString());
        }

        setUserId(storedUser);
    }, []);

    useEffect(() => {
        fetchQuizData();
    }, [userId, id]);

    const fetchQuizData = async () => {
        if (!userId || !id) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getQuiz(id, userId);
            setQuiz(data);
            setQuizFinished(!data.question);
            setAnsweredQuestions(data.answeredQuestions);
            setTotalQuestions(data.totalQuestions);
        } catch (err: any) {
            setError(err.message || "Failed to load quiz");
        } finally {
            setLoading(false);
        }
    };

    function validateAnswerExists(extractedAnswers: Answer[]) {
        const isFilled = (ans: any) => {
            if (ans.kind === 'geoGebraPoints' || ans.kind === 'geoGebraLines') {
                if (!Array.isArray(ans.value)) return false;
                return ans.value.some((v: any) => v.name?.trim() !== '');
            }
            if (ans.kind === 'lineEquation') {
                return typeof ans.value === 'string' && ans.value.trim() !== '' && ans.value.trim() !== 'y=';
            }
            if (Array.isArray(ans.value)) return ans.value.length > 0;
            return ans.value !== null && ans.value !== '';
        };
        const allFilled = extractedAnswers.every(isFilled);
        return allFilled;
    }

    const handleTestAnswers = async () => {
        if (!editorRef.current || !quiz || !quiz.question || !userId) return;
        const question = quiz.question;
        const parsedBlocks: Block[] = parseContentToBlocks(
            typeof question.contentJson === 'string'
                ? JSON.parse(question.contentJson)
                : question.contentJson
        );
        const editorJson = editorRef.current.getJSON();
        let extractedAnswers = extractAnswersFromJson(editorJson, parsedBlocks);
        extractedAnswers = mergeGeoGebraAnswers(extractedAnswers, geoGebraAnswers);
        try {
            extractedAnswers = mergeLineEquationAnswers(extractedAnswers);
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: `Ungültige lineare Gleichung: ${err.message}`,
                severity: 'error',
            });
        }
        const answerExists = validateAnswerExists(extractedAnswers);
        if (!answerExists) {
            setSnackbar({open: true, message: `Bitte beantworten Sie die Frage(n).`, severity: 'error',});
            return;
        }
        if (!id) return;
        const answerDTO: AnswerDTO = {
            questionId: question.id,
            instanceId: id!,
            answer: extractedAnswers.map(a => {
                if (a.kind === 'lineEquation') {
                    return {
                        key: a.key,
                        kind: a.kind,
                        value: a.value,
                        m: a.m,
                        c: a.c
                    } as LineEquationAnswer;
                }  else {
                    return { value: a.value, key: a.key, kind: a.kind } as any;
                }
            }),
        };
        try {
            setSubmitting(true);
            await submitAnswer(answerDTO, userId);
            await fetchQuizData();
        } catch (err) {
            console.error(err);
            setSnackbar({open: true, message: `Fehler beim Absenden der Antwort.`, severity: 'error',});
        } finally {
            setSubmitting(false);
        }
    };

    if (loading)
        return (
            <GeneralLayout>
                <Stack direction="column" justifyContent="center" alignItems="center" sx={{ height: '60vh' }}><CircularProgress />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Laden...
                    </Typography>
                </Stack>
            </GeneralLayout>
        );
    if (error) return <GeneralLayout><h4>Fehler: {error}</h4></GeneralLayout>;

    return (
        <>
            <AppBar position="fixed" sx={{width: '100%'}}>
                <Toolbar sx={{width: '100%', maxWidth: '100%', px: 2, boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', gap: 2}}>
                    <Box sx={{flexGrow: 1}}>
                        <Typography variant="body2" color="inherit" gutterBottom>
                            Frage {answeredQuestions} von {totalQuestions}
                        </Typography>
                        <LinearProgress color="secondary" variant="determinate" value={progress} sx={{height: 10, width: 1000, borderRadius: 5}}/>
                    </Box>
                    <Box>
                        <Typography variant="body1" color="inherit">
                            UserId: {userId}
                        </Typography>
                    </Box>
                </Toolbar>
            </AppBar>
            <main style={{padding: '2rem', marginTop: 80}}>
                <Box sx={{border: '2px solid', borderRadius: 2, p: 3, mb: 4}}>
                    {quizFinished ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <Typography variant="body1">
                                Vielen Dank für Ihre Teilnahme.
                            </Typography>
                            <Button variant="contained" color="primary" href={`https://www.soscisurvey.de/MAB-Demo/?uid=${userId}/?instance=${id}`}>
                                Bitte füllen Sie jetzt diese Umfrage aus!
                            </Button>
                        </Box>
                    ) : (quiz?.question && (
                            <Preview content={quiz.question.contentJson} editorRef={editorRef} onGeoGebraChange={handleGeoGebraChange}/>))}
                </Box>
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                    {quiz?.question && <Button variant="contained" color="primary" size="small" onClick={handleTestAnswers} disabled={submitting} sx={{ px: 6, py: 2, fontSize: '1.25rem', fontWeight: 'bold' }}>
                        {submitting ? <CircularProgress size={24} color="inherit" /> : "Antwort abschicken"}
                    </Button>}
                </Box>
            </main>
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((prev) => ({...prev, open: false}))} anchorOrigin={{vertical: "bottom", horizontal: "center"}}>
                <Alert
                    onClose={() => setSnackbar((prev) => ({...prev, open: false}))}
                    severity={snackbar.severity}
                    sx={{width: "100%"}}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}
