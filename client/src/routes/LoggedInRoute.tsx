import {useState, useEffect, type ReactNode} from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LoggedInRouteProps {
    children: ReactNode;
}

const LoggedInRoute = ({ children }: LoggedInRouteProps) => {
    const { isLoggedIn } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, [isLoggedIn]);

    if (loading) return null;

    return isLoggedIn ? <>{children}</> : <Navigate to="/" replace />;
};

export default LoggedInRoute;
