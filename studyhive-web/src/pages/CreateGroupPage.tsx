import { useEffect, useState } from 'react';
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { getCourses } from '../api/coursesApi';
import { createGroup } from '../api/groupsApi';
import { getApiErrorMessage } from '../lib/apiErrors';
import type { Course, CreateGroupPayload } from '../types';

interface GroupFormState {
    title: string;
    description: string;
    courseId: string;
    location: string;
    meetingMode: string;
    maxMembers: string;
}

const INITIAL_FORM: GroupFormState = {
    title: '',
    description: '',
    courseId: '',
    location: '',
    meetingMode: 'In-Person',
    maxMembers: '',
};

export default function CreateGroupPage() {
    const navigate = useNavigate();
    const { session } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [form, setForm] = useState<GroupFormState>(INITIAL_FORM);
    const [errors, setErrors] = useState<string[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        getCourses()
            .then((loadedCourses) => {
                setCourses(loadedCourses);
                setLoadingCourses(false);
            })
            .catch(() => {
                setLoadingCourses(false);
            });
    }, []);

    const validate = () => {
        const nextErrors: string[] = [];

        if (!form.title.trim()) nextErrors.push('Title is required.');
        if (form.maxMembers.trim()) {
            const parsed = Number(form.maxMembers);
            if (!Number.isInteger(parsed) || parsed <= 0) {
                nextErrors.push('Max members must be a positive whole number.');
            }
        }

        setErrors(nextErrors);
        return nextErrors.length === 0;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitError(null);

        if (!session) {
            setSubmitError('Please sign in before creating a group.');
            return;
        }

        if (!validate()) return;

        const payload: CreateGroupPayload = {
            title: form.title.trim(),
            description: form.description.trim() || undefined,
            courseId: form.courseId ? Number(form.courseId) : null,
            location: form.location.trim() || undefined,
            meetingMode: form.meetingMode || undefined,
            maxMembers: form.maxMembers ? Number(form.maxMembers) : null,
        };

        setSubmitting(true);

        try {
            const created = await createGroup(payload);
            navigate(`/groups/${created.id}`);
        } catch (caughtError) {
            setSubmitError(getApiErrorMessage(caughtError, 'Unable to create the group right now.'));
            setSubmitting(false);
        }
    };

    return (
        <AppLayout>
            <div style={{ maxWidth: 780, margin: '0 auto' }}>
                <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', marginBottom: 24, fontWeight: 600 }}>
                    Back to Dashboard
                </button>

                <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #E2E8F0', padding: 28 }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px', color: '#0F172A' }}>Create a Group</h1>
                    <p style={{ color: '#64748B', margin: '0 0 24px' }}>
                        Start with the basics now. The backend is lenient, so we are validating required fields here before submit.
                    </p>

                    {submitError && (
                        <div style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
                            {submitError}
                        </div>
                    )}

                    {errors.length > 0 && (
                        <div style={{ background: '#FFF7ED', color: '#9A3412', border: '1px solid #FED7AA', borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
                            {errors.map((error) => (
                                <p key={error} style={{ margin: 0 }}>{error}</p>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18 }}>
                        <Field label="Group title">
                            <input
                                value={form.title}
                                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                                placeholder="Algorithms Midterm Prep"
                                style={inputStyle}
                            />
                        </Field>

                        <Field label="Description">
                            <textarea
                                value={form.description}
                                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                                placeholder="What will this group work on?"
                                rows={4}
                                style={{ ...inputStyle, resize: 'vertical', minHeight: 110 }}
                            />
                        </Field>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
                            <Field label="Course">
                                <select
                                    value={form.courseId}
                                    onChange={(event) => setForm((current) => ({ ...current, courseId: event.target.value }))}
                                    style={inputStyle}
                                    disabled={loadingCourses}
                                >
                                    <option value="">Select a course</option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>{course.code} - {course.title}</option>
                                    ))}
                                </select>
                            </Field>

                            <Field label="Meeting mode">
                                <select
                                    value={form.meetingMode}
                                    onChange={(event) => setForm((current) => ({ ...current, meetingMode: event.target.value }))}
                                    style={inputStyle}
                                >
                                    <option value="In-Person">In-Person</option>
                                    <option value="Online">Online</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                            </Field>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
                            <Field label="Location">
                                <input
                                    value={form.location}
                                    onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                                    placeholder="Library, room, or Zoom"
                                    style={inputStyle}
                                />
                            </Field>

                            <Field label="Max members">
                                <input
                                    value={form.maxMembers}
                                    onChange={(event) => setForm((current) => ({ ...current, maxMembers: event.target.value }))}
                                    placeholder="8"
                                    inputMode="numeric"
                                    style={inputStyle}
                                />
                            </Field>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
                            <button type="button" onClick={() => navigate('/groups')} style={secondaryButtonStyle}>
                                Cancel
                            </button>
                            <button type="submit" disabled={submitting || !session} style={{ ...primaryButtonStyle, opacity: submitting || !session ? 0.7 : 1 }}>
                                {submitting ? 'Creating...' : 'Create Group'}
                            </button>
                        </div>
                    </form>
                </div>
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
    padding: '10px 18px',
    fontWeight: 700,
    cursor: 'pointer',
};

const secondaryButtonStyle: CSSProperties = {
    background: '#fff',
    color: '#334155',
    border: '1px solid #CBD5E1',
    borderRadius: 10,
    padding: '10px 18px',
    fontWeight: 700,
    cursor: 'pointer',
};
