'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, hasRole } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-4 font-bold text-xl">
            !
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-xs text-gray-500 mb-6">Please log in to access this section of Restro Counter System.</p>
          <a
            href="/login"
            className="inline-block w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (allowedRole && !hasRole(allowedRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center mb-4 font-bold text-xl">
            🚫
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-xs text-gray-500 mb-6">
            Your role (<span className="font-semibold">{user?.role}</span>) does not have permission to view this page.
          </p>
          <a
            href="/login"
            className="inline-block w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Switch Account
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
