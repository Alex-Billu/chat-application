import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="min-h-screen gradient-bg flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );
    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen gradient-bg text-white selection:bg-indigo-500/30">
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/dashboard" element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        } />
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                        <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
