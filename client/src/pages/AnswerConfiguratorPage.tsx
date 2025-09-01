import { Box } from '@mui/material';
import MainLayout from '../layouts/MainLayout.tsx';
import { useTranslation } from "react-i18next";
import GeoGebraApp from "../components/GeoGebra/GeoGebraApp.tsx";

export default function AnswerConfiguratorPage() {
    const { t } = useTranslation();

    return (
        <MainLayout>
            <Box display="flex" justifyContent="center" alignItems="center" p={2} pt={30}>
                <GeoGebraApp
                    width={800}
                    height={600}
                    showAlgebraInput={true}
                    showGraphView={true}
                    materialId="RHYH3UQ8"
                    onChange={(expr) => console.log("Formula changed:", expr)}
                />
            </Box>
        </MainLayout>
    );
}
