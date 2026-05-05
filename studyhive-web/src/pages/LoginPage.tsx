import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
    const { signInWithGoogle, signInWithGitHub, session } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (session) {
        navigate('/dashboard', { replace: true });
        return null;
    }

    const handleEmailLogin = async () => {
        setError('');
        if (!email || !password) {
            setError('Please enter your email and password.');
            return;
        }

        setLoading(true);
        const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        setLoading(false);

        if (loginError) {
            setError(loginError.message);
        } else {
            navigate('/dashboard', { replace: true });
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

                {error && (
                    <p style={{
                        color: '#dc2626',
                        fontSize: '0.95rem',
                        marginBottom: 16,
                        padding: '12px 16px',
                        background: '#fef2f2',
                        borderRadius: 12,
                    }}>
                        {error}
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
                    disabled={loading}
                    style={{ opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </div>
        </div>
    );
}