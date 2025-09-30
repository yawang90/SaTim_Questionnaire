import path from "path";
import fs from "fs";
import prisma from "../config/prismaClient.js";
import type {question} from "@prisma/client";

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
export const saveMetadata = async (data: SaveMetadataInput): Promise<question> => {
    return prisma.question.create({ data });
};
/**
 * Find a metadata entry by ID
 */
export const findMetadataById = async (id: number): Promise<question | null> => {
    return prisma.question.findUnique({
        where: {id},
    });
};

/**
 * Update a metadata entry by ID
 */
export const updateMetadataById = async (id: number, data: Partial<{ metadata: any; createdById: number; updatedById: number; }>): Promise<question> => {
    return prisma.question.update({
        where: {id},
        data,
    });
};