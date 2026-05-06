import { apiClient } from '../lib/apiClient';

export interface UserProfile {
    id: number;
    userId: string;
    name: string;
    email: string;
    bio: string | null;
    oauthProvider: string;
}

export interface UpdateProfilePayload {
    name: string;
    bio: string;
}

export async function getMyProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/api/user/me');
    return response.data;
}

export async function createProfile(payload: { name: string; email: string; oauthProvider: string }): Promise<UserProfile> {
    const response = await apiClient.post<UserProfile>('/api/user', payload);
    return response.data;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/api/user', payload);
    return response.data;
}