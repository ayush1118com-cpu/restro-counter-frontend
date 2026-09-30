'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Users,
  ShoppingBag,
  Settings,
  LogOut,
  ChefHat,
  Menu,
  X,
  ShieldCheck,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/context/app-context';
import { Button } from '@/components/ui/button';

export function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
    { label: 'Restaurants', href: '/super-admin/restaurants', icon: Building2 },
    { label: 'Add Restaurant', href: '/super-admin/restaurants/new', icon: PlusCircle },
    { label: 'Leads', href: '/super-admin/leads', icon: Users },
    { label: 'Orders', href: '/super-admin/orders', icon: ShoppingBag },
    { label: 'Settings', href: '/super-admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-900">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
            <ChefHat className="w-5 h-5" />
          </div>
          <span className="font-bold text-gray-900 text-sm">Super Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col justify-between transition-transform duration-200 md:translate-x-0 md:static',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div>
          {/* Logo & Platform Name */}
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 tracking-tight">Restro Counter</h2>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md mt-0.5 w-max">
                <ShieldCheck className="w-3 h-3" /> Super Admin
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                    isActive
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                      : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-gray-500')} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-xs">
              SA
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">
                {currentUser?.name || 'Super Admin'}
              </p>
              <p className="text-[10px] text-gray-500 truncate">System Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors border border-red-100"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="hidden md:flex bg-white border-b border-gray-100 h-16 px-8 items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {navItems.find((i) => i.href === pathname)?.label || 'Super Admin Console'}
            </h1>
            <p className="text-xs text-gray-500">Multi-restaurant platform control center</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
            </button>
            <div className="h-6 w-px bg-gray-200" />
            <div className="text-right text-xs">
              <p className="font-bold text-gray-900">{currentUser?.name || 'Super Admin'}</p>
              <p className="text-gray-500">{currentUser?.email || 'superadmin@restrocounter.com'}</p>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
