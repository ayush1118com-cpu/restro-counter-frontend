'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Shield, Store, ArrowRight, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/lib/context/app-context';
import { toast } from 'sonner';
import { API_URL } from '@/lib/config';

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
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        const { user, accessToken } = resData.data;

        // Use restaurant info from backend response directly
        const backendRestaurant = user.restaurant;

        const enrichedUser = {
          ...user,
          restaurantId: backendRestaurant?._id || user.restaurantId,
          restaurantName: backendRestaurant?.name || user.restaurantName || '',
          phone: user.phone || '',
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
    <div className="min-h-[100dvh] bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80')] bg-cover bg-center bg-fixed flex flex-col justify-start sm:justify-center pt-16 pb-32 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-y-auto">
      <div className="absolute inset-0 bg-gray-50/70 backdrop-blur-md z-0"></div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-xl shadow-orange-500/20 ring-4 ring-white border border-orange-500/30">
            <Image
              src="/logo.png"
              alt="ServDesk Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">ServDesk</h2>
        <p className="text-xs font-bold text-amber-600">Powered by Alvora Tech Solution</p>
        <p className="text-xs text-gray-500 font-medium">Sign in to your restaurant POS, Kitchen KDS, or Counter Management portal</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-5 shadow-xl shadow-black/5 border border-white/60 rounded-3xl sm:px-10 space-y-6">
          {/* Card Top Brand Pill */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="relative w-6 h-6 rounded-lg overflow-hidden border border-amber-200 shadow-sm shrink-0">
                <Image src="/logo.png" alt="ServDesk Logo" fill className="object-cover" />
              </div>
              <span className="text-xs font-bold text-gray-800 tracking-tight">ServDesk Portal</span>
            </div>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
              Secure Sign In
            </span>
          </div>

          {/* Quick Demo Role Selector Tabs */}
          <div className="bg-gray-100 p-1.5 rounded-2xl flex flex-wrap sm:flex-nowrap items-center gap-1 text-[11px] font-semibold border border-gray-200/50">
            <button
              type="button"
              onClick={() => setRoleDemo('RESTAURANT_ADMIN')}
              className={`flex-1 min-w-[30%] py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                selectedRoleDemo === 'RESTAURANT_ADMIN'
                  ? 'bg-white text-gray-900 font-bold shadow-sm ring-1 ring-gray-200'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Store className="w-3.5 h-3.5 hidden sm:block" /> Admin POS
            </button>
            <button
              type="button"
              onClick={() => setRoleDemo('KITCHEN_STAFF')}
              className={`flex-1 min-w-[30%] py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                selectedRoleDemo === 'KITCHEN_STAFF'
                  ? 'bg-white text-gray-900 font-bold shadow-sm ring-1 ring-gray-200'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5 hidden sm:block" /> Kitchen KDS
            </button>
            <button
              type="button"
              onClick={() => setRoleDemo('SUPER_ADMIN')}
              className={`flex-1 min-w-[30%] py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                selectedRoleDemo === 'SUPER_ADMIN'
                  ? 'bg-white text-gray-900 font-bold shadow-sm ring-1 ring-gray-200'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5 hidden sm:block" /> Super Admin
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
              className="w-full font-bold bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white shadow-lg shadow-gray-900/20 py-3.5 text-sm mt-2 rounded-xl border border-gray-700/50 transition-all flex items-center justify-center gap-2"
            >
              <div className="relative w-4 h-4 rounded overflow-hidden shrink-0">
                <Image src="/logo.png" alt="ServDesk" fill className="object-cover" />
              </div>
              <span>Login to {selectedRoleDemo === 'SUPER_ADMIN' ? 'Super Admin' : selectedRoleDemo === 'KITCHEN_STAFF' ? 'Kitchen KDS' : 'Restaurant POS'}</span>
              <ArrowRight className="w-4 h-4" />
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
