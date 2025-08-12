import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import {Link as RouterLink} from 'react-router-dom';
import Link from '@mui/material/Link';
import type {ReactNode} from "react";

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {

    return (
        <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 8 }}>
            <AppBar position="fixed" sx={{ width: '100%' }}>
                <Toolbar
                    sx={{width: '100%', maxWidth: '100%', px: 2, boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between'}}>
                    <Box>
                        <Link component={RouterLink} to="/" color="inherit" underline="none" sx={{ mr: 2 }} variant="button">
                            Home
                        </Link>
                    </Box>

                    <Box>
                        <Link component={RouterLink} to="/login" color="inherit" underline="none" variant="button">
                            Login
                        </Link>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                {children}
            </Box>
        </Box>
    );
}
