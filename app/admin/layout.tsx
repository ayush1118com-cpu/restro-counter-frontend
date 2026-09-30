import React from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function RestaurantAdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}
