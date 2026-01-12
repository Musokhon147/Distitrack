import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
                    <div className="max-w-md w-full glass-card rounded-2xl p-8 border-2 border-red-200 dark:border-red-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                                <AlertTriangle className="text-red-600 dark:text-red-400" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Xatolik yuz berdi
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400">
                                {this.state.error?.message || 'Kutilmagan xatolik yuz berdi'}
                            </p>
                            <button
                                onClick={() => {
                                    this.setState({ hasError: false, error: null });
                                    window.location.reload();
                                }}
                                className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                            >
                                Sahifani yangilash
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
