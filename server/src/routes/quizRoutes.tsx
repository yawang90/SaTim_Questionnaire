import express from 'express';
import {getQuizHandler, skipQuestionHandler, submitAnswerHandler} from "../controllers/quizController.js";

const router = express.Router();

router.get('/instance/:id', getQuizHandler);
router.post('/question/:questionId/answer', submitAnswerHandler);
router.post('/question/:questionId/skip', skipQuestionHandler);

export default router;
