import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function SignupPage() {
    const { signInWithGoogle, signInWithGitHub, session, loading: authLoading, bootstrapError } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (session && authLoading) {
        return (
            <div className="auth-page">
                <div className="auth-card">
                    <h2 className="auth-title">Finishing sign-in...</h2>
                    <p className="auth-subtitle">We are setting up your StudyHive account.</p>
                </div>
            </div>
        );
    }

    if (session && !bootstrapError) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleEmailSignup = async () => {
        setError('');

        if (!email || !password) {
            setError('Email and password are required.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setSubmitting(true);
        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
            },
        });
        if (signUpError) {
            setSubmitting(false);
            setError(signUpError.message);
        } else {
            setSubmitting(false);
            // Supabase sends a confirmation email by default.
            // If email confirmation is disabled in your Supabase project,
            // the session is set immediately and AuthContext redirects automatically.
            setError('Check your email to confirm your account.');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="brand-row">
                    <div className="brand-logo-placeholder" />
                    <h1 className="brand-name">StudyHive</h1>
                </div>

                <h2 className="auth-title">Create Account</h2>

                <p className="auth-subtitle">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">Sign In</Link>
                </p>

                <div className="social-buttons">
                    <button className="social-button" type="button" onClick={signInWithGoogle}>
                        <span className="social-icon google">G</span>
                        <span>Continue with Google</span>
                    </button>

                    <button className="social-button" type="button" onClick={signInWithGitHub}>
                        <span className="social-icon github">⌘</span>
                        <span>Continue with GitHub</span>
                    </button>
                </div>

                <div className="divider">
                    <span>Or create an account with email</span>
                </div>

                {(bootstrapError || error) && (
                    <p style={{
                        color: (bootstrapError || error).startsWith('Check') ? '#16a34a' : '#dc2626',
                        fontSize: '0.95rem',
                        marginBottom: 16,
                        padding: '12px 16px',
                        background: (bootstrapError || error).startsWith('Check') ? '#f0fdf4' : '#fef2f2',
                        borderRadius: 12,
                    }}>
                        {bootstrapError || error}
                    </p>
                )}

                <div className="form-group">
                    <label htmlFor="fullName">Full name</label>
                    <input
                        id="fullName"
                        type="text"
                        placeholder="John Smith"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="signupEmail">Email address</label>
                    <input
                        id="signupEmail"
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
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleEmailSignup(); }}
                    />
                </div>

                <button
                    className="primary-button"
                    type="button"
                    onClick={handleEmailSignup}
                    disabled={submitting || authLoading}
                    style={{ opacity: submitting || authLoading ? 0.7 : 1 }}
                >
                    {submitting ? 'Creating account...' : 'Create Account'}
                </button>
            </div>
        </div>
    );
}
