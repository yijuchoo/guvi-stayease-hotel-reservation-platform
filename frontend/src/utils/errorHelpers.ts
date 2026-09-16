import axios from 'axios';

export function extractErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
    if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
            return data;
        }
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
            return data.errors[0].defaultMessage;
        }
        if (typeof data === 'object' && 'message' in data) {
            return String(data.message);
        }
    }
    return fallback;
}