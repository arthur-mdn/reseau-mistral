// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Logout from "./pages/Logout.jsx";
import BottomBar from "./components/BottomBar.jsx";
import { TopBarProvider } from './TopBarContext';
import TopBar from './components/TopBar';
import Home from './pages/Home.jsx';
import Tickets from "./pages/Tickets.jsx";
import Trafic from "./pages/Trafic.jsx";
import Menu from "./pages/Menu.jsx";
import Horaires from "./pages/Horaires.jsx";
import Ticket from "./pages/Ticket.jsx";
import Loading from "./components/Loading.jsx";

const AuthenticatedApp = () => {
    const { authStatus } = useAuth();

    return (
        <Router>
            {authStatus === "loading" ? (
                <Loading />
            ) : (
                <>
                    <TopBarProvider>
                        <TopBar />
                        <Routes>
                            {authStatus === "unauthenticated" ? (
                                <>
                                    {/* Routes publiques */}
                                    <Route path="/" element={<Login />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />
                                </>
                            ) : (
                                <>
                                    {/* Routes privées */}
                                    <Route path="/" element={<Home />} />
                                    <Route path="/horaires" element={<Horaires />} />
                                    <Route path="/tickets" element={<Tickets />} />
                                    <Route path="/tickets/:ticketId" element={<Ticket />} />
                                    <Route path="/trafic" element={<Trafic />} />
                                    <Route path="/menu" element={<Menu />} />
                                    <Route path="/logout" element={<Logout />} />
                                </>
                            )}

                            <Route path="*" element={<Navigate to={authStatus === "unauthenticated" ? "/login" : "/"} />} />
                        </Routes>
                    </TopBarProvider>
                    <BottomBar />
                </>
            )}
        </Router>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <AuthenticatedApp />
        </AuthProvider>
    );
};

export default App;
