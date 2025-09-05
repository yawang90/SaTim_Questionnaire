import {Box, Card, CardContent, CardHeader, Typography} from '@mui/material';
import MainLayout from '../layouts/MainLayout.tsx';
import GeoGebraApp from "../components/GeoGebra/GeoGebraApp.tsx";
import {useState} from "react";
import "mathlive";
import MathField from "../components/MathField.tsx";

export default function AnswerConfiguratorPage() {
   // const { t } = useTranslation();
    const [latex, setLatex] = useState("\\frac{1}{2}");
    return (
        <MainLayout>
            <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', py: 3, px: 2, display: 'flex', flexDirection: 'column', mt: 6 }}>
                <Box sx={{ width: '100%', pl: 3 }}>
                    <Card>
                        <CardHeader
                            title={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="h4">Aufgaben Beurteilung festlegen </Typography>
                                </Box>
                            }
                            sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
                        />
                        <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <GeoGebraApp
                                materialId="pfeKePU3"
                                onChange={(expr) => console.log("Formula changed:", expr)}
                            />
                            <div style={{ padding: "20px" }}>
                                <MathField
                                    value={latex}
                                    onChange={setLatex}
                                    style={{ fontSize: "1.2rem", border: "1px solid #ccc", padding: 8 }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </MainLayout>
    );
}
