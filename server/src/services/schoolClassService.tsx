import prisma from "../config/prismaClient.js";
import type {ClassTypes} from "../controllers/schoolClassController.js";

export const getClassesService = async () => {
    return prisma.schoolClass.findMany({
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

export const createClassService = async ({
                                             name,
                                             type,
                                         }: ClassTypes) => {
    return prisma.schoolClass.create({
        data: {
            name,
            type,

            // TODO:
            // replace this with the logged-in teacher id
            teacherId: 1,
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
    classId: number,
    { name, type }: ClassTypes
) => {
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

export const deleteClassService = async (classId: number) => {
    return prisma.schoolClass.delete({
        where: {
            id: classId,
        },
    });
};

export const getClassService = async (classId: number) => {
    return prisma.schoolClass.findUnique({
        where: {
            id: classId,
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