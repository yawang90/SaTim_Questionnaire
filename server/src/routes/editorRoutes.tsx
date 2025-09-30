import express from 'express';
import {
    createQuestionsForm, loadAllQuestions,
    getQuestionFormById,
    updateQuestionForm,
    uploadImage
} from "../controllers/editorController.js";
import multer from "multer";
import {authenticateToken} from "../auth/authenticate.js";

const router = express.Router();

const upload = multer({ dest: "temp/" });
router.use(authenticateToken);

router.post("/imageUpload", upload.single("upload"), uploadImage);
router.put("/question", updateQuestionForm);
router.post("/question", createQuestionsForm);
router.get("/question", getQuestionFormById);
router.get("/questions", loadAllQuestions);

export default router;
