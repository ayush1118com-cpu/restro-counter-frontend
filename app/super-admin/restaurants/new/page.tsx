'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowLeft,
  Building2,
  ShieldCheck,
  Layers,
  Calculator,
  QrCode,
  CreditCard,
  IndianRupee,
  Smartphone,
  Banknote,
  Building,
  Gift,
} from 'lucide-react';
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
  subscriptionPlan: z.enum(['BOTH', 'POS_ONLY', 'SCANNER_ONLY']),
  subscriptionPrice: z.number().min(0, 'Price must be 0 or more'),
  paymentMode: z.enum(['CASH', 'UPI', 'BANK_TRANSFER', 'COMPLIMENTARY']),
  paymentReference: z.string().optional(),
  paymentStatus: z.enum(['PAID', 'PENDING']),
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
      subscriptionPlan: 'BOTH',
      subscriptionPrice: 899,
      paymentMode: 'UPI',
      paymentReference: '',
      paymentStatus: 'PAID',
    },
  });

  const cityValue = watch('city');
  const modulesMode = watch('modulesMode');
  const posEnabled = watch('posEnabled');
  const tableQrEnabled = watch('tableQrEnabled');
  const paymentMode = watch('paymentMode');

  const onSubmit = async (data: RestaurantFormData) => {
    const payload = {
      ...data,
      posEnabled: data.posEnabled,
      tableQrEnabled: data.tableQrEnabled,
      hasTableQrOrdering: data.tableQrEnabled,
      subscriptionPlan: data.subscriptionPlan,
      subscriptionPrice: Number(data.subscriptionPrice),
      paymentMode: data.paymentMode,
      paymentReference: data.paymentReference || '',
      paymentStatus: data.paymentStatus,
    };
    await addRestaurant(payload);
    router.push('/super-admin/restaurants');
  };

  const handleSelectPackage = (mode: 'BOTH' | 'POS_ONLY' | 'SCANNER_ONLY') => {
    setValue('modulesMode', mode);
    setValue('subscriptionPlan', mode);

    if (mode === 'BOTH') {
      setValue('posEnabled', true);
      setValue('tableQrEnabled', true);
      setValue('subscriptionPrice', 899);
    } else if (mode === 'POS_ONLY') {
      setValue('posEnabled', true);
      setValue('tableQrEnabled', false);
      setValue('subscriptionPrice', 499);
    } else if (mode === 'SCANNER_ONLY') {
      setValue('posEnabled', false);
      setValue('tableQrEnabled', true);
      setValue('subscriptionPrice', 499);
    }
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
          <h2 className="text-xl font-bold text-gray-900">Onboard New Restaurant</h2>
          <p className="text-xs text-gray-500">Create restaurant profile, choose subscription package and record payment mode</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200/80 shadow-sm space-y-6"
      >
        {/* 1. GENERAL RESTAURANT DETAILS */}
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100 text-sm font-semibold text-gray-900">
          <Building2 className="w-4 h-4 text-amber-500" /> General Restaurant Details
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

        {/* 2. SUBSCRIPTION PACKAGE SELECTION */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Layers className="w-4 h-4 text-amber-500" /> Subscription Package Selection
            </div>
            <span className="text-xs font-medium text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
              Monthly Plan
            </span>
          </div>

          <p className="text-xs text-gray-500">
            Client ke liye package choose karein: Counter POS Only (₹499/mo), Table QR Scanner Only (₹499/mo) ya Dono Combo (₹899/mo):
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {/* Option 1: Both POS & Scanner */}
            <div
              onClick={() => handleSelectPackage('BOTH')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                modulesMode === 'BOTH'
                  ? 'border-amber-500 bg-amber-50/60 shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">⚡</span>
                  <span className="text-xs font-semibold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                    ₹899 / mo
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-gray-900">Both POS & Scanner</h4>
                <p className="text-xs text-gray-500 mt-1 leading-normal">
                  Full restaurant suite: Counter POS billing + Table/Room QR self-ordering + live kitchen display.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-medium">✓ POS + Scanner</span>
                {modulesMode === 'BOTH' && <span className="text-amber-800 font-semibold text-xs">Selected ✓</span>}
              </div>
            </div>

            {/* Option 2: POS Only */}
            <div
              onClick={() => handleSelectPackage('POS_ONLY')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                modulesMode === 'POS_ONLY'
                  ? 'border-amber-500 bg-amber-50/60 shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">🖥️</span>
                  <span className="text-xs font-semibold bg-blue-500 text-white px-2 py-0.5 rounded-full">
                    ₹499 / mo
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-gray-900">Counter POS Only</h4>
                <p className="text-xs text-gray-500 mt-1 leading-normal">
                  Counter billing, thermal receipts, customer credit (Khata) & offline mode. Table QR hidden.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-medium">✓ Counter POS</span>
                {modulesMode === 'POS_ONLY' && <span className="text-amber-800 font-semibold text-xs">Selected ✓</span>}
              </div>
            </div>

            {/* Option 3: Scanner Only */}
            <div
              onClick={() => handleSelectPackage('SCANNER_ONLY')}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                modulesMode === 'SCANNER_ONLY'
                  ? 'border-amber-500 bg-amber-50/60 shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">📱</span>
                  <span className="text-xs font-semibold bg-purple-500 text-white px-2 py-0.5 rounded-full">
                    ₹499 / mo
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-gray-900">Table Scanner (QR) Only</h4>
                <p className="text-xs text-gray-500 mt-1 leading-normal">
                  Dine-in tables & hotel rooms. Customers scan & order with name & phone. Counter POS hidden.
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-medium">✓ QR Scanner</span>
                {modulesMode === 'SCANNER_ONLY' && <span className="text-amber-800 font-semibold text-xs">Selected ✓</span>}
              </div>
            </div>
          </div>

          {/* Checkbox Toggles */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 shadow-2xs">
              <input
                type="checkbox"
                checked={posEnabled}
                onChange={(e) => {
                  const val = e.target.checked;
                  setValue('posEnabled', val);
                  if (val && tableQrEnabled) handleSelectPackage('BOTH');
                  else if (val) handleSelectPackage('POS_ONLY');
                  else if (tableQrEnabled) handleSelectPackage('SCANNER_ONLY');
                }}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
              />
              <span className="flex items-center gap-1.5 font-medium">
                <Calculator className="w-3.5 h-3.5 text-amber-500" /> Enable Counter POS System
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-700 shadow-2xs">
              <input
                type="checkbox"
                checked={tableQrEnabled}
                onChange={(e) => {
                  const val = e.target.checked;
                  setValue('tableQrEnabled', val);
                  if (val && posEnabled) handleSelectPackage('BOTH');
                  else if (val) handleSelectPackage('SCANNER_ONLY');
                  else if (posEnabled) handleSelectPackage('POS_ONLY');
                }}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
              />
              <span className="flex items-center gap-1.5 font-medium">
                <QrCode className="w-3.5 h-3.5 text-purple-600" /> Enable Table & Room QR Scanner Ordering
              </span>
            </label>
          </div>
        </div>

        {/* 3. PAYMENT COLLECTION & MODE (CASH / UPI) */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <CreditCard className="w-4 h-4 text-emerald-600" /> Subscription Payment & Collection Mode
            </div>
            <span className="text-xs font-medium text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Payment Method
            </span>
          </div>

          <p className="text-xs text-gray-500">
            Client ne subscription ka payment kaise kiya? Select karein (Cash ya UPI ya Bank Transfer):
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {/* UPI */}
            <div
              onClick={() => setValue('paymentMode', 'UPI')}
              className={`p-3 rounded-xl border-2 transition-all cursor-pointer text-center space-y-1 ${
                paymentMode === 'UPI'
                  ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <Smartphone className="w-5 h-5 text-emerald-600 mx-auto" />
              <h5 className="font-semibold text-xs text-gray-900">UPI Payment</h5>
              <p className="text-[11px] text-gray-500">GPay / PhonePe / QR</p>
            </div>

            {/* Cash */}
            <div
              onClick={() => setValue('paymentMode', 'CASH')}
              className={`p-3 rounded-xl border-2 transition-all cursor-pointer text-center space-y-1 ${
                paymentMode === 'CASH'
                  ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <Banknote className="w-5 h-5 text-amber-600 mx-auto" />
              <h5 className="font-semibold text-xs text-gray-900">Direct Cash</h5>
              <p className="text-[11px] text-gray-500">Collected in Cash</p>
            </div>

            {/* Bank Transfer */}
            <div
              onClick={() => setValue('paymentMode', 'BANK_TRANSFER')}
              className={`p-3 rounded-xl border-2 transition-all cursor-pointer text-center space-y-1 ${
                paymentMode === 'BANK_TRANSFER'
                  ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <Building className="w-5 h-5 text-blue-600 mx-auto" />
              <h5 className="font-semibold text-xs text-gray-900">Bank Transfer</h5>
              <p className="text-[11px] text-gray-500">NEFT / IMPS / NetBanking</p>
            </div>

            {/* Complimentary */}
            <div
              onClick={() => setValue('paymentMode', 'COMPLIMENTARY')}
              className={`p-3 rounded-xl border-2 transition-all cursor-pointer text-center space-y-1 ${
                paymentMode === 'COMPLIMENTARY'
                  ? 'border-purple-500 bg-purple-50/70 shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <Gift className="w-5 h-5 text-purple-600 mx-auto" />
              <h5 className="font-semibold text-xs text-gray-900">Complimentary</h5>
              <p className="text-[11px] text-gray-500">Free / 7-Day Demo</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Monthly Subscription Fee (₹) *
              </label>
              <Input
                type="number"
                placeholder="899"
                {...register('subscriptionPrice', { valueAsNumber: true })}
                error={errors.subscriptionPrice?.message}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Payment Status *
              </label>
              <Select
                options={[
                  { label: 'Payment Paid (Received ✓)', value: 'PAID' },
                  { label: 'Payment Pending (Due)', value: 'PENDING' },
                ]}
                {...register('paymentStatus')}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Payment Ref / Notes (Optional)
              </label>
              <Input
                placeholder="e.g. UPI Ref / UTR / Cash Receipt"
                {...register('paymentReference')}
              />
            </div>
          </div>
        </div>

        {/* 4. Kitchen Credentials Info Box */}
        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/60 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-600" /> Kitchen Display Station (KDS) Auto-Generated Credentials
          </div>
          <p className="text-xs text-gray-600">
            Creating this outlet automatically generates isolated <strong>Counter Admin</strong> & <strong>Kitchen KDS</strong> accounts:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-gray-200">
              <span className="text-gray-500 block text-[11px] mb-0.5">👨‍🍳 Kitchen Staff Email:</span>
              <span className="font-medium text-gray-900 break-all">
                {watch('email') ? `kitchen.${watch('email')}` : 'kitchen.<admin_email>'}
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-gray-200">
              <span className="text-gray-500 block text-[11px] mb-0.5">🔑 Shared Password:</span>
              <span className="font-medium text-gray-900">
                {watch('password') || 'Same as Counter Manager Password'}
              </span>
            </div>
          </div>
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
            className="font-semibold shadow-xs px-6"
          >
            Create Restaurant Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
