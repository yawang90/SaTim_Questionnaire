import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import {v4 as uuidv4} from "uuid";
import {getQuiz, type Quiz as QuizType} from "../../services/QuizService.tsx";
import GeneralLayout from "../../layouts/GeneralLayout.tsx";
import type {useEditor} from "@tiptap/react";
import {Preview} from "../../components/Editor/Preview.tsx";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import {Button} from '@mui/material';

export default function QuizPage() {
    const { id } = useParams<{ id: string }>();
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [totalQuestions, setTotalQuestions] = useState<number>(0);
    const [answeredQuestions, setAnsweredQuestions] = useState<number>(0);
    const [currentQuestion, setCurrentQuestion] = useState<number>(0);
    const [quiz, setQuiz] = useState<QuizType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const editorRef = React.useRef<ReturnType<typeof useEditor> | null>(null);
    const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

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
        if (!userId || !id) return;

        const fetchQuizData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getQuiz(id, userId);
                setQuiz(data);
                setTotalQuestions(data?.questions?.length);
                setAnsweredQuestions(0);
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Failed to load quiz");
            } finally {
                setLoading(false);
            }
        };

        fetchQuizData();
    }, [userId, id]);

    const handleTestAnswers = async () => {
        if (!editorRef.current) return;
        const json = editorRef.current.getJSON();
        console.log(json)
        /*
      extractAnswersFromJson :
      {
    "type": "doc",
    "content": [
        {
            "type": "paragraph",
            "attrs": {
                "textAlign": null
            },
            "content": [
                {
                    "type": "numericInput",
                    "attrs": {
                        "id": "5039b8ad-ed5e-4c0a-9888-0f4da7d16acc",
                        "mode": "algebra",
                        "value": "as"
                    }
                },
                {
                    "type": "numericInput",
                    "attrs": {
                        "id": "7d723a35-e00d-4125-b58d-bece09ba0973",
                        "mode": "numeric",
                        "value": "2"
                    }
                },
                {
                    "type": "text",
                    "text": "Erstelle hier deine Aufgabe..."
                }
            ]
        }
    ]
}
      const answers = extractAnswersFromJson(json, blocks);
        try {
            const response = await submitAnswer(quiz?.id, userAnswer, userId);

        } catch (err) {
            console.error(err);
        }*/
    };

    if (loading) return <GeneralLayout><h4>Laden...</h4></GeneralLayout>;
    if (error) return <GeneralLayout><h4>Fehler: {error}</h4></GeneralLayout>;

    return (
        <><AppBar position="fixed" sx={{width: '100%'}}>
            <Toolbar sx={{width: '100%', maxWidth: '100%', px: 2, boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', gap: 2}}>
                <Box sx={{flexGrow: 1}}>
                    <Typography variant="body2" color="inherit" gutterBottom>
                        Frage {answeredQuestions} von {totalQuestions}
                    </Typography>
                    <LinearProgress color="secondary" variant="determinate" value={progress}
                                    sx={{height: 10, width: 1000, borderRadius: 5}}/>
                    <Button color={"secondary"} onClick={() => {handleTestAnswers()}}>Antwort Speichern</Button>
                </Box>

                <Box>
                    <Typography variant="body1" color="inherit">
                        UserId: {userId}
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
            <main style={{padding: '2rem', marginTop: 80}}>
                <div>
                    <Preview content={quiz?.questions?.at(0)?.contentJson || {}} editorRef={editorRef}/>
                </div>
            </main>
        </>
    );
}
