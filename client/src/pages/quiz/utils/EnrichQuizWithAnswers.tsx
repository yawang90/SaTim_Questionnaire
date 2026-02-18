import type {JSONContent} from "@tiptap/core";

type PreviousAnswer = {
    key: string;
    kind: string;
    value: any;
};

export function enrichQuizWithAnswers(content: JSONContent, previousAnswers?: any[]): JSONContent {
    const answerMap = buildFlatAnswerMap(previousAnswers);
    const walk = (node: any): any => {
        const newNode = { ...node };
        const nodeId = node?.attrs?.id
            ? String(node.attrs.id)
            : null;
        if (nodeId) {
            const answerNode = answerMap.get(nodeId);
            if (answerNode) {
                switch (answerNode.kind) {
                    case "numeric":
                    case "freeText":
                    case "freeTextInline":
                        newNode.attrs = {
                            ...newNode.attrs,
                            value: answerNode.value
                        };
                        break;
                    case "lineEquation":
                    case "geoGebraLines":
                    case "geoGebraPoints":
                        newNode.attrs = {
                            ...newNode.attrs,
                            value: answerNode.value
                        };
                        break;
                    case "mc":
                    case "sc":
                        newNode.attrs = {
                            ...newNode.attrs,
                            selected: answerNode.value
                        };
                        break;
                }
            }
        }
        if (node.content) {
            newNode.content = node.content.map(walk);
        }
        return newNode;
    };
    return walk(content);
}

function buildFlatAnswerMap(previousAnswers?: PreviousAnswer[]) {
    const map = new Map<string, any>();
    if (!previousAnswers?.length) return map;
    previousAnswers.forEach(answer => {
        const kind = answer.kind;
        switch (kind) {
            case "mc":
            case "sc":
                answer.value?.forEach((choice: any) => {
                    map.set(
                        String(choice.id),
                        {
                            kind,
                            value: choice.selected
                        }
                    );

                });
                break;
            case "numeric":
            case "freetext":
            case "geoGebraPoints":
            case "geoGebraLines":
            case "lineEquation":
            default:
                map.set(
                    String(answer.key),
                    {
                        kind,
                        value: answer.value
                    }
                );
        }
    });
    return map;
}
