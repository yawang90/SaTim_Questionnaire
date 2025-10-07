import path from "path";
import fs from "fs";
import prisma from "../config/prismaClient.js";
import {type question, question_status} from "@prisma/client";

interface CreateQuestionInput {
    metadata: Record<string, any>;
    createdById: number;
    updatedById: number;
    group_id: number;
}

interface UpdateQuestionInput {
    updatedById: number;
    contentJson: object;
    contentHtml: string | null;
}

interface UpdateMetadataInput {
    metadata: Record<string, any>;
    updatedById: number;
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
export const createQuestionMeta = async (data: CreateQuestionInput): Promise<question> => {
    return prisma.question.create({
        data: {
            metadata: data.metadata,
            createdById: data.createdById,
            updatedById: data.updatedById,
            group_id: data.group_id,
            status: question_status.ACTIVE
        },
    });
};
/**
 * Find a metadata entry by ID
 */
export const findQuestionById = async (id: number): Promise<question | null> => {
    return prisma.question.findUnique({
        where: {id},
    });
};

/**
 * Update question metadata
 */
export const updateQuestionMetaById = async (id: number, data: UpdateMetadataInput): Promise<question> => {
    return prisma.question.update({
        where: { id },
        data: {
            metadata: data.metadata,
            updatedById: data.updatedById,
        },
    });
};

/**
 * Update question content (JSON + HTML)
 */
export const updateQuestionContentById = async (id: number, data: UpdateQuestionInput): Promise<question> => {
    return prisma.question.update({
        where: { id },
        data: {
            contentJson: data.contentJson,
            contentHtml: data.contentHtml,
            updatedById: data.updatedById,
        },
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