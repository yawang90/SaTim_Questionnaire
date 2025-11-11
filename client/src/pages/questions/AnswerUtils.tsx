import type {JSONContent} from "@tiptap/core";

export type Choice = { id: string; text: string; html?: string;};

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

function renderNodeToHTML(node: any): string {
    if (!node) return "";

    switch (node.type) {
        case "text":
            return node.text ?? "";

        case "paragraph":
            return `<p>${(node.content || []).map(renderNodeToHTML).join("")}</p>`;

        case "latex":
            { const latex = node.attrs?.latex ?? "";
            return `<span class="mathjax-latex">\\(${latex}\\)</span>`; }

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

            if (node.type === "mcChoice" || node.type === "singleChoice") {
                const kind = node.type === "mcChoice" ? "mc" : "sc";
                const groupId = node.attrs?.groupId || node.attrs?.id || Math.random().toString(36).slice(2, 8);

                if (!blockMap[groupId]) {
                    blockMap[groupId] = { kind, key: groupId, choices: [] };
                }

                (node.content || []).forEach((choiceNode: any) => {
                    const id = node.attrs?.id || Math.random().toString(36).slice(2, 8);
                    const html = renderNodeToHTML(choiceNode);
                    const text = html.replace(/<[^>]+>/g, "").trim();
                    (blockMap[groupId] as any).choices.push({ id, text, html });
                });
            }

            if (node.type === "freeText") {
                const key = node.attrs?.id || Math.random().toString(36).slice(2, 8);
                blockMap[key] = { kind: "freeText", key };
            }

            if (node.type === "freeTextInline") {
                const key = node.attrs?.id || Math.random().toString(36).slice(2, 8);
                blockMap[key] = { kind: "freeTextInline", key };
            }

            if (node.type === "numericInput") {
                const key = node.attrs?.id || Math.random().toString(36).slice(2, 8);
                blockMap[key] = { kind: "numeric", key };
            }

            if (node.type === "algebraInput") {
                const key = node.attrs?.id || Math.random().toString(36).slice(2, 8);
                blockMap[key] = { kind: "algebra", key };
            }

            if (node.type === "geoGebra") {
                const key = node.attrs?.id || Math.random().toString(36).slice(2, 8);
                blockMap[key] = { kind: "geoGebra", key };
            }

            if (node.content) walk(node.content);
        });
    };

    walk(json.content);
    return Object.values(blockMap);
}
