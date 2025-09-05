import {BrowserRouter, Route, Routes} from 'react-router-dom';
import DashboardPage from "../pages/DashboardPage.tsx";
import NotFoundPage from "../pages/NotFoundPage.tsx";
import LandingPage from '../pages/LandingPage.tsx';
import EditorPage from "../pages/survey/Editor.tsx";
import AnswerConfiguratorPage from "../pages/survey/AnswerConfiguratorPage.tsx";
import QuestionsPage from "../pages/survey/QuestionsPage.tsx";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/editor" element={<EditorPage />} />
                <Route path="/answers" element={<AnswerConfiguratorPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/questions" element={<QuestionsPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
