import {BrowserRouter, Route, Routes} from 'react-router-dom';
import DashboardPage from "../pages/DashboardPage.tsx";
import NotFoundPage from "../pages/NotFoundPage.tsx";
import LandingPage from '../pages/LandingPage.tsx';
import EditorPage from "../pages/Editor.tsx";
import LoginPage from "../pages/LoginPage.tsx";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage/>}/>
                <Route path="*" element={<NotFoundPage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/editor" element={<EditorPage/>}/>
                <Route path="/dashboard" element={<DashboardPage/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
