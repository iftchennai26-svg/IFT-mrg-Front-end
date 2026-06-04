const BACKEND_URL = import.meta.env?.VITE_BACKEND_URL || '';

export const apiFetch = (path, options) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = BACKEND_URL.replace(/\/$/, '');
  return fetch(`${baseUrl}${cleanPath}`, options);
};
