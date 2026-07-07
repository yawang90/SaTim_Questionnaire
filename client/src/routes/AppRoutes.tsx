import {BrowserRouter, Route, Routes} from 'react-router-dom';
import DashboardPage from "../pages/survey/DashboardPage.tsx";
import NotFoundPage from "../pages/NotFoundPage.tsx";
import LandingPage from '../pages/LandingPage.tsx';
import AnswerEditorPage from "../pages/editor/AnswerEditorPage.tsx";
import EditorPage from "../pages/editor/QuestionEditorPage.tsx";
import AnswerPreviewPage from "../pages/editor/AnswerPreviewPage.tsx";
import QuestionsTablePage from "../pages/QuestionsTablePage.tsx";
import ProfilePage from "../pages/ProfilePage.tsx";
import MetaDataPage from "../pages/editor/MetaDataPage.tsx";
import SurveyUpdatePage from "../pages/survey/SurveyUpdatePage.tsx";
import SurveyInstancePage from "../pages/survey/SurveyInstancePage.tsx";
import QuizPage from "../pages/quiz/QuizPage.tsx";
import TeamPage from '../pages/TeamPage.tsx';
import LoggedInRoute from './LoggedInRoute.tsx';
import NoTeamPage from '../pages/NoTeamPage.tsx';
import TeacherPage from "../pages/TeacherPage.tsx";
import TeacherRegistrationPage from "../pages/teacher/TeacherRegistrationPage.tsx";
import ClassOverviewPage from "../pages/teacher/ClassOverviewPage.tsx";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />

                {/* PUBLIC */}
                <Route path="/quiz/:id" element={<QuizPage />} />
                <Route path="/table" element={<QuestionsTablePage />} />
                <Route path="/noTeam" element={<NoTeamPage />} />
                <Route path="/teacher/register" element={<TeacherRegistrationPage />} />

                {/* TEACHER */}
                <Route path="/teacher/classes" element={<ClassOverviewPage />} />

                {/* PROTECTED */}
                <Route path="/dashboard" element={<LoggedInRoute><DashboardPage /></LoggedInRoute>} />
                <Route path="/survey/:id" element={<LoggedInRoute><SurveyUpdatePage /></LoggedInRoute>} />
                <Route path="/survey/details/:id" element={<LoggedInRoute><SurveyInstancePage /></LoggedInRoute>} />
                <Route path="/meta/:id?" element={<LoggedInRoute><MetaDataPage /></LoggedInRoute>} />
                <Route path="/editor/:id" element={<LoggedInRoute><EditorPage /></LoggedInRoute>} />
                <Route path="/answers/:id" element={<LoggedInRoute><AnswerEditorPage /></LoggedInRoute>} />
                <Route path="/preview/:id" element={<LoggedInRoute><AnswerPreviewPage /></LoggedInRoute>} />

                <Route path="/profile" element={<LoggedInRoute><ProfilePage /></LoggedInRoute>} />
                <Route path="/team" element={<LoggedInRoute><TeamPage /></LoggedInRoute>} />
                <Route path="/teachers" element={<LoggedInRoute><TeacherPage /></LoggedInRoute>} />

                {/* PUBLIC */}
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
