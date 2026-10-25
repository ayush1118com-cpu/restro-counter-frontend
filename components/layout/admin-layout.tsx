'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  BookOpen,
  Users,
  PanelLeftClose,
  PanelLeftOpen,
  QrCode,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/context/app-context';
import { Badge } from '@/components/ui/badge';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, logout, orders, restaurants, currentRestaurant, khataAccounts } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Role-based route protection
  React.useEffect(() => {
    if (!currentUser) return;
    
    // Kitchen Staff can ONLY access /admin/kitchen
    if (currentUser.role === 'KITCHEN_STAFF' && pathname !== '/admin/kitchen') {
      router.replace('/admin/kitchen');
      return;
    }
    
    // Restaurant Admin should NOT access kitchen page directly (they use sidebar)
    // Super Admin should NOT land on admin pages
    if (currentUser.role === 'SUPER_ADMIN' && pathname.startsWith('/admin')) {
      router.replace('/super-admin');
      return;
    }
  }, [currentUser, pathname, router]);

  // Dynamically resolve active restaurant for logged in user
  const activeRest =
    restaurants.find((r) => r.id === currentUser?.restaurantId) ||
    restaurants.find((r) => r.email === currentUser?.email) ||
    (restaurants.length > 0 ? restaurants[0] : null);

  const activeRestaurantName = currentUser?.restaurantName || activeRest?.name || 'Restro Counter';

  const pendingCount = orders.filter((o) => o.status === 'NEW' || o.status === 'PREPARING').length;
  const totalKhataDueCustomers = (khataAccounts || []).filter((k) => k.totalDue > 0).length;

  const isTableQrDisabled =
    currentRestaurant?.hasTableQrOrdering === false ||
    activeRest?.hasTableQrOrdering === false;

  const hasTableQr = !isTableQrDisabled;

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Counter POS', href: '/admin/pos', icon: Calculator },
    { label: 'Live Orders', href: '/admin/live-orders', icon: Flame, count: pendingCount },
    ...(hasTableQr ? [{ label: 'Tables & QR', href: '/admin/tables', icon: QrCode }] : []),
    { label: 'Menu Items', href: '/admin/menu', icon: UtensilsCrossed },
    { label: 'Categories', href: '/admin/categories', icon: Tags },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Order History', href: '/admin/orders', icon: History },
    { label: 'Khata Book', href: '/admin/khata', icon: BookOpen, count: totalKhataDueCustomers > 0 ? totalKhataDueCustomers : undefined },
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
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-[#F7F8FA] flex flex-col md:flex-row font-sans text-[#172033]">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-[#E7EAF0] px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-sm border border-amber-200 shrink-0">
            <Image
              src="/logo.png"
              alt="ServDesk Logo"
              fill
              className="object-cover"
            />
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

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop & Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-white border-r border-[#E7EAF0] flex flex-col justify-between transition-all duration-300 ease-in-out md:static shrink-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          isCollapsed ? 'md:w-[58px]' : 'md:w-[215px] w-[250px]'
        )}
      >
        <div className="flex-1 flex flex-col min-h-0">
          {/* Restaurant Branding Area */}
          <div className="h-12 px-2.5 border-b border-[#E7EAF0] flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-amber-200 shadow-xs shrink-0">
                <Image
                  src="/logo.png"
                  alt="ServDesk Logo"
                  fill
                  className="object-cover"
                />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <h2 className="text-xs font-bold text-[#172033] truncate tracking-tight">
                    {activeRestaurantName}
                  </h2>
                  <p className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                  </p>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle Button (Only in Sidebar) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-amber-600" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-1.5 space-y-0.5 flex-1 overflow-y-auto overflow-x-hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <div key={item.href} className="relative group">
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center rounded-lg text-xs font-semibold transition-all h-[34px] relative',
                      isCollapsed ? 'justify-center px-0' : 'justify-between px-2.5',
                      isActive
                        ? 'bg-amber-50 text-amber-700 font-bold border border-amber-200/60'
                        : 'text-[#667085] hover:bg-gray-50 hover:text-[#172033]'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={cn('w-3.5 h-3.5 shrink-0', isActive ? 'text-amber-600' : 'text-[#667085]')} />
                      {!isCollapsed && <span className="truncate text-xs">{item.label}</span>}
                    </div>
                    {!isCollapsed && item.count !== undefined && item.count > 0 && (
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0',
                          isActive ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
                        )}
                      >
                        {item.count}
                      </span>
                    )}
                    {isCollapsed && item.count !== undefined && item.count > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
                    )}
                  </Link>

                  {/* Floating tooltip on hover when collapsed */}
                  {isCollapsed && (
                    <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:flex items-center gap-2 z-50 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap animate-in fade-in-50 zoom-in-95 duration-150">
                      <span>{item.label}</span>
                      {item.count !== undefined && item.count > 0 && (
                        <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                          {item.count}
                        </span>
                      )}
                      {/* Arrow pointer */}
                      <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 rounded-xs" />
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout at Bottom */}
        <div className="p-2.5 border-t border-[#E7EAF0] space-y-2">
          {!isCollapsed ? (
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
          ) : (
            <div className="flex justify-center relative group">
              <div
                className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs shadow-xs cursor-pointer"
              >
                {currentUser?.name?.slice(0, 2).toUpperCase() || 'AD'}
              </div>
              <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:flex items-center z-50 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap animate-in fade-in-50 zoom-in-95 duration-150">
                <span>{currentUser?.name || 'Counter Admin'} (Admin)</span>
                <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45 rounded-xs" />
              </div>
            </div>
          )}

          <div className="relative group">
            <button
              onClick={handleLogout}
              className={cn(
                'w-full flex items-center justify-center gap-2 h-9 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors border border-rose-100 cursor-pointer',
                isCollapsed && 'px-0'
              )}
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              {!isCollapsed && <span>Logout</span>}
            </button>
            {isCollapsed && (
              <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 hidden group-hover:flex items-center z-50 px-2.5 py-1.5 bg-rose-900 text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap animate-in fade-in-50 zoom-in-95 duration-150">
                <span>Logout</span>
                <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-rose-900 rotate-45 rounded-xs" />
              </div>
            )}
          </div>

          {/* ServDesk Branding */}
          {!isCollapsed && (
            <div className="pt-2 text-center border-t border-gray-100">
              <p className="text-[11px] font-black text-gray-900 tracking-tight">ServDesk</p>
              <p className="text-[9px] font-bold text-amber-600">Powered by Alvora Tech Solution</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="hidden md:flex bg-white border-b border-[#E7EAF0] h-12 px-4 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
              <Building className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#172033]">
                {activeRestaurantName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-3.5 h-3.5" />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>

            <div className="h-4 w-px bg-gray-200" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
                {currentUser?.name?.slice(0, 2).toUpperCase() || 'RS'}
              </div>
              <div className="text-left text-xs hidden lg:block">
                <p className="font-bold text-[#172033] leading-none">{currentUser?.name || 'Rahul Sharma'}</p>
                <p className="text-[10px] text-[#667085] mt-0.5">Restaurant Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-2 sm:p-3 lg:p-4 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
