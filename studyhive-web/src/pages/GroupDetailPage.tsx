import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { GroupDetailPageSkeleton } from '../components/PageSkeletons';
import { useAuth } from '../contexts/AuthContext';
import { getCourses } from '../api/coursesApi';
import { deleteGroup, getGroupById, getGroupMembership, joinGroup, leaveGroup } from '../api/groupsApi';
import { createSession, deleteSession, getSessionsByGroup, updateSession } from '../api/sessionsApi';
import { getApiErrorMessage } from '../lib/apiErrors';
import { formatDateOnly, formatDateTime, fromDateTimeLocalValue, toDateTimeLocalValue } from '../lib/dateTime';
import type { Course, CreateOrUpdateSessionPayload, StudyGroup, StudySession } from '../types';

interface SessionFormState {
    title: string;
    topic: string;
    scheduledAt: string;
    location: string;
    notes: string;
    durationMinutes: string;
}

const EMPTY_SESSION_FORM: SessionFormState = {
    title: '',
    topic: '',
    scheduledAt: '',
    location: '',
    notes: '',
    durationMinutes: '',
};

export default function GroupDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const groupId = Number(id);

    const [group, setGroup] = useState<StudyGroup | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<SessionFormState>(EMPTY_SESSION_FORM);
    const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [deletingGroup, setDeletingGroup] = useState(false);

    const [joined, setJoined] = useState(false);
    const [membershipLoading, setMembershipLoading] = useState(false);
    const [membershipError, setMembershipError] = useState<string | null>(null);

    useEffect(() => {
        if (!Number.isFinite(groupId)) {
            setError('That group link is invalid.');
            setLoading(false);
            return;
        }

        let active = true;

        setLoading(true);
        setError(null);
        setMembershipError(null);

        Promise.all([
            getGroupById(groupId),
            getCourses().catch(() => []),
            getSessionsByGroup(groupId),
            getGroupMembership(groupId).catch(() => ({ groupId, joined: false })),
        ])
            .then(([loadedGroup, loadedCourses, loadedSessions, membership]) => {
                if (!active) return;

                setGroup(loadedGroup);
                setCourses(loadedCourses);
                setSessions(loadedSessions);
                setJoined(membership.joined);
                setLoading(false);
            })
            .catch((caughtError) => {
                if (!active) return;

                setError(getApiErrorMessage(caughtError, 'Unable to load this group right now.'));
                setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [groupId]);

    const isOwner = !!user?.id && user.id === group?.creatorId;

    const courseCode = useMemo(() => {
        if (!group?.courseId) return 'Course TBD';
        const match = courses.find((course) => course.id === group.courseId);
        return match ? match.code : `Course ${group.courseId}`;
    }, [courses, group?.courseId]);

    const handleToggleMembership = async () => {
        if (!group) return;

        setMembershipLoading(true);
        setMembershipError(null);

        try {
            if (joined) {
                await leaveGroup(group.id);
                setJoined(false);
            } else {
                await joinGroup(group.id);
                setJoined(true);
            }
        } catch (caughtError) {
            setMembershipError(
                getApiErrorMessage(
                    caughtError,
                    joined ? 'Unable to leave this group.' : 'Unable to join this group.'
                )
            );
        } finally {
            setMembershipLoading(false);
        }
    };

    const handleSessionSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!group) return;

        setSubmitError(null);

        if (!form.title.trim()) {
            setSubmitError('Session title is required.');
            return;
        }

        if (!form.scheduledAt) {
            setSubmitError('Choose a scheduled date and time.');
            return;
        }

        const duration = form.durationMinutes.trim() ? Number(form.durationMinutes) : null;
        if (form.durationMinutes.trim() && (!Number.isInteger(duration) || (duration ?? 0) <= 0)) {
            setSubmitError('Duration must be a positive whole number of minutes.');
            return;
        }

        const payload: CreateOrUpdateSessionPayload = {
            groupId: group.id,
            title: form.title.trim(),
            topic: form.topic.trim() || undefined,
            scheduledAt: fromDateTimeLocalValue(form.scheduledAt),
            location: form.location.trim() || undefined,
            notes: form.notes.trim() || undefined,
            durationMinutes: duration,
        };

        setSubmitting(true);

        try {
            const saved = editingSessionId
                ? await updateSession(editingSessionId, payload)
                : await createSession(payload);

            setSessions((current) => {
                const next = editingSessionId
                    ? current.map((session) => (session.id === editingSessionId ? saved : session))
                    : [...current, saved];

                return next.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
            });

            setForm(EMPTY_SESSION_FORM);
            setEditingSessionId(null);
        } catch (caughtError) {
            setSubmitError(getApiErrorMessage(caughtError, 'Unable to save the session right now.'));
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditSession = (session: StudySession) => {
        setEditingSessionId(session.id);
        setSubmitError(null);
        setForm({
            title: session.title,
            topic: session.topic || '',
            scheduledAt: toDateTimeLocalValue(session.scheduledAt),
            location: session.location || '',
            notes: session.notes || '',
            durationMinutes: session.durationMinutes ? String(session.durationMinutes) : '',
        });
    };

    const handleDeleteSession = async (sessionId: number) => {
        const confirmed = window.confirm('Delete this session?');
        if (!confirmed) return;

        try {
            await deleteSession(sessionId);
            setSessions((current) => current.filter((session) => session.id !== sessionId));

            if (editingSessionId === sessionId) {
                setEditingSessionId(null);
                setForm(EMPTY_SESSION_FORM);
            }
        } catch (caughtError) {
            setSubmitError(getApiErrorMessage(caughtError, 'Unable to delete the session right now.'));
        }
    };

    const handleDeleteGroup = async () => {
        if (!group) return;

        const confirmed = window.confirm(`Delete "${group.title || 'this group'}"?`);
        if (!confirmed) return;

        setDeletingGroup(true);

        try {
            await deleteGroup(group.id);
            navigate('/my-groups');
        } catch (caughtError) {
            setError(getApiErrorMessage(caughtError, 'Unable to delete the group right now.'));
            setDeletingGroup(false);
        }
    };

    if (loading) {
        return <GroupDetailPageSkeleton />;
    }

    return (
        <AppLayout>
            <div style={{ maxWidth: 980, margin: '0 auto' }}>
                <button
                    onClick={() => navigate('/groups')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563EB',
                        cursor: 'pointer',
                        marginBottom: 24,
                        fontWeight: 600,
                    }}
                >
                    Back to Groups
                </button>

                {error || !group ? (
                    <div
                        style={{
                            background: '#FEF2F2',
                            color: '#991B1B',
                            border: '1px solid #FECACA',
                            borderRadius: 12,
                            padding: '14px 16px',
                        }}
                    >
                        {error || 'This group could not be found.'}
                    </div>
                ) : (
                    <>
                        <div
                            style={{
                                background: '#fff',
                                borderRadius: 18,
                                border: '1px solid #E2E8F0',
                                padding: 28,
                                marginBottom: 24,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    gap: 20,
                                    alignItems: 'flex-start',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                                        <span style={tagStyle('#EFF6FF', '#1D4ED8')}>{courseCode}</span>
                                        <span style={tagStyle('#F1F5F9', '#475569')}>
                                            {group.meetingMode || 'Unspecified'}
                                        </span>
                                        {isOwner && <span style={tagStyle('#DCFCE7', '#166534')}>You own this group</span>}
                                        {!isOwner && joined && (
                                            <span style={tagStyle('#DCFCE7', '#166534')}>Joined</span>
                                        )}
                                    </div>

                                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0F172A', margin: '0 0 10px' }}>
                                        {group.title || 'Untitled group'}
                                    </h1>

                                    <p style={{ color: '#64748B', margin: '0 0 18px', lineHeight: 1.6, maxWidth: 720 }}>
                                        {group.description || 'No description yet.'}
                                    </p>

                                    <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', color: '#475569', fontSize: 14 }}>
                                        <span>{group.location || 'Location TBD'}</span>
                                        <span>{group.maxMembers ? `${group.maxMembers} maximum members` : 'No member limit set'}</span>
                                        <span>Created {formatDateOnly(group.createdAt)}</span>
                                    </div>

                                    {membershipError && (
                                        <div
                                            style={{
                                                background: '#FEF2F2',
                                                color: '#991B1B',
                                                border: '1px solid #FECACA',
                                                borderRadius: 12,
                                                padding: '12px 14px',
                                                marginTop: 16,
                                            }}
                                        >
                                            {membershipError}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    {!isOwner && (
                                        <button
                                            onClick={handleToggleMembership}
                                            disabled={membershipLoading}
                                            style={{
                                                background: joined ? '#fff' : '#2563EB',
                                                color: joined ? '#334155' : '#fff',
                                                border: joined ? '1px solid #CBD5E1' : 'none',
                                                borderRadius: 10,
                                                padding: '10px 16px',
                                                fontWeight: 700,
                                                cursor: membershipLoading ? 'not-allowed' : 'pointer',
                                                opacity: membershipLoading ? 0.7 : 1,
                                            }}
                                        >
                                            {membershipLoading ? 'Saving...' : joined ? 'Leave Group' : 'Join Group'}
                                        </button>
                                    )}

                                    {isOwner && (
                                        <button
                                            onClick={handleDeleteGroup}
                                            disabled={deletingGroup}
                                            style={{
                                                background: '#fff',
                                                color: '#B91C1C',
                                                border: '1px solid #FECACA',
                                                borderRadius: 10,
                                                padding: '10px 14px',
                                                fontWeight: 700,
                                                cursor: deletingGroup ? 'not-allowed' : 'pointer',
                                                opacity: deletingGroup ? 0.7 : 1,
                                            }}
                                        >
                                            {deletingGroup ? 'Deleting...' : 'Delete Group'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.9fr', gap: 24 }}>
                            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E2E8F0', padding: 24 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0F172A' }}>Study Sessions</h2>
                                    <span style={{ color: '#64748B', fontSize: 14 }}>{sessions.length} scheduled</span>
                                </div>

                                {sessions.length === 0 ? (
                                    <div style={{ background: '#F8FAFC', borderRadius: 12, padding: 20, color: '#64748B' }}>
                                        No sessions are scheduled for this group yet.
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: 14 }}>
                                        {sessions.map((session) => (
                                            <div key={session.id} style={{ border: '1px solid #E2E8F0', borderRadius: 14, padding: 18 }}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        gap: 16,
                                                        alignItems: 'flex-start',
                                                        flexWrap: 'wrap',
                                                    }}
                                                >
                                                    <div>
                                                        <h3 style={{ margin: '0 0 6px', color: '#0F172A' }}>{session.title}</h3>
                                                        <p style={{ margin: '0 0 6px', color: '#475569', fontSize: 14 }}>
                                                            {formatDateTime(session.scheduledAt)}
                                                        </p>
                                                        <p style={{ margin: '0 0 8px', color: '#64748B', fontSize: 14 }}>
                                                            {session.location || 'Location TBD'}
                                                        </p>
                                                        {session.topic && (
                                                            <p style={{ margin: '0 0 6px', color: '#334155', fontSize: 14 }}>
                                                                Topic: {session.topic}
                                                            </p>
                                                        )}
                                                        {session.notes && (
                                                            <p style={{ margin: 0, color: '#64748B', fontSize: 14, lineHeight: 1.5 }}>
                                                                {session.notes}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {isOwner && (
                                                        <div style={{ display: 'flex', gap: 10 }}>
                                                            <button onClick={() => handleEditSession(session)} style={secondaryButtonStyle}>
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteSession(session.id)}
                                                                style={{ ...secondaryButtonStyle, color: '#B91C1C', borderColor: '#FECACA' }}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E2E8F0', padding: 24 }}>
                                <h2 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#0F172A' }}>
                                    {editingSessionId ? 'Edit Session' : 'Create Session'}
                                </h2>

                                <p style={{ margin: '0 0 18px', color: '#64748B', lineHeight: 1.5 }}>
                                    {isOwner
                                        ? 'Session creation is enabled because you own this group.'
                                        : 'Only the creator of this group can create, edit, or delete sessions.'}
                                </p>

                                {submitError && (
                                    <div
                                        style={{
                                            background: '#FEF2F2',
                                            color: '#991B1B',
                                            border: '1px solid #FECACA',
                                            borderRadius: 12,
                                            padding: '12px 14px',
                                            marginBottom: 16,
                                        }}
                                    >
                                        {submitError}
                                    </div>
                                )}

                                <form onSubmit={handleSessionSubmit} style={{ display: 'grid', gap: 14 }}>
                                    <Field label="Session title">
                                        <input
                                            value={form.title}
                                            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                                            style={inputStyle}
                                            disabled={!isOwner || submitting}
                                            placeholder="Midterm review"
                                        />
                                    </Field>

                                    <Field label="Topic">
                                        <input
                                            value={form.topic}
                                            onChange={(event) => setForm((current) => ({ ...current, topic: event.target.value }))}
                                            style={inputStyle}
                                            disabled={!isOwner || submitting}
                                            placeholder="Graphs and shortest paths"
                                        />
                                    </Field>

                                    <Field label="Scheduled at">
                                        <input
                                            type="datetime-local"
                                            value={form.scheduledAt}
                                            onChange={(event) => setForm((current) => ({ ...current, scheduledAt: event.target.value }))}
                                            style={inputStyle}
                                            disabled={!isOwner || submitting}
                                        />
                                    </Field>

                                    <Field label="Location">
                                        <input
                                            value={form.location}
                                            onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                                            style={inputStyle}
                                            disabled={!isOwner || submitting}
                                            placeholder="Zoom or library room"
                                        />
                                    </Field>

                                    <Field label="Duration in minutes">
                                        <input
                                            value={form.durationMinutes}
                                            onChange={(event) => setForm((current) => ({ ...current, durationMinutes: event.target.value }))}
                                            style={inputStyle}
                                            disabled={!isOwner || submitting}
                                            placeholder="90"
                                            inputMode="numeric"
                                        />
                                    </Field>

                                    <Field label="Notes">
                                        <textarea
                                            value={form.notes}
                                            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                                            style={{ ...inputStyle, minHeight: 110, resize: 'vertical' }}
                                            disabled={!isOwner || submitting}
                                            placeholder="Prep notes, agenda, or meeting link"
                                        />
                                    </Field>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 6 }}>
                                        {editingSessionId && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingSessionId(null);
                                                    setForm(EMPTY_SESSION_FORM);
                                                    setSubmitError(null);
                                                }}
                                                style={secondaryButtonStyle}
                                            >
                                                Cancel edit
                                            </button>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={!isOwner || submitting}
                                            style={{ ...primaryButtonStyle, opacity: !isOwner || submitting ? 0.7 : 1 }}
                                        >
                                            {submitting ? 'Saving...' : editingSessionId ? 'Save Session' : 'Create Session'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
    return (
        <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>{label}</span>
            {children}
        </label>
    );
}

function tagStyle(background: string, color: string): CSSProperties {
    return {
        fontSize: 11,
        fontWeight: 700,
        background,
        color,
        borderRadius: 999,
        padding: '4px 10px',
    };
}

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
    padding: '10px 16px',
    fontWeight: 700,
    cursor: 'pointer',
};

const secondaryButtonStyle: CSSProperties = {
    background: '#fff',
    color: '#334155',
    border: '1px solid #CBD5E1',
    borderRadius: 10,
    padding: '10px 16px',
    fontWeight: 700,
    cursor: 'pointer',
};