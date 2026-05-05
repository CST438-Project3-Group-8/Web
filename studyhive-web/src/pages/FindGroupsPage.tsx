import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { apiClient } from '../lib/apiClient';
import type { StudyGroup, Course } from '../types';

export default function FindGroupsPage() {
    const navigate = useNavigate();
    const [groups, setGroups] = useState<StudyGroup[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        Promise.all([
            apiClient.get<StudyGroup[]>('/api/groups').then(r => r.data).catch(() => []),
            apiClient.get<Course[]>('/api/courses').then(r => r.data).catch(() => []),
        ]).then(([g, c]) => { setGroups(g); setCourses(c); setLoading(false); });
    }, []);

    const courseMap = Object.fromEntries(courses.map(c => [c.id, c.code]));

    const modeFilters = ['All', 'Online', 'In-Person', 'Hybrid'];

    const filtered = groups.filter(g => {
        const matchSearch = !search || g.title.toLowerCase().includes(search.toLowerCase()) || g.description?.toLowerCase().includes(search.toLowerCase());
        const matchFilter = activeFilter === 'All' || g.meetingMode === activeFilter;
        return matchSearch && matchFilter;
    });

    return (
        <AppLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>Discover Groups</h1>
                    <p style={{ color: '#64748B', margin: 0 }}>Find and join study groups that match your courses and schedule.</p>
                </div>
                <button onClick={() => navigate('/groups/new')} style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap' }}>
                    + Create New Group
                </button>
            </div>

            {/* Search + filters */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 240, display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '9px 14px', gap: 8 }}>
                    <span style={{ color: '#94A3B8' }}>🔍</span>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by course code, topic, or group name..."
                        style={{ border: 'none', outline: 'none', fontSize: 14, color: '#0F172A', width: '100%', background: 'transparent' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {modeFilters.map(f => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            style={{
                                padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                                background: activeFilter === f ? '#2563EB' : '#fff',
                                color: activeFilter === f ? '#fff' : '#475569',
                                border: activeFilter === f ? 'none' : '1px solid #E2E8F0',
                            } as React.CSSProperties}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Groups grid */}
            {loading ? (
                <p style={{ color: '#94A3B8' }}>Loading groups...</p>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748B' }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>No groups found.</p>
                    <p>Try adjusting your search or filters.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {filtered.map(g => (
                        <BrowseGroupCard key={g.id} group={g} courseCode={courseMap[g.courseId] ?? `Course ${g.courseId}`} onView={() => navigate(`/groups/${g.id}`)} />
                    ))}
                </div>
            )}
        </AppLayout>
    );
}

function BrowseGroupCard({ group, courseCode, onView }: { group: StudyGroup; courseCode: string; onView: () => void }) {
    const modeStyles: Record<string, { bg: string; color: string }> = {
        'Online': { bg: '#DCFCE7', color: '#16A34A' },
        'In-Person': { bg: '#DCFCE7', color: '#16A34A' },
        'Hybrid': { bg: '#FEF3C7', color: '#D97706' },
    };
    const mode = group.meetingMode || 'In-Person';
    const ms = modeStyles[mode] ?? { bg: '#F1F5F9', color: '#475569' };

    return (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20, display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 600, background: '#EFF6FF', color: '#1D4ED8', borderRadius: 6, padding: '3px 8px' }}>{courseCode}</span>
                <span style={{ fontSize: 11, fontWeight: 600, background: ms.bg, color: ms.color, borderRadius: 6, padding: '3px 8px' }}>{mode}</span>
            </div>
            <h3 style={{ fontWeight: 700, color: '#0F172A', margin: '0 0 8px', fontSize: '1rem' }}>{group.title}</h3>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 12px', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                {group.description}
            </p>
            {group.location && (
                <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    📍 {group.location}
                </p>
            )}
            <p style={{ fontSize: 12, color: '#94A3B8', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 4 }}>
                👥 ? / {group.maxMembers} members
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 14, marginTop: 'auto' }}>
                <div style={{ display: 'flex' }}>
                    {['#93C5FD', '#C4B5FD', '#FCA5A5'].map((c, i) => (
                        <div key={i} style={{ width: 24, height: 24, borderRadius: '50%', background: c, border: '2px solid #fff', marginLeft: i > 0 ? -8 : 0 }} />
                    ))}
                </div>
                <button
                    onClick={onView}
                    style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: '7px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer', color: '#334155' }}
                >
                    View Details
                </button>
            </div>
        </div>
    );
}