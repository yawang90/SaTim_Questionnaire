import React from "react";
import MainLayout from "../layouts/MainLayout";
import { Box, Paper, Typography } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const LoginPage: React.FC = () => {
    const { isLoggedIn } = useAuth();
    const { t } = useTranslation();

    if (isLoggedIn) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <MainLayout>
            <Box sx={{minHeight: "calc(100vh - 64px)", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5",}}>
                <Paper elevation={3} sx={{ p: 4, width: 400 }}>
                    <Typography variant="h5" gutterBottom>
                        {t("welcome")}
                    </Typography>
                    <Typography variant="body1" align="center" sx={{mb: 3}}>
                        {t("loginPrompt")}
                    </Typography>
                    {/*<RegistrationButton fullWidth></RegistrationButton>*/}
                    {/*<p></p>*/}
                    {/*<LoginButton></LoginButton>*/}
                </Paper>
            </Box>
        </MainLayout>
    );
};

export default LoginPage;
