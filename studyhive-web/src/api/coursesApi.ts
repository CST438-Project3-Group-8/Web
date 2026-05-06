import { apiClient } from '../lib/apiClient';
import type { Course } from '../types';

export async function getCourses() {
    const response = await apiClient.get<Course[]>('/api/courses');
    return response.data;
}
