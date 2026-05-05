import { useNavigate, useParams } from 'react-router-dom';

export default function GroupDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    return (
        <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
            <button onClick={() => navigate('/groups')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: 24, fontWeight: 600 }}>← Find Groups</button>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Group #{id}</h2>
            <p style={{ color: '#64748b' }}>Building this screen next.</p>
        </div>
    );
}