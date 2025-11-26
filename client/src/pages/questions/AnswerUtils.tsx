import {Box, Paper, Typography} from "@mui/material";
import type {JSONContent} from "@tiptap/core";
import { v4 as uuidv4 } from "uuid";

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

            if (node.type === "freeText") {
                blockMap[nodeId] = { kind: "freeText", key: nodeId };
            }

            if (node.type === "freeTextInline") {
                blockMap[nodeId] = { kind: "freeTextInline", key: nodeId };
            }

            if (node.type === "numericInput") {
                const mode = node.attrs?.mode ?? "numeric";
                if (mode === "algebra") {
                    blockMap[nodeId] = { kind: "algebra", key: nodeId };
                } else {
                    blockMap[nodeId] = { kind: "numeric", key: nodeId };
                }
            }

            if (node.type === "geoGebra") {
                blockMap[nodeId] = { kind: "geoGebra", key: nodeId };
            }

            if (node.content) walk(node.content);
        });
    };

    walk(json.content);
    return Object.values(blockMap);
}

export function PrettyTestResult({ result }: { result: any }) {
    if (!result)
        return <Typography>Keine Daten vorhanden.</Typography>;

    if (result.error)
        return (
            <Typography color="error">
                {result.error}
            </Typography>
        );

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Header */}
            <Box>
                <Typography variant="h6">
                    Ergebnis
                </Typography>
                <Typography variant="body1">
                    Richtig: <strong>{result.score ?? "-"}</strong> / {result.total ?? "-"}
                </Typography>
            </Box>

            {/* Details */}
            {Array.isArray(result.details) && result.details.length > 0 && (
                <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Details:
                    </Typography>

                    {result.details.map((d: any, i: number) => (
                        <Paper
                            key={i}
                            sx={{p: 2, mb: 1, backgroundColor: d.correct ? "#e8f5e9" : "#ffebee", border: "1px solid", borderColor: d.correct ? "#2e7d32" : "#c62828",}}>
                            <Typography variant="body1">
                                <strong>Frage:</strong> {d.key}
                            </Typography>

                            <Typography variant="body2">
                                <strong>Ihre Antwort:</strong>{" "}
                                {formatValue(d.given)}
                            </Typography>

                            <Typography variant="body2">
                                <strong>Erwartet:</strong>{" "}
                                {formatValue(d.expected)}
                            </Typography>

                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                <strong>Status:</strong>{" "}
                                {d.correct ? "✔Richtig" : "Falsch"}
                            </Typography>
                        </Paper>
                    ))}
                </Box>
            )}
        </Box>
    );
}

function formatValue(value: any) {
    if (value === null || value === undefined) return "–";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}
