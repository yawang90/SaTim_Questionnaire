import prisma from "../config/prismaClient.js";
import {type survey, survey_mode, survey_status, type surveyInstance} from "@prisma/client";
import XLSX from "xlsx";

/**
 * Interface for creating a new survey
 */
interface CreateSurveyInput {
    title: string;
    description?: string;
    mode: survey_mode;
    createdById: number;
    updatedById: number;
    status?: survey_status;
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
    status?: survey_status;
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
 * Create a new survey
 */
export const createSurvey = async (data: CreateSurveyInput): Promise<survey> => {
    const createData: any = {
        title: data.title,
        mode: data.mode,
        status: data.status ?? "IN_PROGRESS",
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
export const getSurveyById = async (id: number) => {
    const survey = await prisma.survey.findUnique({
        where: { id },
        include: {
            createdBy: { select: { id: true, first_name: true, last_name: true } },
            updatedBy: { select: { id: true, first_name: true, last_name: true } },
            instances: true,
            booklet: {
                orderBy: { bookletId: "asc" },
            },
        },
    });

    if (!survey) throw new Error("Survey not found");

    const now = new Date();
    const hasActiveInstance = survey.instances?.some(
        inst => new Date(inst.validFrom) <= now && now <= new Date(inst.validTo)
    ) ?? false;

    const hasBooklet = (survey.booklet?.length ?? 0) > 0;

    return {
        ...survey,
        hasActiveInstance,
        booklet: survey.booklet ?? [],
        hasBooklet,
    };
};

/**
 * Update an existing survey by ID
 */
export const updateSurveyById = async (id: number, data: UpdateSurveyInput): Promise<survey> => {
    const updateData: any = { updatedById: data.updatedById };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.mode !== undefined) updateData.mode = data.mode;
    if (data.status !== undefined) updateData.status = data.status;

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
    const survey = await prisma.survey.findUnique({
        where: { id: data.surveyId },
        select: { bookletVersion: true }
    });

    if (!survey) {
        throw new Error("Survey not found");
    }

    return prisma.surveyInstance.create({
        data: {
            surveyId: data.surveyId,
            name: data.name,
            validFrom: data.validFrom,
            validTo: data.validTo,
            createdById: data.createdById,
            updatedById: data.updatedById,
            bookletVersion: survey.bookletVersion,
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

/**
 * Get all booklets for a survey
 */
export const getBookletsBySurveyId = async (surveyId: number) => {
    return prisma.booklet.findMany({
        where: { surveyId },
        include: {
            questions: true,
        },
        orderBy: { bookletId: "asc" },
    });
};

/**
 * Process uploaded survey Excel files
 * Creates new booklets or updates existing ones
 */
export const processSurveyExcels = async (
    surveyId: number,
    slotQuestionFile: Express.Multer.File,
    bookletSlotFile: Express.Multer.File,
    createdById: number
) => {
    const slotToQuestionMap = readSlotToQuestionExcel(slotQuestionFile);
    const bookletMap = readBookletToSlotExcel(bookletSlotFile, slotToQuestionMap);

    await prisma.booklet.deleteMany({
        where: { surveyId },
    });
    const updatedSurvey = await prisma.survey.update({
        where: { id: surveyId },
        data: { bookletVersion: { increment: 1 } },
        select: { bookletVersion: true }
    });

    for (const [bookletName, questionIds] of Object.entries(bookletMap)) {
        const bookletId = parseInt(bookletName.replace(/\D/g, "")) || 0;

        const validQuestions = await prisma.question.findMany({
            where: { id: { in: questionIds } },
            select: { id: true },
        });
        const validQuestionIds = validQuestions.map(q => q.id);

        if (validQuestionIds.length !== questionIds.length) {
            throw new Error("Some question IDs do not exist");
        }
        await prisma.booklet.create({
            data: {
                bookletId,
                surveyId,
                questions: {
                    connect: validQuestionIds.map(id => ({ id })),
                },
                excelFileUrl: "",
                createdById,
                version: updatedSurvey.bookletVersion,
            },
        });
    }
    return prisma.survey.update({
        where: { id: surveyId },
        data: {
            bookletMappingExcelUrl: "",
            status: survey_status.PREPARED,
        },
    });
};

function readSlotToQuestionExcel(slotQuestionFile: Express.Multer.File) {
    const slotQuestionWorkbook = XLSX.read(slotQuestionFile.buffer, {type: "buffer"});

    if (slotQuestionWorkbook.SheetNames.length === 0) {
        throw new Error("Slot-Question Excel file has no sheets");
    }
    const slotQuestionSheetName = slotQuestionWorkbook.SheetNames[0]!;
    const slotQuestionSheet = slotQuestionWorkbook.Sheets[slotQuestionSheetName];
    if (!slotQuestionSheet) {
        throw new Error(`Sheet "${slotQuestionSheetName}" not found in Slot-Question Excel file`);
    }
    const slotQuestionData = XLSX.utils.sheet_to_json<Record<string, string>>(slotQuestionSheet, {defval: ""});
    const slotToQuestionMap: Record<string, number> = {};
    for (const row of slotQuestionData) {
        const keys = Object.keys(row);
        if (keys.length !== 2) {
            throw new Error(`Expected 2 columns per row, found ${keys.length}: ${JSON.stringify(row)}`);
        }

        const [questionIdCol, slotCodeCol] = keys as [string, string];
        const questionId = Number(row[questionIdCol]);
        const slotCode = row[slotCodeCol]?.toString().trim();

        if (isNaN(questionId)) throw new Error(`Invalid question ID "${row[questionIdCol]}" in row: ${JSON.stringify(row)}`);
        if (!slotCode) throw new Error(`Empty slot code for question ID "${questionId}" in row: ${JSON.stringify(row)}`);

        if (slotToQuestionMap[slotCode]) {
            throw new Error(`Duplicate slot code "${slotCode}" found in Slot-Question Excel`);
        }
        slotToQuestionMap[slotCode] = questionId;
    }
    return slotToQuestionMap;
}

function readBookletToSlotExcel(bookletSlotFile: Express.Multer.File, slotToQuestionMap: Record<string, number>) {
    const bookletSlotWorkbook = XLSX.read(bookletSlotFile.buffer, {type: "buffer"});
    if (bookletSlotWorkbook.SheetNames.length === 0) {
        throw new Error("Booklet-Slot Excel file has no sheets");
    }
    const bookletSlotSheetName = bookletSlotWorkbook.SheetNames[0]!;
    const bookletSlotSheet = bookletSlotWorkbook.Sheets[bookletSlotSheetName];
    if (!bookletSlotSheet) {
        throw new Error(`Sheet "${bookletSlotSheetName}" not found in Booklet-Slot Excel file`);
    }
    const bookletSlotData = XLSX.utils.sheet_to_json<Record<string, string>>(bookletSlotSheet, {defval: ""});

    const bookletMap: Record<string, number[]> = {};
    for (const row of bookletSlotData) {
        for (const [bookletNameRaw, slotCodeRaw] of Object.entries(row)) {
            const bookletName = bookletNameRaw.trim();
            const slotCode = slotCodeRaw?.toString().trim();

            if (!bookletName) throw new Error(`Empty booklet name found in row: ${JSON.stringify(row)}`);
            if (!slotCode) throw new Error(`Empty slot code in booklet "${bookletName}" for row: ${JSON.stringify(row)}`);

            const questionId = slotToQuestionMap[slotCode];
            if (questionId === undefined) throw new Error(`Slot code "${slotCode}" in booklet "${bookletName}" does not exist in Slot-Question mapping`);

            if (!bookletMap[bookletName]) bookletMap[bookletName] = [];
            bookletMap[bookletName].push(questionId);
        }
    }
    return bookletMap;
}