export interface StudyGroup {
    id: number;
    title: string | null;
    description: string | null;
    courseId: number | null;
    creatorId: string | null;
    location: string | null;
    meetingMode: string | null;
    maxMembers: number | null;
    createdAt: string | null;
}

export interface Course {
    id: number;
    code: string;
    title: string;
    subject: string;
}

export interface StudySession {
    id: number;
    groupId: number;
    title: string;
    topic: string | null;
    scheduledAt: string;
    location: string | null;
    notes: string | null;
    durationMinutes: number | null;
}

export interface CreateGroupPayload {
    title: string;
    description?: string;
    courseId?: number | null;
    location?: string;
    meetingMode?: string;
    maxMembers?: number | null;
}

export interface CreateOrUpdateSessionPayload {
    groupId: number;
    title: string;
    topic?: string;
    scheduledAt: string;
    location?: string;
    notes?: string;
    durationMinutes?: number | null;
}
