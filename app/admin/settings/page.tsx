'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/lib/context/app-context';
import { toast } from 'sonner';

export default function RestaurantSettingsPage() {
  const { currentUser } = useApp();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Restaurant profile and bill thermal settings saved!');
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Restaurant Settings</h2>
        <p className="text-xs text-gray-500">Configure outlet profile, receipt details, and tax rates</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Outlet Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Restaurant Name" defaultValue={currentUser?.restaurantName || 'Spice Garden Restaurant'} />
            <Input label="Owner Name" defaultValue={currentUser?.name || 'Rahul Sharma'} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Phone Number" defaultValue="+91 98765 43210" />
              <Input label="Email Address" defaultValue="admin@spicegarden.com" />
            </div>
            <Input label="Full Address" defaultValue="102 Connaught Place, Block C, New Delhi" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Receipt & Billing Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="GSTIN Number" defaultValue="07AAAAA0000A1Z5" />
              <Input label="GST Rate (%)" defaultValue="5" />
            </div>
            <Input label="Thermal Receipt Header Note" defaultValue="RESTRO COUNTER SYSTEM - FAST POS" />
            <Input label="Thermal Receipt Footer Message" defaultValue="Thank you for dining with us! Visit again." />
          </CardContent>
        </Card>

        <Button type="submit" variant="primary" size="md" className="font-bold shadow-md shadow-amber-500/20">
          Save Profile & Bill Settings
        </Button>
      </form>
    </div>
  );
}
