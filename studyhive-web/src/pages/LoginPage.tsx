import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
    const { signInWithGoogle, signInWithGitHub, session } = useAuth();
    const navigate = useNavigate();

    // Already logged in — bounce to dashboard
    if (session) {
        navigate('/dashboard', { replace: true });
        return null;
    }

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

                <div className="form-group">
                    <label htmlFor="email">Email address</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="student@university.edu"
                    />
                </div>

                <button className="primary-button" type="button">
                    Continue with Email
                </button>
            </div>
        </div>
    );
}