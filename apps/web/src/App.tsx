import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SimplifiedDashboard } from './features/dashboard/pages/Dashboard';
import { Records } from './features/records/pages/Records';
import { Hisobot } from './features/records/pages/Hisobot';
import { Login } from './features/auth/pages/Login';
import { Register } from './features/auth/pages/Register';
import { Profile } from './features/dashboard/pages/Profile';
import { ForgotPassword } from './features/auth/pages/ForgotPassword';
import { ResetPassword } from './features/auth/pages/ResetPassword';
import { Navbar } from './components/layout/Navbar';
import { EntryProvider } from './context/EntryContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

import { Toaster } from 'sonner';

function App() {
    return (
        <ThemeProvider>
            <Toaster position="top-center" richColors />
            <AuthProvider>
                <EntryProvider>
                    <BrowserRouter>
                        <AppContent />
                    </BrowserRouter>
                </EntryProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
}

import { LoadingScreen } from './components/ui/LoadingScreen';

function AppContent() {
    const location = useLocation();
    const { isAuthenticated, loading } = useAuth();
    const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
            {!isAuthPage && <Navbar />}
            <main className={!isAuthPage ? "py-6 md:py-10 px-4 md:px-8" : ""}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route
                        path="/"
                        element={
                            isAuthenticated ? (
                                <Navigate to="/dashboard" replace />
                            ) : (
                                <Navigate to="/login" replace />
                            )
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <SimplifiedDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/records"
                        element={
                            <ProtectedRoute>
                                <Records />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/hisobot"
                        element={
                            <ProtectedRoute>
                                <Hisobot />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>
        </div>
    );
}

export default App;
