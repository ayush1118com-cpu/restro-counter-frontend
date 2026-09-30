'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChefHat, Shield, Store, ArrowRight, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/lib/context/app-context';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Valid email address is required'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

type RoleTab = 'RESTAURANT_ADMIN' | 'KITCHEN_STAFF' | 'SUPER_ADMIN';

export default function LoginPage() {
  const router = useRouter();
  const { loginAs, restaurants } = useApp();
  const [selectedRoleDemo, setSelectedRoleDemo] = useState<RoleTab>('RESTAURANT_ADMIN');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      // Call Backend API
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        const { user, accessToken } = resData.data;

        // Enrich user with restaurant data from local state
        const matchedRest = restaurants.find(
          (r) =>
            r.email.toLowerCase() === user.email?.toLowerCase() ||
            r.email.toLowerCase() === data.email.toLowerCase()
        ) || (restaurants.length > 0 ? restaurants[0] : null);

        const enrichedUser = {
          ...user,
          restaurantId: matchedRest?.id || user.restaurantId,
          restaurantName: matchedRest?.name || user.restaurantName,
          phone: matchedRest?.phone || user.phone,
        };

        // Store tokens & user in localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(enrichedUser));

        loginAs(enrichedUser.role as any, enrichedUser);

        if (enrichedUser.role === 'SUPER_ADMIN') {
          router.push('/super-admin');
        } else if (enrichedUser.role === 'KITCHEN_STAFF') {
          router.push('/admin/kitchen');
        } else {
          router.push('/admin/dashboard');
        }
      } else {
        // Backend returned an error (e.g. Invalid credentials)
        const errorMsg = resData.message || 'Login failed. Please check your credentials.';
        toast.error(errorMsg);
      }
    } catch (err) {
      toast.error('Network error. Is the backend server running?');
    }
  };

  const setRoleDemo = (role: RoleTab) => {
    setSelectedRoleDemo(role);
    // Removed auto-filling of dummy credentials per user request.
    // The form will remain blank and require real DB credentials.
  };

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80')] bg-cover bg-center bg-fixed flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-gray-50/70 backdrop-blur-md z-0"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-lg shadow-black/10 ring-4 ring-white">
            <ChefHat className="w-8 h-8" />
          </div>
        </Link>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Restro Counter</h2>
        <p className="text-sm text-gray-600 font-medium">Sign in to your restaurant POS, Kitchen KDS, or Management portal</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-xl shadow-black/5 border border-white/60 rounded-3xl sm:px-10 space-y-6">
          {/* Quick Demo Role Selector Tabs */}
          <div className="bg-gray-100 p-1.5 rounded-2xl flex items-center gap-1 text-[11px] font-semibold border border-gray-200/50">
            <button
              type="button"
              onClick={() => setRoleDemo('RESTAURANT_ADMIN')}
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                selectedRoleDemo === 'RESTAURANT_ADMIN'
                  ? 'bg-white text-gray-900 font-bold shadow-sm ring-1 ring-gray-200'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Store className="w-3.5 h-3.5" /> Admin POS
            </button>
            <button
              type="button"
              onClick={() => setRoleDemo('KITCHEN_STAFF')}
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                selectedRoleDemo === 'KITCHEN_STAFF'
                  ? 'bg-white text-gray-900 font-bold shadow-sm ring-1 ring-gray-200'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> Kitchen KDS
            </button>
            <button
              type="button"
              onClick={() => setRoleDemo('SUPER_ADMIN')}
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                selectedRoleDemo === 'SUPER_ADMIN'
                  ? 'bg-white text-gray-900 font-bold shadow-sm ring-1 ring-gray-200'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Super Admin
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. restaurant@restrocounter.com"
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-600">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-amber-500 focus:ring-amber-500/20 bg-white"
                  {...register('rememberMe')}
                />
                Remember Me
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full font-bold bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20 py-3.5 text-sm mt-2 rounded-xl border-0 transition-all"
            >
              Login to {selectedRoleDemo === 'SUPER_ADMIN' ? 'Super Admin' : selectedRoleDemo === 'KITCHEN_STAFF' ? 'Kitchen KDS' : 'Restaurant POS'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="pt-4 border-t border-gray-100 text-center text-xs text-gray-500 font-medium">
            Don't have a counter system account?{' '}
            <Link href="/#demo-form" className="font-bold text-amber-500 hover:text-amber-600">
              Request a Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
