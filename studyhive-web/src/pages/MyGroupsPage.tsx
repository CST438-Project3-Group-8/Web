import { useNavigate } from 'react-router-dom';

export default function MyGroupsPage() {
    const navigate = useNavigate();
    return (
        <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: 24, fontWeight: 600 }}>← Dashboard</button>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>My Groups</h2>
            <p style={{ color: '#64748b' }}>Building this screen next.</p>
        </div>
    );
}