import type { Request, Response } from "express";
import {
    getStudentsService,
    registerStudentService,
    loginStudentService, getStudentService,
} from "../services/studentService.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface RegisterStudentBody {
    email: string;
    password: string;
    birthday: string;
    registrationToken: string;
}

interface StudentLoginRequestBody {
    email: string;
    password: string;
}

export const getStudents = async (
    req: Request<{ classId: string }>,
    res: Response
) => {
    try {
        const classId = Number(req.params.classId);

        if (Number.isNaN(classId)) {
            return res.status(400).json({
                message: "Invalid class id",
            });
        }

        const students = await getStudentsService(classId);

        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Server error",
        });
    }
};

export const registerStudent = async (
    req: Request<{}, {}, RegisterStudentBody>,
    res: Response
) => {
    try {
        const student = await registerStudentService(req.body);
        const token = jwt.sign(
            {
                studentId: student.id,
                email: student.email,
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: "24h",
            }
        );

        res.status(201).json({
            token,
            studentId: student.id,
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Registration failed",
        });
    }
};

export const loginStudent = async (
    req: Request<{}, {}, StudentLoginRequestBody>,
    res: Response
) => {

    const { email, password } = req.body;
    try {
        const student = await loginStudentService(email);
        if (!student) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        const valid = await bcrypt.compare(
            password,
            student.password
        );

        if (!valid) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        const token = jwt.sign(
            {
                studentId: student.id,
                email: student.email,
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: "24h",
            }
        );

        res.json({
            token,
            studentId: student.id,
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Server error",
        });
    }
};

export const getStudent = async (req: Request, res: Response) => {
    try {
        const studentId = (req as any).studentId;
        if (!studentId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }
        const student = await getStudentService(Number(studentId));
        if (!student) {
            return res.status(404).json({
                message: "Student not found",
            });
        }
        res.json(student);
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: "Server error",
        });
    }
};