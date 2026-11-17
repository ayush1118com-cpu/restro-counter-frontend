'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Building2, ShieldCheck, Layers, Calculator, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CitySelect } from '@/components/ui/city-select';
import { useApp } from '@/lib/context/app-context';
import { RestaurantStatus } from '@/types';
import Link from 'next/link';

const restaurantSchema = z.object({
  name: z.string().min(2, 'Restaurant name is required'),
  ownerName: z.string().min(2, 'Owner name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().regex(/^\d{10}$/, 'Valid 10-digit phone number is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BLOCKED']),
  modulesMode: z.enum(['BOTH', 'POS_ONLY', 'SCANNER_ONLY']),
  posEnabled: z.boolean(),
  tableQrEnabled: z.boolean(),
});

type RestaurantFormData = z.infer<typeof restaurantSchema>;

export default function AddRestaurantPage() {
  const router = useRouter();
  const { addRestaurant } = useApp();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      status: 'ACTIVE',
      city: 'Jaipur',
      modulesMode: 'BOTH',
      posEnabled: true,
      tableQrEnabled: true,
    },
  });

  const cityValue = watch('city');
  const modulesMode = watch('modulesMode');
  const posEnabled = watch('posEnabled');
  const tableQrEnabled = watch('tableQrEnabled');

  const onSubmit = async (data: RestaurantFormData) => {
    const payload = {
      ...data,
      posEnabled: data.posEnabled,
      tableQrEnabled: data.tableQrEnabled,
      hasTableQrOrdering: data.tableQrEnabled,
    };
    await addRestaurant(payload);
    router.push('/super-admin/restaurants');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/super-admin/restaurants">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Onboard New Restaurant</h2>
          <p className="text-xs text-gray-500">Create restaurant profile, choose modules and assign manager credentials</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6"
      >
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100 text-sm font-bold text-gray-900">
          <Building2 className="w-5 h-5 text-amber-500" /> General Restaurant Details
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Restaurant Name *"
            placeholder="e.g. Royal Punjab Dhaba"
            {...register('name')}
            error={errors.name?.message}
          />
          <Input
            label="Owner / Admin Name *"
            placeholder="e.g. Gurpreet Singh"
            {...register('ownerName')}
            error={errors.ownerName?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone Number *"
            type="tel"
            placeholder="10-digit mobile number"
            maxLength={10}
            {...register('phone', {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
              },
            })}
            error={errors.phone?.message}
          />
          <Input
            label="Email Address *"
            type="email"
            placeholder="e.g. admin@royalpunjab.com"
            {...register('email')}
            error={errors.email?.message}
          />
        </div>

        <Input
          label="Full Address *"
          placeholder="e.g. 88 GT Road, Sector 17"
          {...register('address')}
          error={errors.address?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CitySelect
            label="City *"
            placeholder="Select or type city"
            value={cityValue || ''}
            onChange={(val) => setValue('city', val, { shouldValidate: true })}
            error={errors.city?.message}
            required
          />
          <Input
            label="Counter Manager Password *"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
          />
          <Select
            label="Initial Account Status *"
            options={[
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Suspended', value: 'SUSPENDED' },
              { label: 'Blocked', value: 'BLOCKED' },
            ]}
            {...register('status')}
            error={errors.status?.message}
          />
        </div>

        {/* Module / Feature Selection: POS or Scanner or Both */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-black text-gray-900">
              <Layers className="w-5 h-5 text-amber-500" /> Client Module Selection
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
              Choose Modules for this Client
            </span>
          </div>

          <p className="text-xs text-gray-600">
            Client ko POS chahiye ya Scanner (Table/Room QR) ya Dono? Select karein (baad me bhi change kar sakte hain):
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {/* Option 1: Both */}
            <div
              onClick={() => {
                setValue('modulesMode', 'BOTH');
                setValue('posEnabled', true);
                setValue('tableQrEnabled', true);
              }}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                modulesMode === 'BOTH'
                  ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">⚡</span>
                  {modulesMode === 'BOTH' && (
                    <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full">
                      SELECTED
                    </span>
                  )}
                </div>
                <h4 className="font-black text-sm text-gray-900">Both POS & Scanner</h4>
                <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                  Full restaurant suite: Counter POS billing + Table/Room QR self-ordering & live kitchen sync.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1.5 text-[10px] font-bold text-emerald-700">
                <span>✓ POS Active</span> • <span>✓ Scanner Active</span>
              </div>
            </div>

            {/* Option 2: POS Only */}
            <div
              onClick={() => {
                setValue('modulesMode', 'POS_ONLY');
                setValue('posEnabled', true);
                setValue('tableQrEnabled', false);
              }}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                modulesMode === 'POS_ONLY'
                  ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">🖥️</span>
                  {modulesMode === 'POS_ONLY' && (
                    <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full">
                      SELECTED
                    </span>
                  )}
                </div>
                <h4 className="font-black text-sm text-gray-900">Counter POS Only</h4>
                <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                  Ideal for takeaways, counter cafés & fast food stalls. (Table QR Ordering hidden).
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1.5 text-[10px] font-bold text-gray-600">
                <span className="text-emerald-700">✓ POS Active</span> • <span className="text-gray-400">✗ Scanner Off</span>
              </div>
            </div>

            {/* Option 3: Scanner (Table/Room QR) Only */}
            <div
              onClick={() => {
                setValue('modulesMode', 'SCANNER_ONLY');
                setValue('posEnabled', false);
                setValue('tableQrEnabled', true);
              }}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                modulesMode === 'SCANNER_ONLY'
                  ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">📱</span>
                  {modulesMode === 'SCANNER_ONLY' && (
                    <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full">
                      SELECTED
                    </span>
                  )}
                </div>
                <h4 className="font-black text-sm text-gray-900">Scanner (QR) Only</h4>
                <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                  For dine-in tables, hotel rooms & self-order scanning. Customers scan & order directly. (Counter POS hidden).
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1.5 text-[10px] font-bold text-gray-600">
                <span className="text-gray-400">✗ POS Off</span> • <span className="text-emerald-700">✓ Scanner Active</span>
              </div>
            </div>
          </div>

          {/* Granular Checkbox Toggles */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 shadow-2xs">
              <input
                type="checkbox"
                checked={posEnabled}
                onChange={(e) => {
                  const val = e.target.checked;
                  setValue('posEnabled', val);
                  if (val && tableQrEnabled) setValue('modulesMode', 'BOTH');
                  else if (val) setValue('modulesMode', 'POS_ONLY');
                  else if (tableQrEnabled) setValue('modulesMode', 'SCANNER_ONLY');
                }}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-amber-500" /> Enable Counter POS System
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-800 shadow-2xs">
              <input
                type="checkbox"
                checked={tableQrEnabled}
                onChange={(e) => {
                  const val = e.target.checked;
                  setValue('tableQrEnabled', val);
                  if (val && posEnabled) setValue('modulesMode', 'BOTH');
                  else if (val) setValue('modulesMode', 'SCANNER_ONLY');
                  else if (posEnabled) setValue('modulesMode', 'POS_ONLY');
                }}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-purple-600" /> Enable Table & Room QR Scanner Ordering
              </span>
            </label>
          </div>
        </div>

        {/* Kitchen Credentials Info Box */}
        <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-600" /> Kitchen Display Station (KDS) Auto-Generated Credentials
          </div>
          <p className="text-xs text-amber-800/80 font-medium">
            Creating this outlet automatically generates isolated <strong>Counter Admin</strong> & <strong>Kitchen KDS</strong> accounts for this specific restaurant:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 font-mono text-xs">
            <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-xs">
              <span className="text-amber-800 font-sans block text-[11px] font-bold mb-1">👨‍🍳 Kitchen Staff Email:</span>
              <span className="font-bold text-gray-900 break-all">
                {watch('email') ? `kitchen.${watch('email')}` : 'kitchen.<admin_email>'}
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-xs">
              <span className="text-amber-800 font-sans block text-[11px] font-bold mb-1">🔑 Shared Password:</span>
              <span className="font-bold text-gray-900">
                {watch('password') || 'Same as Counter Manager Password'}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-amber-700 italic">
            * Note: Orders for this restaurant will ONLY show in this restaurant&apos;s kitchen login. Other restaurants cannot see these orders.
          </p>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
          <Link href="/super-admin/restaurants">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="font-bold shadow-md shadow-amber-500/20 px-6"
          >
            Create Restaurant
          </Button>
        </div>
      </form>
    </div>
  );
}
