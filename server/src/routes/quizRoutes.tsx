import express from 'express';
import {
    endQuestionSessionHandler,
    getQuizHandler,
    skipQuestionHandler, startQuestionSessionHandler,
    submitAnswerHandler, submitFeedbackHandler,
    trackQuestionTimeHandler
} from "../controllers/quizController.js";

const router = express.Router();

router.post('/instance/:id', getQuizHandler);
router.post('/question/:questionId/answer', submitAnswerHandler);
router.post('/question/:questionId/skip', skipQuestionHandler);
router.post('/track-time', trackQuestionTimeHandler);
router.post('/session/start', startQuestionSessionHandler);
router.post('/session/end', endQuestionSessionHandler);
router.post('/feedback', submitFeedbackHandler);


export default router;
