import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/login', { replace: true });
    };

    return (
        <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>StudyHive</h1>
                <button onClick={handleSignOut} style={{ background: 'none', border: '1px solid #cbd5e1', borderRadius: 12, padding: '8px 16px', cursor: 'pointer', color: '#64748b' }}>
                    Log out
                </button>
            </div>
            <p style={{ color: '#64748b', marginBottom: 24 }}>Signed in as {user?.email}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/groups/new')} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 16, padding: '12px 24px', cursor: 'pointer', fontWeight: 700 }}>
                    Create Group
                </button>
                <button onClick={() => navigate('/groups')} style={{ background: '#fff', color: '#334155', border: '2px solid #cbd5e1', borderRadius: 16, padding: '12px 24px', cursor: 'pointer', fontWeight: 700 }}>
                    Find Groups
                </button>
                <button onClick={() => navigate('/my-groups')} style={{ background: '#fff', color: '#334155', border: '2px solid #cbd5e1', borderRadius: 16, padding: '12px 24px', cursor: 'pointer', fontWeight: 700 }}>
                    My Groups
                </button>
            </div>
        </div>
    );
}