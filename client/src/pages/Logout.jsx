import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import api from '../api';

function Logout() {
    const { setAuthStatus } = useAuth();

    useEffect(() => {
        api.post('/auth/logout', {})
            .catch(() => {})
            .finally(() => {
                setAuthStatus('unauthenticated');
            });
    }, [setAuthStatus]);

    return <Navigate to="/login" />;
}

export default Logout;
