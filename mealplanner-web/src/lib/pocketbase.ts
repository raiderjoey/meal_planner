import PocketBase from 'pocketbase';

// Determine the backend URL
// If running in development, assume PocketBase is on 8090 or use env
const url = import.meta.env.VITE_PB_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8090' : '/');
export const pb = new PocketBase(url);

// Disable auto cancellation for React 18 strict mode
pb.autoCancellation(false);
