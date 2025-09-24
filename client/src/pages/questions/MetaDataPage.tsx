import React, { useState } from "react";
import MainLayout from "../../layouts/MainLayout.tsx";
import {Box, Button, CardContent, Paper, TextField, Typography, FormGroup, FormControlLabel, Checkbox,} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import {formSchema} from "./FormSchema.tsx";

type FieldType = "text" | "textarea" | "checkbox";

export interface MetaField {
    key: string;
    label: string;
    type: FieldType;
    options?: string[]; // for checkbox
    placeholder?: string;
}

export default function MetaDataPage() {
    const [formData, setFormData] = useState<Record<string, any>>({});

    const handleChange = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleCheckboxChange = (key: string, option: string, checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            [key]: { ...(prev[key] || {}), [option]: checked },
        }));
    };

    const saveMetadata = () => {
        console.log("Form Data:", formData);
        alert("Metadaten gespeichert! Schau in der Konsole nach.");
    };

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
                                        <Typography variant="h6" sx={{ mb: 1 }}>{field.label}</Typography>
                                        <TextField key={field.key} label={field.label} fullWidth multiline={field.type === "textarea"} value={formData[field.key] || ""} onChange={(e) => handleChange(field.key, e.target.value)} placeholder={field.placeholder}/>
                                    </Box>
                                );
                            }

                            if (field.type === "checkbox") {
                                return (
                                    <Box key={field.key}>
                                        <Typography variant="h6" sx={{ mb: 1 }}>{field.label}</Typography>
                                        <FormGroup row>
                                            {field.options?.map((option) => (
                                                <FormControlLabel
                                                    key={option}
                                                    control={
                                                        <Checkbox
                                                            checked={formData[field.key]?.[option] || false}
                                                            onChange={(e) =>
                                                                handleCheckboxChange(
                                                                    field.key,
                                                                    option,
                                                                    e.target.checked
                                                                )
                                                            }
                                                        />
                                                    }
                                                    label={option}
                                                />
                                            ))}
                                        </FormGroup>
                                    </Box>
                                );
                            }

                            return null;
                        })}

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <Button variant="outlined" fullWidth onClick={() => alert("Zurück zur Übersicht")}>Abbrechen</Button>
                            <Button variant="contained" fullWidth startIcon={<SaveIcon />} onClick={saveMetadata}>Speichern</Button>
                        </Box>
                    </CardContent>
                </Paper>
            </Box>
        </MainLayout>
    );
}
