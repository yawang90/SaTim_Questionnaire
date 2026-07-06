import type {Request, Response} from "express";

import {getTeachersService, registerTeacherService,} from "../services/teacherService.js";

interface RegisterTeacherBody {
    token?: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    schoolName: string;
    schoolAddress: string;
}

export const getTeachers = async (_req: Request, res: Response) => {
    try {
        const teachers = await getTeachersService();
        res.json(teachers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

export const registerTeacher = async (
    req: Request<{}, {}, RegisterTeacherBody>,
    res: Response
) => {
    try {
        const teacher = await registerTeacherService(req.body);

        res.status(201).json(teacher);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Registration failed",
        });
    }
};