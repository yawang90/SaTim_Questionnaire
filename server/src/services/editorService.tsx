import fs from "fs/promises";
import prisma from "../config/prismaClient.js";
import {type question, question_status} from "@prisma/client";
import {supabase} from "../supabaseClient.js";

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

export const saveImage = async (file: Express.Multer.File): Promise<string> => {
    const safeName = file.originalname.replace(/\s+/g, "_");
    const fileName = `${Date.now()}_${safeName}`;
    const filePath = `uploads/${fileName}`;

    const fileBuffer = await fs.readFile(file.path);

    const { error } = await supabase.storage
        .from("images")
        .upload(filePath, fileBuffer, {
            contentType: file.mimetype,
        });

    await fs.unlink(file.path);

    if (error) throw new Error("Failed to upload image: " + error.message);

    const { data } = supabase.storage.from("images").getPublicUrl(filePath);
    return data.publicUrl;
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


/**
 * Update the correct answers JSON for a question
 */
export async function updateQuestionAnswersById(id: number, data: { updatedById: number; answersJson: any }) {
    return prisma.question.update({
        where: { id },
        data: {correctAnswers: data.answersJson, updatedById: data.updatedById,},
    });
}

export const updateQuestionStatusById = async (
    id: number,
    { updatedById, status }: { updatedById: number; status: 'ACTIVE' | 'FINISHED' | 'DELETED' }
) => {
    return prisma.question.update({
        where: { id },
        data: {
            status,
            updatedById,
            updatedAt: new Date(),
        },
    });
};

