import type {Request, Response} from "express";

import {
    createClassService,
    deleteClassService,
    ensureTeacherBelongsToUserTeam,
    getClassesService,
    getClassService,
    updateClassService,
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


export const getClasses = async (req: Request, res: Response) => {
    try {
        let teacherId: number;

        if (req.params.teacherId) {
            const userId = Number((req as any).user?.id);
            if (!userId) return res.status(401).json({ error: "Not authenticated" });
            teacherId = Number(req.params.teacherId);
            await ensureTeacherBelongsToUserTeam(userId, teacherId);
        } else {
            teacherId = req.teacherId!;
        }

        const classes = await getClassesService(teacherId);
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
        const schoolClass = await createClassService(req.teacherId!, req.body);
        res.status(201).json(schoolClass);
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Failed to create class",
        });
    }
};

export const updateClass = async (req: Request<{ id: string }, {}, UpdateClassBody>, res: Response) => {
    try {
        const schoolClass = await updateClassService(
            req.teacherId!,
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

export const deleteClass = async (req: Request<{ id: string }>, res: Response) => {
    try {
        await deleteClassService(req.teacherId!, Number(req.params.id));
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

export const getClass = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const schoolClass = await getClassService(req.teacherId!, Number(req.params.id));
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

