import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import { AuthProvider, useAuth } from './AuthContext';
import BottomBar from './components/BottomBar.jsx';
import { TopBarProvider } from './TopBarContext';
import TopBar from './components/TopBar';
import Loading from './components/Loading.jsx';
import DemoBanner from './components/DemoBanner.jsx';

const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Logout = lazy(() => import('./pages/Logout.jsx'));
const Home = lazy(() => import('./pages/Home.jsx'));
const Tickets = lazy(() => import('./pages/Tickets.jsx'));
const Trafic = lazy(() => import('./pages/Trafic.jsx'));
const Menu = lazy(() => import('./pages/Menu.jsx'));
const Horaires = lazy(() => import('./pages/Horaires.jsx'));
const Ticket = lazy(() => import('./pages/Ticket.jsx'));
const AuthError = lazy(() => import('./pages/AuthError.jsx'));

const AuthenticatedApp = () => {
    const { authStatus } = useAuth();

    return (
        <Router>
            <DemoBanner />
            {authStatus === 'loading' ? (
                <Loading />
            ) : authStatus === 'error' ? (
                <Suspense fallback={<Loading />}>
                    <AuthError />
                </Suspense>
            ) : (
                <>
                    <TopBarProvider>
                        <TopBar />
                        <Suspense fallback={<Loading />}>
                            <Routes>
                                {authStatus === 'unauthenticated' ? (
                                    <>
                                        <Route path="/" element={<Login />} />
                                        <Route path="/login" element={<Login />} />
                                        <Route path="/register" element={<Register />} />
                                    </>
                                ) : (
                                    <>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/horaires" element={<Horaires />} />
                                        <Route path="/tickets" element={<Tickets />} />
                                        <Route path="/tickets/:ticketId" element={<Ticket />} />
                                        <Route path="/trafic" element={<Trafic />} />
                                        <Route path="/menu" element={<Menu />} />
                                        <Route path="/logout" element={<Logout />} />
                                    </>
                                )}
                                <Route path="*" element={<Navigate to={authStatus === 'unauthenticated' ? '/login' : '/'} />} />
                            </Routes>
                        </Suspense>
                    </TopBarProvider>
                    <BottomBar />
                </>
            )}
        </Router>
    );
};

const App = () => {
    return (
        <CookiesProvider defaultSetOptions={{ path: '/' }}>
            <AuthProvider>
                <AuthenticatedApp />
            </AuthProvider>
        </CookiesProvider>
    );
};

export default App;
