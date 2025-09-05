import {BrowserRouter, Route, Routes} from 'react-router-dom';
import DashboardPage from "../pages/DashboardPage.tsx";
import NotFoundPage from "../pages/NotFoundPage.tsx";
import LandingPage from '../pages/LandingPage.tsx';
import EditorPage from "../pages/Editor.tsx";
import LoginPage from "../pages/LoginPage.tsx";
import AnswerConfiguratorPage from "../pages/AnswerConfiguratorPage.tsx";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/editor" element={<EditorPage />} />
                <Route path="/answers" element={<AnswerConfiguratorPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
