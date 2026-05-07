import {type ReactNode} from 'react';
import {Navigate} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';

interface LoggedInRouteProps {
    children: ReactNode;
}

const LoggedInRoute = ({ children }: LoggedInRouteProps) => {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn) {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
};

export default LoggedInRoute;
