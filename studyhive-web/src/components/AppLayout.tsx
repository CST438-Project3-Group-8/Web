import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AppLayout({ children }: { children: ReactNode }) {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login', { replace: true });
    };

    const displayName =
        user?.user_metadata?.full_name ??
        user?.email?.split('@')[0] ??
        'User';

    const initials = displayName[0]?.toUpperCase() ?? 'U';

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
            {/* Sidebar */}
            <aside style={{
                width: 220, minHeight: '100vh', background: '#fff',
                borderRight: '1px solid #E2E8F0', display: 'flex',
                flexDirection: 'column', position: 'fixed',
                top: 0, left: 0, bottom: 0, zIndex: 10,
            }}>
                <div style={{ padding: '20px 16px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, background: '#2563EB', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ color: '#fff', fontSize: 16 }}>📚</span>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>StudyHive</span>
                </div>

                <nav style={{ padding: '4px 10px', flex: 1 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', margin: '4px 0 6px 8px' }}>MAIN MENU</p>
                    <SideNavItem to="/dashboard" emoji="🏠" label="Dashboard" />
                    <SideNavItem to="/groups" emoji="🔍" label="Browse Groups" />
                    <SideNavItem to="/my-groups" emoji="👥" label="My Groups" />
                    <SideNavItem to="/groups/new" emoji="➕" label="Create Group" />
                </nav>

                <div style={{ padding: '14px 16px', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1D4ED8' }}>{initials}</span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</p>
                        <p style={{ fontSize: 11, color: '#64748B', margin: 0 }}>View Profile</p>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <header style={{
                    height: 60, background: '#fff', borderBottom: '1px solid #E2E8F0',
                    display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16,
                    position: 'sticky', top: 0, zIndex: 9,
                }}>
                    <div style={{ flex: 1, maxWidth: 480 }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#F1F5F9', borderRadius: 10, padding: '8px 14px', gap: 8 }}>
                            <span style={{ color: '#94A3B8', fontSize: 14 }}>🔍</span>
                            <input
                                placeholder="Search for courses, topics, or groups..."
                                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 14, color: '#0F172A', width: '100%' }}
                            />
                        </div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, position: 'relative' }}>🔔</button>
                        <button
                            onClick={handleSignOut}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 14, color: '#475569', fontWeight: 500 }}
                        >
                            Log out
                        </button>
                    </div>
                </header>

                <main style={{ padding: '28px 32px', flex: 1 }}>
                    {children}
                </main>
            </div>
        </div>
    );
}

function SideNavItem({ to, emoji, label }: { to: string; emoji: string; label: string }) {
    return (
        <NavLink
            to={to}
            end={to === '/dashboard'}
            style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, textDecoration: 'none',
                fontSize: 14, fontWeight: isActive ? 600 : 400,
                color: isActive ? '#2563EB' : '#475569',
                background: isActive ? '#EFF6FF' : 'transparent',
                marginBottom: 2,
            })}
        >
            <span style={{ fontSize: 15 }}>{emoji}</span>
            {label}
        </NavLink>
    );
}