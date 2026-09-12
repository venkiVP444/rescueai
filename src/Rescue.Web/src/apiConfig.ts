// Centralized API and SignalR host configuration
export const API_BASE = (((import.meta as any).env?.VITE_API_BASE_URL as string) || '').replace(/\/$/, '');

/**
 * Returns the fully-qualified or relative API URL depending on deployment environment.
 */
export function apiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
}

/**
 * Returns the active base host for SDK configuration and curl snippets.
 */
export function getActiveHost(): string {
  if (API_BASE) {
    return API_BASE;
  }
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return 'http://localhost:5105';
}
