import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios mock para demo
const MOCK_USERS: Record<string, User> = {
  'superadmin@brandup.com': {
    id: 'sa1',
    name: 'Admin Principal',
    email: 'superadmin@brandup.com',
    role: 'super_admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin',
  },
  'admin@isp1.com': {
    id: 'ia1',
    name: 'Juan Pérez',
    email: 'admin@isp1.com',
    role: 'isp_admin',
    companyId: 'comp1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=juan',
  },
  'cobranza@isp1.com': {
    id: 'cob1',
    name: 'María García',
    email: 'cobranza@isp1.com',
    role: 'cobranza',
    companyId: 'comp1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
  },
  'soporte@isp1.com': {
    id: 'sop1',
    name: 'Carlos López',
    email: 'soporte@isp1.com',
    role: 'soporte',
    companyId: 'comp1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
  },
  'tecnico@isp1.com': {
    id: 'tec1',
    name: 'Luis Martínez',
    email: 'tecnico@isp1.com',
    role: 'tecnico',
    companyId: 'comp1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luis',
  },
  'cliente@ejemplo.com': {
    id: 'cli1',
    name: 'Ana Rodríguez',
    email: 'cliente@ejemplo.com',
    role: 'cliente',
    companyId: 'comp1',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Intentar recuperar sesión del localStorage
    const savedUser = localStorage.getItem('brandup_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email: string, password: string, role?: UserRole) => {
    // Simulación de login
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockUser = MOCK_USERS[email];
    if (mockUser) {
      setUser(mockUser);
      localStorage.setItem('brandup_user', JSON.stringify(mockUser));
    } else {
      throw new Error('Credenciales inválidas');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('brandup_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}
