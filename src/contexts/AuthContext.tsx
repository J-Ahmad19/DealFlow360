import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

type User = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
};

type Customer = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyId: string;
  company?: { name: string };
};

type AuthContextType = {
  user: User | null;
  customer: Customer | null;
  loading: boolean;
  loginUser: (user: User) => void;
  logoutUser: () => Promise<void>;
  loginCustomer: (customer: Customer) => void;
  logoutCustomer: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        // Try to fetch internal user
        const res = await apiFetch('/auth/me');
        setUser(res.user);
      } catch (e) {
        // Not logged in internally
      }

      try {
        // Try to fetch customer portal user
        const res = await apiFetch('/portal/auth/me');
        setCustomer(res.contact);
      } catch (e) {
        // Not logged in externally
      }
      
      setLoading(false);
    }

    initAuth();
  }, []);

  const loginUser = (user: User) => setUser(user);
  
  const logoutUser = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  };

  const loginCustomer = (customer: Customer) => setCustomer(customer);
  
  const logoutCustomer = async () => {
    try {
      await apiFetch('/portal/auth/logout', { method: 'POST' });
    } finally {
      setCustomer(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, customer, loading, loginUser, logoutUser, loginCustomer, logoutCustomer }}>
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
