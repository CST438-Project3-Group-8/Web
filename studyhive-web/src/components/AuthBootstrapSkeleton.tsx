export default function AuthBootstrapSkeleton() {
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
