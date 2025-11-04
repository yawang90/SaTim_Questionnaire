import {BrowserRouter, Route, Routes} from 'react-router-dom';
import DashboardPage from "../pages/survey/DashboardPage.tsx";
import NotFoundPage from "../pages/NotFoundPage.tsx";
import LandingPage from '../pages/LandingPage.tsx';
import AnswerEditorPage from "../pages/questions/AnswerEditorPage.tsx";
import EditorPage from "../pages/questions/QuestionEditorPage.tsx";
import AnswerPreviewPage from "../pages/questions/AnswerPreviewPage.tsx";
import QuestionsTablePage from "../pages/QuestionsTablePage.tsx";
import ProfilePage from "../pages/ProfilePage.tsx";
import MetaDataPage from "../pages/questions/MetaDataPage.tsx";
import SurveyUpdatePage from "../pages/survey/SurveyUpdatePage.tsx";
import SurveyDetailPage from "../pages/survey/SurveyDetailPage.tsx";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/survey/:id" element={<SurveyUpdatePage />} />
                <Route path="/survey/details/:id" element={<SurveyDetailPage />} />

                <Route path="/meta/:id?" element={<MetaDataPage />} />
                <Route path="/editor/:id" element={<EditorPage />} />
                <Route path="/answers/:id" element={<AnswerEditorPage />} />
                <Route path="/preview/:id" element={<AnswerPreviewPage />} />

                <Route path="/table" element={<QuestionsTablePage />} />
                <Route path="/profile" element={<ProfilePage />} />

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
