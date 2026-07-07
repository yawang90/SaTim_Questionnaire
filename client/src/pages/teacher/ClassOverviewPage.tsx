import React, { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Snackbar,
    TextField,
    Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import {
    createClass,
    getClasses,
    type SchoolClass,
    SchoolClassType,
} from "../../services/ClassService";
import TeacherLayout from "../../layouts/TeacherLayout.tsx";

const ClassOverviewPage = () => {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [loading, setLoading] = useState(false);

    const [openDialog, setOpenDialog] = useState(false);

    const [newClass, setNewClass] = useState({
        name: "",
        type: SchoolClassType.SEK_7,
    });

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error",
    });

    const fetchClasses = async () => {
        setLoading(true);

        try {
            const data = await getClasses();
            setClasses(data);
        } catch (err) {
            console.error(err);
            setSnackbar({
                open: true,
                message: "Klassen konnten nicht geladen werden.",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const handleCreateClass = async () => {
        try {
            await createClass(newClass);

            setSnackbar({
                open: true,
                message: "Klasse erfolgreich erstellt.",
                severity: "success",
            });

            setOpenDialog(false);

            setNewClass({
                name: "",
                type: SchoolClassType.SEK_7,
            });

            fetchClasses();
        } catch (err) {
            console.error(err);

            setSnackbar({
                open: true,
                message: "Klasse konnte nicht erstellt werden.",
                severity: "error",
            });
        }
    };

    if (loading) {
        return (
            <TeacherLayout>
                <Typography>Loading...</Typography>
            </TeacherLayout>
        );
    }

    return (
        <TeacherLayout>
            <Box sx={{minHeight: "100vh",  px: 2}}>
                <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false,})}>
                    <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar({...snackbar, open: false,})}>{snackbar.message}</Alert>
                </Snackbar>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                 <Typography variant="h4">
                        Meine Klassen
                    </Typography>

                    <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
                        Klasse erstellen
                    </Button>
                </Box>

                <Card>
                    <CardHeader title="Klassen" />
                    <CardContent sx={{display: "flex", flexDirection: "column", gap: 2,}}>
                        {classes.length > 0 ? (
                            classes.map((schoolClass) => (
                                <Card key={schoolClass.id} variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6">
                                            {schoolClass.name}
                                        </Typography>

                                        <Typography color="text.secondary">
                                            {schoolClass.type}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary">
                                            {schoolClass.studentCount} Schüler
                                        </Typography>

                                        <Box mt={2} display="flex" gap={1}>
                                            <Button variant="outlined" size="small">
                                                Verwalten
                                            </Button>

                                            <Button variant="outlined" size="small">
                                                Schüler
                                            </Button>

                                            <Button color="error" size="small">
                                                Löschen
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Typography color="text.secondary">
                                Noch keine Klassen vorhanden.
                            </Typography>
                        )}
                    </CardContent>
                </Card>

                <Dialog
                    open={openDialog}
                    onClose={() => setOpenDialog(false)}
                    fullWidth>
                    <DialogTitle>
                        Neue Klasse erstellen
                    </DialogTitle>

                    <DialogContent sx={{display: "flex", flexDirection: "column", gap: 2, pt: 2,}}>
                        <TextField
                            label="Klassenname"
                            value={newClass.name}
                            onChange={(e) =>
                                setNewClass({
                                    ...newClass,
                                    name: e.target.value,
                                })
                            }
                        />

                        <TextField
                            select
                            label="Schultyp"
                            value={newClass.type}
                            onChange={(e) =>
                                setNewClass({
                                    ...newClass,
                                    type: e.target.value as SchoolClassType,
                                })
                            }
                        >
                            {Object.values(SchoolClassType).map((type) => (
                                <MenuItem
                                    key={type}
                                    value={type}
                                >
                                    {type}
                                </MenuItem>
                            ))}
                        </TextField>
                    </DialogContent>

                    <DialogActions>
                        <Button
                            onClick={() =>
                                setOpenDialog(false)
                            }
                        >
                            Abbrechen
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleCreateClass}
                        >
                            Erstellen
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </TeacherLayout>
    );
};

export default ClassOverviewPage;