import {BrowserRouter, Outlet, Route, Routes} from 'react-router-dom';
import LoggedInRoute from './LoggedInRoute';
import DashboardPage from "../pages/DashboardPage.tsx";
import NotFoundPage from "../pages/NotFoundPage.tsx";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<LoggedInRoute><Outlet /></LoggedInRoute>}>
                    <Route path="/dashboard" element={<DashboardPage/>}/>
                </Route>
                <Route path="*" element={<NotFoundPage/>}/>
                <Route path="/" element={<DashboardPage/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;
