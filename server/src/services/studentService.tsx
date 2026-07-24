import prisma from "../config/prismaClient.js";
import bcrypt from "bcrypt";

const saltRounds = 10;

interface RegisterStudentInput {
    email: string;
    password: string;
    birthday: string;
    registrationToken: string;
}

export const getStudentsService = async () => {

    return prisma.student.findMany({
        select: {
            id: true,
            birthday: true,
            email: true,
            createdAt: true,
            classId: true,
        }
    });
};

export const registerStudentService = async ({email, password, birthday, registrationToken,}: RegisterStudentInput) => {

    const existing = await prisma.student.findFirst({
        where: {
            email,
        },
    });

    if (existing) {
        throw new Error("Email already exists");
    }

    const schoolClass = await prisma.schoolClass.findUnique({
        where: {
            registrationToken,
        },
    });

    if (!schoolClass) {
        throw new Error("Invalid registration token");
    }

    const hashedPassword = await bcrypt.hash(
        password,
        saltRounds
    );

    return prisma.student.create({
        data: {
            birthday: new Date(birthday),
            email,
            password: hashedPassword,
            classId: schoolClass.id,
        },
        select: {
            id: true,
            email: true,
            birthday: true,
        },
    });
};

export const loginStudentService = async (
    email: string
) => {

    return prisma.student.findFirst({
        where: {
            email,
        },
    });
};