import type {Request, Response} from "express";

import {getTeachersService, loginTeacherService, registerTeacherService,} from "../services/teacherService.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface RegisterTeacherBody {
    token?: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    schoolName: string;
    schoolAddress: string;
}

interface TeacherLoginRequestBody {
    email: string;
    password: string;
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
        const token = jwt.sign(
            {
                teacherId: teacher.id,
                email: teacher.email,
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: "24h",
            }
        );

        res.status(201).json({
            token,
            teacherId: teacher.id,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Registration failed",
        });
    }
};

export const loginTeacher = async (
    req: Request<{}, {}, TeacherLoginRequestBody>,
    res: Response
) => {
    const { email, password } = req.body;
    try {
        const teacher = await loginTeacherService(email);

        if (!teacher) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        const passwordValid = await bcrypt.compare(
            password,
            teacher.password
        );

        if (!passwordValid) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET not set");
        }

        const token = jwt.sign(
            {
                teacherId: teacher.id,
                email: teacher.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h",
            }
        );

        res.status(200).json({
            token,
            teacherId: teacher.id,
        });
    } catch (err) {
        console.error("Teacher login error:", err);

        res.status(500).json({
            message: "Server error",
        });
    }
};