import { apiClient } from '../lib/apiClient';
import type { CreateGroupPayload, StudyGroup } from '../types';

export async function getGroups() {
    const response = await apiClient.get<StudyGroup[]>('/api/groups');
    return response.data;
}

export async function getGroupById(id: number) {
    const response = await apiClient.get<StudyGroup>(`/api/groups/${id}`);
    return response.data;
}

export async function createGroup(payload: CreateGroupPayload) {
    const response = await apiClient.post<StudyGroup>('/api/groups', payload);
    return response.data;
}

export async function deleteGroup(id: number) {
    await apiClient.delete(`/api/groups/${id}`);
}
