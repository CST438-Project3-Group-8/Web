import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import {
    getMyProfile,
    updateProfile,
    getMyCourses,
    addMyCourse,
    removeMyCourse,
    deleteMyAccount,
} from '../api/userApi';
import { getCourses } from '../api/coursesApi';
import { supabase } from '../lib/supabase';
import { getApiErrorMessage } from '../lib/apiErrors';
import type { UserProfile } from '../api/userApi';
import type { Course } from '../types';

type Tab = 'general' | 'security';

export default function ProfilePage() {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [myCourses, setMyCourses] = useState<Course[]>([]);
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<Tab>('general');

    const [name, setName] = useState('');
    const [major, setMajor] = useState('');
    const [bio, setBio] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [courseError, setCourseError] = useState<string | null>(null);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([getMyProfile(), getMyCourses(), getCourses()])
            .then(([prof, enrolled, all]) => {
                setProfile(prof);
                setName(prof.name ?? '');
                setMajor(prof.major ?? '');
                setBio(prof.bio ?? '');
                setMyCourses(enrolled);
                setAllCourses(all);
                setLoading(false);
            })
            .catch((err) => {
                setLoadError(getApiErrorMessage(err, 'Failed to load profile.'));
                setLoading(false);
            });
    }, []);

    const initials = name
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || '?';


    const handleSaveGeneral = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveError(null);
        setSaveSuccess(false);
        if (!name.trim()) {
            setSaveError('Full name is required.');
            return;
        }
        setSaving(true);
        try {
            const updated = await updateProfile({ name: name.trim(), bio: bio.trim(), major: major.trim() });
            setProfile(updated);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setSaveError(getApiErrorMessage(err, 'Failed to save profile.'));
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        setPasswordSuccess(false);
        if (!newPassword || newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match.');
            return;
        }
        setPasswordSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw new Error(error.message);
            setPasswordSuccess(true);
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setPasswordSuccess(false), 4000);
        } catch (err) {
            setPasswordError(err instanceof Error ? err.message : 'Failed to update password.');
        } finally {
            setPasswordSaving(false);
        }
    };

    const handleAddCourse = async () => {
        if (!selectedCourseId) return;
        setCourseError(null);
        const courseId = Number(selectedCourseId);
        try {
            await addMyCourse(courseId);
            const course = allCourses.find((c) => c.id === courseId);
            if (course) setMyCourses((prev) => [...prev, course]);
            setSelectedCourseId('');
        } catch (err) {
            setCourseError(getApiErrorMessage(err, 'Failed to add course.'));
        }
    };

    const handleRemoveCourse = async (courseId: number) => {
        setCourseError(null);
        try {
            await removeMyCourse(courseId);
            setMyCourses((prev) => prev.filter((c) => c.id !== courseId));
        } catch (err) {
            setCourseError(getApiErrorMessage(err, 'Failed to remove course.'));
        }
    };

    const handleDeleteAccount = async () => {
        setDeleteError(null);
        setDeleting(true);
        try {
            await deleteMyAccount();
            await signOut();
            navigate('/login', { replace: true });
        } catch (err) {
            setDeleteError(getApiErrorMessage(err, 'Failed to delete account.'));
            setDeleting(false);
        }
    };

    const enrolledIds = new Set(myCourses.map((c) => c.id));
    const availableToAdd = allCourses.filter((c) => !enrolledIds.has(c.id));


    if (loading) {
        return (
            <AppLayout>
                <p style={{ color: '#94A3B8', padding: 32 }}>Loading profile...</p>
            </AppLayout>
        );
    }

    if (loadError) {
        return (
            <AppLayout>
                <div style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: 12, padding: 16, margin: 32 }}>
                    {loadError}
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div style={{ maxWidth: 980, margin: '0 auto' }}>

                {/* ── Profile header card ── */}
                <div style={{
                    background: '#fff', border: '1px solid #E2E8F0', borderRadius: 28,
                    padding: 28, display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', gap: 20, marginBottom: 28,
                    boxShadow: '0 8px 20px rgba(15,23,42,0.04)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
                        <div style={{
                            width: 96, height: 96, borderRadius: '50%', background: '#DBEAFE',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#1D4ED8', fontSize: 34, fontWeight: 800, flexShrink: 0,
                        }}>
                            {initials}
                        </div>
                        <div>
                            <div style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', marginBottom: 4 }}>
                                {profile?.name}
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: '#64748B', marginBottom: profile?.bio ? 10 : 0 }}>
                                {profile?.major || 'No major set'}
                            </div>
                            {profile?.bio && (
                                <div style={{ maxWidth: 520, fontSize: 15, lineHeight: 1.65, color: '#475569' }}>
                                    {profile.bio}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Two-column layout ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 28, alignItems: 'start' }}>

                    {/* Left: tabs */}
                    <div style={{
                        background: '#fff', border: '1px solid #E2E8F0', borderRadius: 24,
                        padding: 16, boxShadow: '0 8px 20px rgba(15,23,42,0.04)',
                    }}>
                        <ProfileTab label="General" active={activeTab === 'general'} onClick={() => setActiveTab('general')} />
                        <ProfileTab label="Security" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
                    </div>

                    {/* Right: tab content + always-visible sections */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

                        {/* ── General tab ── */}
                        {activeTab === 'general' && (
                            <form
                                onSubmit={handleSaveGeneral}
                                style={{
                                    background: '#fff', border: '1px solid #E2E8F0', borderRadius: 28,
                                    padding: 30, boxShadow: '0 8px 20px rgba(15,23,42,0.04)',
                                }}
                            >
                                <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 24 }}>
                                    Personal Details
                                </div>

                                {saveError && <Banner type="error" message={saveError} />}
                                {saveSuccess && <Banner type="success" message="Profile saved!" />}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
                                    <Field label="Full Name">
                                        <input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your name"
                                            style={inputStyle}
                                        />
                                    </Field>
                                    <Field label="Email Address">
                                        <input
                                            value={profile?.email ?? ''}
                                            disabled
                                            style={{ ...inputStyle, background: '#F8FAFC', color: '#475569', cursor: 'not-allowed' }}
                                        />
                                    </Field>
                                </div>

                                <div style={{ marginBottom: 18 }}>
                                    <Field label="Major / Program">
                                        <input
                                            value={major}
                                            onChange={(e) => setMajor(e.target.value)}
                                            placeholder="e.g. Computer Science"
                                            style={inputStyle}
                                        />
                                    </Field>
                                </div>

                                <div style={{ marginBottom: 26 }}>
                                    <Field label="Bio">
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            rows={5}
                                            placeholder="Tell others about yourself..."
                                            style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }}
                                        />
                                    </Field>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" disabled={saving} style={{ ...primaryBtnStyle, opacity: saving ? 0.7 : 1 }}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ── Security tab ── */}
                        {activeTab === 'security' && (
                            <form
                                onSubmit={handleChangePassword}
                                style={{
                                    background: '#fff', border: '1px solid #E2E8F0', borderRadius: 28,
                                    padding: 30, boxShadow: '0 8px 20px rgba(15,23,42,0.04)',
                                }}
                            >
                                <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
                                    Change Password
                                </div>
                                <p style={{ color: '#64748B', marginBottom: 24, lineHeight: 1.6 }}>
                                    Set a new password for your account. Must be at least 6 characters.
                                </p>

                                {passwordError && <Banner type="error" message={passwordError} />}
                                {passwordSuccess && <Banner type="success" message="Password updated successfully!" />}

                                <div style={{ marginBottom: 18 }}>
                                    <Field label="New Password">
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="At least 6 characters"
                                            style={inputStyle}
                                        />
                                    </Field>
                                </div>

                                <div style={{ marginBottom: 26 }}>
                                    <Field label="Confirm New Password">
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repeat new password"
                                            style={inputStyle}
                                        />
                                    </Field>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" disabled={passwordSaving} style={{ ...primaryBtnStyle, opacity: passwordSaving ? 0.7 : 1 }}>
                                        {passwordSaving ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ── My Courses (always visible) ── */}
                        <div style={{
                            background: '#fff', border: '1px solid #E2E8F0', borderRadius: 28,
                            padding: 30, boxShadow: '0 8px 20px rgba(15,23,42,0.04)',
                        }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', marginBottom: 20 }}>
                                My Courses
                            </div>

                            {courseError && <Banner type="error" message={courseError} />}

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20, minHeight: 44 }}>
                                {myCourses.length === 0 && (
                                    <p style={{ color: '#94A3B8', fontSize: 14, margin: 0 }}>No courses added yet.</p>
                                )}
                                {myCourses.map((course) => (
                                    <div
                                        key={course.id}
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 8,
                                            background: '#EFF6FF', color: '#2563EB', borderRadius: 14,
                                            padding: '9px 14px', fontWeight: 700, fontSize: 14,
                                        }}
                                    >
                                        <span>{course.code}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCourse(course.id)}
                                            style={{
                                                border: 'none', background: 'transparent', color: '#2563EB',
                                                cursor: 'pointer', fontWeight: 800, fontSize: 15,
                                                padding: 0, lineHeight: 1, display: 'flex',
                                            }}
                                            title={`Remove ${course.code}`}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                <select
                                    value={selectedCourseId}
                                    onChange={(e) => setSelectedCourseId(e.target.value)}
                                    style={{ ...inputStyle, flex: 1, fontSize: 14 }}
                                >
                                    <option value="">Select a course to add...</option>
                                    {availableToAdd.map((course) => (
                                        <option key={course.id} value={course.id}>
                                            {course.code} — {course.title}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={handleAddCourse}
                                    disabled={!selectedCourseId}
                                    style={{ ...secondaryBtnStyle, opacity: !selectedCourseId ? 0.5 : 1, whiteSpace: 'nowrap' }}
                                >
                                    Add Course
                                </button>
                            </div>
                        </div>

                        {/* ── Delete Account ── */}
                        <div style={{
                            background: '#FEF2F2', border: '1px solid #FECACA',
                            borderRadius: 28, padding: 30,
                        }}>
                            <div style={{ color: '#B91C1C', fontSize: 18, fontWeight: 800, marginBottom: 10 }}>
                                Delete Account
                            </div>
                            <p style={{ color: '#DC2626', fontSize: 15, lineHeight: 1.6, marginBottom: 24, maxWidth: 580 }}>
                                Permanently deletes your account and all associated data. This action cannot be undone.
                            </p>

                            {deleteError && <Banner type="error" message={deleteError} />}

                            {!showDeleteConfirm ? (
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    style={{
                                        background: '#fff', color: '#B91C1C', border: '1px solid #FCA5A5',
                                        borderRadius: 16, padding: '14px 22px', fontSize: 15,
                                        fontWeight: 800, cursor: 'pointer',
                                    }}
                                >
                                    Delete Account
                                </button>
                            ) : (
                                <div style={{
                                    background: '#fff', border: '1px solid #FECACA',
                                    borderRadius: 16, padding: 20,
                                }}>
                                    <p style={{ color: '#991B1B', fontWeight: 700, marginBottom: 16, fontSize: 15 }}>
                                        Are you absolutely sure? This cannot be undone.
                                    </p>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button
                                            type="button"
                                            onClick={handleDeleteAccount}
                                            disabled={deleting}
                                            style={{
                                                background: '#DC2626', color: '#fff', border: 'none',
                                                borderRadius: 12, padding: '12px 20px', fontWeight: 700,
                                                cursor: 'pointer', opacity: deleting ? 0.7 : 1, fontSize: 14,
                                            }}
                                        >
                                            {deleting ? 'Deleting...' : 'Yes, Delete My Account'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setShowDeleteConfirm(false); setDeleteError(null); }}
                                            style={{ ...secondaryBtnStyle, fontSize: 14 }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}


function ProfileTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderRadius: 16, marginBottom: 8, cursor: 'pointer',
                border: active ? '1px solid #DBEAFE' : '1px solid transparent',
                background: active ? '#F8FBFF' : 'transparent',
                color: active ? '#2563EB' : '#475569',
                fontWeight: active ? 700 : 600, fontSize: 16,
            }}
        >
            <span style={{
                width: 18, height: 18, borderRadius: active ? '50%' : 4,
                border: `2px solid ${active ? '#2563EB' : '#64748B'}`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                boxSizing: 'border-box', flexShrink: 0,
            }}>
                {active && (
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563EB', display: 'block' }} />
                )}
            </span>
            {label}
        </button>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label style={{ display: 'block' }}>
            <div style={{ marginBottom: 10, fontWeight: 700, fontSize: 15, color: '#334155' }}>{label}</div>
            {children}
        </label>
    );
}

function Banner({ type, message }: { type: 'error' | 'success'; message: string }) {
    const styles = type === 'error'
        ? { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }
        : { background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' };
    return (
        <div style={{ ...styles, borderRadius: 12, padding: '12px 14px', marginBottom: 16, fontSize: 14 }}>
            {message}
        </div>
    );
}


const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 16,
    border: '1px solid #CBD5E1', fontSize: 16, outline: 'none',
    boxSizing: 'border-box', background: '#fff', color: '#0F172A',
};

const primaryBtnStyle: React.CSSProperties = {
    background: '#2563EB', color: '#fff', border: 'none', borderRadius: 16,
    padding: '14px 24px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 10px 18px rgba(37,99,235,0.22)',
};

const secondaryBtnStyle: React.CSSProperties = {
    background: '#F8FAFC', color: '#334155', border: '1px solid #E2E8F0',
    borderRadius: 16, padding: '14px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
};
