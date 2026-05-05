import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/apiClient';
import type { StudyGroup, Course } from '../types';

export default function MyGroupsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [groups, setGroups] = useState<StudyGroup[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiClient.get<StudyGroup[]>('/api/groups').then(r => r.data).catch(() => []),
            apiClient.get<Course[]>('/api/courses').then(r => r.data).catch(() => []),
        ]).then(([g, c]) => {
            // Filter to groups created by this user
            setGroups(g.filter(group => group.creatorId === user?.id));
            setCourses(c);
            setLoading(false);
        });
    }, [user?.id]);

    const courseMap = Object.fromEntries(courses.map(c => [c.id, c.code]));

    return (
        <AppLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>My Groups</h1>
                    <p style={{ color: '#64748B', margin: 0 }}>Manage your study groups and upcoming sessions.</p>
                </div>
                <button onClick={() => navigate('/groups')} style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    🔍 Find More Groups
                </button>
            </div>

            <div style={{ marginTop: 24 }}>
                {loading ? (
                    <p style={{ color: '#94A3B8' }}>Loading your groups...</p>
                ) : groups.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 48, textAlign: 'center', color: '#64748B' }}>
                        <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>You haven't created any groups yet.</p>
                        <p style={{ marginBottom: 20 }}>Create a group or browse existing ones to join.</p>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                            <button onClick={() => navigate('/groups/new')} style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>
                                Create a Group
                            </button>
                            <button onClick={() => navigate('/groups')} style={{ background: '#fff', color: '#334155', border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>
                                Browse Groups
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
                        {groups.map(g => (
                            <MyGroupCard key={g.id} group={g} courseCode={courseMap[g.courseId] ?? `Course ${g.courseId}`} onClick={() => navigate(`/groups/${g.id}`)} />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function MyGroupCard({ group, courseCode, onClick }: { group: StudyGroup; courseCode: string; onClick: () => void }) {
    const modeStyles: Record<string, { bg: string; color: string }> = {
        'Online': { bg: '#DBEAFE', color: '#1D4ED8' },
        'In-Person': { bg: '#FEF3C7', color: '#D97706' },
        'Hybrid': { bg: '#EDE9FE', color: '#7C3AED' },
    };
    const mode = group.meetingMode || 'In-Person';
    const ms = modeStyles[mode] ?? { bg: '#F1F5F9', color: '#475569' };

    return (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 22, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Tags row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 600, background: '#EFF6FF', color: '#1D4ED8', borderRadius: 6, padding: '3px 8px' }}>{courseCode}</span>
                <span style={{ fontSize: 11, fontWeight: 600, background: '#DCFCE7', color: '#16A34A', borderRadius: 6, padding: '3px 8px' }}>● Active</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, background: ms.bg, color: ms.color, borderRadius: 6, padding: '3px 8px' }}>{mode}</span>
            </div>

            {/* Title */}
            <h3
                onClick={onClick}
                style={{ fontWeight: 700, color: '#2563EB', margin: '0 0 8px', fontSize: '1.05rem', cursor: 'pointer' }}
            >
                {group.title}
            </h3>

            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 16px', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {group.description}
            </p>

            {/* Members row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex' }}>
                    {['#93C5FD', '#C4B5FD', '#FCA5A5'].map((c, i) => (
                        <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: '2px solid #fff', marginLeft: i > 0 ? -8 : 0 }} />
                    ))}
                </div>
                <span style={{ fontSize: 13, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                    👥 ? / {group.maxMembers} members
                </span>
            </div>

            {/* Next session placeholder */}
            <div style={{ background: '#F8FAFC', borderRadius: 12, border: '1px solid #F1F5F9', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    📅
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', margin: '0 0 2px', letterSpacing: '0.06em' }}>NEXT SESSION</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: 0 }}>No sessions scheduled</p>
                </div>
                <span style={{ color: '#94A3B8', fontSize: 18 }}>→</span>
            </div>
        </div>
    );
}