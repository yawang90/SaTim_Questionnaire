import React from "react";
import { Box, Button, Typography, FormControl, MenuItem, Select, IconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";
import type {Condition} from "./GeoGebraAnswerTypes";
import { MathInput } from "./MathInput";

interface Props {
    data: { name: string };
    conditions: { x: Condition[]; y: Condition[] };
    onChange: (next: { x: Condition[]; y: Condition[] }) => void;
}

const operators: Condition["operator"][] = ["=", "<", ">", "<=", ">="];
const logics: ("and" | "or")[] = ["and", "or"];

export const GeoGebraPointAnswer: React.FC<Props> = ({ data, conditions, onChange }) => {
    const update = (axis: "x" | "y", idx: number, patch: Partial<Condition>) => {
        const nextAxis = conditions[axis].map((c, i) => (i === idx ? { ...c, ...patch } : c));
        onChange({
            x: axis === "x" ? nextAxis : conditions.x,
            y: axis === "y" ? nextAxis : conditions.y
        });
    };

    const addCondition = (axis: "x" | "y") => {
        onChange({
            x: axis === "x" ? [...conditions.x, { operator: "=", value: "", logic: "and" }] : conditions.x,
            y: axis === "y" ? [...conditions.y, { operator: "=", value: "", logic: "and" }] : conditions.y,
        });
    };

    const removeCondition = (axis: "x" | "y", idx: number) => {
        if (conditions[axis].length <= 1) return;
        onChange({
            x: axis === "x" ? conditions.x.filter((_, i) => i !== idx) : conditions.x,
            y: axis === "y" ? conditions.y.filter((_, i) => i !== idx) : conditions.y,
        });
    };

    const renderAxis = (axis: "x" | "y") => (
        <Box>
            <Typography fontWeight="bold">{axis}</Typography>
            {conditions[axis].map((cond, idx) => (
                <Box key={idx} display="flex" gap={1} alignItems="center" mb={1}>
                    {idx > 0 && (
                        <FormControl size="small">
                            <Select
                                value={cond.logic || "and"}
                                onChange={(e) => update(axis, idx, { logic: e.target.value as "and" | "or" })}>
                                {logics.map((l) => (
                                    <MenuItem key={l} value={l}>
                                        {l.toUpperCase()}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    <FormControl size="small">
                        <Select
                            value={cond.operator}
                            onChange={(e) => update(axis, idx, { operator: e.target.value as Condition["operator"] })}>
                            {operators.map((op) => (
                                <MenuItem key={op} value={op}>
                                    {op}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <MathInput value={cond.value} onChange={(v) => update(axis, idx, { value: v })} />
                    <IconButton onClick={() => removeCondition(axis, idx)} disabled={conditions[axis].length === 1}>
                        <Delete />
                    </IconButton>
                </Box>
            ))}
            <Button size="small" variant="outlined" onClick={() => addCondition(axis)}>
                + Bedingung hinzufügen
            </Button>
        </Box>
    );

    return (
        <Box border="1px solid #ccc" p={2} mb={2}>
            <Typography fontWeight="bold">{data.name}</Typography>
            <Box display="flex" gap={2}>
                {renderAxis("x")}
                {renderAxis("y")}
            </Box>
        </Box>
    );
};
