import {CssBaseline, ThemeProvider} from "@mui/material";
import AppRoutes from "./routes/AppRoutes.tsx";
import theme from "./styles/theme.ts";
import {AuthProvider} from "./contexts/AuthContext.tsx";

export default function App() {

    return <div>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <AppRoutes/>
            </AuthProvider>
        </ThemeProvider>
    </div>;
}
