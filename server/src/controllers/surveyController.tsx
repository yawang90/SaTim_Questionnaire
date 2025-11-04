import type { Request, Response } from "express";
import {
    createSurvey,
    getAllSurveys,
    getSurveyById,
    updateSurveyById,
    deleteSurveyById,
    createSurveyInstance,
    getSurveyInstances,
    updateSurveyInstanceById,
    deleteSurveyInstanceById, processSurveyExcels, getBookletsBySurveyId,
} from "../services/surveyService.js";

/**
 * Interface for creating a new survey
 */
interface SurveyInput {
    title: string;
    description?: string;
    mode: "adaptiv" | "design";
    instances?: {
        name: string;
        validFrom: string;
        validTo: string;
    }[];
}

/**
 * Create a new survey
 */
export const createSurveyHandler = async (req: Request, res: Response) => {
    try {
        const { title, description, mode, instances } = req.body as SurveyInput;
        const userId = Number((req as any).user?.id);
        if (!userId) return res.status(401).json({ error: "Not authenticated" });

        if (!title || !mode) {
            return res.status(400).json({ error: "Missing required fields: title or mode" });
        }

        const newSurvey = await createSurvey({
            title,
            description: description || "",
            mode: mode === "adaptiv" ? "ADAPTIV" : "DESIGN",
            createdById: userId,
            updatedById: userId,
            instances: instances?.map(i => ({
                name: i.name,
                validFrom: new Date(i.validFrom),
                validTo: new Date(i.validTo),
            })) || [],
        });

        res.status(201).json(newSurvey);
    } catch (err) {
        console.error("Error creating survey:", err);
        res.status(500).json({ error: "Failed to create survey" });
    }
};

/**
 * Get all surveys
 */
export const getAllSurveysHandler = async (_req: Request, res: Response) => {
    try {
        const surveys = await getAllSurveys();
        res.json(surveys);
    } catch (err) {
        console.error("Error fetching surveys:", err);
        res.status(500).json({ error: "Failed to fetch surveys" });
    }
};

/**
 * Get one survey by ID
 */
export const getSurveyByIdHandler = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const survey = await getSurveyById(id);
        if (!survey) return res.status(404).json({ error: "Survey not found" });
        res.json(survey);
    } catch (err) {
        console.error("Error fetching survey:", err);
        res.status(500).json({ error: "Failed to fetch survey" });
    }
};

/**
 * Update survey by ID
 */
export const updateSurveyHandler = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const userId = Number((req as any).user?.id);
        if (!userId) return res.status(401).json({ error: "Not authenticated" });

        const { title, description, mode, status } = req.body;

        const updatePayload: any = { updatedById: userId };
        if (title) updatePayload.title = title;
        if (description !== undefined) updatePayload.description = description;
        if (mode) updatePayload.mode = mode === "adaptiv" ? "ADAPTIV" : "DESIGN";
        if (status) updatePayload.status = status;

        const updatedSurvey = await updateSurveyById(id, updatePayload);

        res.json(updatedSurvey);
    } catch (err) {
        console.error("Error updating survey:", err);
        res.status(500).json({ error: "Failed to update survey" });
    }
};

/**
 * Delete survey by ID
 */
export const deleteSurveyHandler = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        await deleteSurveyById(id);
        res.json({ success: true });
    } catch (err) {
        console.error("Error deleting survey:", err);
        res.status(500).json({ error: "Failed to delete survey" });
    }
};

/**
 * Create a new survey instance
 */
export const createSurveyInstanceHandler = async (req: Request, res: Response) => {
    try {
        const surveyId = Number(req.params.surveyId);
        if (!surveyId) return res.status(400).json({ error: "Invalid survey ID" });
        const userId = Number((req as any).user?.id);
        if (!userId) return res.status(401).json({ error: "Not authenticated" });
        const { name, validFrom, validTo } = req.body;
        if (!name || !validFrom || !validTo) {
            return res.status(400).json({ error: "Missing required fields: name, validFrom, validTo" });
        }
        const instance = await createSurveyInstance({
            surveyId,
            name,
            validFrom: new Date(validFrom),
            validTo: new Date(validTo),
            createdById: userId,
            updatedById: userId,
        });

        res.status(201).json(instance);
    } catch (err) {
        console.error("Error creating survey instance:", err);
        res.status(500).json({ error: "Failed to create survey instance" });
    }
};

/**
 * Get all instances for a survey
 */
export const getSurveyInstancesHandler = async (req: Request, res: Response) => {
    try {
        const surveyId = Number(req.params.surveyId);
        const instances = await getSurveyInstances(surveyId);
        res.json(instances);
    } catch (err) {
        console.error("Error fetching survey instances:", err);
        res.status(500).json({ error: "Failed to fetch survey instances" });
    }
};

/**
 * Update survey instance
 */
export const updateSurveyInstanceHandler = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const userId = Number((req as any).user?.id);
        if (!userId) return res.status(401).json({ error: "Not authenticated" });

        const { name, validFrom, validTo } = req.body;

        // Only pass existing fields
        const updatePayload: any = { updatedById: userId };
        if (name) updatePayload.name = name;
        if (validFrom) updatePayload.validFrom = new Date(validFrom);
        if (validTo) updatePayload.validTo = new Date(validTo);

        const updated = await updateSurveyInstanceById(id, updatePayload);

        res.json(updated);
    } catch (err) {
        console.error("Error updating survey instance:", err);
        res.status(500).json({ error: "Failed to update survey instance" });
    }
};

/**
 * Delete survey instance
 */
export const deleteSurveyInstanceHandler = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        await deleteSurveyInstanceById(id);
        res.json({ success: true });
    } catch (err) {
        console.error("Error deleting survey instance:", err);
        res.status(500).json({ error: "Failed to delete survey instance" });
    }
};

export const uploadSurveyExcelsHandler = async (req: Request, res: Response) => {
    try {
        const surveyId = Number(req.params.id);
        if (!surveyId) return res.status(400).json({ error: "Invalid survey ID" });

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        const slotQuestionFile = files.slotQuestionFile?.[0];
        const bookletSlotFile = files.bookletSlotFile?.[0];

        if (!slotQuestionFile || !bookletSlotFile) {
            return res.status(400).json({ error: "Both files are required" });
        }

        if (!slotQuestionFile || !bookletSlotFile) {
            return res.status(400).json({ error: "Both files are required" });
        }
        const createdBy = Number((req as any).user?.id);
        if (!createdBy) {
            return res.status(401).json({ error: "Unauthorized: user not found in token" });
        }
        await processSurveyExcels(surveyId, slotQuestionFile, bookletSlotFile, createdBy);

        res.status(200).json({ message: "Files uploaded and processed successfully" });
    } catch (err) {
        console.error("Error uploading survey Excels:", err);
        res.status(500).json({ error: "Failed to upload Excel files", err });
    }
};

export const getSurveyBookletsHandler = async (req: Request, res: Response) => {
    try {
        const surveyId = Number(req.params.id);
        if (!surveyId) return res.status(400).json({ error: "Invalid survey ID" });

        const booklets = await getBookletsBySurveyId(surveyId);
        res.status(200).json(booklets);
    } catch (err) {
        console.error("Error fetching booklets:", err);
        res.status(500).json({ error: "Failed to fetch booklets" });
    }
};
