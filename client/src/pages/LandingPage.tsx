import {useState} from "react";
import {useTranslation} from "react-i18next";
import {Box, Typography, Button, Dialog, DialogContent} from "@mui/material";
import {LoginForm} from "../components/LoginForm.tsx";
import {RegisterForm} from "../components/RegisterForm.tsx";
import {useNavigate} from "react-router-dom";

const LandingPage = () => {
    const {t} = useTranslation();
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const navigate = useNavigate();

    const handleLoginSuccess = () =>
    {
        setIsLoginOpen(false);
        navigate('/dashboard');

    }
    const handleRegisterSuccess = () =>
    {
        setIsRegisterOpen(false);
        navigate('/dashboard');
    }

    const openRegister = () => {
        setIsLoginOpen(false);
        setIsRegisterOpen(true);
    };

    const openLogin = () => {
        setIsRegisterOpen(false);
        setIsLoginOpen(true);
    };

    return (
        <Box sx={{minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default",}}>
            <Box sx={{textAlign: "center"}}>
                <Typography variant="h2" fontWeight={300} color="text.primary" gutterBottom>
                    {t("landing.title")}
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{mb: 4}}>
                    {t("landing.subtitle")}
                </Typography>

                <Box sx={{display: "flex", flexDirection: "column", gap: 2, width: 260, mx: "auto"}}>
                    <Button variant="outlined" onClick={openLogin} fullWidth>
                        {t("login")}
                    </Button>
                    <Button variant="contained" onClick={openRegister} fullWidth>
                        {t("register")}
                    </Button>
                </Box>
            </Box>

            <Dialog open={isLoginOpen} onClose={() => setIsLoginOpen(false)} maxWidth="xs" fullWidth>
                <DialogContent>
                    <LoginForm onSuccess={handleLoginSuccess}/>
                    <Typography variant="body2" align="center" sx={{mt: 2}}>
                        {t("landing.noAccount")}{" "}
                        <Button variant="text" onClick={openRegister}>
                            {t("landing.signUp")}
                        </Button>
                    </Typography>
                </DialogContent>
            </Dialog>

            <Dialog open={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} maxWidth="xs" fullWidth>
                <DialogContent>
                    <RegisterForm onSuccess={handleRegisterSuccess}/>
                    <Typography variant="body2" align="center" sx={{mt: 2}}>
                        {t("landing.alreadyAccount")}{" "}
                        <Button variant="text" onClick={openLogin}>
                            {t("landing.signIn")}
                        </Button>
                    </Typography>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default LandingPage;
