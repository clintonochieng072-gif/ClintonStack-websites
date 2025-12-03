// Create API client with credentials
const API_URL = ''; // Since API is local, use relative paths

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const isFormData = options.body instanceof FormData;
  const config = {
    ...options,
    credentials: 'include' as RequestCredentials, // Always include cookies
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${url}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
};

// For protected routes that need auth check
export const checkAuth = async () => {
  try {
    const { user } = await apiFetch('/api/auth/me');
    return user;
  } catch (error) {
    // Clear local storage on auth failure
    localStorage.removeItem('cachedUser');
    throw error;
  }
};

// Fetch user with credentials for /api/auth/me calls
export const fetchUser = async () => {
  try {
    const { user } = await apiFetch('/api/auth/me');
    return user;
  } catch (error) {
    throw error;
  }
};