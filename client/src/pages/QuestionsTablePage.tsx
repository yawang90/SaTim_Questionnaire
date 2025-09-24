import React, { useState } from "react";
import {Box, Button, TextField, Typography, MenuItem, Select, InputLabel, FormControl,} from "@mui/material";
import MainLayout from "../layouts/MainLayout.tsx";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {Add} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";

interface Aufgabe {
    id: string;
    aufgabenId: string;
    ersteller: string;
    erstellungszeit: string;
    kompetenzen: string;
    serie: string;
    kompetenzniveau: string;
    kompetenzstufe: string;
}

const mockData: Aufgabe[] = [
    {
        id: "1",
        aufgabenId: "A101",
        ersteller: "Fabian Nachname",
        erstellungszeit: "2025-09-15 10:30",
        kompetenzen: "Mathematik, Algebra",
        serie: "Serie 1",
        kompetenzniveau: "B1",
        kompetenzstufe: "2",
    },
    {
        id: "2",
        aufgabenId: "A102",
        ersteller: "Peter Nachname",
        erstellungszeit: "2025-09-14 15:20",
        kompetenzen: "Sprache, Lesen",
        serie: "Serie 2",
        kompetenzniveau: "A2",
        kompetenzstufe: "1",
    },
];

export default function QuestionsTablePage() {
    const navigate = useNavigate();
    const [filterSerie, setFilterSerie] = useState<string>("");
    const [searchText, setSearchText] = useState<string>("");

    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 80 },
        { field: "aufgabenId", headerName: "Aufgaben ID", width: 120 },
        { field: "ersteller", headerName: "Ersteller", width: 150 },
        { field: "erstellungszeit", headerName: "Erstellungszeit", width: 180 },
        { field: "kompetenzen", headerName: "Kompetenzen", width: 200 },
        { field: "serie", headerName: "Serie", width: 120 },
        { field: "kompetenzniveau", headerName: "Kompetenzniveau", width: 130 },
        { field: "kompetenzstufe", headerName: "Kompetenzstufe (Lehrplan 21)", width: 180 },
    ];

    const filteredRows = mockData.filter((row) => {
        return (
            (!filterSerie || row.serie === filterSerie) &&
            row.ersteller.toLowerCase().includes(searchText.toLowerCase())
        );
    });

    return (
        <MainLayout>
            <Box sx={{ minHeight: '100vh', py: 3, px: 2, display: 'flex', flexDirection: 'column', mt: 6 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box>
                        <Typography variant="h4">Aufgabenübersicht</Typography>
                        <Typography color="textSecondary">
                            Alle Aufgaben mit Filter- und Suchoptionen
                        </Typography>
                    </Box>
                    <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/meta')}>
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
                        <Select
                            value={filterSerie}
                            label="Serie"
                            onChange={(e) => setFilterSerie(e.target.value)}
                        >
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
                        initialState={{
                            pagination: { paginationModel: { pageSize: 5 } },
                        }}
                        showToolbar={true}
                        slotProps={{
                            toolbar: {
                                showQuickFilter: true,
                                quickFilterProps: { debounceMs: 200 },
                            },
                        }}
                    />
                </Box>
            </Box>
        </MainLayout>
    );
}
