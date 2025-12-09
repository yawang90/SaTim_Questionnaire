import express from 'express';
import {getQuizHandler, submitAnswerHandler} from "../controllers/quizController.js";

const router = express.Router();

router.get('/:id', getQuizHandler);
router.post('/:id/answer', submitAnswerHandler);

export default router;
