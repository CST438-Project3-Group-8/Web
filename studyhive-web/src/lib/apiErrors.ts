import axios from 'axios';

export function getApiErrorMessage(error: unknown, fallback: string) {
    if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) return 'The server rejected the data. Please check the form and try again.';
        if (error.response?.status === 401) return 'Please sign in again before trying that action.';
        if (error.response?.status === 403) return 'You do not have permission to perform that action.';
        if (error.response?.status === 404) return 'That item could not be found on the server.';
        if (error.message?.toLowerCase().includes('network error')) {
            return 'The request could not reach the backend. This may be a CORS or server availability issue.';
        }
    }

    return fallback;
}
