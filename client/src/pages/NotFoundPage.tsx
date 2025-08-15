import { Link } from 'react-router-dom';
import {useTranslation} from "react-i18next";
import MainLayout from "../layouts/MainLayout.tsx";
import {Box, Typography} from "@mui/material";

const NotFoundPage = () => {
    const { t } = useTranslation();

    return (
        <MainLayout>
            <Box sx={{width: 600, mx: 'auto', mt: 12, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 3, borderRadius: 2,}}>
                <Typography variant="h5" gutterBottom>
                    {t("pageNotFound")}
                </Typography>
                <Typography variant="body1" align="center" sx={{mb: 3}}>
                    <Link to="/" className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                        {t("pageReload")}
                    </Link>
                </Typography>
            </Box>
        </MainLayout>
    );
};

export default NotFoundPage;
