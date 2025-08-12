import {BrowserRouter, Route, Routes} from 'react-router-dom';
import DashboardPage from "../pages/DashboardPage.tsx";
import NotFoundPage from "../pages/NotFoundPage.tsx";
import LandingPage from '../pages/LandingPage.tsx';

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/dashboard" element={<DashboardPage/>}/>
                <Route path="*" element={<NotFoundPage/>}/>
                <Route path="/" element={<LandingPage/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
