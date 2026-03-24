import prisma from "../config/prismaClient.js";
import {question_status, type survey, survey_mode, survey_status, type surveyInstance} from "@prisma/client";
import XLSX from "xlsx";
import {evaluateAnswersService, type UserAnswerInput} from "./solverService.js";

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
    isTwoTier: boolean;
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
        isTwoTier: data.isTwoTier
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
    const result = await prisma.booklet.aggregate({
        where: { surveyId },
        _max: { version: true },
    });

    const maxVersion = result._max.version ?? 0;
    if (maxVersion === 0) return [];

    return prisma.booklet.findMany({
        where: { surveyId, version: maxVersion },
        include: {
            bookletQuestion: {
                include: { question: true },
                orderBy: { position: "asc" },
            },
        },
        orderBy: { bookletId: "asc" },
    });
};

/**
 * Process uploaded survey Excel files
 * Creates new booklets or updates existing ones
 */
export const processSurveyExcels = async (surveyId: number, slotQuestionFile: Express.Multer.File, bookletSlotFile: Express.Multer.File, createdById: number) => {
    const slotToQuestionMap = readSlotToQuestionExcel(slotQuestionFile);
    const bookletMap = readBookletToSlotExcel(bookletSlotFile, slotToQuestionMap);
    const errors: any[] = [];
    for (const [bookletName, questionIdsRaw] of Object.entries(bookletMap)) {
        const bookletId = parseInt(bookletName.replace(/\D/g, "")) || 0;
        const questionIds = [...new Set(questionIdsRaw)];

        const validQuestions = await prisma.question.findMany({
            where: { id: { in: questionIds } },
            select: { id: true, status: true },
        });
        const validIds = validQuestions.map(q => q.id);
        const unfinishedIds = validQuestions.filter(q => q.status !== question_status.FINISHED).map(q => q.id);
        const missing = questionIds.filter(id => !validIds.includes(id));
//TODO enable again if (missing.length > 0 || unfinishedIds.length > 0) {
        if (missing.length > 0) {
            errors.push({
                bookletId,
                missingQuestionIds: missing,
                unfinishedQuestionIds: unfinishedIds
            });
        }
    }

    if (errors.length > 0) {
        const error: any = new Error("Excel validation failed");
        error.statusCode = 400;
        error.details = errors;
        throw error;
    }

    return prisma.$transaction(async (tx) => {
        const updatedSurvey = await tx.survey.update({
            where: { id: surveyId },
            data: { bookletVersion: { increment: 1 } },
            select: { bookletVersion: true },
        });

        for (const [bookletName, questionIdsRaw] of Object.entries(bookletMap)) {
            const bookletId = parseInt(bookletName.replace(/\D/g, "")) || 0;
            const questionIds = [...new Set(questionIdsRaw)];
            if (!questionIds.length) continue;
            const newBooklet = await tx.booklet.create({
                data: {
                    bookletId,
                    surveyId,
                    excelFileUrl: "",
                    createdById,
                    version: updatedSurvey.bookletVersion,
                },
            });

            const bookletQuestionData = questionIds.map((questionId, index) => ({
                bookletId: newBooklet.id,
                questionId,
                position: index + 1,
            }));

            await tx.bookletQuestion.createMany({
                data: bookletQuestionData,
            });
        }
        return tx.survey.update({
            where: { id: surveyId },
            data: {
                bookletMappingExcelUrl: "",
                status: survey_status.PREPARED,
            },
        });
    });
};

/**
 * Export survey answers for selected instances, including question scores
 */
/**
 * Export survey answers for selected instances, including question scores
 */
