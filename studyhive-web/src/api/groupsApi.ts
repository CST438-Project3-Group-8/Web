import { apiClient } from '../lib/apiClient';
import type { CreateGroupPayload, GroupMember, GroupMembershipStatus, StudyGroup } from '../types';

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

export async function joinGroup(groupId: number) {
    const response = await apiClient.post<GroupMember>(`/api/groups/${groupId}/join`);
    return response.data;
}

export async function leaveGroup(groupId: number) {
    await apiClient.delete(`/api/groups/${groupId}/leave`);
}

export async function getGroupMembership(groupId: number) {
    const response = await apiClient.get<GroupMembershipStatus>(`/api/groups/${groupId}/membership`);
    return response.data;
}

export async function getMyJoinedGroups() {
    const response = await apiClient.get<StudyGroup[]>('/api/groups/me/joined');
    return response.data;
}