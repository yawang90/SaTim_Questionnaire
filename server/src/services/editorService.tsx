import path from "path";
import fs from "fs";
import prisma from "../config/prismaClient.js";
import {type question, question_status} from "@prisma/client";

interface SaveMetadataInput {
    metadata: Record<string, any>;
    createdById: number;
    updatedById: number;
    group_id: number;
}

const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, {recursive: true});
}

/**
 * Save uploaded image and return its public URL
 */
export const saveImage = (file: Express.Multer.File): string => {
    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    fs.renameSync(file.path, filePath);

    const baseUrl = process.env.API_URL || "http://localhost:5000";
    return `${baseUrl}/uploads/${filename}`;
};

/**
 * Create a new metadata entry
 */
export const createQuestionMeta = async (data: SaveMetadataInput): Promise<question> => {
    return prisma.question.create({
        data: {
            metadata: data,
            status: question_status.ACTIVE,
        },
    });};
/**
 * Find a metadata entry by ID
 */
export const findQuestionById = async (id: number): Promise<question | null> => {
    return prisma.question.findUnique({
        where: {id},
    });
};

/**
 * Update a metadata entry by ID
 */
export const updateQuestionMetaById = async (id: number, data: Partial<{
    metadata: any;
    createdById: number;
    updatedById: number;
}>): Promise<question> => {
    return prisma.question.update({
        where: {id},
        data,
    });
};

/**
 * Get all questions belonging to a group
 */
export const getQuestionsByGroupId = async (groupId: number) => {
    return prisma.question.findMany({
        where: {group_id: groupId},
        orderBy: {createdAt: "desc"},
        include: {
            createdBy: {
                select: {id: true, first_name: true, last_name: true, email: true},
            },
            updatedBy: {
                select: {id: true, first_name: true, last_name: true, email: true},
            },
        },
    });
}