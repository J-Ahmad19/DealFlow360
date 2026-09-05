import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

export type UserRole = 'admin' | 'sales_manager' | 'finance' | 'sales_rep';

export type User = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: string;
};

export type Customer = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  companyId: string;
  company?: { name: string };
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'QUOTATION_CREATE',
    'QUOTATION_READ',
    'QUOTATION_EDIT',
    'QUOTATION_SUBMIT',
    'QUOTATION_APPROVE',
    'QUOTATION_REJECT',
    'QUOTATION_REVISE',
    'DISCOUNT_CONFIGURE',
    'PRODUCT_MANAGE',
    'CUSTOMER_MANAGE',
    'WAREHOUSE_MANAGE',
    'FULFILLMENT_MANAGE',
    'BILLING_RECONCILE',
    'CREDIT_NOTE_CREATE',
    'DEAL_HEALTH_VIEW',
    'REPORT_VIEW',
    'USER_MANAGE',
  ],
  sales_manager: [
    'QUOTATION_READ',
    'QUOTATION_APPROVE',
    'QUOTATION_REJECT',
    'QUOTATION_REVISE',
    'DISCOUNT_CONFIGURE',
    'DEAL_HEALTH_VIEW',
    'REPORT_VIEW',
  ],
  finance: [
    'QUOTATION_READ',
    'APPROVAL_SECOND_LEVEL',
    'FULFILLMENT_MANAGE',
    'BILLING_RECONCILE',
    'CREDIT_NOTE_CREATE',
    'DEAL_HEALTH_VIEW',
    'REPORT_VIEW',
  ],
  sales_rep: [
    'QUOTATION_CREATE',
    'QUOTATION_READ',
    'QUOTATION_EDIT',
    'QUOTATION_SUBMIT',
    'NEGOTIATION_RESPOND',
  ],
};

type AuthContextType = {
  user: User | null;
  customer: Customer | null;
  loading: boolean;
  sessionExpired: boolean;
  loginUser: (user: User) => void;
  logoutUser: () => Promise<void>;
  loginCustomer: (customer: Customer) => void;
  logoutCustomer: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  clearSessionExpired: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    async function initAuth() {
      try {
        setLoading(true);
        try {
          // Try to fetch internal user
          const res = await apiFetch('/auth/me');
          if (res?.user) {
            setUser(res.user);
          }
        } catch {
          setUser(null);
        }

        try {
          // Try to fetch customer portal user
          const res = await apiFetch('/portal/auth/me');
          if (res?.contact) {
            setCustomer(res.contact);
          }
        } catch {
          setCustomer(null);
        }
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const loginUser = (user: User) => {
    setUser(user);
    setSessionExpired(false);
  };

  const logoutUser = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  };

  const loginCustomer = (customer: Customer) => {
    setCustomer(customer);
    setSessionExpired(false);
  };

  const logoutCustomer = async () => {
    try {
      await apiFetch('/portal/auth/logout', { method: 'POST' });
    } finally {
      setCustomer(null);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.role) return false;
    const permissions = ROLE_PERMISSIONS[user.role as UserRole] || [];
    return permissions.includes(permission);
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user || !user.role) return false;
    const targetRoles = Array.isArray(roles) ? roles : [roles];
    return targetRoles.includes(user.role as UserRole);
  };

  const clearSessionExpired = () => setSessionExpired(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        customer,
        loading,
        sessionExpired,
        loginUser,
        logoutUser,
        loginCustomer,
        logoutCustomer,
        hasPermission,
        hasRole,
        clearSessionExpired,
      }}
    >
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
