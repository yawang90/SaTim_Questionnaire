export interface Condition {
    operator: "=" | "<" | ">" | "<=" | ">=";
    value: string;
    logic?: "and" | "or";
}

export type PointConditions = {
    x: Condition[];
    y: Condition[];
};

export type LineConditions = {
    m: Condition[];
    c: Condition[];
};
