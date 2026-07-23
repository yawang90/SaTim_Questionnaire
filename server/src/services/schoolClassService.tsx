import prisma from "../config/prismaClient.js";
import type { ClassTypes } from "../controllers/schoolClassController.js";
import {getUserTeam} from "./teamServices.js";

export const getClassesService = async (teacherId: number) => {
    return prisma.schoolClass.findMany({
        where: {
            teacherId,
        },
        include: {
            _count: {
                select: {
                    sus: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};

export const createClassService = async (
    teacherId: number,
    {
        name,
        type,
    }: ClassTypes
) => {
    return prisma.schoolClass.create({
        data: {
            name,
            type,
            teacherId,
        },
        include: {
            _count: {
                select: {
                    sus: true,
                },
            },
        },
    });
};

export const updateClassService = async (
    teacherId: number,
    classId: number,
    {
        name,
        type,
    }: ClassTypes
) => {
    const schoolClass = await prisma.schoolClass.findFirst({
        where: {
            id: classId,
            teacherId,
        },
    });

    if (!schoolClass) {
        throw new Error("Class not found");
    }

    return prisma.schoolClass.update({
        where: {
            id: classId,
        },
        data: {
            name,
            type,
        },
        include: {
            _count: {
                select: {
                    sus: true,
                },
            },
        },
    });
};

export const deleteClassService = async (
    teacherId: number,
    classId: number
) => {
    const schoolClass = await prisma.schoolClass.findFirst({
        where: {
            id: classId,
            teacherId,
        },
    });

    if (!schoolClass) {
        throw new Error("Class not found");
    }

    return prisma.schoolClass.delete({
        where: {
            id: classId,
        },
    });
};

export const getClassService = async (
    teacherId: number,
    classId: number
) => {
    return prisma.schoolClass.findFirst({
        where: {
            id: classId,
            teacherId,
        },
        include: {
            sus: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    email: true,
                    birthday: true,
                    externalId: true,
                    createdAt: true,
                },
                orderBy: {
                    last_name: "asc",
                },
            },
        },
    });
};


export const ensureTeacherBelongsToUserTeam = async (
    userId: number,
    teacherId: number
): Promise<void> => {
    const userTeamId = await getUserTeam(userId);
    const teacher = await prisma.teacher.findUnique({
        where: {
            id: teacherId,
        },
        select: {
            teamId: true,
        },
    });

    if (!teacher) {
        throw new Error("Teacher not found");
    }

    if (teacher.teamId !== userTeamId) {
        throw new Error("Access denied");
    }
};