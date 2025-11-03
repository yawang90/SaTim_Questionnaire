import prisma from "../config/prismaClient.js";
import { type survey, survey_mode, type surveyInstance } from "@prisma/client";

/**
 * Interface for creating a new survey
 */
interface CreateSurveyInput {
    title: string;
    description?: string;
    mode: survey_mode;
    createdById: number;
    updatedById: number;
    instances?: {
        name: string;
        validFrom: Date;
        validTo: Date;
    }[];
}

/**
 * Interface for updating a survey
 */
interface UpdateSurveyInput {
    title?: string;
    description?: string;
    mode?: survey_mode;
    updatedById: number;
}


/**
 * Create a new survey instance for an existing survey
 */
interface CreateSurveyInstanceInput {
    surveyId: number;
    name: string;
    validFrom: Date;
    validTo: Date;
    createdById: number;
    updatedById: number;
}

/**
 * Interface for updating a survey instance
 */
interface UpdateSurveyInstanceInput {
    name?: string;
    validFrom?: Date;
    validTo?: Date;
    updatedById: number;
}

/**
 * Create a new survey and optionally its instances
 */
export const createSurvey = async (data: CreateSurveyInput): Promise<survey> => {
    const createData: any = {
        title: data.title,
        mode: data.mode,
        createdById: data.createdById,
        updatedById: data.updatedById,
    };

    if (data.description !== undefined) createData.description = data.description;

    if (data.instances && data.instances.length > 0) {
        createData.instances = {
            create: data.instances.map((inst) => ({
                name: inst.name,
                validFrom: inst.validFrom,
                validTo: inst.validTo,
                createdById: data.createdById,
                updatedById: data.updatedById,
            })),
        };
    }

    return prisma.survey.create({
        data: createData,
        include: { instances: true },
    });
};


/**
 * Get all surveys
 */
export const getAllSurveys = async (): Promise<survey[]> => {
    return prisma.survey.findMany({
        include: {
            createdBy: { select: { id: true, first_name: true, last_name: true } },
            updatedBy: { select: { id: true, first_name: true, last_name: true } },
            instances: true,
        },
        orderBy: { createdAt: "desc" },
    });
};

/**
 * Get a single survey by ID
 */
export const getSurveyById = async (id: number): Promise<survey | null> => {
    return prisma.survey.findUnique({
        where: { id },
        include: {
            createdBy: { select: { id: true, first_name: true, last_name: true } },
            updatedBy: { select: { id: true, first_name: true, last_name: true } },
            instances: true,
        },
    });
};

/**
 * Update an existing survey by ID
 */
export const updateSurveyById = async (id: number, data: UpdateSurveyInput): Promise<survey> => {
    const updateData: any = { updatedById: data.updatedById };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.mode !== undefined) updateData.mode = data.mode;

    return prisma.survey.update({
        where: { id },
        data: updateData,
        include: { instances: true },
    });
};


/**
 * Delete a survey by ID
 */
export const deleteSurveyById = async (id: number): Promise<survey> => {
    return prisma.survey.delete({
        where: { id },
    });
};

export const createSurveyInstance = async (data: CreateSurveyInstanceInput): Promise<surveyInstance> => {
    return prisma.surveyInstance.create({
        data: {
            surveyId: data.surveyId,
            name: data.name,
            validFrom: data.validFrom,
            validTo: data.validTo,
            createdById: data.createdById,
            updatedById: data.updatedById,
        },
    });
};

/**
 * Get all instances for a given survey
 */
export const getSurveyInstances = async (surveyId: number): Promise<surveyInstance[]> => {
    return prisma.surveyInstance.findMany({
        where: { surveyId },
        orderBy: { createdAt: "desc" },
        include: {
            createdBy: { select: { id: true, first_name: true, last_name: true } },
            updatedBy: { select: { id: true, first_name: true, last_name: true } },
        },
    });
};

/**
 * Update a specific survey instance
 */
export const updateSurveyInstanceById = async (
    id: number,
    data: UpdateSurveyInstanceInput
): Promise<surveyInstance> => {
    return prisma.surveyInstance.update({
        where: { id },
        data,
    });
};

/**
 * Delete a survey instance by ID
 */
export const deleteSurveyInstanceById = async (id: number): Promise<surveyInstance> => {
    return prisma.surveyInstance.delete({
        where: { id },
    });
};
