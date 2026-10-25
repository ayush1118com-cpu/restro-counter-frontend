'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/lib/context/app-context';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Building, Percent, FileText } from 'lucide-react';

export default function RestaurantSettingsPage() {
  const { currentUser, currentRestaurant, updateCurrentRestaurant } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    gstin: '',
    gstRate: '5',
    receiptHeader: 'SERV DESK - FAST POS',
    receiptFooter: 'Thank you for dining with us! Visit again.',
  });

  const [isSaving, setIsSaving] = useState(false);

  // Sync real restaurant / user data into form
  useEffect(() => {
    const rawOwner = currentRestaurant?.ownerName || (currentUser?.name ? currentUser.name.replace(/\s*\(Counter Admin\)/i, '').replace(/\s*\(Admin\)/i, '').trim() : '');
    setFormData({
      name: currentRestaurant?.name || currentUser?.restaurantName || '',
      ownerName: rawOwner,
      phone: currentRestaurant?.phone || currentUser?.phone || '',
      email: currentRestaurant?.email || currentUser?.email || '',
      address: currentRestaurant?.address || '',
      city: currentRestaurant?.city || '',
      gstin: currentRestaurant?.gstin || '',
      gstRate: currentRestaurant?.gstRate !== undefined ? currentRestaurant.gstRate.toString() : '5',
      receiptHeader: currentRestaurant?.receiptHeader || 'SERV DESK - FAST POS',
      receiptFooter: currentRestaurant?.receiptFooter || 'Thank you for dining with us! Visit again.',
    });
  }, [currentRestaurant, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const parsedGst = parseFloat(formData.gstRate);
      if (isNaN(parsedGst) || parsedGst < 0 || parsedGst > 100) {
        toast.error('Please enter a valid GST percentage between 0 and 100');
        setIsSaving(false);
        return;
      }

      const success = await updateCurrentRestaurant({
        name: formData.name.trim(),
        ownerName: formData.ownerName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        gstin: formData.gstin.trim(),
        gstRate: parsedGst,
        receiptHeader: formData.receiptHeader.trim(),
        receiptFooter: formData.receiptFooter.trim(),
      });

      if (!success) {
        toast.error('Failed to update restaurant settings. Please try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Restaurant Settings</h2>
        <p className="text-xs text-gray-500">Configure outlet profile, receipt details, and tax rates</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Outlet Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-500" />
              Outlet Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Restaurant Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Ayush Rajpalani"
              required
            />
            <Input
              label="Owner Name"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              placeholder="e.g. Ayush"
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 8385973582"
                required
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. rajpalaniayush72@gmail.com"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Full Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street / Market Address"
                  required
                />
              </div>
              <div>
                <Input
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receipt & Billing Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-500" />
              Receipt & Billing Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="GSTIN Number (Optional)"
                name="gstin"
                value={formData.gstin}
                onChange={handleChange}
                placeholder="e.g. 08AAAAA0000A1Z5"
              />
              <Input
                label="GST Rate (%)"
                name="gstRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.gstRate}
                onChange={handleChange}
                placeholder="e.g. 5 or 0"
                hint="Applied automatically on subtotal during POS order creation"
                required
              />
            </div>
            <Input
              label="Thermal Receipt Header Note"
              name="receiptHeader"
              value={formData.receiptHeader}
              onChange={handleChange}
              placeholder="e.g. SERV DESK - FAST POS"
            />
            <Input
              label="Thermal Receipt Footer Message"
              name="receiptFooter"
              value={formData.receiptFooter}
              onChange={handleChange}
              placeholder="e.g. Thank you for dining with us! Visit again."
            />
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSaving}
            className="font-bold shadow-md shadow-amber-500/20 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Save Profile & Bill Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
