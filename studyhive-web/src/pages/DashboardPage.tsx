import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { getCourses } from '../api/coursesApi';
import { getGroups } from '../api/groupsApi';
import { getSessionsByGroup } from '../api/sessionsApi';
import { getApiErrorMessage } from '../lib/apiErrors';
import { formatDateTime } from '../lib/dateTime';
import type { Course, StudyGroup, StudySession } from '../types';

const ACTIVITY = [
    { id: 1, text: 'Sarah Jenkins joined Algorithm Enthusiasts', time: '2 hours ago' },
    { id: 2, text: 'David Cho created: Midterm 2 Practice Exam', time: '5 hours ago' },
    { id: 3, text: 'You updated your profile picture', time: 'Yesterday' },
];

export default function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [groups, setGroups] = useState<StudyGroup[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'there';

    useEffect(() => {
        let active = true;

        Promise.all([getGroups(), getCourses()])
            .then(async ([allGroups, allCourses]) => {
                if (!active) return;

                setGroups(allGroups);
                setCourses(allCourses);

                const ownedGroups = allGroups.filter((group) => group.creatorId === user?.id);
                const sessionLists = await Promise.all(
                    ownedGroups.map((group) =>
                        getSessionsByGroup(group.id).catch(() => [])
                    )
                );

                if (!active) return;

                const upcoming = sessionLists
                    .flat()
                    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

                setSessions(upcoming);
                setLoading(false);
            })
            .catch((caughtError) => {
                if (!active) return;
                setError(getApiErrorMessage(caughtError, 'Unable to load your dashboard right now.'));
                setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [user?.id]);

    const courseMap = Object.fromEntries(courses.map((course) => [course.id, course.code]));
    const groupMap = Object.fromEntries(groups.map((group) => [group.id, group]));
    const ownedGroups = groups.filter((group) => group.creatorId === user?.id);
    const upcomingSessions = sessions.slice(0, 4);

    return (
        <AppLayout>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: '24px 28px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                        Welcome back, {displayName}!
                    </h1>
                    <p style={{ color: '#64748B', margin: 0 }}>
                        You have {loading ? '...' : upcomingSessions.length} study sessions coming up across your groups.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => navigate('/groups/new')} style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                        + Create Group
                    </button>
                    <button onClick={() => navigate('/groups')} style={{ background: '#fff', color: '#334155', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                        Browse Groups
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 14px', marginBottom: 24 }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                <StatCard emoji="Groups" label="Owned Groups" value={loading ? '...' : String(ownedGroups.length)} bg="#DBEAFE" />
                <StatCard emoji="Sessions" label="Upcoming Sessions" value={loading ? '...' : String(upcomingSessions.length)} bg="#FEF3C7" />
                <StatCard emoji="Courses" label="Courses Available" value={loading ? '...' : String(courses.length)} bg="#DCFCE7" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, marginBottom: 28 }}>
                <div>
                    <SectionHeader title="Upcoming Sessions" action="View My Groups" onAction={() => navigate('/my-groups')} />
                    {loading ? (
                        <p style={{ color: '#94A3B8' }}>Loading sessions...</p>
                    ) : upcomingSessions.length === 0 ? (
                        <EmptyState message="No upcoming sessions yet." onAction={() => navigate('/groups')} actionLabel="Browse Groups" />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {upcomingSessions.map((session) => {
                                const group = groupMap[session.groupId];
                                return (
                                    <div key={session.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{ background: '#EFF6FF', borderRadius: 10, padding: '8px 12px', textAlign: 'center', flexShrink: 0, minWidth: 92 }}>
                                            <p style={{ fontSize: 10, fontWeight: 700, color: '#2563EB', margin: 0 }}>
                                                {formatDateTime(session.scheduledAt)}
                                            </p>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>{session.title}</p>
                                            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 2px' }}>{group?.title ?? `Group #${session.groupId}`}</p>
                                            <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>{session.location || 'Location to be announced'}</p>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/groups/${session.groupId}`)}
                                            style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: '7px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#334155', whiteSpace: 'nowrap' }}
                                        >
                                            View Group
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>Recent Activity</h2>
                    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {ACTIVITY.map((item) => (
                            <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB', flexShrink: 0, marginTop: 4 }} />
                                <div>
                                    <p style={{ fontSize: 13, color: '#334155', margin: '0 0 2px', lineHeight: 1.4 }}>{item.text}</p>
                                    <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <SectionHeader title="Your Study Groups" action="View All" onAction={() => navigate('/my-groups')} />
                {loading ? (
                    <p style={{ color: '#94A3B8' }}>Loading groups...</p>
                ) : ownedGroups.length === 0 ? (
                    <EmptyState message="You have not created any groups yet." onAction={() => navigate('/groups/new')} actionLabel="Create Group" />
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {ownedGroups.slice(0, 4).map((group) => (
                            <GroupCard
                                key={group.id}
                                group={group}
                                courseCode={group.courseId ? courseMap[group.courseId] ?? `Course ${group.courseId}` : 'Course TBD'}
                                onClick={() => navigate(`/groups/${group.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function StatCard({ emoji, label, value, bg }: { emoji: string; label: string; value: string; bg: string }) {
    return (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ minWidth: 58, height: 46, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, fontWeight: 700, color: '#0F172A', padding: '0 8px' }}>{emoji}</div>
            <div>
                <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 3px' }}>{label}</p>
                <p style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1 }}>{value}</p>
            </div>
        </div>
    );
}

function SectionHeader({ title, action, onAction }: { title: string; action: string; onAction: () => void }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>{title}</h2>
            <button onClick={onAction} style={{ background: 'none', border: 'none', color: '#2563EB', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>{action}</button>
        </div>
    );
}

function EmptyState({ message, onAction, actionLabel }: { message: string; onAction: () => void; actionLabel: string }) {
    return (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: 32, textAlign: 'center', color: '#64748B' }}>
            <p style={{ marginBottom: 12 }}>{message}</p>
            <button onClick={onAction} style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>{actionLabel}</button>
        </div>
    );
}

function GroupCard({ group, courseCode, onClick }: { group: StudyGroup; courseCode: string; onClick: () => void }) {
    const mode = group.meetingMode || 'Unspecified';

    return (
        <div onClick={onClick} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: 18, cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, background: '#EFF6FF', color: '#1D4ED8', borderRadius: 6, padding: '3px 8px' }}>{courseCode}</span>
                <span style={{ fontSize: 11, fontWeight: 600, background: '#F1F5F9', color: '#475569', borderRadius: 6, padding: '3px 8px' }}>{mode}</span>
            </div>
            <h3 style={{ fontWeight: 700, color: '#0F172A', margin: '0 0 8px', fontSize: '0.95rem' }}>{group.title || 'Untitled group'}</h3>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 14px', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {group.description || 'No description yet.'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
                <span style={{ fontSize: 12, color: '#64748B' }}>{group.location || 'Location TBD'}</span>
                <span style={{ fontSize: 12, color: '#64748B' }}>
                    {group.maxMembers ? `${group.maxMembers} max` : 'No cap'}
                </span>
            </div>
        </div>
    );
}
