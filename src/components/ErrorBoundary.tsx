import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
                    <Card className="border-none glassmorphism rounded-[32px] p-8 md:p-12 max-w-2xl w-full">
                        {/* Error Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                                <AlertTriangle className="w-10 h-10 text-destructive" />
                            </div>
                        </div>

                        {/* Error Message */}
                        <div className="text-center space-y-4 mb-8">
                            <h1 className="text-2xl md:text-4xl font-black tracking-tight">
                                Oops! Something went wrong
                            </h1>
                            <p className="text-sm md:text-base text-muted-foreground">
                                We encountered an unexpected error. Don't worry, our team has been notified.
                            </p>
                        </div>

                        {/* Error Details (Development) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-8 p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
                                <p className="text-xs font-bold text-destructive mb-2">Error Details (Dev Only):</p>
                                <pre className="text-[10px] text-muted-foreground overflow-auto max-h-40">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                onClick={this.handleReset}
                                variant="outline"
                                size="lg"
                                className="rounded-xl gap-2 font-bold"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </Button>
                            <Button
                                onClick={this.handleGoHome}
                                size="lg"
                                className="rounded-xl gap-2 font-bold shadow-lg shadow-primary/20"
                            >
                                <Home className="w-4 h-4" />
                                Back to Home
                            </Button>
                        </div>

                        {/* Help Text */}
                        <div className="mt-8 pt-8 border-t border-border/50 text-center">
                            <p className="text-xs text-muted-foreground">
                                If this problem persists, please{' '}
                                <a href="/#contact" className="text-primary hover:underline font-medium">
                                    contact support
                                </a>
                            </p>
                        </div>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
