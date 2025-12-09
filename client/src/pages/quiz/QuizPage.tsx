import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import {v4 as uuidv4} from "uuid";
import {getQuiz, type Quiz as QuizType} from "../../services/QuizService.tsx";
import QuizLayout from "../../layouts/QuizLayout.tsx";
import GeneralLayout from "../../layouts/GeneralLayout.tsx";
import type {useEditor} from "@tiptap/react";
import {Preview} from "../../components/Editor/Preview.tsx";

export default function QuizPage() {
    const { id } = useParams<{ id: string }>();
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [quiz, setQuiz] = useState<QuizType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const editorRef = React.useRef<ReturnType<typeof useEditor> | null>(null);

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

    if (loading) return <GeneralLayout><h4>Laden...</h4></GeneralLayout>;
    if (error) return <GeneralLayout><h4>Fehler: {error}</h4></GeneralLayout>;

    return (
        <QuizLayout totalQuestions={quiz?.questions?.length || 0} answeredQuestions={2} userId={userId || ""}>
            <div>
                <Preview content={quiz?.questions?.at(0).contentJson || {}} editorRef={editorRef} />
            </div>
        </QuizLayout>
    );
}
