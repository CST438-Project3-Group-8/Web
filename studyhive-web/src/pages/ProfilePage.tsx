import { useMemo, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
    const { user } = useAuth();

    const initialName =
        user?.user_metadata?.full_name ??
        user?.email?.split('@')[0] ??
        'Alex Rivera';

    const initialEmail = user?.email ?? 'student@university.edu';

    const [fullName, setFullName] = useState(initialName);
    const [email] = useState(initialEmail);
    const [major, setMajor] = useState('Computer Science');
    const [bio, setBio] = useState(
        'Senior CS student. I love building web apps and studying algorithms. Always up for a late-night study session before finals!'
    );
    const [courses, setCourses] = useState(['CS301', 'MATH220', 'PHYS101', 'ENG101']);
    const [newCourse, setNewCourse] = useState('');
    const [saving, setSaving] = useState(false);

    const initials = useMemo(() => {
        return fullName
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
    }, [fullName]);

    const handleSave = async (event: React.FormEvent) => {
        event.preventDefault();
        setSaving(true);

        try {
            alert('Profile save hookup can be connected next.');
        } finally {
            setSaving(false);
        }
    };

    const handleAddCourse = () => {
        const cleaned = newCourse.trim().toUpperCase();
        if (!cleaned) return;
        if (courses.includes(cleaned)) {
            setNewCourse('');
            return;
        }
        setCourses((current) => [...current, cleaned]);
        setNewCourse('');
    };

    const handleRemoveCourse = (courseToRemove: string) => {
        setCourses((current) => current.filter((course) => course !== courseToRemove));
    };

    return (
        <AppLayout>
            <div style={{ maxWidth: 980, margin: '0 auto' }}>
                <div style={{ marginBottom: 28 }}>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: '2.4rem',
                            fontWeight: 800,
                            color: '#0F172A',
                            lineHeight: 1.1,
                        }}
                    >
                        Your Profile
                    </h1>
                    <p
                        style={{
                            marginTop: 10,
                            color: '#64748B',
                            fontSize: '1.15rem',
                        }}
                    >
                        Manage your account settings and personal information.
                    </p>
                </div>

                <div
                    style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: 28,
                        padding: 28,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 20,
                        marginBottom: 28,
                        boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
                        <div
                            style={{
                                width: 96,
                                height: 96,
                                borderRadius: '50%',
                                background: '#DBEAFE',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#1D4ED8',
                                fontSize: 34,
                                fontWeight: 800,
                                flexShrink: 0,
                            }}
                        >
                            {initials || 'A'}
                        </div>

                        <div>
                            <div
                                style={{
                                    fontSize: 26,
                                    fontWeight: 800,
                                    color: '#0F172A',
                                    marginBottom: 4,
                                }}
                            >
                                {fullName}
                            </div>

                            <div
                                style={{
                                    fontSize: 16,
                                    fontWeight: 600,
                                    color: '#64748B',
                                    marginBottom: 14,
                                }}
                            >
                                {major}
                            </div>

                            <div
                                style={{
                                    maxWidth: 520,
                                    fontSize: 15,
                                    lineHeight: 1.65,
                                    color: '#475569',
                                }}
                            >
                                {bio}
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        style={{
                            alignSelf: 'flex-start',
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: 16,
                            padding: '14px 22px',
                            fontWeight: 700,
                            fontSize: 16,
                            color: '#334155',
                            cursor: 'pointer',
                        }}
                    >
                        Edit Profile
                    </button>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '280px 1fr',
                        gap: 28,
                        alignItems: 'start',
                    }}
                >
                    <div
                        style={{
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: 24,
                            padding: 16,
                            boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)',
                        }}
                    >
                        <ProfileTab label="General" active />
                        <ProfileTab label="Courses" />
                        <ProfileTab label="Security" />
                        <ProfileTab label="Preferences" />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                        <form
                            onSubmit={handleSave}
                            style={{
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: 28,
                                padding: 30,
                                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 18,
                                    fontWeight: 800,
                                    color: '#0F172A',
                                    marginBottom: 24,
                                }}
                            >
                                Personal Details
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 18,
                                    marginBottom: 18,
                                }}
                            >
                                <Field label="Full Name">
                                    <input
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Alex Rivera"
                                        style={inputStyle}
                                    />
                                </Field>

                                <Field label="Email Address">
                                    <input
                                        value={email}
                                        disabled
                                        style={{
                                            ...inputStyle,
                                            background: '#F8FAFC',
                                            color: '#475569',
                                        }}
                                    />
                                </Field>
                            </div>

                            <div style={{ marginBottom: 18 }}>
                                <Field label="Major / Program">
                                    <input
                                        value={major}
                                        onChange={(e) => setMajor(e.target.value)}
                                        placeholder="Computer Science"
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
                      style={{
                          ...inputStyle,
                          resize: 'vertical',
                          minHeight: 120,
                      }}
                  />
                                </Field>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        background: '#2563EB',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        borderRadius: 16,
                                        padding: '14px 24px',
                                        fontSize: 16,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        boxShadow: '0 10px 18px rgba(37, 99, 235, 0.22)',
                                        opacity: saving ? 0.7 : 1,
                                    }}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>

                        <div
                            style={{
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: 28,
                                padding: 30,
                                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 18,
                                    fontWeight: 800,
                                    color: '#0F172A',
                                    marginBottom: 24,
                                }}
                            >
                                My Courses
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 12,
                                    marginBottom: 22,
                                }}
                            >
                                {courses.map((course) => (
                                    <div
                                        key={course}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            background: '#EFF6FF',
                                            color: '#2563EB',
                                            borderRadius: 14,
                                            padding: '10px 16px',
                                            fontWeight: 700,
                                            fontSize: 15,
                                        }}
                                    >
                                        <span>{course}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCourse(course)}
                                            style={{
                                                border: 'none',
                                                background: 'transparent',
                                                color: '#2563EB',
                                                cursor: 'pointer',
                                                fontWeight: 800,
                                                fontSize: 14,
                                                padding: 0,
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    gap: 12,
                                    alignItems: 'center',
                                }}
                            >
                                <input
                                    value={newCourse}
                                    onChange={(e) => setNewCourse(e.target.value)}
                                    placeholder="Add a new course (e.g. HIST 201)"
                                    style={{
                                        ...inputStyle,
                                        flex: 1,
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddCourse}
                                    style={{
                                        background: '#F8FAFC',
                                        border: '1px solid #E2E8F0',
                                        borderRadius: 16,
                                        padding: '14px 24px',
                                        fontWeight: 700,
                                        fontSize: 16,
                                        color: '#334155',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div
                            style={{
                                background: '#FEF2F2',
                                border: '1px solid #FECACA',
                                borderRadius: 28,
                                padding: 30,
                            }}
                        >
                            <div
                                style={{
                                    color: '#B91C1C',
                                    fontSize: 18,
                                    fontWeight: 800,
                                    marginBottom: 14,
                                }}
                            >
                                Delete Account
                            </div>

                            <div
                                style={{
                                    color: '#DC2626',
                                    fontSize: 16,
                                    lineHeight: 1.6,
                                    marginBottom: 24,
                                    maxWidth: 620,
                                }}
                            >
                                Your actions will have grave consequences. Please be certain.
                            </div>

                            <button
                                type="button"
                                style={{
                                    background: '#FFFFFF',
                                    color: '#FF0000',
                                    border: '1px solid #FCA5A5',
                                    borderRadius: 16,
                                    padding: '14px 22px',
                                    fontSize: 16,
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                }}
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function ProfileTab({ label, active = false }: { label: string; active?: boolean }) {
    return (
        <button
            type="button"
            style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                borderRadius: 16,
                border: active ? '1px solid #DBEAFE' : '1px solid transparent',
                background: active ? '#F8FBFF' : 'transparent',
                color: active ? '#2563EB' : '#475569',
                fontWeight: active ? 700 : 600,
                fontSize: 16,
                cursor: 'pointer',
                marginBottom: 8,
            }}
        >
      <span
          style={{
              width: 18,
              height: 18,
              borderRadius: active ? '999px' : '4px',
              border: '2px solid',
              borderColor: active ? '#2563EB' : '#64748B',
              display: 'inline-block',
              boxSizing: 'border-box',
              position: 'relative',
              flexShrink: 0,
          }}
      >
        {active && (
            <span
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 6,
                    height: 6,
                    borderRadius: '999px',
                    background: '#2563EB',
                    transform: 'translate(-50%, -50%)',
                }}
            />
        )}
      </span>

            {label}
        </button>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label style={{ display: 'block' }}>
            <div
                style={{
                    marginBottom: 10,
                    fontWeight: 700,
                    fontSize: 15,
                    color: '#334155',
                }}
            >
                {label}
            </div>
            {children}
        </label>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: 16,
    border: '1px solid #CBD5E1',
    fontSize: 16,
    outline: 'none',
    boxSizing: 'border-box',
    background: '#FFFFFF',
    color: '#0F172A',
};