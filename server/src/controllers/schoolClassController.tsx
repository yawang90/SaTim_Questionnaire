import type { Request, Response } from "express";

import {
    getClassesService,
    createClassService,
    updateClassService,
    deleteClassService, getClassService,
} from "../services/schoolClassService.js";

export interface ClassTypes {
    name: string;
    type:
        | "KANTI_KURZ_1"
        | "KANTI_KURZ_2"
        | "KANTI_LANG_1"
        | "SEK_7"
        | "SEK_8"
        | "SEK_9";
}

interface UpdateClassBody {
    name: string;
    type: ClassTypes["type"];
}

export const getClasses = async (_req: Request, res: Response) => {
    try {
        const classes = await getClassesService();

        res.json(classes);
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Server error",
        });
    }
};

export const createClass = async (
    req: Request<{}, {}, ClassTypes>,
    res: Response
) => {
    try {
        const schoolClass = await createClassService(req.body);

        res.status(201).json(schoolClass);
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Failed to create class",
        });
    }
};

export const updateClass = async (
    req: Request<{ id: string }, {}, UpdateClassBody>,
    res: Response
) => {
    try {
        const schoolClass = await updateClassService(
            Number(req.params.id),
            req.body
        );

        res.json(schoolClass);
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Failed to update class",
        });
    }
};

export const deleteClass = async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        await deleteClassService(Number(req.params.id));

        res.json({
            message: "Class deleted",
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Failed to delete class",
        });
    }
};

export const getClass = async (
    req: Request<{ id: string }>,
    res: Response
) => {
    try {
        const schoolClass = await getClassService(Number(req.params.id));

        if (!schoolClass) {
            return res.status(404).json({
                message: "Class not found",
            });
        }

        res.json(schoolClass);
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Server error",
        });
    }
};