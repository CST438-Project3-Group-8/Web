import { useEffect, useMemo, useState } from "react";
import { getCourses, type Course } from "../api/coursesApi";
import "./CreateGroupPage.css";

type MeetingMode = "In-Person" | "Online" | "Hybrid";

function CreateGroupPage() {
    const [groupName, setGroupName] = useState("");
    const [courseQuery, setCourseQuery] = useState("");
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [maxMembers, setMaxMembers] = useState("2 - 5 members");
    const [description, setDescription] = useState("");
    const [meetingMode, setMeetingMode] = useState<MeetingMode>("In-Person");
    const [location, setLocation] = useState("");
    const [schedule, setSchedule] = useState("");

    const [courses, setCourses] = useState<Course[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [coursesError, setCoursesError] = useState("");

    useEffect(() => {
        async function loadCourses() {
            try {
                setLoadingCourses(true);
                const data = await getCourses();
                setCourses(data);
            } catch (error) {
                console.error(error);
                setCoursesError("Could not load courses.");
            } finally {
                setLoadingCourses(false);
            }
        }

        loadCourses();
    }, []);

    const filteredCourses = useMemo(() => {
        const query = courseQuery.trim().toLowerCase();

        if (!query) {
            return courses;
        }

        return courses.filter((course) => {
            const label = `${course.code} ${course.title} ${course.subject}`.toLowerCase();
            return label.includes(query);
        });
    }, [courseQuery, courses]);

    const handleCourseSelect = (course: Course) => {
        setSelectedCourse(course);
        setCourseQuery(`${course.code} - ${course.title}`);
        setShowDropdown(false);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        console.log({
            groupName,
            selectedCourse,
            maxMembers,
            description,
            meetingMode,
            location,
            schedule,
        });

        alert("Create Group clicked. Backend hookup can be next.");
    };

    return (
        <div className="create-group-page">
            <aside className="create-group-sidebar">
                <div className="sidebar-brand">
                    <div className="sidebar-logo" />
                    <span>StudyHive</span>
                </div>

                <nav className="sidebar-nav">
                    <button className="sidebar-link" type="button">
                        Dashboard
                    </button>
                    <button className="sidebar-link sidebar-link-active" type="button">
                        Browse Groups
                    </button>
                    <button className="sidebar-link" type="button">
                        My Groups
                    </button>
                    <button className="sidebar-link" type="button">
                        Create Group
                    </button>
                </nav>

                <div className="sidebar-profile">
                    <div className="profile-avatar" />
                    <div>
                        <div className="profile-name">Alex Rivera</div>
                        <div className="profile-subtext">View Profile</div>
                    </div>
                </div>
            </aside>

            <main className="create-group-content">
                <div className="create-group-header">
                    <button className="back-button" type="button">
                        ←
                    </button>

                    <div>
                        <h1>Create a Study Group</h1>
                        <p>Start a new group to study, collaborate, and prep together.</p>
                    </div>
                </div>

                <form className="create-group-form" onSubmit={handleSubmit}>
                    <section className="form-card">
                        <h2>Basic Information</h2>

                        <div className="form-group">
                            <label htmlFor="groupName">Group Name</label>
                            <input
                                id="groupName"
                                type="text"
                                placeholder="e.g., Finals Prep - Physics 101"
                                value={groupName}
                                onChange={(event) => setGroupName(event.target.value)}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group course-dropdown-group">
                                <label htmlFor="courseQuery">Course or Subject</label>
                                <input
                                    id="courseQuery"
                                    type="text"
                                    placeholder="e.g., PHYS 101"
                                    value={courseQuery}
                                    onChange={(event) => {
                                        setCourseQuery(event.target.value);
                                        setSelectedCourse(null);
                                        setShowDropdown(true);
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                />

                                {showDropdown && (
                                    <div className="course-dropdown">
                                        {loadingCourses && <div className="dropdown-item muted">Loading courses...</div>}

                                        {!loadingCourses && coursesError && (
                                            <div className="dropdown-item muted">{coursesError}</div>
                                        )}

                                        {!loadingCourses && !coursesError && filteredCourses.length === 0 && (
                                            <div className="dropdown-item muted">No matching courses found.</div>
                                        )}

                                        {!loadingCourses &&
                                            !coursesError &&
                                            filteredCourses.map((course) => (
                                                <button
                                                    key={course.id}
                                                    className="dropdown-item"
                                                    type="button"
                                                    onClick={() => handleCourseSelect(course)}
                                                >
                                                    {course.code} - {course.title}
                                                </button>
                                            ))}
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="maxMembers">Maximum Members</label>
                                <input
                                    id="maxMembers"
                                    type="text"
                                    value={maxMembers}
                                    onChange={(event) => setMaxMembers(event.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                placeholder="Describe what your group will focus on, your goals, and any prerequisites..."
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                rows={5}
                            />
                        </div>
                    </section>

                    <section className="form-card">
                        <h2>Meeting Details</h2>

                        <div className="form-group">
                            <label>Meeting Mode</label>

                            <div className="meeting-mode-row">
                                {(["In-Person", "Online", "Hybrid"] as MeetingMode[]).map((mode) => (
                                    <button
                                        key={mode}
                                        type="button"
                                        className={
                                            meetingMode === mode
                                                ? "meeting-mode-button meeting-mode-button-active"
                                                : "meeting-mode-button"
                                        }
                                        onClick={() => setMeetingMode(mode)}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="location">Location / Link</label>
                                <input
                                    id="location"
                                    type="text"
                                    placeholder="e.g., Main Library"
                                    value={location}
                                    onChange={(event) => setLocation(event.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="schedule">Schedule</label>
                                <input
                                    id="schedule"
                                    type="text"
                                    placeholder="e.g., Thursdays 4:00 PM"
                                    value={schedule}
                                    onChange={(event) => setSchedule(event.target.value)}
                                />
                            </div>
                        </div>
                    </section>

                    <div className="form-actions">
                        <button className="secondary-button" type="button">
                            Cancel
                        </button>
                        <button className="primary-button" type="submit">
                            Create Group
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default CreateGroupPage;