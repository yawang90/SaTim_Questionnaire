import { useState } from "react";
import {Box, TextField, Button, Card, CardContent, CardHeader, Typography, Snackbar, Alert,} from "@mui/material";
import {useTranslation} from "react-i18next";

interface RegisterFormProps {
    onSuccess?: () => void;
}

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
    const {t} = useTranslation();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error",
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setSnackbar({
                open: true,
                message: "Please make sure your passwords match.",
                severity: "error",
            });
            return;
        }

        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            setSnackbar({
                open: true,
                message: "Welcome! Your account has been successfully created.",
                severity: "success",
            });
            onSuccess?.();
        }, 1000);
    };

    return (
        <>
            <Card sx={{ width: "100%", maxWidth: 400, mx: "auto" }}>
                <CardHeader
                    title={
                        <Typography variant="h5" align="center" fontWeight="bold">
                            {t("registerForm.title")}
                        </Typography>
                    }
                    subheader={
                        <Typography variant="body2" align="center" color="text.secondary">
                            {t("registerForm.subtitle")}
                        </Typography>
                    }
                />
                <CardContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField label={t("registerForm.name")} placeholder="Enter your full name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} required fullWidth/>
                        <TextField label={t("registerForm.email")} type="email" placeholder="Enter your email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} required fullWidth/>
                        <TextField label={t("registerForm.password")} type="password" placeholder="Create a password" value={formData.password} onChange={(e) => handleInputChange("password", e.target.value)} required fullWidth/>
                        <TextField label={t("registerForm.passwordConfirm")} type="password" placeholder="Confirm your password" value={formData.confirmPassword} onChange={(e) => handleInputChange("confirmPassword", e.target.value)} required fullWidth/>
                        <Button type="submit" variant="contained" fullWidth disabled={isLoading}>
                            {isLoading ? t("registerForm.creating") : t("registerForm.create")}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};
