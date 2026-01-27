import type { JSONContent } from "@tiptap/core";
import { v4 as uuidv4 } from "uuid";

export type Choice = { id: string; text: string; html?: string };

export type Answer =
    | { kind: "mc" | "sc"; key: string; value: { id: string; selected: boolean }[] }
    | { kind: "freeText" | "freeTextInline" | "numeric"; key: string; value: string }
    | LineEquationAnswer
    | GeoGebraAnswer;

export type LineEquationAnswer = {
    kind: "lineEquation";
    key: string;
    value: string;
    m?: string;
    c?: string;
};

export type GeoGebraPoint = { name: string; x: number; y: number };
export type GeoGebraLine = { name: string; m: number; c: number };

export type GeoGebraAnswer = {
    kind: "geoGebra";
    key: string;
    points: GeoGebraPoint[];
    lines: GeoGebraLine[];
    value: {     points: GeoGebraPoint[];
        lines: GeoGebraLine[]; };
};

export type Block =
    | { kind: "mc"; key: string; choices: Choice[] }
    | { kind: "sc"; key: string; choices: Choice[] }
    | { kind: "freeText"; key: string }
    | { kind: "freeTextInline"; key: string }
    | { kind: "numeric"; key: string }
    | { kind: "lineEquation"; key: string }
    | { kind: "geoGebra"; key: string; attrs?: { maxPoints?: number; maxLines?: number } };


export const mapQuestionsStatus = (
    status: string | null | undefined
): "in bearbeitung" | "abgeschlossen" | "gelöscht" => {
    switch (status) {
        case "ACTIVE":
            return "in bearbeitung";
        case "FINISHED":
            return "abgeschlossen";
        case "DELETED":
            return "gelöscht";
        default:
            return "in bearbeitung";
    }
};

/** Recursively extracts plain text from a TipTap JSON node */
export const extractText = (node: any): string => {
    if (!node) return "";
    if (Array.isArray(node)) return node.map(extractText).join("");
    if (node.type === "text") return node.text ?? "";
    if (node.content) return node.content.map(extractText).join("");
    return "";
};

/** Render a TipTap node to HTML */
function renderNodeToHTML(node: any): string {
    if (!node) return "";

    switch (node.type) {
        case "text":
            return node.text ?? "";
        case "paragraph":
            return `<p>${(node.content || []).map(renderNodeToHTML).join("")}</p>`;
        case "latex": {
            const latex = node.attrs?.latex ?? "";
            return `<span class="mathjax-latex">\\(${latex}\\)</span>`;
        }
        case "image":
            return `<img src="${node.attrs?.src ?? ""}" alt="" style="max-width:100%;height:auto;" />`;
        case "mcChoice":
        case "singleChoice":
            return (node.content || []).map(renderNodeToHTML).join("");
        default:
            if (node.content && Array.isArray(node.content)) {
                return node.content.map(renderNodeToHTML).join("");
            }
            return "";
    }
}

export function parseContentToBlocks(json: JSONContent): Block[] {
    if (!json || !json.content) return [];
    const blockMap: Record<string, Block> = {};

    const walk = (nodes: any[]) => {
        nodes.forEach((node) => {
            if (!node) return;

            const nodeId = node.attrs?.id || uuidv4();
            if (node.type === "mcChoice" || node.type === "singleChoice") {
                const kind = node.type === "mcChoice" ? "mc" : "sc";
                const groupId = node.attrs?.groupId || nodeId;

                if (!blockMap[groupId]) {
                    blockMap[groupId] = { kind, key: groupId, choices: [] };
                }

                (node.content || []).forEach((choiceNode: any) => {
                    const html = renderNodeToHTML(choiceNode);
                    const text = html.replace(/<[^>]+>/g, "").trim();
                    (blockMap[groupId] as any).choices.push({ id: nodeId, text, html });
                });
            }

            if (node.type === "freeText") blockMap[nodeId] = { kind: "freeText", key: nodeId };
            if (node.type === "freeTextInline") blockMap[nodeId] = { kind: "freeTextInline", key: nodeId };
            if (node.type === "numericInput") blockMap[nodeId] = { kind: "numeric", key: nodeId };
            if (node.type === "lineEquation") blockMap[nodeId] = { kind: "lineEquation", key: nodeId };

            if (node.type === "geoGebra") {
                blockMap[nodeId] = { kind: "geoGebra", key: nodeId, attrs: node.attrs };
            }
            if (node.content) walk(node.content);
        });
    };

    walk(json.content);
    return Object.values(blockMap);
}

export interface TipTapNode {
    type: string;
    attrs?: Record<string, any>;
    content?: TipTapNode[];
    text?: string;
}

export function extractAnswersFromJson(doc: JSONContent, blocks: Block[]): Answer[] {
    const answers: Answer[] = blocks.map((block) => {
        switch (block.kind) {
            case "sc":
            case "mc":
                return {
                    kind: block.kind,
                    key: block.key,
                    value: block.choices.map((choice) => ({ id: choice.id, selected: false })),
                };

            case "freeText":
            case "freeTextInline":
            case "numeric":
            case "lineEquation":
                return { kind: block.kind, key: block.key, value: "" };

            case "geoGebra": {
                const maxPoints = block.attrs?.maxPoints ?? 0;
                const maxLines = block.attrs?.maxLines ?? 0;

                const geoAnswer: GeoGebraAnswer = {
                    kind: "geoGebra",
                    key: block.key,
                    points: Array.from({ length: maxPoints }).map((_, i) => ({
                        name: `P${i + 1}`,
                        x: 0,
                        y: 0,
                    })),
                    lines: Array.from({ length: maxLines }).map((_, i) => ({
                        name: `L${i + 1}`,
                        m: 0,
                        c: 0,
                    })),
                    value: { points: Array.from({ length: maxPoints }).map((_, i) => ({
                            name: `P${i + 1}`,
                            x: 0,
                            y: 0,
                        })),
                        lines: Array.from({ length: maxLines }).map((_, i) => ({
                            name: `L${i + 1}`,
                            m: 0,
                            c: 0,
                        })),}
                };
                return geoAnswer;
            }
        }
    });

    const walk = (nodes: TipTapNode[]) => {
        for (const node of nodes) {
            if (!node || !node.type) continue;

            const block = blocks.find((b) => b.key === node.attrs?.id || b.key === node.attrs?.groupId);
            if (!block) {
                if (node.content) walk(node.content);
                continue;
            }

            const answer = answers.find((a) => a.key === block.key)!;

            switch (block.kind) {
                case "sc":
                case "mc": {
                    if (answer.kind === "mc" || answer.kind === "sc") {
                        const answerValues = answer.value;
                        const checkboxNodes = document.querySelectorAll<HTMLInputElement>(
                            `div.mc-choice-wrapper input[name="group-${block.key}"]`
                        );
                        checkboxNodes.forEach((input, i) => {
                            if (answerValues[i]) answerValues[i].selected = input.checked;
                        });
                    }
                    break;
                }
                case "freeText":
                case "freeTextInline":
                case "numeric":
                case "lineEquation": {
                    if (answer.kind === "lineEquation") {
                        const inputEl = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
                            `[data-node-view-wrapper] [id="${block.key}"]`
                        );
                        if (inputEl) answer.value = inputEl.value;
                    }
                    break;
                }
                case "geoGebra": {
                    break;
                }
            }

            if (node.content) walk(node.content);
        }
    };

    if (doc.content) walk(doc.content as TipTapNode[]);

    return answers;
}