export const getSurveyExport = async (surveyId: number, instanceIds: number[]): Promise<Buffer> => {
    const survey = await prisma.survey.findUnique({
        where: { id: surveyId },
        include: {
            booklet: {
                include: {
                    bookletQuestion: true
                }
            }
        }
    });
    if (!survey) throw new Error("Survey not found");
    const allBookletQuestions = survey.booklet.flatMap(b => b.bookletQuestion ?? []);
    const allQuestionIds = Array.from(new Set(allBookletQuestions.map(q => q.questionId)));
    const instances = await prisma.surveyInstance.findMany({
        where: { id: { in: instanceIds }, surveyId }
    });
    if (!instances.length) {
        throw new Error("No valid instances found");
    }
    const answers = await prisma.answer.findMany({
        where: { surveyId, instanceId: { in: instanceIds } },
        include: {
            questionsAnswers: true,
            booklet: {
                include: {
                    bookletQuestion: true
                }
            }
        }
    });
    const rows: any[] = [];
    for (const answer of answers) {
        const instance = instances.find(i => i.id === answer.instanceId);
        if (!instance) continue;
        const qaMap = new Map<number, typeof answer.questionsAnswers[0]>();
        for (const qa of answer.questionsAnswers) {
            qaMap.set(qa.questionId, qa);
        }
        const bookletQuestionSet = new Set(
            answer.booklet.bookletQuestion.map(bq => bq.questionId)
        );
        const bookletPositionMap = new Map<number, number>();
        for (const bq of answer.booklet.bookletQuestion) {
            bookletPositionMap.set(bq.questionId, bq.position);
        }
        const earliestStart = answer.questionsAnswers
            .map(qA => qA.solvingTimeStart)
            .filter(Boolean)
            .map(date => new Date(date).getTime())
            .reduce((min, ts) => Math.min(min, ts), Infinity);
        const earliestStartDate = earliestStart !== Infinity ? formatSwissDate(new Date(earliestStart).toISOString()) : null;

        const row: any = {
            SchuelerID_System: answer.userId,
            GruppenID_ausLink: instance.id,
            GruppenBezeichnung: instance.name,
            Booklet_ID: answer.booklet.bookletId,
            Booklet_Version: answer.booklet.version,
            Freier_Parameter: answer.freeParam,
            Erhebung_StartedAt: earliestStartDate,
            Erhebung_EndedAt: answer.endedAt
        };
        for (const questionId of allQuestionIds) {
            if (!bookletQuestionSet.has(questionId)) {
                row[`Aufgabe_${questionId}_SystemID`] = "";
                row[`Aufgabe_${questionId}_Position`] = "";
                row[`Aufgabe_${questionId}_RawResponse`] = "";
                row[`Aufgabe_${questionId}_Score`] = "";
                row[`Aufgabe_${questionId}_StartedAt`] = "";
                row[`Aufgabe_${questionId}_FinishedAt`] = "";
                row[`Aufgabe_${questionId}_Zeit_MS`] = "";
                row[`Aufgabe_${questionId}_Skipped`] = "";
                continue;
            }
            const qa = qaMap.get(questionId);
            if (!qa) {
                row[`Aufgabe_${questionId}_SystemID`] = questionId;
                row[`Aufgabe_${questionId}_Position`] = bookletPositionMap.get(questionId) ?? "";
                row[`Aufgabe_${questionId}_RawResponse`] = "";
                row[`Aufgabe_${questionId}_Score`] = "";
                row[`Aufgabe_${questionId}_StartedAt`] = "";
                row[`Aufgabe_${questionId}_FinishedAt`] = "";
                row[`Aufgabe_${questionId}_Zeit_MS`] = "";
                row[`Aufgabe_${questionId}_Skipped`] = "";
                continue;
            }
            const answerArray = Array.isArray(qa.answerJson) ? qa.answerJson as any[] : [];
            const userAnswerInput: UserAnswerInput[] = answerArray.map(a => ({key: a.key, value: a.value, m: a.m, c: a.c}));
            const result = await evaluateAnswersService(questionId, userAnswerInput);
            row[`Aufgabe_${questionId}_SystemID`] = qa.questionId;
            row[`Aufgabe_${questionId}_Position`] = bookletPositionMap.get(questionId) ?? "";
            row[`Aufgabe_${questionId}_RawResponse`] = JSON.stringify(qa.answerJson ?? []);
            row[`Aufgabe_${questionId}_Score`] = result?.score ?? "";
            row[`Aufgabe_${questionId}_StartedAt`] = qa.solvingTimeStart ? formatSwissDate(qa.solvingTimeStart.toISOString()) : "";
            row[`Aufgabe_${questionId}_FinishedAt`] = qa.solvingTimeEnd ? formatSwissDate(qa.solvingTimeEnd.toISOString()) : "";
            row[`Aufgabe_${questionId}_Zeit_MS`] = qa.solvedTime ?? "";
            row[`Aufgabe_${questionId}_Skipped`] = qa.skipped ?? "";
        }
        rows.push(row);
    }
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "SurveyAnswers");
    return XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx"
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
    for (let rawRow of slotQuestionData) {
        const row = Object.fromEntries(
            Object.entries(rawRow).filter(
                ([key, value]) => !key.startsWith("__EMPTY") && value !== ""
            )
        );
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
    const workbook = XLSX.read(bookletSlotFile.buffer, { type: "buffer" });

    if (workbook.SheetNames.length === 0) {
        throw new Error("Booklet-Slot Excel file has no sheets");
    }
    const sheet = workbook.Sheets[workbook.SheetNames[0]!];
    if (!sheet) {
        throw new Error(`Sheet "${workbook.SheetNames[0]}" not found`);
    }
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {header: 1, defval: "",});
    if (rows.length === 0) {
        throw new Error("Booklet-Slot Excel file is empty");
    }
    if (!rows.length || !rows[0]) {
        throw new Error("Booklet-Slot Excel file has no rows or header row is empty");
    }
    const headerRow = rows[0];
    const bookletMap: Record<string, number[]> = {};
    for (let col = 0; col < headerRow.length; col++) {
        const bookletName = headerRow[col]?.trim();
        if (!bookletName) continue;
        bookletMap[bookletName] = [];

        for (let row = 1; row < rows.length; row++) {
            const slotCode = rows[row]?.[col]?.toString().trim();
            if (!slotCode) continue;
            const questionId = slotToQuestionMap[slotCode];
            if (questionId === undefined) {
                throw new Error(
                    `Slot code "${slotCode}" in booklet "${bookletName}" does not exist in Slot-Question mapping`
                );
            }
            bookletMap[bookletName].push(questionId);
        }
        if (bookletMap[bookletName].length === 0) {
            throw new Error(`Booklet "${bookletName}" has no slot codes`);
        }
    }
    return bookletMap;
}

function formatSwissDate(isoString: string | Date | null | undefined): string {
    if (!isoString) return "";

    const date = typeof isoString === "string" ? new Date(isoString) : isoString;
    return date.toLocaleString("de-CH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    }).replace(",", "");
}
