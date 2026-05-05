export interface StudyGroup {
    id: number;
    title: string;
    description: string;
    courseId: number;
    creatorId: string;
    location: string;
    meetingMode: string;
    maxMembers: number;
    createdAt: string;
}

export interface Course {
    id: number;
    code: string;
    title: string;
    subject: string;
}