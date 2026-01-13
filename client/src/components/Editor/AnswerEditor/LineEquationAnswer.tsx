import React from "react";
import {Box, Button, MenuItem, Select, Typography} from "@mui/material";
import {MathInput} from "./MathInput.tsx";
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

export interface Condition {
    variable: "m" | "c";
    operator: "=" | "<" | ">" | "<=" | ">=";
    value: string;
    logic?: "and" | "or";
}

interface LineEquationProps {
    conditions: Condition[];
    onChange: (conditions: Condition[]) => void;
}

const operators: Condition["operator"][] = ["=", "<", ">", "<=", ">="];
const logics: Condition["logic"][] = ["and", "or"];

export const LineEquationAnswer: React.FC<LineEquationProps > = ({ conditions, onChange }) => {
    const handleChange = (variable: "m" | "c", index: number, field: keyof Condition, newValue: string) => {
        const current = getConditions(variable);
        const next = [...current];
        next[index] = { ...next[index], [field]: newValue } as Condition;

        if (next.length > 1 && index === 1) {
            next[0] = {
                ...next[0],
                logic: next[1].logic === "or" ? "or" : "and"
            };
        }

        updateConditions(variable, next);
    };

    const addCondition = (variable: "m" | "c") => {
        const next = [
            ...getConditions(variable),
            { variable, operator: "=", value: "", logic: "and" } as Condition
        ];

        if (next.length > 1) {
            next[0] = {
                ...next[0],
                logic: next[1].logic === "or" ? "or" : "and"
            };
        }

        updateConditions(variable, next);
    };

    const removeCondition = (variable: "m" | "c", index: number) => {
        const current = getConditions(variable);
        if (current.length <= 1) return;
        updateConditions(
            variable,
            current.filter((_, i) => i !== index)
        );
    };

    const getConditions = (variable: "m" | "c") => {
        const filtered = conditions.filter(c => c.variable === variable);
        if (filtered.length === 0) {
            return [{ variable, operator: "=", value: "", logic: "and" }] as Condition[];
        }
        return filtered;
    };

    const updateConditions = (variable: "m" | "c", next: Condition[]) => {
        const updatedNext = next.length > 0 ? next : [{ variable, operator: "=", value: "", logic: "and" }];

        const otherVariable = variable === "m" ? "c" : "m";
        const otherConditions = getConditions(otherVariable);

        const merged = variable === "m"
            ? [...updatedNext.map(c => ({ ...c, variable: "m" }) as Condition), ...otherConditions.map(c => ({ ...c, variable: "c" }) as Condition)]
            : [...getConditions("m").map(c => ({ ...c, variable: "m" }) as Condition), ...updatedNext.map(c => ({ ...c, variable: "c" }) as Condition)];

        onChange(merged);
    };

    return (
        <Box>
            <div>
                Der Parameter <b>m</b> wird als richtig gewertet, wenn <b>m</b> die folgenden Bedingungen erfüllt:
                {getConditions("m").map((cond, idx) => (
                    <Box key={idx} display="flex" alignItems="center" gap={1} mb={1}>
                        {idx > 0 && (
                            <Select
                                value={cond.logic || "and"}
                                onChange={(e) =>
                                    handleChange("m", idx, "logic", e.target.value)
                                }
                                size="small"
                                sx={{ minWidth: 60 }}>
                                {logics.map(l => (
                                    <MenuItem key={l} value={l}>{l?.toUpperCase()}</MenuItem>
                                ))}
                            </Select>
                        )}
                        <Select value={cond.operator} onChange={(e) => handleChange("m", idx, "operator", e.target.value)} size="small" sx={{ minWidth: 60 }}>
                            {operators.map(op => (
                                <MenuItem key={op} value={op}>{op}</MenuItem>
                            ))}</Select>
                        <MathInput value={cond.value} onChange={(val) => handleChange("m", idx, "value", val)}/>
                        <Button onClick={() => removeCondition("m", idx)} disabled={getConditions("m").length === 1}>
                            <RemoveCircleIcon />
                        </Button>
                    </Box>
                ))}
                <p></p>
                <Button onClick={() => addCondition("m")} variant="outlined" size="small">
                    + Bedingung hinzufügen
                </Button>
            </div>
            <Box mt={5}> </Box>
            <div>
                Der Parameter <b>c</b> wird als richtig gewertet, wenn <b>c</b> die folgenden Bedingungen erfüllt:
                {getConditions("c").map((cond, idx) => (
                    <Box key={idx} display="flex" alignItems="center" gap={1} mb={1}>
                        {idx > 0 && (
                            <Select value={cond.logic || "and"} onChange={(e) => handleChange("c", idx, "logic", e.target.value)} size="small" sx={{ minWidth: 60 }}>
                                {logics.map(l => (
                                    <MenuItem key={l} value={l}>{l?.toUpperCase()}</MenuItem>
                                ))}
                            </Select>)}
                        <Select value={cond.operator} onChange={(e) => handleChange("c", idx, "operator", e.target.value)} size="small" sx={{ minWidth: 60 }}>
                            {operators.map(op => (
                                <MenuItem key={op} value={op}>{op}</MenuItem>
                            ))}
                        </Select>
                        <MathInput value={cond.value} onChange={(val) => handleChange("c", idx, "value", val)}/>
                        <Button onClick={() => removeCondition("c", idx)} disabled={getConditions("c").length === 1}>
                            <RemoveCircleIcon />
                        </Button>
                    </Box>
                ))}
                <p></p>
                <Button onClick={() => addCondition("c")} variant="outlined" size="small">
                    + Bedingung hinzufügen
                </Button>
            </div>

            <p></p>
            <Typography variant="caption" color="text.secondary">
                Bedingungen können mit logischem "UND / ODER" verknüpft werden
            </Typography>
        </Box>
    );
};
