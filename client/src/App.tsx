import {CssBaseline, ThemeProvider} from "@mui/material";
import AppRoutes from "./routes/AppRoutes.tsx";
import theme from "./styles/theme.ts";

export default function App() {

    return <div>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AppRoutes/>
        </ThemeProvider>
    </div>;
}
