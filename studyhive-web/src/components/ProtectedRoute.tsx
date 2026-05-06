import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';
import AuthBootstrapSkeleton from './AuthBootstrapSkeleton';

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { session, loading, bootstrapError, retryBootstrap, signOut } = useAuth();

    if (loading) {
        return <AuthBootstrapSkeleton />;
    }

    if (!session) {
        return <Navigate to="/login" replace />;
    }

    if (bootstrapError) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                background: '#F8FAFC',
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: 460,
                    background: '#fff',
                    border: '1px solid #FECACA',
                    borderRadius: 16,
                    padding: 24,
                    boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
                }}>
                    <h1 style={{ margin: '0 0 10px', fontSize: 22, color: '#991B1B' }}>We could not finish signing you in.</h1>
                    <p style={{ margin: '0 0 18px', color: '#7F1D1D', lineHeight: 1.5 }}>{bootstrapError}</p>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button
                            type="button"
                            onClick={() => void retryBootstrap()}
                            style={{
                                background: '#2563EB',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 10,
                                padding: '10px 16px',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            Try Again
                        </button>
                        <button
                            type="button"
                            onClick={() => void signOut()}
                            style={{
                                background: '#fff',
                                color: '#334155',
                                border: '1px solid #CBD5E1',
                                borderRadius: 10,
                                padding: '10px 16px',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
