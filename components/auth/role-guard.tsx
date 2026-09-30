'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

export interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: UserRole;
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRole, fallback = null }: RoleGuardProps) {
  const { hasRole } = useAuth();

  if (!hasRole(allowedRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
