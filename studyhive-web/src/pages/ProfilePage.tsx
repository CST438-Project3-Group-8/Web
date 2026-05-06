import { useEffect, useMemo, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
    const { user } = useAuth();

    const fallbackName =
        user?.user_metadata?.full_name ??
        user?.email?.split('@')[0] ??
        'User';

    const [fullName, setFullName] = useState(fallbackName);
    const [bio, setBio] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setFullName(fallbackName);
    }, [fallbackName]);

    const initials = useMemo(() => {
        return fullName?.trim()?.charAt(0)?.toUpperCase() || 'U';
    }, [fullName]);

    const email = user?.email ?? '';

    const handleSave = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);

        try {
            // backend / profile save hookup can go here later
            alert('Profile save hookup can be connected next.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppLayout>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
                <div style={{ marginBottom: 24 }}>
                    <h1
                        style={{
                            fontSize: '2.1rem',
                            fontWeight: 800,
                            color: '#0F172A',
                            margin: 0,
                        }}
                    >
                        My Profile
                    </h1>
                    <p
                        style={{
                            marginTop: 8,
                            fontSize: '1.05rem',
                            color: '#64748B',
                        }}
                    >
                        Your account information and preferences.
                    </p>
                </div>

                <div
                    style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: 24,
                        padding: 28,
                        marginBottom: 22,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 20,
                    }}
                >
                    <div
                        style={{
                            width: 74,
                            height: 74,
                            borderRadius: '50%',
                            background: '#DBEAFE',
                            color: '#1D4ED8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 22,
                            flexShrink: 0,
                        }}
                    >
                        {initials}
                    </div>

                    <div>
                        <div
                            style={{
                                fontSize: 22,
                                fontWeight: 700,
                                color: '#0F172A',
                                marginBottom: 6,
                            }}
                        >
                            {fullName || fallbackName}
                        </div>
                        <div
                            style={{
                                fontSize: 16,
                                color: '#64748B',
                            }}
                        >
                            {email}
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={handleSave}
                    style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: 24,
                        padding: 28,
                    }}
                >
                    <h2
                        style={{
                            fontSize: '1.4rem',
                            fontWeight: 700,
                            color: '#0F172A',
                            margin: '0 0 24px 0',
                        }}
                    >
                        Edit profile
                    </h2>

                    <div style={{ marginBottom: 18 }}>
                        <label
                            style={{
                                display: 'block',
                                fontWeight: 600,
                                color: '#334155',
                                marginBottom: 8,
                            }}
                        >
                            Full name
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Your name"
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: 14,
                                border: '1px solid #CBD5E1',
                                fontSize: 16,
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: 18 }}>
                        <label
                            style={{
                                display: 'block',
                                fontWeight: 600,
                                color: '#334155',
                                marginBottom: 8,
                            }}
                        >
                            Email address
                        </label>
                        <input
                            type="email"
                            value={email}
                            disabled
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: 14,
                                border: '1px solid #CBD5E1',
                                background: '#F8FAFC',
                                color: '#64748B',
                                fontSize: 16,
                                boxSizing: 'border-box',
                            }}
                        />
                        <p
                            style={{
                                marginTop: 8,
                                fontSize: 13,
                                color: '#94A3B8',
                            }}
                        >
                            Email is managed by your sign-in provider and cannot be changed here.
                        </p>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label
                            style={{
                                display: 'block',
                                fontWeight: 600,
                                color: '#334155',
                                marginBottom: 8,
                            }}
                        >
                            Bio
                        </label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value.slice(0, 500))}
                            placeholder="Tell other students a bit about yourself, your courses, or your study style..."
                            rows={5}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: 14,
                                border: '1px solid #CBD5E1',
                                fontSize: 16,
                                outline: 'none',
                                resize: 'vertical',
                                boxSizing: 'border-box',
                            }}
                        />
                        <div
                            style={{
                                textAlign: 'right',
                                fontSize: 13,
                                color: '#94A3B8',
                                marginTop: 8,
                            }}
                        >
                            {bio.length} / 500
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                background: '#2563EB',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: 12,
                                padding: '12px 22px',
                                fontSize: 16,
                                fontWeight: 700,
                                cursor: 'pointer',
                                opacity: saving ? 0.7 : 1,
                            }}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}