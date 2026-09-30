'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function SuperAdminSettingsPage() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Super Admin configuration settings updated successfully!');
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">System Settings</h2>
        <p className="text-xs text-gray-500">Configure global platform preferences, socket URL, and defaults</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">API & Socket Server Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Backend API Base URL"
              defaultValue={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}
            />
            <Input
              label="Socket.IO Real-time Endpoint URL"
              defaultValue={process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Platform Branding & Tax Defaults</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Platform Name" defaultValue="Restro Counter System" />
            <Input label="Default GST / Sales Tax Rate (%)" defaultValue="5" />
            <Input label="Support Email" defaultValue="support@restrocounter.com" />
          </CardContent>
        </Card>

        <Button type="submit" variant="primary" size="md" className="font-bold shadow-md shadow-amber-500/20">
          Save Settings
        </Button>
      </form>
    </div>
  );
}
