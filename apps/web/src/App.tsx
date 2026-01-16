import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SimplifiedDashboard } from './features/dashboard/pages/Dashboard';
import { Records } from './features/records/pages/Records';
import { Hisobot } from './features/records/pages/Hisobot';
import { Login } from './features/auth/pages/Login';
import { Register } from './features/auth/pages/Register';
import { Profile } from './features/dashboard/pages/Profile';
import { Markets } from './features/markets/pages/Markets';
import { Products } from './features/products/pages/Products';
import { ForgotPassword } from './features/auth/pages/ForgotPassword';
import { ResetPassword } from './features/auth/pages/ResetPassword';
import { MarketDashboard } from './features/dashboard/MarketDashboard';
import { AdminDashboard } from './features/dashboard/pages/AdminDashboard';
import { Navbar } from './components/layout/Navbar';
import { EntryProvider } from './context/EntryContext';
import { ThemeProvider } from './context/ThemeContext';
import { MarketProvider } from './context/MarketContext';
import { ProductProvider } from './context/ProductContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <Toaster
                    position="top-center"
                    richColors
                    toastOptions={{
                        className: 'shadow-2xl border border-white/20 backdrop-blur-xl',
                        style: {
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '16px',
                        },
                        classNames: {
                            toast: 'shadow-2xl',
                            success: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800',
                            error: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800',
                            info: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800',
                        }
                    }}
                />
                <AuthProvider>
                    <EntryProvider>
                        <MarketProvider>
                            <ProductProvider>
                                <BrowserRouter>
                                    <AppContent />
                                </BrowserRouter>
                            </ProductProvider>
                        </MarketProvider>
                    </EntryProvider>
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

function ProtectedRoute({ children, role }: { children: React.ReactNode, role?: 'seller' | 'market' | 'admin' }) {
    const { isAuthenticated, profile, loading } = useAuth();

    if (loading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (role && profile && profile.role !== role) {
        const target = profile.role === 'admin' ? '/admin-dashboard' : (profile.role === 'seller' ? '/dashboard' : '/market-dashboard');
        return <Navigate to={target} replace />;
    }

    return <>{children}</>;
}

function AppContent() {
    const location = useLocation();
    const { isAuthenticated, profile, loading } = useAuth();
    const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
            {!isAuthPage && <Navbar />}
            <main className={!isAuthPage ? "py-6 md:py-10 px-4 md:px-8" : ""}>
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route
                            path="/"
                            element={
                                isAuthenticated ? (
                                    <Navigate to={profile?.role === 'admin' ? '/admin-dashboard' : (profile?.role === 'seller' ? '/dashboard' : '/market-dashboard')} replace />
                                ) : (
                                    <Navigate to="/login" replace />
                                )
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute role="seller">
                                    <SimplifiedDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/market-dashboard"
                            element={
                                <ProtectedRoute role="market">
                                    <MarketDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin-dashboard"
                            element={
                                <ProtectedRoute role="admin">
                                    <AdminDashboard />
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
                            path="/markets"
                            element={
                                <ProtectedRoute>
                                    <Markets />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/products"
                            element={
                                <ProtectedRoute>
                                    <Products />
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
                </AnimatePresence>
            </main>
        </div>
    );
}

export default App;
