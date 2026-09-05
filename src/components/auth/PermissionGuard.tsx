import React from 'react';
import { useAuth, type UserRole } from '../../contexts/AuthContext';

interface PermissionGuardProps {
  /** Permission string to check (e.g. 'QUOTATION_APPROVE', 'DISCOUNT_CONFIGURE') */
  permission?: string;
  /** Role(s) required (e.g. 'admin', ['sales_manager', 'finance']) */
  role?: UserRole | UserRole[];
  /** Elements to render if authorized */
  children: React.ReactNode;
  /** Optional fallback UI if unauthorized */
  fallback?: React.ReactNode;
}

/**
 * PermissionGuard
 *
 * Declarative component for permission-aware UI rendering.
 * Checks permissions and roles against the authenticated user's state.
 *
 * Note: Never treat frontend route guards or PermissionGuard as security.
 * Backend authorization remains authoritative on every API mutation.
 */
export function PermissionGuard({ permission, role, children, fallback = null }: PermissionGuardProps) {
  const { user, hasPermission, hasRole } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (role) {
    if (!hasRole(role)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
