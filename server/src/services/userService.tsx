import prisma from "../config/prismaClient.js";
import bcrypt from "bcrypt";

const saltRounds = 10;

interface NewUserInput {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

export const saveNewUser = async ({first_name, last_name, email, password}: NewUserInput) => {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return prisma.users.create({
        data: {
            first_name,
            last_name,
            email,
            password: hashedPassword,
            roles: ["GENERAL"],
            group_access: {
                create: [
                    {
                        group_id: 999,
                    },
                ],
            },
        },
        select: {
            id: true,
            email: true,
            group_access: true,
        },
    });
};
export const loginUserService = async (email: string) => {
    return prisma.users.findUnique({
        where: {email}
    });
};

export const findUser = async (userId: string | number) => {
    const id = typeof userId === "string" ? Number(userId) : userId;

    return prisma.users.findUnique({
        where: { id },
        select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            roles: true,
        },
    });

};

