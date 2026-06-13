import React, {useEffect, useState} from "react";
import {Box, Button, Card, CardContent, CircularProgress, TextField, Typography,} from "@mui/material";
import {useParams} from "react-router-dom";
import {registerTeacher, verifyTeacherInvite} from "../../services/TeacherService.tsx";
import GeneralLayout from "../../layouts/GeneralLayout.tsx";

const TeacherRegistrationPage = () => {
    const { token } = useParams();

    const [loading, setLoading] = useState(true);
    const [validToken, setValidToken] = useState(false);

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        schoolName: "",
        schoolAddress: "",
    });

    useEffect(() => {
        const verify = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                await verifyTeacherInvite(token);
                setValidToken(true);
            } catch (err) {
                console.error(err);
                setValidToken(true);
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, [token]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async () => {
        try {
            await registerTeacher({token, ...form,});
            alert("Registrierung erfolgreich");
        } catch (err) {
            console.error(err);
            alert("Registrierung fehlgeschlagen");
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={10}>
                <CircularProgress />
            </Box>
        );
    }

    if (!validToken) {
        return (
                <Box sx={{width: 600, mx: 'auto', mt: 12, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 3, borderRadius: 2,}}>
                    <Typography variant="h5" gutterBottom>
                        Der Einladungslink ist ungültig oder abgelaufen, bitte fordern Sie einen neuen Link.
                    </Typography>
                </Box>
        );
    }

    return (
        <GeneralLayout>
        <Box width={700}  mt={6}>
            <Card>
                <CardContent>
                    <Typography variant="h4" gutterBottom>
                        Lehrperson Registrierung
                    </Typography>

                    <Box display="flex" flexDirection="column" gap={2}>
                        <TextField
                            label="Vorname"
                            name="firstName"
                            value={form.firstName}
                            onChange={handleChange}
                            required
                        />

                        <TextField
                            label="Nachname"
                            name="lastName"
                            value={form.lastName}
                            onChange={handleChange}
                            required
                        />

                        <TextField
                            label="E-Mail"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />

                        <TextField
                            label="Schule"
                            name="schoolName"
                            value={form.schoolName}
                            onChange={handleChange}
                            required
                        />

                        <TextField
                            label="Adresse der Schule"
                            name="schoolAddress"
                            multiline
                            rows={3}
                            value={form.schoolAddress}
                            onChange={handleChange}
                            required
                        />

                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                        >
                            Registrieren
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box></GeneralLayout>
    );
};

export default TeacherRegistrationPage;