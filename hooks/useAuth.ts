'use client';

import { useApp } from '@/lib/context/app-context';
import { UserRole } from '@/types';

export function useAuth() {
  const { currentUser, loginAs, logout } = useApp();

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isRestaurantAdmin = currentUser?.role === 'RESTAURANT_ADMIN';
  const isAuthenticated = !!currentUser;

  const hasRole = (role: UserRole) => currentUser?.role === role;

  return {
    user: currentUser,
    isAuthenticated,
    isSuperAdmin,
    isRestaurantAdmin,
    hasRole,
    loginAs,
    logout,
  };
}
