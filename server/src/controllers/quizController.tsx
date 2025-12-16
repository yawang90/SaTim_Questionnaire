import type { Request, Response } from "express";
import {getQuiz, submitQuizAnswer} from "../services/quizService.js";

/**
 * Get a quiz by ID
 */
export const getQuizHandler = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const userId = req.query.userId as string;
        if (!id) return res.status(400).json({ error: "Quiz ID is required" });
        if (!userId) return res.status(400).json({ error: "User ID is required" });

        const quiz = await getQuiz(id, userId);
        if (!quiz) return res.status(404).json({ error: "Quiz not found" });
        res.status(200).json(quiz);
    } catch (err) {
        console.error("Error fetching quiz:", err);
        res.status(500).json({ error: "Failed to fetch quiz" });
    }
};

/**
 * Submit an answer for a quiz question
 */
export const submitAnswerHandler = async (req: Request, res: Response) => {
    try {
        const surveyId = Number(req.params.id);
        const {userId, instanceId, bookletId, questionId, answer,} = req.body;

        if (!surveyId || !instanceId || !bookletId || !userId || !questionId || answer === undefined) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const result = await submitQuizAnswer({surveyId, instanceId, bookletId, userId, questionId, answerJson: answer,});
        res.status(200).json({ success: true, result });
    } catch (err: any) {
        if (err.message === "QUESTION_ALREADY_ANSWERED") {
            return res.status(409).json({ error: "Question already answered" });
        }
        console.error(err);
        res.status(500).json({ error: "Failed to submit answer" });
    }
};

