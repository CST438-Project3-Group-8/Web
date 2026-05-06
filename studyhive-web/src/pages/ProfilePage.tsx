import { useEffect, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { getMyProfile, createProfile, updateProfile } from '../api/userApi';
import { getApiErrorMessage } from '../lib/apiErrors';
import type { UserProfile } from '../api/userApi';

export default function ProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [notCreated, setNotCreated] = useState(false);

    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getMyProfile()
            .then((loaded) => {
                setProfile(loaded);
                setName(loaded.name);
                setBio(loaded.bio ?? '');
                setLoading(false);
            })
            .catch((err: unknown) => {
                // 404 = profile not created in DB yet
                const isNotFound = (err as { response?: { status?: number } })?.response?.status === 404;
                if (isNotFound) {
                    setNotCreated(true);
                    setName(user?.user_metadata?.full_name ?? '');
                }
                setLoading(false);
            });
    }, [user?.user_metadata?.full_name]);

    const handleCreateProfile = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError('Name is required.');
            return;
        }

        setSubmitting(true);
        try {
            const created = await createProfile({
                name: name.trim(),
                email: user?.email ?? '',
                oauthProvider: 'GITHUB', // fallback; backend sets email from JWT anyway
            });
            setProfile(created);
            setNotCreated(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(getApiErrorMessage(err, 'Failed to create profile.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateProfile = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (!name.trim()) {
            setError('Name is required.');
            return;
        }

        setSubmitting(true);
        try {
            const updated = await updateProfile({ name: name.trim(), bio: bio.trim() });
            setProfile(updated);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(getApiErrorMessage(err, 'Failed to update profile.'));
        } finally {
            setSubmitting(false);
        }
    };

    const initials = (name || user?.email || 'U')[0]?.toUpperCase() ?? 'U';

    return (
        <AppLayout>
            <div style={{ maxWidth: 680, margin: '0 auto' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', marginBottom: 24, fontWeight: 600 }}>
                    ← Dashboard
                </button>

                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>My Profile</h1>
                <p style={{ color: '#64748B', margin: '0 0 28px' }}>
                    {notCreated ? 'Complete your profile to get started.' : 'Your account information and preferences.'}
                </p>

                {loading ? (
                    <p style={{ color: '#94A3B8' }}>Loading profile...</p>
                ) : (
                    <>
                        {/* Avatar + email header */}
                        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: '28px 28px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
                            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1D4ED8' }}>{initials}</span>
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0F172A', margin: '0 0 4px' }}>
                                    {profile?.name ?? name ?? 'New User'}
                                </p>
                                <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 4px' }}>{user?.email}</p>
                                {profile?.oauthProvider && (
                                    <span style={{ fontSize: 11, fontWeight: 600, background: '#EFF6FF', color: '#1D4ED8', borderRadius: 6, padding: '3px 8px' }}>
                                        {profile.oauthProvider}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Feedback banners */}
                        {success && (
                            <div style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
                                Profile saved successfully.
                            </div>
                        )}
                        {error && (
                            <div style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
                                {error}
                            </div>
                        )}

                        {/* Edit form */}
                        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 28 }}>
                            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 20px' }}>
                                {notCreated ? 'Create your profile' : 'Edit profile'}
                            </h2>

                            <form onSubmit={notCreated ? handleCreateProfile : handleUpdateProfile} style={{ display: 'grid', gap: 18 }}>
                                <label style={{ display: 'grid', gap: 8 }}>
                                    <span style={labelStyle}>Full name</span>
                                    <input
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Your name"
                                        style={inputStyle}
                                        disabled={submitting}
                                    />
                                </label>

                                <label style={{ display: 'grid', gap: 8 }}>
                                    <span style={labelStyle}>Email address</span>
                                    <input
                                        value={user?.email ?? ''}
                                        style={{ ...inputStyle, background: '#F8FAFC', color: '#94A3B8', cursor: 'not-allowed' }}
                                        disabled
                                    />
                                    <span style={{ fontSize: 12, color: '#94A3B8' }}>Email is managed by your sign-in provider and cannot be changed here.</span>
                                </label>

                                <label style={{ display: 'grid', gap: 8 }}>
                                    <span style={labelStyle}>Bio</span>
                                    <textarea
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                        placeholder="Tell other students a bit about yourself, your courses, or your study style..."
                                        rows={4}
                                        maxLength={500}
                                        style={{ ...inputStyle, resize: 'vertical', minHeight: 110 }}
                                        disabled={submitting || notCreated}
                                    />
                                    <span style={{ fontSize: 12, color: '#94A3B8', textAlign: 'right' }}>{bio.length} / 500</span>
                                </label>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        style={{ ...primaryButtonStyle, opacity: submitting ? 0.7 : 1 }}
                                    >
                                        {submitting
                                            ? 'Saving...'
                                            : notCreated
                                                ? 'Create Profile'
                                                : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Account info section */}
                        {profile && (
                            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, marginTop: 20 }}>
                                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 16px' }}>Account details</h2>
                                <div style={{ display: 'grid', gap: 12 }}>
                                    <InfoRow label="Account ID" value={String(profile.id)} />
                                    <InfoRow label="Sign-in provider" value={profile.oauthProvider} />
                                    <InfoRow label="Supabase UID" value={profile.userId} mono />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ fontSize: 13, color: '#64748B' }}>{label}</span>
            <span style={{ fontSize: 13, color: '#334155', fontFamily: mono ? 'monospace' : 'inherit', maxWidth: '60%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {value}
            </span>
        </div>
    );
}

const labelStyle: CSSProperties = { fontSize: 13, fontWeight: 700, color: '#334155' };

const inputStyle: CSSProperties = {
    width: '100%',
    border: '1px solid #CBD5E1',
    borderRadius: 12,
    padding: '12px 14px',
    fontSize: 14,
    color: '#0F172A',
    background: '#fff',
    boxSizing: 'border-box',
};

const primaryButtonStyle: CSSProperties = {
    background: '#2563EB',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '10px 22px',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: 14,
};