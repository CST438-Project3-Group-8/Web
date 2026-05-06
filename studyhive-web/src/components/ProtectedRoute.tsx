import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { ReactNode } from 'react';

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

function AuthBootstrapSkeleton() {
    return (
        <div className="bootstrap-shell">
            <aside className="bootstrap-sidebar">
                <div className="bootstrap-brand">
                    <div className="bootstrap-logo-skeleton bootstrap-shimmer" />
                    <div className="bootstrap-brand-text bootstrap-shimmer" />
                </div>

                <div className="bootstrap-nav">
                    <div className="bootstrap-nav-item bootstrap-shimmer" />
                    <div className="bootstrap-nav-item bootstrap-shimmer" />
                    <div className="bootstrap-nav-item bootstrap-shimmer" />
                    <div className="bootstrap-nav-item bootstrap-shimmer" />
                </div>

                <div className="bootstrap-profile-row">
                    <div className="bootstrap-avatar-skeleton bootstrap-shimmer" />
                    <div className="bootstrap-profile-text">
                        <div className="bootstrap-profile-line bootstrap-shimmer" />
                        <div className="bootstrap-profile-link bootstrap-shimmer" />
                    </div>
                </div>
            </aside>

            <div className="bootstrap-main">
                <header className="bootstrap-header">
                    <div className="bootstrap-search bootstrap-shimmer" />
                    <div className="bootstrap-header-actions">
                        <div className="bootstrap-icon-button bootstrap-shimmer" />
                        <div className="bootstrap-logout bootstrap-shimmer" />
                    </div>
                </header>

                <main className="bootstrap-content">
                    <div className="bootstrap-hero">
                        <div>
                            <div className="bootstrap-hero-title bootstrap-shimmer" />
                            <div className="bootstrap-hero-copy bootstrap-shimmer" />
                        </div>
                        <div className="bootstrap-hero-actions">
                            <div className="bootstrap-action-button bootstrap-shimmer" />
                            <div className="bootstrap-action-button bootstrap-shimmer bootstrap-action-button-secondary" />
                        </div>
                    </div>

                    <div className="bootstrap-stat-grid">
                        <div className="bootstrap-stat-card bootstrap-shimmer" />
                        <div className="bootstrap-stat-card bootstrap-shimmer" />
                        <div className="bootstrap-stat-card bootstrap-shimmer" />
                    </div>

                    <div className="bootstrap-panels">
                        <section className="bootstrap-panel">
                            <div className="bootstrap-panel-header">
                                <div className="bootstrap-panel-title bootstrap-shimmer" />
                                <div className="bootstrap-panel-link bootstrap-shimmer" />
                            </div>
                            <div className="bootstrap-list-item bootstrap-shimmer" />
                            <div className="bootstrap-list-item bootstrap-shimmer" />
                            <div className="bootstrap-list-item bootstrap-shimmer" />
                        </section>

                        <section className="bootstrap-panel bootstrap-panel-side">
                            <div className="bootstrap-panel-title bootstrap-shimmer" />
                            <div className="bootstrap-list-item bootstrap-shimmer" />
                            <div className="bootstrap-list-item bootstrap-shimmer" />
                        </section>
                    </div>

                    <p className="bootstrap-status-copy">Finishing sign-in and preparing your dashboard...</p>
                </main>
            </div>
        </div>
    );
}
