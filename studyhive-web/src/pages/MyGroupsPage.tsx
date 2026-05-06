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

export default function MyGroupsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [groups, setGroups] = useState<StudyGroup[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [nextSessionByGroup, setNextSessionByGroup] = useState<Record<number, StudySession | undefined>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        Promise.all([getGroups(), getCourses()])
            .then(async ([allGroups, allCourses]) => {
                const ownedGroups = allGroups.filter((group) => group.creatorId === user?.id);
                const sessionLists = await Promise.all(
                    ownedGroups.map((group) => getSessionsByGroup(group.id).catch(() => []))
                );

                if (!active) return;

                const nextMap: Record<number, StudySession | undefined> = {};
                ownedGroups.forEach((group, index) => {
                    nextMap[group.id] = sessionLists[index]
                        .slice()
                        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
                });

                setGroups(ownedGroups);
                setCourses(allCourses);
                setNextSessionByGroup(nextMap);
                setLoading(false);
            })
            .catch((caughtError) => {
                if (!active) return;
                setError(getApiErrorMessage(caughtError, 'Unable to load your groups right now.'));
                setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [user?.id]);

    const courseMap = Object.fromEntries(courses.map((course) => [course.id, course.code]));

    return (
        <AppLayout>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>My Groups</h1>
                    <p style={{ color: '#64748B', margin: 0 }}>Manage your study groups and upcoming sessions.</p>
                </div>
                <button onClick={() => navigate('/groups')} style={{ background: '#2563EB', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
                    Browse Groups
                </button>
            </div>

            {error && (
                <div style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 14px', marginTop: 20 }}>
                    {error}
                </div>
            )}

            <div style={{ marginTop: 24 }}>
                {loading ? (
                    <p style={{ color: '#94A3B8' }}>Loading your groups...</p>
                ) : groups.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 48, textAlign: 'center', color: '#64748B' }}>
                        <p style={{ fontSize: '1.1rem', marginBottom: 8 }}>You have not created any groups yet.</p>
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
                        {groups.map((group) => (
                            <MyGroupCard
                                key={group.id}
                                group={group}
                                courseCode={group.courseId ? courseMap[group.courseId] ?? `Course ${group.courseId}` : 'Course TBD'}
                                nextSession={nextSessionByGroup[group.id]}
                                onClick={() => navigate(`/groups/${group.id}`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

function MyGroupCard({
    group,
    courseCode,
    nextSession,
    onClick,
}: {
    group: StudyGroup;
    courseCode: string;
    nextSession?: StudySession;
    onClick: () => void;
}) {
    const modeStyles: Record<string, { bg: string; color: string }> = {
        Online: { bg: '#DBEAFE', color: '#1D4ED8' },
        'In-Person': { bg: '#FEF3C7', color: '#D97706' },
        Hybrid: { bg: '#EDE9FE', color: '#7C3AED' },
    };
    const mode = group.meetingMode || 'Unspecified';
    const modeStyle = modeStyles[mode] ?? { bg: '#F1F5F9', color: '#475569' };

    return (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 22, display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 600, background: '#EFF6FF', color: '#1D4ED8', borderRadius: 6, padding: '3px 8px' }}>{courseCode}</span>
                <span style={{ fontSize: 11, fontWeight: 600, background: '#DCFCE7', color: '#16A34A', borderRadius: 6, padding: '3px 8px' }}>Active</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, background: modeStyle.bg, color: modeStyle.color, borderRadius: 6, padding: '3px 8px' }}>{mode}</span>
            </div>

            <h3 onClick={onClick} style={{ fontWeight: 700, color: '#2563EB', margin: '0 0 8px', fontSize: '1.05rem', cursor: 'pointer' }}>
                {group.title || 'Untitled group'}
            </h3>

            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 16px', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {group.description || 'No description yet.'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: '#64748B' }}>{group.location || 'Location TBD'}</span>
                <span style={{ fontSize: 13, color: '#64748B' }}>
                    {group.maxMembers ? `${group.maxMembers} members max` : 'No member cap'}
                </span>
            </div>

            <div style={{ background: '#F8FAFC', borderRadius: 12, border: '1px solid #F1F5F9', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#2563EB', flexShrink: 0 }}>
                    {nextSession ? 'Next' : 'None'}
                </div>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', margin: '0 0 2px', letterSpacing: '0.06em' }}>NEXT SESSION</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>{nextSession?.title || 'No sessions scheduled'}</p>
                    {nextSession && (
                        <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>{formatDateTime(nextSession.scheduledAt)}</p>
                    )}
                </div>
                <button onClick={onClick} style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontWeight: 600 }}>
                    Open
                </button>
            </div>
        </div>
    );
}
