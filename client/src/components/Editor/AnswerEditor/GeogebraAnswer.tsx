import { Box, TextField, Typography, IconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";

interface Line {
    name: string;
    m: number;
    c: number;
}

interface Point {
    name: string;
    x: number;
    y: number;
}

interface GeoGebraAnswerProps {
    type: "point" | "line";
    data: Line | Point;
    onChange: (updated: any) => void;
    onRemove?: () => void;
}

export const GeoGebraAnswer: React.FC<GeoGebraAnswerProps> = ({ type, data, onChange, onRemove }) => {
    return (
        <Box sx={{ display: "flex", gap: 2, mb: 1, alignItems: "center" }}>
            <Typography sx={{ width: 80 }}>{data.name}</Typography>

            {type === "point" && "x" in data && "y" in data ? (
                <>
                    <TextField label="x" type="number" size="small" value={data.x} onChange={(e) => onChange({ ...data, x: Number(e.target.value) })}/>
                    <TextField label="y" type="number" size="small" value={data.y} onChange={(e) => onChange({ ...data, y: Number(e.target.value) })}/>
                </>
            ) : type === "line" && "m" in data && "c" in data ? (
                <>
                    <TextField label="m" type="number" size="small" value={data.m} onChange={(e) => onChange({ ...data, m: Number(e.target.value) })}/>
                    <TextField label="c" type="number" size="small" value={data.c} onChange={(e) => onChange({ ...data, c: Number(e.target.value) })}/>
                </>
            ) : null}

            {onRemove && <IconButton onClick={onRemove}><Delete /></IconButton>}
        </Box>
    );
};
