import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import {v4 as uuidv4} from "uuid";
import {
    type AnswerDTO,
    getQuiz,
    type Quiz,
    type Quiz as QuizType,
    skipQuestion,
    submitAnswer
} from "../../services/QuizService.tsx";
import GeneralLayout from "../../layouts/GeneralLayout.tsx";
import type {useEditor} from "@tiptap/react";
import {type GeoGebraAnswer, Preview} from "../../components/Editor/Preview.tsx";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {Alert, Button, CircularProgress, Paper, Snackbar, Stack, Tooltip} from '@mui/material';
import {
    type Answer,
    type Block,
    extractAnswersFromJson,
    type LineEquationAnswer,
    mergeGeoGebraAnswers,
    parseContentToBlocks
} from '../utils/AnswerUtils.tsx';
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import {enrichQuizWithAnswers} from "./utils/EnrichQuizWithAnswers.tsx";

export default function QuizPage() {
    const { id } = useParams<{ id: string }>();
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [quiz, setQuiz] = useState<QuizType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const editorRef = React.useRef<ReturnType<typeof useEditor> | null>(null);
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
    const [questionIds, setQuestionIds] = useState<number[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

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

    const fetchQuizData = async (qid?: number) => {
        if (!userId || !id) return;
        setLoading(true);
        setError(null);
        try {
            let data: Quiz;
            if (qid) {
                data = await getQuiz(id, userId, qid);
            } else {
                data = await getQuiz(id, userId);
            }
            if (data?.question) {
                const contentWithAnswers = enrichQuizWithAnswers(typeof data.question.contentJson === "string" ? JSON.parse(data.question.contentJson) : data.question.contentJson, data.previousAnswer);
                data.question.contentJson = contentWithAnswers;
            }
            setQuiz(data);
            setQuizFinished(!data.question);
            if (!questionIds.length && data.questionIds) {
                setQuestionIds(data.questionIds);
            }
            if (data.question && data.questionIds) {
                const idx = data.questionIds.indexOf(data.question.id);
                setCurrentIndex(idx >= 0 ? idx : 0);
            }
            setGeoGebraAnswers([]);
        } catch (err: any){
            if (err.message==="NOT_ACTIVE"){
                setError("Der Testlauf ist nicht aktiv, Sie können den Test nicht durchführen.")
            } else {
                setError(err.message || "Failed to load quiz");
            }
        } finally {
            setLoading(false);
        }
    };

    function validateAnswerExists(extractedAnswers: Answer[]) {
        const isFilled = (ans: Answer) => {
            if (ans.kind === 'geoGebraPoints' || ans.kind === 'geoGebraLines') {
                if (!Array.isArray(ans.value)) return false;
                return ans.value.some((v: any) => v.name?.trim() !== '');
            }
            if (ans.kind === 'lineEquation') {
                return ans.value.trim() !== '' && ans.value.trim() !== 'y=';
            }
            if (ans.kind === 'sc') {
                if (!Array.isArray(ans.value)) return false;
                return ans.value.some(v => v.selected);
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
                    return {key: a.key, kind: a.kind, value: a.value} as LineEquationAnswer;
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

    const handleSkip = async () => {
        if (!quiz?.question || !userId || !id) return;
        try {
            setSubmitting(true);
            await skipQuestion(quiz.question.id, id, userId);
            await fetchQuizData();
        } catch (err) {
            console.error(err);
            setSnackbar({open: true, message: "Fehler beim Überspringen der Frage.", severity: "error",});
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

    if (error) {
        return (
            <GeneralLayout>
                <Box sx={{minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center",}}>
                    <Paper elevation={3} sx={{padding: 6, maxWidth: 500, textAlign: "center", borderRadius: 3,}}>
                        <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }}></ErrorOutlineIcon>
                        <Typography variant="h5" fontWeight={600} gutterBottom>Fehler beim Laden des Tests</Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>{error}</Typography>
                        <Button variant="contained" onClick={() => window.location.reload()}>
                            Erneut versuchen
                        </Button>
                    </Paper>
                </Box>
            </GeneralLayout>
        );
    }
    return (
        <>
            <AppBar position="static" sx={{ width: '100%' }}>
                <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1, px: 2 }}>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                        {questionIds.map((qid, index) => {
                            const isCurrent = quiz?.question?.id === qid;
                            const isAnswered = quiz?.answeredQuestionIds?.includes(qid);
                            const isSkipped = quiz?.skippedQuestions?.includes(qid);
                            let title = "";
                            if (isAnswered && !isSkipped) {
                                    title = "Die Antwort ist gespeichert.";
                            }
                            if (isSkipped) {
                                title = "Die Antwort ist übersprungen.";
                            }
                            return (
                                <Tooltip title={title} arrow>
                                <Button key={qid} size="small" variant={isCurrent ? "contained" : "outlined"} onClick={() => fetchQuizData(qid)} sx={{color: "white", borderColor: "white", backgroundColor: isCurrent ? "rgba(255,255,255,0.2)" : "transparent", minWidth: 36, position: "relative", "&:hover": {backgroundColor: "rgba(255,255,255,0.1)", borderColor: "white",},}}>
                                    Aufgabe {index + 1}
                                    {isAnswered && !isSkipped &&(
                                        <Box component="span" sx={{position: "absolute", top: -4, right: -4, width: 16, height: 16, backgroundColor: "green", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontSize: 12, fontWeight: "bold",
                                        }}>✓</Box>)}
                                    {isSkipped && (
                                        <Box component="span" sx={{position: "absolute", top: -4, right: -4, width: 16, height: 16, backgroundColor: "#fbc02d", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", color: "black", fontSize: 12, fontWeight: "bold",}}>
                                            ⏭</Box>)}
                                </Button></Tooltip>
                            );
                        })}
                    </Box>
                    <Box sx={{ color: "white", ml: 2 }}>
                        {"userId:" + userId}</Box>
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
                {!quizFinished ? (<Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', maxWidth: 600, margin: 'auto' }}>
                        <Button
                            variant="outlined"
                            onClick={async () => {
                                if (currentIndex > 0) {
                                    const prevQuestionId = questionIds[currentIndex - 1];
                                    await fetchQuizData(prevQuestionId);
                                }
                            }}
                            disabled={currentIndex === 0}>
                            Zurück
                        </Button>
                        <Button variant="outlined" color="warning" onClick={handleSkip} disabled={submitting}>
                            Überspringen
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleTestAnswers}
                            disabled={submitting || loading}>
                            {submitting ? <CircularProgress size={24} color="inherit" /> : "Antwort abschicken"}
                        </Button>
                    </Box>
                ) : (<></>)}
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
