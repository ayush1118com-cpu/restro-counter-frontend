'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Building2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useApp } from '@/lib/context/app-context';
import { RestaurantStatus } from '@/types';
import Link from 'next/link';

const restaurantSchema = z.object({
  name: z.string().min(2, 'Restaurant name is required'),
  ownerName: z.string().min(2, 'Owner name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'BLOCKED']),
});

type RestaurantFormData = z.infer<typeof restaurantSchema>;

export default function AddRestaurantPage() {
  const router = useRouter();
  const { addRestaurant } = useApp();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      status: 'ACTIVE',
      city: 'New Delhi',
    },
  });

  const onSubmit = async (data: RestaurantFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    addRestaurant(data);
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
          <p className="text-xs text-gray-500">Create restaurant profile and assign manager credentials</p>
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
            placeholder="e.g. 9876543210"
            {...register('phone')}
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
          <Input
            label="City *"
            placeholder="e.g. Chandigarh"
            {...register('city')}
            error={errors.city?.message}
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
