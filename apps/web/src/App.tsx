import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SimplifiedDashboard } from './features/dashboard/pages/Dashboard';
import { Records } from './features/records/pages/Records';
import { Hisobot } from './features/records/pages/Hisobot';
import { Navbar } from './components/layout/Navbar';
import { EntryProvider } from './context/EntryContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
    return (
        <ThemeProvider>
            <EntryProvider>
                <BrowserRouter>
                    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
                        <Navbar />
                        <main className="py-6 md:py-10 px-4 md:px-8">
                            <Routes>
                                <Route path="/" element={<SimplifiedDashboard />} />
                                <Route path="/records" element={<Records />} />
                                <Route path="/hisobot" element={<Hisobot />} />
                            </Routes>
                        </main>
                    </div>
                </BrowserRouter>
            </EntryProvider>
        </ThemeProvider>
    );
}

export default App;
