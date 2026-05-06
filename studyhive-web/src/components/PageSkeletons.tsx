import type { CSSProperties } from 'react';
import AppLayout from './AppLayout';

export function DashboardPageSkeleton() {
    return (
        <AppLayout>
            <div className="page-skeleton-container">
                <div className="page-skeleton-hero">
                    <div>
                        <div className="page-skeleton-title page-skeleton-shimmer" style={{ width: 280 }} />
                        <div className="page-skeleton-copy page-skeleton-shimmer" style={{ width: 360, maxWidth: '100%' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div className="page-skeleton-button page-skeleton-shimmer" />
                        <div className="page-skeleton-button page-skeleton-shimmer page-skeleton-button-secondary" />
                    </div>
                </div>

                <div className="page-skeleton-stat-grid">
                    <SkeletonCard height={88} />
                    <SkeletonCard height={88} />
                    <SkeletonCard height={88} />
                </div>

                <div className="page-skeleton-two-column">
                    <section>
                        <SkeletonSectionHeader />
                        <div style={{ display: 'grid', gap: 12 }}>
                            <SkeletonCard height={86} />
                            <SkeletonCard height={86} />
                            <SkeletonCard height={86} />
                        </div>
                    </section>

                    <section>
                        <SkeletonSectionHeader actionWidth={0} />
                        <SkeletonCard height={184} />
                    </section>
                </div>

                <section>
                    <SkeletonSectionHeader />
                    <div className="page-skeleton-card-grid">
                        <SkeletonCard height={176} />
                        <SkeletonCard height={176} />
                        <SkeletonCard height={176} />
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}

export function GroupsGridPageSkeleton() {
    return (
        <AppLayout>
            <div className="page-skeleton-container">
                <div className="page-skeleton-hero">
                    <div>
                        <div className="page-skeleton-title page-skeleton-shimmer" style={{ width: 230 }} />
                        <div className="page-skeleton-copy page-skeleton-shimmer" style={{ width: 420, maxWidth: '100%' }} />
                    </div>
                    <div className="page-skeleton-button page-skeleton-shimmer" />
                </div>

                <div className="page-skeleton-filter-row">
                    <div className="page-skeleton-search page-skeleton-shimmer" />
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <div className="page-skeleton-chip page-skeleton-shimmer" />
                        <div className="page-skeleton-chip page-skeleton-shimmer" />
                        <div className="page-skeleton-chip page-skeleton-shimmer" />
                        <div className="page-skeleton-chip page-skeleton-shimmer" />
                    </div>
                </div>

                <div className="page-skeleton-card-grid">
                    <SkeletonCard height={220} />
                    <SkeletonCard height={220} />
                    <SkeletonCard height={220} />
                    <SkeletonCard height={220} />
                    <SkeletonCard height={220} />
                    <SkeletonCard height={220} />
                </div>
            </div>
        </AppLayout>
    );
}

export function GroupDetailPageSkeleton() {
    return (
        <AppLayout>
            <div className="page-skeleton-container" style={{ maxWidth: 980, margin: '0 auto' }}>
                <div className="page-skeleton-link page-skeleton-shimmer" />

                <SkeletonCard height={184} />

                <div className="page-skeleton-two-column-detail">
                    <section>
                        <SkeletonCard height={86} />
                        <div style={{ height: 16 }} />
                        <SkeletonCard height={122} />
                        <div style={{ height: 12 }} />
                        <SkeletonCard height={122} />
                    </section>

                    <section>
                        <SkeletonCard height={520} />
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}

export function ProfilePageSkeleton() {
    return (
        <AppLayout>
            <div className="page-skeleton-container" style={{ maxWidth: 980, margin: '0 auto' }}>
                <SkeletonCard height={152} />

                <div className="page-skeleton-two-column-detail" style={{ gridTemplateColumns: '260px 1fr' }}>
                    <section>
                        <SkeletonCard height={122} />
                    </section>

                    <section style={{ display: 'grid', gap: 24 }}>
                        <SkeletonCard height={332} />
                        <SkeletonCard height={214} />
                        <SkeletonCard height={148} />
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}

function SkeletonSectionHeader({ actionWidth = 92 }: { actionWidth?: number }) {
    return (
        <div className="page-skeleton-section-header">
            <div className="page-skeleton-section-title page-skeleton-shimmer" />
            {actionWidth > 0 && (
                <div className="page-skeleton-section-action page-skeleton-shimmer" style={{ width: actionWidth }} />
            )}
        </div>
    );
}

function SkeletonCard({ height, style }: { height: number; style?: CSSProperties }) {
    return <div className="page-skeleton-card page-skeleton-shimmer" style={{ height, ...style }} />;
}
