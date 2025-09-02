import type {Request, Response} from 'express';
import { saveImage } from "../services/editorService.js";

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
