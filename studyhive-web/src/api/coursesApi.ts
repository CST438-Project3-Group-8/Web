export type Course = {
    id: number;
    code: string;
    title: string;
    subject: string;
};

const API_BASE_URL = "http://localhost:8080";

export async function getCourses(): Promise<Course[]> {
    const response = await fetch(`${API_BASE_URL}/api/courses`);

    if (!response.ok) {
        throw new Error("Failed to fetch courses");
    }

    return response.json();
}