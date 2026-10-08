import axios from 'axios';
import config from './config.js';

const api = axios.create({
    baseURL: config.serverUrl,
    withCredentials: true,
    timeout: 15000,
});

api.interceptors.request.use((reqConfig) => {
    const profileId = getSelectedProfileId();
    if (profileId) {
        reqConfig.headers = reqConfig.headers || {};
        reqConfig.headers['X-Profile-Id'] = profileId;
    }
    return reqConfig;
});

let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
    onUnauthorized = handler;
}

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            if (error.config?.url?.includes('/auth/validate-session')) {
                return Promise.reject(error);
            }
            if (error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register')) {
                return Promise.reject(error);
            }
            onUnauthorized?.(error);
        }
        return Promise.reject(error);
    }
);

export function getSelectedProfileId() {
    const match = document.cookie.match(/(?:^|; )selectedProfile=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
}

export default api;
