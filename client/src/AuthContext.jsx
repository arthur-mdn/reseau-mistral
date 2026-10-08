import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api, { setUnauthorizedHandler } from './api';

export const AuthContext = createContext();

function isSessionUnavailableError(error) {
    if (!error.response) return true;
    const status = error.response.status;
    return status >= 500 || status === 408 || status === 429;
}

export const AuthProvider = ({ children }) => {
    const [authStatus, setAuthStatus] = useState('loading');

    const retrySession = useCallback(async () => {
        setAuthStatus('loading');
        try {
            const response = await api.get('/auth/validate-session');
            setAuthStatus(response.data.isAuthenticated ? 'authenticated' : 'unauthenticated');
        } catch (error) {
            if (isSessionUnavailableError(error)) {
                setAuthStatus('error');
                return;
            }
            setAuthStatus('unauthenticated');
        }
    }, []);

    useEffect(() => {
        setUnauthorizedHandler(() => {
            setAuthStatus('unauthenticated');
        });

        retrySession();
    }, [retrySession]);

    return (
        <AuthContext.Provider value={{ authStatus, setAuthStatus, retrySession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
