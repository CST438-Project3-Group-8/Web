import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/apiClient';
import type { StudyGroup, Course } from '../types';

const SAMPLE_SESSIONS = [
    { id: 1, title: 'Dynamic Programming Review', group: 'Algorithm Enthusiasts', time: 'TODAY', hour: '4:00', location: 'Main Library, Room 402' },
    { id: 2, title: 'Midterm 2 Practice Exam', group: 'Calculus III Prep', time: 'TOMORROW', hour: '7:00', location: 'Zoom' },
];

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
    const [loading, setLoading] = useState(true);

    const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'there';

    useEffect(() => {
        Promise.all([
            apiClient.get<StudyGroup[]>('/api/groups').then(r => r.data).catch(() => []),
            apiClient.get<Course[]>('/api/courses').then(r => r.data).catch(() => []),
        ]).then(([g, c]) => {
            setGroups(g);
            setCourses(c);
            setLoading(false);
        });
    }, []);

    const courseMap = Object.fromEntries(courses.map(c => [c.id, c.code]));

    return (
        <AppLayout>
            {/* Welcome banner */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: '24px 28px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
                        Welcome back, {displayName}! 👋
                    </h1>
                    <p style={{ color: '#64748B', margin: 0 }}>
                        You have {SAMPLE_SESSIONS.length} study sessions coming up this week.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => navigate('/groups/new')} style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                        + Create Group
                    </button>
                    <button onClick={() => navigate('/groups')} style={{ background: '#fff', color: '#334155', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                        🔍 Find Groups
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
                <StatCard emoji="👥" label="Active Groups" value={loading ? '…' : String(groups.length)} bg="#DBEAFE" />
                <StatCard emoji="📅" label="Upcoming Sessions" value={String(SAMPLE_SESSIONS.length)} bg="#FEF3C7" />
                <StatCard emoji="📗" label="Courses Enrolled" value="4" bg="#DCFCE7" />
            </div>

            {/* Sessions + Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, marginBottom: 28 }}>
                <div>
                    <SectionHeader title="📅 Upcoming Sessions" action="View Calendar →" onAction={() => {}} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {SAMPLE_SESSIONS.map(s => (
                            <div key={s.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                                <div style={{ background: '#EFF6FF', borderRadius: 10, padding: '8px 12px', textAlign: 'center', flexShrink: 0 }}>
                                    <p style={{ fontSize: 9, fontWeight: 700, color: '#2563EB', margin: 0, letterSpacing: '0.06em' }}>{s.time}</p>
                                    <p style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2563EB', margin: 0 }}>{s.hour}</p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>{s.title}</p>
                                    <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 2px' }}>{s.group}</p>
                                    <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>📍 {s.location}</p>
                                </div>
                                <button style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: '7px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#334155', whiteSpace: 'nowrap' }}>
                                    Join Meeting
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>🔔 Recent Activity</h2>
                    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {ACTIVITY.map(a => (
                            <div key={a.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB', flexShrink: 0, marginTop: 4 }} />
                                <div>
                                    <p style={{ fontSize: 13, color: '#334155', margin: '0 0 2px', lineHeight: 1.4 }}>{a.text}</p>
                                    <p style={{ fontSize: 11, color: '#94A3B8', margin: 0 }}>{a.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Study Groups */}
            <div>
                <SectionHeader title="👥 Your Study Groups" action="View All →" onAction={() => navigate('/my-groups')} />
                {loading ? (
                    <p style={{ color: '#94A3B8' }}>Loading groups...</p>
                ) : groups.length === 0 ? (
                    <EmptyState message="You haven't joined any groups yet." onAction={() => navigate('/groups')} actionLabel="Find Groups" />
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {groups.slice(0, 4).map(g => (
                            <GroupCard key={g.id} group={g} courseCode={courseMap[g.courseId] ?? `Course ${g.courseId}`} onClick={() => navigate(`/groups/${g.id}`)} />
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
            <div style={{ width: 46, height: 46, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{emoji}</div>
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

function AvatarStack() {
    const colors = ['#93C5FD', '#C4B5FD', '#FCA5A5'];
    return (
        <div style={{ display: 'flex' }}>
            {colors.map((c, i) => (
                <div key={i} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: '2px solid #fff', marginLeft: i > 0 ? -8 : 0 }} />
            ))}
        </div>
    );
}

function ModeTag({ mode }: { mode: string }) {
    const map: Record<string, { bg: string; color: string }> = {
        'Online': { bg: '#DCFCE7', color: '#16A34A' },
        'In-Person': { bg: '#DCFCE7', color: '#16A34A' },
        'Hybrid': { bg: '#EDE9FE', color: '#7C3AED' },
    };
    const style = map[mode] ?? { bg: '#F1F5F9', color: '#475569' };
    return <span style={{ fontSize: 11, fontWeight: 600, background: style.bg, color: style.color, borderRadius: 6, padding: '3px 8px' }}>{mode}</span>;
}

function GroupCard({ group, courseCode, onClick }: { group: StudyGroup; courseCode: string; onClick: () => void }) {
    return (
        <div onClick={onClick} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: 18, cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, background: '#EFF6FF', color: '#1D4ED8', borderRadius: 6, padding: '3px 8px' }}>{courseCode}</span>
                <ModeTag mode={group.meetingMode || 'In-Person'} />
            </div>
            <h3 style={{ fontWeight: 700, color: '#0F172A', margin: '0 0 8px', fontSize: '0.95rem' }}>{group.title}</h3>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 14px', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {group.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
                <AvatarStack />
                <span style={{ fontSize: 12, color: '#64748B' }}>? / {group.maxMembers} members</span>
            </div>
        </div>
    );
}