import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { seedDemoUser } from '../lib/seedData';
import { api, setToken } from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'guest' | 'admin' | 'kitchen_staff';
  allergens: string[];
  nis?: string; // NIS/NISN untuk siswa
  class?: string; // Kelas untuk siswa
  customAllergies?: string; // Alergen kustom
  bio?: string; // Bio/catatan profil
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: 'student' | 'admin' | 'kitchen_staff') => Promise<boolean>;
  register: (
    name: string, 
    email: string, 
    password: string, 
    role?: 'student' | 'admin' | 'kitchen_staff',
    additionalData?: { nis?: string }
  ) => Promise<{ success: boolean; message?: string }>;
  loginAsGuest: () => void;
  logout: () => void;
  updateAllergens: (allergens: string[]) => void;
  updateUserProfile: (data: Partial<User>) => void;
  isAuthenticated: boolean;
  isStudent: boolean;
  isGuest: boolean;
  isAdmin: boolean;
  isKitchenStaff: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount and seed demo user, then hydrate from backend if token exists
  useEffect(() => {
    seedDemoUser(); // Seed demo user on app start
    
    const savedUser = localStorage.getItem('nutriplan_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser) as User);
    }

    // If token exists, fetch profile from backend
    const token = localStorage.getItem('nutriplan_token');
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          if (res.data?.success && res.data?.user) {
            const userFromApi = res.data.user as User;
            setUser({
              id: userFromApi.id,
              name: userFromApi.name,
              email: userFromApi.email,
              role: userFromApi.role,
              allergens: (userFromApi as any).allergens?.map((a: any) => a.allergen) || [],
              nis: userFromApi.nis,
              class: userFromApi.class,
              customAllergies: userFromApi.customAllergies,
              bio: userFromApi.bio,
            });
          }
        })
        .catch(() => {/* ignore */});
    }
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('nutriplan_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nutriplan_user');
    }
  }, [user]);

  const register = async (
    name: string, 
    email: string, 
    password: string, 
    role: 'student' | 'admin' | 'kitchen_staff' = 'student',
    additionalData?: { nis?: string }
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        role,
        nis: additionalData?.nis,
      });

      if (!res.data?.success) {
        return { success: false, message: res.data?.message || 'Registrasi gagal' };
      }

      const { token, user: apiUser } = res.data;
      await setToken(token);
      setUser({
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        role: apiUser.role,
        allergens: [],
        nis: apiUser.nis,
        class: apiUser.class,
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.response?.data?.message || 'Registrasi gagal' };
    }
  };

  const login = async (email: string, password: string, role?: 'student' | 'admin' | 'kitchen_staff'): Promise<boolean> => {
    try {
      const res = await api.post('/auth/login', { email, password, role });
      if (!res.data?.success) return false;

      const { token, user: apiUser } = res.data;
      await setToken(token);

      setUser({
        id: apiUser.id,
        name: apiUser.name,
        email: apiUser.email,
        role: apiUser.role,
        allergens: [],
        nis: apiUser.nis,
        class: apiUser.class,
      });
      return true;
    } catch {
      return false;
    }
  };

  const loginAsGuest = () => {
    const guestUser: User = {
      id: 'guest',
      name: 'Guest',
      email: '',
      role: 'guest',
      allergens: []
    };
    setUser(guestUser);
  };

  const logout = () => {
    setToken(undefined);
    setUser(null);
  };

  const updateAllergens = (allergens: string[]) => {
    if (user && user.role === 'student') {
      const updatedUser = { ...user, allergens };
      setUser(updatedUser);

      // Update in users database
      const users = JSON.parse(localStorage.getItem('nutriplan_users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex].allergens = allergens;
        localStorage.setItem('nutriplan_users', JSON.stringify(users));
      }
    }
  };

  const updateUserProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);

      // Update in users database only if not guest
      if (user.role !== 'guest') {
        const users = JSON.parse(localStorage.getItem('nutriplan_users') || '[]');
        const userIndex = users.findIndex((u: any) => u.id === user.id);
        if (userIndex !== -1) {
          // Merge with existing password
          users[userIndex] = { ...users[userIndex], ...data };
          localStorage.setItem('nutriplan_users', JSON.stringify(users));
        }
      }
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    loginAsGuest,
    logout,
    updateAllergens,
    updateUserProfile,
    isAuthenticated: user !== null,
    isStudent: user?.role === 'student',
    isGuest: user?.role === 'guest',
    isAdmin: user?.role === 'admin',
    isKitchenStaff: user?.role === 'kitchen_staff'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}