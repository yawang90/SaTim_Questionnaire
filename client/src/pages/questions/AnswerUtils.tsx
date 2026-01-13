import type {JSONContent} from "@tiptap/core";
import {v4 as uuidv4} from "uuid";

export type Choice = { id: string; text: string; html?: string; };
export type Answer =
    | { kind: "mc" | "sc"; key: string; value: { id: string; selected: boolean }[] }
    | { kind: "freeText" | "freeTextInline" | "numeric" | "lineEquation" | "geoGebra"; key: string; value: string };

export type Block =
    | { kind: "mc"; key: string; choices: Choice[] }
    | { kind: "sc"; key: string; choices: Choice[] }
    | { kind: "freeText"; key: string }
    | { kind: "freeTextInline"; key: string }
    | { kind: "numeric"; key: string }
    | { kind: "lineEquation"; key: string }
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
                    blockMap[groupId] = {kind, key: groupId, choices: []};
                }

                (node.content || []).forEach((choiceNode: any) => {
                    const html = renderNodeToHTML(choiceNode);
                    const text = html.replace(/<[^>]+>/g, "").trim();
                    (blockMap[groupId] as any).choices.push({id: nodeId, text, html});
                });
            }

            if (node.type === "freeText") {
                blockMap[nodeId] = {kind: "freeText", key: nodeId};
            }

            if (node.type === "freeTextInline") {
                blockMap[nodeId] = {kind: "freeTextInline", key: nodeId};
            }

            if (node.type === "numericInput") {
                blockMap[nodeId] = {kind: "numeric", key: nodeId};
            }

            if (node.type === "lineEquation") {
                blockMap[nodeId] = {kind: "lineEquation", key: nodeId};
            }

            if (node.type === "geoGebra") {
                blockMap[nodeId] = {kind: "geoGebra", key: nodeId};
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
    const answers: Answer[] = blocks
        .map(block => {
            switch (block.kind) {
                case 'sc':
                case 'mc':
                    return {
                        kind: block.kind,
                        key: block.key,
                        value: block.choices.map(choice => ({id: choice.id, selected: false})),
                    };
                case 'freeText':
                case 'freeTextInline':
                case 'numeric':
                case 'lineEquation':
                case 'geoGebra':
                    return {kind: block.kind, key: block.key, value: ''};
                default:
                    return {kind: 'unknown', key: '', value: null};
            }
        })
        .filter((a): a is Answer => !!a);
    const walk = (nodes: TipTapNode[]) => {
        for (const node of nodes) {
            if (!node || !node.type) continue;

            const block = blocks.find(b => b.key === node.attrs?.id || b.key === node.attrs?.groupId);
            if (!block) {
                if (node.content) walk(node.content);
                continue;
            }

            const answer = answers.find(a => a.key === block.key)!;

            switch (block.kind) {
                case 'sc':
                case 'mc': {
                    const checkboxNodes = document.querySelectorAll<HTMLInputElement>(
                        `div.mc-choice-wrapper input[name="group-${block.key}"]`
                    );
                    const answerValues = answer.value as { id: string; selected: boolean }[];
                    checkboxNodes.forEach((input, i) => {
                        if (answerValues[i]) answerValues[i].selected = input.checked;
                    });
                    break;
                }
                case 'freeText':
                case 'freeTextInline': {
                    const inputEl = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
                        `[data-node-view-wrapper] [id="${block.key}"]`
                    );
                    if (inputEl) answer.value = inputEl.value;
                    break;
                }
                case 'lineEquation': {
                    answer.value = node.attrs?.value ?? '';
                    break;
                }
                case 'numeric': {
                    const numericEl = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(
                        `[data-node-view-wrapper] [id="${block.key}"]`
                    );
                    if (numericEl) answer.value = numericEl.value;
                    break;
                }

                case 'geoGebra':
                    answer.value = node.attrs?.materialId ?? '';
                    break;
            }

            if (node.content) walk(node.content);
        }
    };

    if (doc.content) walk(doc.content as TipTapNode[]);

    return answers;
}

/**
 * Basic validation for a linear equation of the form y = m*x + c
 *  * Checks if an answer represents a valid linear equation of the form y = …
 *  *
 *  * Allowed rules for the right-hand side (RHS):
 *  * - Numbers, optionally with decimal points (e.g., 3, 4.5)
 *  * - Variables: x, y, z
 *  * - Basic arithmetic operators: +, -, :, \cdot
 *  * - Parentheses for grouping: ( )
 *  * - Fraction notation using LaTeX-style: \frac{numerator}{denominator}
 *  * - No other characters are allowed
 *  */
export function isValidLineEquation(answer: Answer): boolean {
    const value = answer.value;
    if (typeof value !== "string") return false;

    const sanitized = value.replace(/\s+/g, "");

    if (!sanitized.startsWith("y=")) return false;

    const rhs = sanitized.slice(2);

    const allowedPattern = /^[0-9.,xyz+\-:()\\cdot\\frac{}]+$/;

    return allowedPattern.test(rhs);
}


