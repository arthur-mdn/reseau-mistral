import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { setUnauthorizedHandler } from './api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authStatus, setAuthStatus] = useState('loading');

    useEffect(() => {
        setUnauthorizedHandler(() => {
            setAuthStatus('unauthenticated');
        });

        api.get('/auth/validate-session')
            .then((response) => {
                setAuthStatus(response.data.isAuthenticated ? 'authenticated' : 'unauthenticated');
            })
            .catch(() => {
                setAuthStatus('unauthenticated');
            });
    }, []);

    return (
        <AuthContext.Provider value={{ authStatus, setAuthStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
