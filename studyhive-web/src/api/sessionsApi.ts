import { apiClient } from '../lib/apiClient';
import type { CreateOrUpdateSessionPayload, StudySession } from '../types';

export async function getSessionById(id: number) {
    const response = await apiClient.get<StudySession>(`/api/sessions/${id}`);
    return response.data;
}

export async function getSessionsByGroup(groupId: number) {
    const response = await apiClient.get<StudySession[]>(`/api/sessions/group/${groupId}`);
    return response.data;
}

export async function createSession(payload: CreateOrUpdateSessionPayload) {
    const response = await apiClient.post<StudySession>('/api/sessions', payload);
    return response.data;
}

export async function updateSession(id: number, payload: CreateOrUpdateSessionPayload) {
    const response = await apiClient.put<StudySession>(`/api/sessions/${id}`, payload);
    return response.data;
}

export async function deleteSession(id: number) {
    await apiClient.delete(`/api/sessions/${id}`);
}
