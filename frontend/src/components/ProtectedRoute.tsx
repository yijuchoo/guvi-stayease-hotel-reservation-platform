import type {ReactNode} from 'react';
import {Navigate} from 'react-router-dom';
import {useAppSelector} from '../app/hooks';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: 'CUSTOMER' | 'HOTEL_MANAGER' | 'ADMIN';
}

function ProtectedRoute({children, requiredRole}: ProtectedRouteProps) {
    const {token, roles} = useAppSelector((state) => state.auth);

    if (!token) {
        return <Navigate to="/login" replace/>;
    }

    if (requiredRole && !roles.includes(requiredRole)) {
        return <Navigate to="/" replace/>;
    }

    return <>{children}</>;
}

export default ProtectedRoute;


/*
This redirects to /login if not authenticated at all, or back to / if authenticated but with the wrong role —
matching the same two-layer enforcement your backend already does (@PreAuthorize + ownership checks), just at the
UI-routing level for a better user experience (the backend remains the actual security boundary regardless)
*/
