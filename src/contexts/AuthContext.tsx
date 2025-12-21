import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types/clinic';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: Record<UserRole, User> = {
  receptionist: {
    id: '1',
    name: 'Sarah Johnson',
    email: 'receptionist@clinic.com',
    role: 'receptionist',
  },
  opd: {
    id: '2',
    name: 'Dr. Michael Chen',
    email: 'doctor@clinic.com',
    role: 'opd',
  },
  laboratory: {
    id: '3',
    name: 'Emma Williams',
    email: 'lab@clinic.com',
    role: 'laboratory',
  },
  injection: {
    id: '4',
    name: 'James Brown',
    email: 'pharmacy@clinic.com',
    role: 'injection',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Demo login - accept any password
    const mockUser = mockUsers[role];
    if (mockUser) {
      setUser(mockUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
