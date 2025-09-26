import React, {useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout.tsx";
import {Box, Button, CardContent, Paper, TextField, Typography, FormGroup, FormControlLabel, Checkbox,} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import {initialFormSchema} from "./FormSchema.tsx";
import {loadQuestionForm, createQuestionForm, updateQuestionForm} from "../../services/EditorService.tsx";

type FieldType = "text" | "textarea" | "checkbox";

export interface MetaField {
    key: string;
    label: string;
    type: FieldType;
    value?: string;
    options?: string[];
    optionsValue?: Record<string, boolean>;
    placeholder?: string;
}

export default function MetaDataPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [formSchema, setFormSchema] = useState<MetaField[]>(initialFormSchema);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error",
    });

    const handleTextChange = (key: string, value: string) => {
        setFormSchema((prev) =>
            prev.map((field) => field.key === key ? { ...field, value } : field)
        );
    };

    const handleCheckboxChange = (key: string, option: string, checked: boolean) => {
        setFormSchema((prev) =>
            prev.map((field) =>
                field.key === key
                    ? {...field, optionsValue: { ...(field.optionsValue || {}), [option]: checked },} : field)
        );
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (id) {
                await updateQuestionForm(id, formSchema);
                setSnackbar({
                    open: true,
                    message: "Aufgabe erfolgreich aktualisiert!",
                    severity: "success",
                });
            } else {
                await createQuestionForm(formSchema);
                setSnackbar({
                    open: true,
                    message: "Aufgabe erfolgreich gespeichert!",
                    severity: "success",
                });
            }
            navigate("/questions");
        } catch (err: any) {
            setSnackbar({
                open: true,
                message: err?.message || "Fehler beim Speichern der Aufgabe.",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            setLoading(true);
            loadQuestionForm(id)
                .then((data) => setFormSchema(data))
                .catch((err) => console.error("Error loading question form data", err))
                .finally(() => setLoading(false));
        }
    }, [id]);

    return (
        <MainLayout>
            <Box
                sx={{minHeight: "100vh", backgroundColor: "background.default", py: 3, px: 2, display: "flex", flexDirection: "column", mt: 6,}}>
                <Paper elevation={0} sx={{ padding: 3, border: "2px solid #000" }}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: "center", fontWeight: "bold" }}>
                        Aufgabe anlegen
                    </Typography>

                    <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
                        {formSchema.map((field) => {
                            if (field.type === "text" || field.type === "textarea") {
                                return (
                                    <Box key={field.key}>
                                        <Typography variant="h6" sx={{ mb: 1 }}>
                                            {field.label}
                                        </Typography>
                                        <TextField fullWidth multiline={field.type === "textarea"} value={field.value || ""} onChange={(e) => handleTextChange(field.key, e.target.value)} placeholder={field.placeholder}/>
                                    </Box>);}

                            if (field.type === "checkbox") {
                                return (
                                    <Box key={field.key}>
                                        <Typography variant="h6" sx={{ mb: 1 }}>
                                            {field.label}
                                        </Typography>
                                        <FormGroup row>
                                            {field.options?.map((option) => (
                                                <FormControlLabel
                                                    key={option}
                                                    control={<Checkbox
                                                            checked={field.optionsValue?.[option] || false}
                                                            onChange={(e) =>
                                                                handleCheckboxChange(field.key, option, e.target.checked)}/>}
                                                    label={option}/>))}
                                        </FormGroup>
                                    </Box>
                                );
                            }

                            return null;
                        })}

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <Button variant="outlined" fullWidth onClick={() => navigate("/questions")}>
                                Abbrechen
                            </Button>
                            <Button variant="contained" fullWidth startIcon={<SaveIcon />} onClick={handleSave}>
                                Speichern
                            </Button>
                        </Box>
                    </CardContent>
                </Paper>
            </Box>
        </MainLayout>
    );
}
