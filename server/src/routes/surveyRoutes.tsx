import express from "express";
import {
    createSurveyHandler,
    getAllSurveysHandler,
    getSurveyByIdHandler,
    updateSurveyHandler,
    deleteSurveyHandler,
    createSurveyInstanceHandler,
    getSurveyInstancesHandler,
    updateSurveyInstanceHandler,
    deleteSurveyInstanceHandler,
} from "../controllers/surveyController.js";
import { authenticateToken } from "../auth/authenticate.js";

const router = express.Router();

router.use(authenticateToken);


router.post("/", createSurveyHandler);
router.get("/", getAllSurveysHandler);
router.get("/:id", getSurveyByIdHandler);
router.put("/:id", updateSurveyHandler);
router.delete("/:id", deleteSurveyHandler);


router.post("/instance", createSurveyInstanceHandler);
router.get("/:surveyId/instances", getSurveyInstancesHandler);
router.put("/instance/:id", updateSurveyInstanceHandler);
router.delete("/instance/:id", deleteSurveyInstanceHandler);

export default router;
