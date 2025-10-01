import React from "react";
import {Box, Step, StepLabel, Stepper} from "@mui/material";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import MainLayout from "./MainLayout";

const steps = [
    { label: "Metadaten", path: "/meta" },
    { label: "Aufgabe", path: "/editor" },
    { label: "Antworten", path: "/answers" },
    { label: "Abschliessen", path: "/preview" },
];

interface QuestionLayoutProps {
    children: React.ReactNode;
    allowedSteps?: boolean[];
}

export default function QuestionLayout({children, allowedSteps = [true, false, false, false],}: QuestionLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();

    const activeStep = steps.findIndex((s) => location.pathname.startsWith(s.path));

    const handleStepClick = (path: string, enabled: boolean) => {
        if (!enabled) return;
        if (id) navigate(`${path}/${id}`);
        else navigate(path);
    };

    return (
        <MainLayout>
            <Box sx={{minHeight: "100vh", backgroundColor: "background.default", py: 3, px: 2, display: "flex", flexDirection: "column", mt: 6,}}>
                <Box sx={{ mb: 4 }}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {steps.map((step, index) => {
                            const enabled = allowedSteps[index];
                            return (
                                <Step
                                    key={step.label}
                                    onClick={() => handleStepClick(step.path, enabled)}
                                    sx={{cursor: enabled ? "pointer" : "not-allowed", opacity: enabled ? 1 : 0.5, pointerEvents: enabled ? "auto" : "none", "& .MuiStepLabel-label": {color: enabled ? "text.primary" : "text.disabled",},}}>
                                    <StepLabel>{step.label}</StepLabel>
                                </Step>
                            );
                        })}
                    </Stepper>
                </Box>

                <Box sx={{ flexGrow: 1 }}>{children}</Box>
            </Box>
        </MainLayout>
    );
}
