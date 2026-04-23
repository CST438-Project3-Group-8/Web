type SignupPageProps = {
    onShowLogin: () => void;
};

function SignupPage({ onShowLogin }: SignupPageProps) {
    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="brand-row">
                    <div className="brand-logo-placeholder" />
                    <h1 className="brand-name">StudyHive</h1>
                </div>

                <h2 className="auth-title">Create Account</h2>

                <p className="auth-subtitle">
                    Already have an account?{" "}
                    <button className="auth-link-button" type="button" onClick={onShowLogin}>
                        Sign In
                    </button>
                </p>

                <div className="social-buttons">
                    <button className="social-button" type="button">
                        <span className="social-icon google">G</span>
                        <span>Continue with Google</span>
                    </button>

                    <button className="social-button" type="button">
                        <span className="social-icon github">⌘</span>
                        <span>Continue with GitHub</span>
                    </button>
                </div>

                <div className="divider">
                    <span>Or create an account with email</span>
                </div>

                <div className="form-group">
                    <label htmlFor="fullName">Full name</label>
                    <input
                        id="fullName"
                        type="text"
                        placeholder="John Smith"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="signupEmail">Email address</label>
                    <input
                        id="signupEmail"
                        type="email"
                        placeholder="student@university.edu"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                    />
                </div>

                <button className="primary-button" type="button">
                    Create Account
                </button>
            </div>
        </div>
    );
}

export default SignupPage;