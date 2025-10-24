import express from 'express';
import {
    createQuestionsForm, loadAllQuestions,
    getQuestionFormById,
    updateQuestionForm,
    uploadImage, updateQuestionContent, updateQuestionAnswers
} from "../controllers/editorController.js";
import multer from "multer";
import {authenticateToken} from "../auth/authenticate.js";

const router = express.Router();

const upload = multer({ dest: "temp/" });
router.use(authenticateToken);

router.post('/imageUpload', upload.single('file'), uploadImage);
router.put("/question/:id", updateQuestionForm);
router.post("/question", createQuestionsForm);
router.get("/question/:id", getQuestionFormById);
router.get("/questions", loadAllQuestions);
router.patch('/question/:id/content', updateQuestionContent);
router.patch('/question/:id/answers', updateQuestionAnswers);

export default router;
