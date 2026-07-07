import prisma from "../config/prismaClient.js";
import bcrypt from "bcrypt";

const saltRounds = 10;

interface RegisterTeacherInput {
    token?: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    schoolName: string;
    schoolAddress: string;
}

export const getTeachersService = async () => {
    return prisma.teacher.findMany({
        select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            school_name: true,
            school_address: true,
            createdAt: true,
        },
        orderBy: {
            last_name: "asc",
        },
    });
};

export const registerTeacherService = async ({firstName, lastName, email, password, schoolName, schoolAddress,}: RegisterTeacherInput) => {
    const existingTeacher = await prisma.teacher.findUnique({where: {email,},});

    if (existingTeacher) {
        throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return prisma.teacher.create({
        data: {
            first_name: firstName,
            last_name: lastName,
            email,
            password: hashedPassword,
            school_name: schoolName,
            school_address: schoolAddress,
        },
        select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            school_name: true,
            school_address: true,
            createdAt: true,
        },
    });
};

export const loginTeacherService = async (email: string) => {
    return prisma.teacher.findUnique({
        where: {
            email,
        },
    });
};