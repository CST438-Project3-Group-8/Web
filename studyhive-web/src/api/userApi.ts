import { apiClient } from '../lib/apiClient';
import type { Course } from '../types';

export interface UserProfile {
    id: number;
    userId: string;
    name: string;
    email: string;
    bio: string | null;
    major: string | null;
    oauthProvider: string;
}

export interface UpdateProfilePayload {
    name: string;
    bio: string;
    major: string;
}

export async function getMyProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/api/user/me');
    return response.data;
}

// Optional idempotent upsert for flows that want to create or refresh profile data eagerly.
export async function createProfile(payload?: {
    name: string;
    email: string;
    oauthProvider: string;
}): Promise<UserProfile> {
    const response = payload === undefined
        ? await apiClient.post<UserProfile>('/api/user')
        : await apiClient.post<UserProfile>('/api/user', payload);
    return response.data;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/api/user', payload);
    return response.data;
}

// ── Course enrolments ──────────────────────────────────────────────────────

export async function getMyCourses(): Promise<Course[]> {
    const response = await apiClient.get<Course[]>('/api/user/me/courses');
    return response.data;
}

export async function addMyCourse(courseId: number): Promise<void> {
    await apiClient.post(`/api/user/me/courses/${courseId}`);
}

export async function removeMyCourse(courseId: number): Promise<void> {
    await apiClient.delete(`/api/user/me/courses/${courseId}`);
}

// ── Account deletion ───────────────────────────────────────────────────────

export async function deleteMyAccount(): Promise<void> {
    await apiClient.delete('/api/user/me');
}
