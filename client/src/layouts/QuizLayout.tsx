import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import type {ReactNode} from "react";

interface QuizLayoutProps {
    children: ReactNode;
    totalQuestions: number;
    answeredQuestions: number;
    userId: string;
}

export default function QuizLayout({children, totalQuestions, answeredQuestions, userId}: QuizLayoutProps) {

    const progress = totalQuestions > 0
        ? (answeredQuestions / totalQuestions) * 100
        : 0;

    return (
        <>
            <AppBar position="fixed" sx={{ width: '100%' }}>
                <Toolbar sx={{width: '100%', maxWidth: '100%', px: 2, boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', gap: 2}}>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" color="inherit" gutterBottom>
                            Frage {answeredQuestions} von {totalQuestions}
                        </Typography>
                        <LinearProgress color="secondary" variant="determinate" value={progress} sx={{ height: 10, width:1000, borderRadius: 5 }}/>
                    </Box>

                    <Box>
                        <Typography variant="body1" color="inherit">
                            UserId: {userId}
                        </Typography>
                    </Box>
                </Toolbar>
            </AppBar>

            <main style={{ padding: '2rem', marginTop: 80 }}>
                {children}
            </main>
        </>
    );
}
