
const API_BASE = 'http://localhost:3001/api/auth';

export const registerUser = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Registration failed');
  
  localStorage.setItem('px_token', data.token);
  localStorage.setItem('px_user', JSON.stringify(data.user));
  return data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Login failed');
  
  localStorage.setItem('px_token', data.token);
  localStorage.setItem('px_user', JSON.stringify(data.user));
  return data;
};

export const signOut = () => {
  localStorage.removeItem('px_token');
  localStorage.removeItem('px_user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('px_user');
  return user ? JSON.parse(user) : null;
};

export const getAuthToken = () => {
  return localStorage.getItem('px_token');
};
