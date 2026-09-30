'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calculator,
  Flame,
  ChefHat,
  UtensilsCrossed,
  Tags,
  History,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu as MenuIcon,
  X,
  Bell,
  Building,
  Radio,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/context/app-context';
import { Badge } from '@/components/ui/badge';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, orders, restaurants } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Dynamically resolve active restaurant for logged in user
  const activeRest =
    restaurants.find((r) => r.id === currentUser?.restaurantId) ||
    restaurants.find((r) => r.email === currentUser?.email) ||
    restaurants.find((r) => r.phone === currentUser?.phone) ||
    (restaurants.length > 0 ? restaurants[0] : null);

  const activeRestaurantName = activeRest?.name
    || (currentUser?.restaurantName && !['Spice Garden Restaurant', 'Spice Garden', 'Counter Restaurant Outlet', 'Restro Counter Outlet'].includes(currentUser.restaurantName) ? currentUser.restaurantName : null)
    || (currentUser?.name ? `${currentUser.name.replace(/\s*\(Counter Admin\)/i, '').replace(/\s*\(Admin\)/i, '').trim()}'s Outlet` : 'Restro Counter Outlet');

  const pendingCount = orders.filter((o) => o.status === 'NEW' || o.status === 'PREPARING').length;

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Counter POS', href: '/admin/pos', icon: Calculator },
    { label: 'Live Orders', href: '/admin/live-orders', icon: Flame, count: pendingCount },
    { label: 'Menu Items', href: '/admin/menu', icon: UtensilsCrossed },
    { label: 'Categories', href: '/admin/categories', icon: Tags },
    { label: 'Order History', href: '/admin/orders', icon: History },
    { label: 'Payments', href: '/admin/payments', icon: CreditCard },
    { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Dedicated Full-Screen Standalone Mode for Kitchen KDS Station
  if (pathname === '/admin/kitchen') {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col md:flex-row font-sans text-[#172033]">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-[#E7EAF0] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-sm">
            <ChefHat className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#172033] text-sm block truncate max-w-[150px]">
              {activeRestaurantName}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
            </span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop & Mobile Sidebar (Width: 235px) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[235px] bg-white border-r border-[#E7EAF0] flex flex-col justify-between transition-transform duration-200 md:translate-x-0 md:static shrink-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div>
          {/* Restaurant Branding Area */}
          <div className="p-4 border-b border-[#E7EAF0] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-200/50 shrink-0">
              <ChefHat className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-[#172033] truncate tracking-tight">
                {activeRestaurantName}
              </h2>
              <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Counter Online
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center justify-between px-3 h-[42px] rounded-xl text-xs font-semibold transition-all',
                    isActive
                      ? 'bg-amber-50 text-amber-700 font-bold border border-amber-200/60'
                      : 'text-[#667085] hover:bg-gray-50 hover:text-[#172033]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn('w-4 h-4', isActive ? 'text-amber-600' : 'text-[#667085]')} />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-bold',
                        isActive ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
                      )}
                    >
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout at Bottom */}
        <div className="p-3 border-t border-[#E7EAF0] space-y-2">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
              {currentUser?.name?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#172033] truncate">
                {currentUser?.name || 'Counter Admin'}
              </p>
              <p className="text-[10px] text-[#667085] truncate">Restaurant Admin</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 h-9 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors border border-rose-100"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="hidden md:flex bg-white border-b border-[#E7EAF0] h-16 px-6 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#172033]">
                {activeRestaurantName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-4 h-4" />
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>

            <div className="h-5 w-px bg-gray-200" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {currentUser?.name?.slice(0, 2).toUpperCase() || 'RS'}
              </div>
              <div className="text-left text-xs">
                <p className="font-bold text-[#172033]">{currentUser?.name || 'Rahul Sharma'}</p>
                <p className="text-[10px] text-[#667085]">Restaurant Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
