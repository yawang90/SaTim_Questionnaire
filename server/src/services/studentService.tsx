import prisma from "../config/prismaClient.js";
import bcrypt from "bcrypt";

const saltRounds = 10;

interface RegisterStudentInput {
    email: string;
    password: string;
    birthday: string;
    registrationToken: string;
}

export const getStudentsService = async (
    classId: number
) => {
    return prisma.student.findMany({
        where: {
            classId,
        },
        select: {
            id: true,
            birthday: true,
            email: true,
            createdAt: true,
            classId: true,
        },
        orderBy: {
            createdAt: "desc",
        },
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

export const getStudentService = async (
    studentId: number
) => {
    return prisma.student.findUnique({
        where: {
            id: studentId,
        },
        select: {
            id: true,
            email: true,
            birthday: true,
        },
    });
};


export const getAssignedTestsService = async (studentId: number) => {
    const student = await prisma.student.findUnique({
        where: {
            id: studentId,
        },
        select: {
            id: true,
            classId: true,
        },
    });

    if (!student) {
        throw new Error("Student not found");
    }

    if (!student.classId) {
        return [];
    }

    const now = new Date();

    const classTests = await prisma.classTestInstance.findMany({
        where: {
            classId: student.classId,
            active: true,
            survey: {
                teacherAssigned: true,
            }
        },
        include: {
            survey: {
                select: {
                    id: true,
                    title: true,
                    description: true,
                    mode: true,

                    instances: {
                        where: {
                            validTo: {
                                gte: now,
                            },
                        },
                        orderBy: {
                            validFrom: "asc",
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return classTests.flatMap((classTest) =>
        classTest.survey.instances.map((instance) => {
            let status: "OPEN" | "UPCOMING" | "FINISHED";

            if (now < instance.validFrom) {
                status = "UPCOMING";
            } else if (now > instance.validTo) {
                status = "FINISHED";
            } else {
                status = "OPEN";
            }

            return {
                id: classTest.id,
                instanceId: instance.id,

                surveyId: classTest.surveyId,
                classId: classTest.classId,

                title: classTest.survey.title,
                description: classTest.survey.description,
                mode: classTest.survey.mode,

                name: instance.name,

                validFrom: instance.validFrom,
                validTo: instance.validTo,

                status,
            };
        })
    );
};