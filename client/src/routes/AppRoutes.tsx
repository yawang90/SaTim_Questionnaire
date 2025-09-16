import {BrowserRouter, Route, Routes} from 'react-router-dom';
import DashboardPage from "../pages/DashboardPage.tsx";
import NotFoundPage from "../pages/NotFoundPage.tsx";
import LandingPage from '../pages/LandingPage.tsx';
import AnswerEditorPage from "../pages/questions/AnswerEditorPage.tsx";
import EditorPage from "../pages/questions/QuestionEditorPage.tsx";
import QuestionsPage from "../pages/questions/QuestionsPage.tsx";
import QuestionPreviewPage from "../pages/questions/QuestionPreviewPage.tsx";
import QuestionsTablePage from "../pages/QuestionsTablePage.tsx";
import SurveyPage from "../pages/SurveyPage.tsx";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/editor" element={<EditorPage />} />
                <Route path="/answers" element={<AnswerEditorPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/questions" element={<QuestionsPage />} />
                <Route path="/preview" element={<QuestionPreviewPage />} />
                <Route path="/table" element={<QuestionsTablePage />} />
                <Route path="/survey" element={<SurveyPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
