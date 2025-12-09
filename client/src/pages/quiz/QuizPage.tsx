import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout.tsx";
import { v4 as uuidv4 } from "uuid";
import { getQuiz, type Quiz as QuizType } from "../../services/QuizService.tsx";
import {Box} from "@mui/material";

export default function QuizPage() {
    const { id } = useParams<{ id: string }>();
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [quiz, setQuiz] = useState<QuizType | null>(null);
    const [error, setError] = useState<string | null>(null);

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
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Failed to load quiz");
            } finally {
                setLoading(false);
            }
        };

        fetchQuizData();
    }, [userId, id]);

    if (loading) return <MainLayout><div>Laden...</div></MainLayout>;
    if (error) return <MainLayout><div>Fehler: {error}</div></MainLayout>;

    return (
        <MainLayout>
            <Box sx={{ minHeight: "100vh", py: 3, px: 2, display: "flex", flexDirection: "column", mt: 6 }}>
            <div>
                <p>UserId: {userId}</p>
                <h2>{quiz?.title}</h2>
                <ul>
                    {quiz?.questions.map(q => (<li key={q.id}>{q.text}</li>
                    ))}
                </ul>
            </div></Box>
        </MainLayout>
    );
}
