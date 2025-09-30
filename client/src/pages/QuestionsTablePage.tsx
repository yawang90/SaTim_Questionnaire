import React, { useEffect, useState } from "react";
import {Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography,} from "@mui/material";
import MainLayout from "../layouts/MainLayout.tsx";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { loadAllQuestions } from "../services/QuestionsService.tsx";

const groupId = "999";

type QuestionRow = {
    id: number;
    metadata: {
        key: string;
        label: string;
        value: string;
    }[];
};

export default function QuestionsTablePage() {
    const navigate = useNavigate();
    const [filterSerie, setFilterSerie] = useState<string>("");
    const [searchText, setSearchText] = useState<string>("");
    const [rows, setRows] = useState<QuestionRow[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const transformedRows = rows.map((row) => {
        const flatRow: Record<string, any> = { id: row.id};
        row.metadata.forEach((meta) => {
            flatRow[meta.key] = meta.value;
        });
        return flatRow;
    });

    const columns: GridColDef[] = [];
    if (rows.length > 0) {
        columns.push({ field: "id", headerName: "ID", width: 80 });
        rows[0].metadata.forEach((meta) => {
            columns.push({ field: meta.key, headerName: meta.label, width: 200 });
        });
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data: QuestionRow[] = await loadAllQuestions(groupId);
                setRows(data);
            } catch (error) {
                console.error("Aufgaben konnten nicht geladen werden: ", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredRows = transformedRows.filter((row) => {
        const name = row.ersteller ?? "";
        return (!filterSerie || row.serie === filterSerie) && name.toLowerCase().includes(searchText.toLowerCase());
    });

    return (
        <MainLayout>
            <Box sx={{ minHeight: "100vh", py: 3, px: 2, display: "flex", flexDirection: "column", mt: 6 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                        <Typography variant="h4">Aufgabenübersicht</Typography>
                        <Typography color="textSecondary">Alle Aufgaben mit Filter- und Suchoptionen</Typography>
                    </Box>
                    <Button variant="contained" startIcon={<Add />} onClick={() => navigate("/meta")}>
                        Neue Aufgabe erstellen
                    </Button>
                </Box>

                <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                    <TextField
                        label="Suche nach Ersteller"
                        variant="outlined"
                        size="small"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Serie</InputLabel>
                        <Select value={filterSerie} label="Serie" onChange={(e) => setFilterSerie(e.target.value)}>
                            <MenuItem value="">Alle</MenuItem>
                            <MenuItem value="Serie 1">Serie 1</MenuItem>
                            <MenuItem value="Serie 2">Serie 2</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ height: 500, width: "100%" }}>
                    <DataGrid
                        rows={filteredRows}
                        columns={columns}
                        pageSizeOptions={[5, 10, 20]}
                        initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                        showToolbar
                        loading={loading}
                        slotProps={{
                            toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 200 } },
                        }}
                    />
                </Box>
            </Box>
        </MainLayout>
    );
}
