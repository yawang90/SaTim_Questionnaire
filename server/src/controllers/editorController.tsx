import type {Request, Response} from 'express';
import {findMetadataById, saveImage, saveMetadata, updateMetadataById} from "../services/editorService.js";

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


export const createQuestionsForm = async  (req: Request, res: Response)  => {
    try {
        const data = await saveMetadata(req.body);
        res.json(data);
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