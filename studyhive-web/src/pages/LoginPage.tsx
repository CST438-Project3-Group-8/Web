import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import AuthBootstrapSkeleton from '../components/AuthBootstrapSkeleton';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
    const { signInWithGoogle, signInWithGitHub, session, loading: authLoading, bootstrapError } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (session && authLoading) {
        return <AuthBootstrapSkeleton />;
    }

    if (session && !bootstrapError) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleEmailLogin = async () => {
        setError('');
        if (!email || !password) {
            setError('Please enter your email and password.');
            return;
        }

        setSubmitting(true);
        const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (loginError) {
            setSubmitting(false);
            setError(loginError.message);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="brand-row">
                    <div className="brand-logo-placeholder" />
                    <h1 className="brand-name">StudyHive</h1>
                </div>

                <h2 className="auth-title">Welcome Back!</h2>

                <p className="auth-subtitle">
                    New to StudyHive?{' '}
                    <Link to="/signup" className="auth-link">Create an Account</Link>
                </p>

                <div className="social-buttons">
                    <button className="social-button" type="button" onClick={signInWithGoogle}>
                        <span className="social-icon google">G</span>
                        <span>Sign in with Google</span>
                    </button>

                    <button className="social-button" type="button" onClick={signInWithGitHub}>
                        <span className="social-icon github">⌘</span>
                        <span>Sign in with GitHub</span>
                    </button>
                </div>

                <div className="divider">
                    <span>Or continue with email</span>
                </div>

                {(bootstrapError || error) && (
                    <p style={{
                        color: '#dc2626',
                        fontSize: '0.95rem',
                        marginBottom: 16,
                        padding: '12px 16px',
                        background: '#fef2f2',
                        borderRadius: 12,
                    }}>
                        {bootstrapError || error}
                    </p>
                )}

                <div className="form-group">
                    <label htmlFor="email">Email address</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="student@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleEmailLogin(); }}
                    />
                </div>

                <button
                    className="primary-button"
                    type="button"
                    onClick={handleEmailLogin}
                    disabled={submitting || authLoading}
                    style={{ opacity: submitting || authLoading ? 0.7 : 1 }}
                >
                    {submitting ? 'Signing in...' : 'Sign In'}
                </button>
            </div>
        </div>
    );
}
