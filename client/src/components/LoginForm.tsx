import { useState } from "react";
import {Box, TextField, Button, Card, CardContent, CardHeader, Typography,} from "@mui/material";
import { useSnackbar } from "notistack";
import {useTranslation} from "react-i18next";

interface LoginFormProps {
    onSuccess?: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
    const {t} = useTranslation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            enqueueSnackbar("You have successfully logged in.", { variant: "success" });
            onSuccess?.();
        }, 1000);
    };

    return (
        <Card sx={{ width: "100%", maxWidth: 400, mx: "auto" }}>
            <CardHeader
                title={
                    <Typography variant="h5" align="center" fontWeight="bold">
                        {t("loginForm.title")}
                    </Typography>
                }
                subheader={
                    <Typography variant="body2" align="center" color="text.secondary">
                        {t("loginForm.subtitle")}
                    </Typography>
                }
            />
            <CardContent>
                <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField label={t("loginForm.email")} type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth/>
                    <TextField label={t("loginForm.password")} type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth/>
                    <Button type="submit" variant="contained" fullWidth disabled={isLoading}>
                        {isLoading ? t("loginForm.amAnmelden") : t("loginForm.anmelden")}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};
