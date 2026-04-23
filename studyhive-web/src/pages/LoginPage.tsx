type LoginPageProps = {
    onShowSignup: () => void;
};

function LoginPage({ onShowSignup }: LoginPageProps) {
    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="brand-row">
                    <div className="brand-logo-placeholder" />
                    <h1 className="brand-name">StudyHive</h1>
                </div>

                <h2 className="auth-title">Welcome Back!</h2>

                <p className="auth-subtitle">
                    New to StudyHive?{" "}
                    <button className="auth-link-button" type="button" onClick={onShowSignup}>
                        Create an Account
                    </button>
                </p>

                <div className="social-buttons">
                    <button className="social-button" type="button">
                        <span className="social-icon google">G</span>
                        <span>Sign in with Google</span>
                    </button>

                    <button className="social-button" type="button">
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

export default LoginPage;