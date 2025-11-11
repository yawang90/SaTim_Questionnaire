import { v4 as uuidv4 } from "uuid";

export type Choice = { id: string; text: string };

export type Block =
    | { kind: "mc"; key: string; choices: Choice[] }
    | { kind: "sc"; key: string; choices: Choice[] }
    | { kind: "freeText"; key: string }
    | { kind: "freeTextInline"; key: string }
    | { kind: "numeric"; key: string }
    | { kind: "algebra"; key: string }
    | { kind: "geoGebra"; key: string };


export const mapQuestionsStatus = (status: string | null | undefined): 'in bearbeitung' | 'abgeschlossen' | 'gelöscht' => {
    switch (status) {
        case 'ACTIVE':
            return 'in bearbeitung';
        case 'FINISHED':
            return 'abgeschlossen';
        case 'DELETED':
            return 'gelöscht';
        default:
            return 'in bearbeitung';
    }
};
/**
 * Recursively extracts plain text from a TipTap JSON node.
 */
export const extractText = (node: any): string => {
    if (!node) return "";
    if (Array.isArray(node)) return node.map(extractText).join("");
    if (node.type === "text") return node.text ?? "";
    if (node.content) return node.content.map(extractText).join("");
    return "";
};

/**
 * Converts TipTap JSON content into an array of answer blocks
 */
export const parseContentToBlocks = (doc: any): Block[] => {
    if (!doc || !doc.content) return [];

    const mcGroups: Record<string, Choice[]> = {};
    const scGroups: Record<string, Choice[]> = {};
    const result: Block[] = [];

    const walk = (nodes: any[]) => {
        for (const node of nodes) {
            if (!node || !node.type) continue;

            switch (node.type) {
                case "mcChoice": {
                    const groupId = node.attrs?.groupId ?? uuidv4();
                    const id = node.attrs?.id ?? uuidv4();
                    const text = extractText(node) || "Option";
                    if (!mcGroups[groupId]) mcGroups[groupId] = [];
                    mcGroups[groupId].push({ id, text });
                    break;
                }

                case "singleChoice": {
                    const groupId = node.attrs?.groupId ?? uuidv4();
                    const id = node.attrs?.id ?? uuidv4();
                    const text = extractText(node) || "Option";
                    if (!scGroups[groupId]) scGroups[groupId] = [];
                    scGroups[groupId].push({ id, text });
                    break;
                }

                case "freeText": {
                    const key = node.attrs?.id ?? uuidv4();
                    result.push({ kind: "freeText", key });
                    break;
                }

                case "freeTextInline": {
                    const key = node.attrs?.id ?? uuidv4();
                    result.push({ kind: "freeTextInline", key });
                    break;
                }

                case "numericInput": {
                    const key = node.attrs?.id ?? uuidv4();
                    const mode = node.attrs?.mode ?? "numeric";
                    result.push({
                        kind: mode === "algebra" ? "algebra" : "numeric",
                        key,
                    });
                    break;
                }

                case "geoGebra": {
                    const key = node.attrs?.id ?? uuidv4();
                    result.push({ kind: "geoGebra", key });
                    break;
                }

                default:
                    if (node.content) walk(node.content);
            }
        }
    };

    walk(doc.content);

    Object.entries(mcGroups).forEach(([groupId, choices]) => {
        result.push({
            kind: "mc",
            key: groupId,
            choices,
        });
    });

    Object.entries(scGroups).forEach(([groupId, choices]) => {
        result.push({
            kind: "sc",
            key: groupId,
            choices,
        });
    });

    return result;
};
