import type {Request, Response} from 'express';
import {
    findMetadataById,
    getQuestionsByGroupId,
    saveImage,
    saveMetadata,
    updateMetadataById
} from "../services/editorService.js";

interface FieldInput {
    key: string;
    value?: any;
    optionsValue?: Record<string, boolean>;
}

interface QuestionFormInput {
    formData: FieldInput[];
    group_id: number;
}

export const uploadImage = (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    try {
        const imageUrl = saveImage(req.file);
        res.status(201).json({ url: imageUrl });
    } catch (err) {
        console.error("Image upload error:", err);
        res.status(500).json({ error: "Failed to upload image" });
    }
};

export const createQuestionsForm = async (req: Request, res: Response) => {
    try {
        const { formData, group_id } = req.body as QuestionFormInput;

        if (!formData || !Array.isArray(formData)) {
            return res.status(400).json({ error: "Invalid form data" });
        }
        const userId = Number((req as any).user?.id);
        if (!userId) return res.status(401).json({ error: "Not authenticated" });

        const newQuestion = await saveMetadata({metadata: formData, createdById: userId, updatedById: userId, group_id,});

        res.status(201).json(newQuestion);
    } catch (err) {
        console.error("Error creating metadata:", err);
        res.status(500).json({ error: "Failed to save metadata" });
    }
};

export const getQuestionFormById = async  (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const entry = await findMetadataById(id);

        if (!entry) return res.status(404).json({ error: "Not found" });
        res.json(entry);
    } catch (err) {
        console.error("Error fetching metadata:", err);
        res.status(500).json({ error: "Failed to load metadata" });
    }
};

export const updateQuestionForm = async  (req: Request, res: Response)  => {
    try {
        const id = Number(req.params.id);
        const updated = await updateMetadataById(id, req.body);
        res.json(updated);
    } catch (err) {
        console.error("Error updating metadata:", err);
        res.status(500).json({ error: "Failed to update metadata" });
    }
};

export const loadAllQuestions = async (req: Request, res: Response) => {
    try {
        const groupId = Number(req.params.groupId);
        if (!groupId) {
            return res.status(400).json({ error: "Missing groupId parameter" });
        }

        const questions = await getQuestionsByGroupId(groupId);
        res.json(questions);
    } catch (err) {
        console.error("Error loading questions:", err);
        res.status(500).json({ error: "Failed to load questions" });
    }
};