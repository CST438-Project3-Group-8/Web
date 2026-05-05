import { apiClient } from '../lib/apiClient';

export async function getGroups() {
    const response = await apiClient.get('/api/groups');
    return response.data;
}