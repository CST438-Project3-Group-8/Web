import { apiClient } from "./client";

export async function getGroups() {
    const response = await apiClient.get("/api/groups");
    return response.data;
}