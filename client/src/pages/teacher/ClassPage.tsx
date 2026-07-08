import React, {useEffect, useState} from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    IconButton,
    Snackbar,
    TextField,
    Typography,
} from "@mui/material";
import {ArrowBack, ContentCopy} from "@mui/icons-material";
import {useNavigate, useParams} from "react-router-dom";

import TeacherLayout from "../../layouts/TeacherLayout";
import {
    getClass,
    getStudents,
    type SchoolClass,
} from "../../services/ClassService";

interface Student {
    id: number;
    first_name: string;
    last_name: string;
    birthday: string;
    email?: string;
}

const ClassPage = () => {
    const {id} = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [loadingSuS, setLoadingSuS] = useState(true);

    const [schoolClass, setSchoolClass] = useState<SchoolClass | null>(null);
    const [students, setStudents] = useState<Student[]>([]);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error",
    });

    useEffect(() => {
        const load = async () => {
            if (!id) return;

            try {
                setLoading(true);
                const classData = await getClass(Number(id));
                setSchoolClass(classData);
            } catch (err) {
                console.error(err);
                setSnackbar({open: true, message: "Klasse konnte nicht geladen werden.", severity: "error",
                });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);


    useEffect(() => {
        const loadSuS = async () => {
            if (!id) return;
            try {
                setLoadingSuS(true);
                const studentData = await getStudents(Number(id));
                setStudents(studentData);
            } catch (err) {
                console.error(err);
                setSnackbar({open: true, message: "SuS konnten nicht geladen werden.", severity: "error",
                });
            } finally {
                setLoadingSuS(false);
            }
        };
        loadSuS();
    }, [id]);

    if (loading || loadingSuS) {
        return (
            <TeacherLayout>
                <Box display="flex" justifyContent="center" mt={10}>
                    <CircularProgress/>
                </Box>
            </TeacherLayout>
        );
    }

    if (!schoolClass) {
        return (
            <TeacherLayout>
                <Typography>Klasse nicht gefunden.</Typography>
            </TeacherLayout>
        );
    }

    const registrationLink =
        `${window.location.origin}/student/register/${schoolClass.registrationToken}`;

    return (
        <TeacherLayout>
            <Box sx={{maxWidth: 1000, mx: "auto", py: 3}}>

                <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false,})}>
                    <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar({...snackbar, open: false,})}>{snackbar.message}</Alert>
                </Snackbar>

                <Button startIcon={<ArrowBack/>} onClick={() => navigate("/teacher/classes")} sx={{mb: 2}}>
                    Zurück
                </Button>

                <Card sx={{mb: 3}}>
                    <CardHeader title={schoolClass.name}/>
                    <CardContent>

                        <Typography variant="body1">
                            <strong>Typ:</strong> {schoolClass.type}
                        </Typography>

                        <Typography variant="body1">
                            <strong>Schüler:</strong> {students.length}
                        </Typography>

                    </CardContent>
                </Card>

                <Card sx={{mb: 3}}>
                    <CardHeader title="Registrierungslink"/>
                    <CardContent>
                        <Typography color="text.secondary" mb={2}>
                            Teilen Sie diesen Link mit Ihren Schülerinnen und Schülern.
                        </Typography>

                        <Box display="flex" gap={2}>
                            <TextField fullWidth value={registrationLink} slotProps={{input: {
                                readOnly: true,},}}/>
                            <IconButton
                                onClick={() => {
                                    navigator.clipboard.writeText(registrationLink);
                                    setSnackbar({open: true, message: "Registrierungslink kopiert.", severity: "success",});
                                }}>
                                <ContentCopy/>
                            </IconButton>
                        </Box>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader title={`Schüler (${students.length})`}/>
                    <CardContent>
                        {students.length === 0 ? (
                            <Typography color="text.secondary">
                                Noch keine Schülerinnen oder Schüler registriert.
                            </Typography>) : (
                            <Box display="flex" flexDirection="column" gap={2}>
                                {students.map((student) => (
                                    <Card key={student.id} variant="outlined">
                                        <CardContent>

                                            <Typography variant="h6">
                                                {student.first_name}{" "}
                                                {student.last_name}
                                            </Typography>

                                            <Typography color="text.secondary">
                                                Geburtstag:{" "}
                                                {new Date(student.birthday).toLocaleDateString()}
                                            </Typography>

                                            {student.email && (
                                                <Typography color="text.secondary">
                                                    {student.email}
                                                </Typography>
                                            )}

                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        )}

                    </CardContent>
                </Card>

            </Box>
        </TeacherLayout>
    );
};

export default ClassPage;