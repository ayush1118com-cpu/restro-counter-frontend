import React from 'react';
import { SuperAdminLayout } from '@/components/layout/super-admin-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function SuperAdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRole="SUPER_ADMIN">
      <SuperAdminLayout>{children}</SuperAdminLayout>
    </ProtectedRoute>
  );
}
