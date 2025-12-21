
import { logActivity } from './dataService';

export interface User {
  id: string;
  email: string;
  name: string;
}

const CURRENT_USER_KEY = 'parallax_user_session';

export const loginUser = async (email: string, password: string): Promise<User> => {
  // Simulating network latency for realism
  await new Promise(resolve => setTimeout(resolve, 800));

  // Hardcoded demo users matching the UI hint in AuthPage
  const validUsers = [
    { id: 'divesh', email: 'divesh', password: 'divesh23', name: 'Divesh' },
    { id: 'manish', email: 'manish', password: 'Manish9', name: 'Manish' }
  ];

  const user = validUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (user) {
    const userData = { id: user.id, email: user.email, name: user.name };
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
      // Log the login event to NeonDB
      // We don't await this to keep UI snappy; it happens in background
      logActivity('LOGIN', `User ${user.name} logged in via web interface`);
    }
    return userData;
  }

  throw new Error("Invalid Credentials");
};

export const signOut = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
};
