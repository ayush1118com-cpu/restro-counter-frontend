'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Zap,
  Flame,
  Utensils,
  CreditCard,
  Receipt,
  History,
  LayoutDashboard,
  Building2,
  CheckCircle2,
  ChefHat,
  Sparkles,
  Calculator,
  Play,
  QrCode,
  Smartphone,
  TrendingUp,
  Clock,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeadForm } from '@/components/forms/lead-form';

export default function HomePage() {
  return (
    <div className="bg-[#fcfcfd] text-gray-900 overflow-hidden">
      
      {/* ========================================================================= */}
      {/* 1. HERO BANNER - PROPER DARK EDITION (EXACT MATCH WITH REFERENCE UI)     */}
      {/* ========================================================================= */}
      <section className="relative bg-[#0b0f17] text-white pt-14 pb-24 lg:pt-24 lg:pb-36 border-b border-slate-800/80 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-10 left-1/4 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-orange-600/15 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-7 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 text-amber-400 text-xs font-bold border border-amber-500/30 shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="uppercase tracking-wider">Modern Restaurant Counter Platform</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
                Run Your Restaurant <br className="hidden sm:inline" />
                Smarter.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500">
                  Serve Every Customer Better.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-normal">
                Manage counter POS ordering, instant UPI payments, kitchen displays (KDS), and daily sales performance from one powerful unified platform.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a href="#demo-form">
                  <Button variant="primary" size="lg" className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold shadow-xl shadow-orange-500/25 px-8 py-4 text-base rounded-full border-0">
                    Start Free Trial <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </a>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="font-semibold text-slate-200 border-slate-700 bg-slate-900/80 hover:bg-slate-800 rounded-full px-6 py-4 flex items-center gap-2">
                    Login to Dashboard <ArrowRight className="w-4 h-4 text-amber-400" />
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-300 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">✓</div>
                  <span>Easy Setup</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">✓</div>
                  <span>No POS Commission</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">✓</div>
                  <span>For All Restaurant Types</span>
                </div>
              </div>
            </div>

            {/* Right Side Mockup Overlay Showcase */}
            <div className="lg:col-span-6 relative">
              
              {/* Floating Notification Header Badge */}
              <div className="absolute -top-6 right-6 z-30 bg-slate-900/90 backdrop-blur-md text-white border border-amber-500/40 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-3 text-xs">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-amber-400">Order Token #1024</p>
                  <p className="text-[10px] text-slate-400">Paneer Tikka • Kitchen KDS Live</p>
                </div>
              </div>

              {/* Main Dashboard Preview Card */}
              <div className="bg-[#0f172a] rounded-3xl border border-slate-800 shadow-2xl p-6 space-y-6 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-500 text-slate-950 flex items-center justify-center font-black text-sm">R</div>
                    <span className="text-sm font-bold text-white">Restro Counter POS</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400 font-semibold">Live System</span>
                  </div>
                </div>

                {/* Dashboard Metrics Grid */}
                <div className="grid grid-cols-3 gap-3 text-left">
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <p className="text-[10px] font-semibold text-slate-400">Total Orders</p>
                    <p className="text-lg font-black text-white mt-1">128</p>
                    <span className="text-[9px] text-emerald-400 font-bold">↑ 12% today</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <p className="text-[10px] font-semibold text-slate-400">Total Revenue</p>
                    <p className="text-lg font-black text-amber-400 mt-1">₹24,580</p>
                    <span className="text-[9px] text-emerald-400 font-bold">↑ 18% today</span>
                  </div>
                  <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <p className="text-[10px] font-semibold text-slate-400">Active Outlets</p>
                    <p className="text-lg font-black text-white mt-1">24</p>
                    <span className="text-[9px] text-emerald-400 font-bold">• Online</span>
                  </div>
                </div>

                {/* Live Order List */}
                <div className="space-y-2 text-left">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Counter Tickets</p>
                  <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between items-center text-slate-200">
                      <span className="font-bold">#1024 Paneer Tikka × 2</span>
                      <span className="text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded text-[10px] font-bold">Paid UPI</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300 text-[11px]">
                      <span>#1023 Butter Chicken Biryani</span>
                      <span className="text-amber-400">Kitchen KDS</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300 text-[11px]">
                      <span>#1022 Veg Noodles & Cold Drink</span>
                      <span className="text-slate-400">Ready</span>
                    </div>
                  </div>
                </div>

                {/* Bottom KDS Bar Overlay */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 p-3 rounded-xl flex items-center justify-between font-bold text-xs shadow-md">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 fill-slate-950" />
                    <span>Live Kitchen Display System (KDS) Active</span>
                  </div>
                  <span className="bg-slate-950 text-white text-[10px] px-2.5 py-1 rounded-lg">Real-Time Sync</span>
                </div>
              </div>

              {/* Scan to Order Badge - Cleanly Offset to top left without overlapping */}
              <div className="absolute -top-6 -left-4 z-30 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3 rounded-2xl shadow-xl flex items-center gap-3 hidden sm:flex text-xs">
                <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 font-bold">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-white text-xs">Scan to Order POS</p>
                  <p className="text-[10px] text-amber-400 font-semibold">Fast Counter Setup</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. FEATURES SECTION - LIGHT CLEAN EDITION                                  */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-100/80 px-4 py-1.5 rounded-full border border-amber-200">
            Powerful Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Everything Your Counter Needs</h2>
          <p className="text-sm text-gray-600 font-normal">Built specifically for high-speed counter ordering without table friction.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Fast Counter Ordering', desc: 'Create customer orders quickly from the restaurant counter with keyboard-friendly interface.', icon: Zap, color: 'text-amber-600 bg-amber-50' },
            { title: 'Real-Time Kitchen', desc: 'Orders appear instantly on the kitchen display screen without any manual printing delays.', icon: Flame, color: 'text-orange-600 bg-orange-50' },
            { title: 'Menu Management', desc: 'Manage categories, items, prices, and instant item availability toggles effortlessly.', icon: Utensils, color: 'text-emerald-600 bg-emerald-50' },
            { title: 'Payment Tracking', desc: 'Track Cash, UPI, and Card payments in real-time with instant reconciliation.', icon: CreditCard, color: 'text-blue-600 bg-blue-50' },
            { title: 'Instant Thermal Billing', desc: 'Generate and print thermal bills instantly right after payment confirmation.', icon: Receipt, color: 'text-purple-600 bg-purple-50' },
            { title: 'Order History', desc: 'Search and review all previous customer orders, receipts, and refund states.', icon: History, color: 'text-indigo-600 bg-indigo-50' },
            { title: 'Restaurant Dashboard', desc: 'Monitor daily sales revenue, peak ordering hours, and menu performance metrics.', icon: LayoutDashboard, color: 'text-teal-600 bg-teal-50' },
            { title: 'Multi-Restaurant Admin', desc: 'Super Admin can easily manage, monitor, and configure multiple restaurant outlets.', icon: Building2, color: 'text-rose-600 bg-rose-50' },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="bg-white p-7 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all space-y-3 group">
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{feature.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-normal">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. HOW IT WORKS - BALANCED 6-STEP PROCESS                                 */}
      {/* ========================================================================= */}
      <section className="bg-slate-50/80 py-20 border-y border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-100/80 px-4 py-1.5 rounded-full border border-amber-200">
              Seamless Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172033]">How Restro Counter Works</h2>
            <p className="text-sm text-[#667085]">6 simple steps from customer walk-in to instant order completion.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Customer Walk-in & Order', desc: 'Customer approaches counter and selects items from menu board or display.' },
              { step: '02', title: 'Fast Counter POS Billing', desc: 'Counter staff adds items to POS screen in 2 taps with instant GST calculation.' },
              { step: '03', title: 'Instant Payment Settlement', desc: 'Payment is confirmed via UPI QR code, Cash, or Credit/Debit Card.' },
              { step: '04', title: 'Live Kitchen Ticket Dispatch', desc: 'Order routes instantly to Kitchen Display System (KDS) screen with chime alert.' },
              { step: '05', title: 'Kitchen Cooking & Timer', desc: 'Chef accepts order ticket and starts cooking with real-time stopwatch tracking.' },
              { step: '06', title: 'Order Pickup & Thermal Bill', desc: 'Chef marks Ready for pickup; staff hands over order & thermal bill receipt.' },
            ].map((st, idx) => (
              <div
                key={idx}
                className="bg-white p-7 rounded-3xl border border-[#E7EAF0] shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white font-black flex items-center justify-center text-sm shadow-md shadow-amber-500/25">
                    {st.step}
                  </div>
                  <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                    Step {idx + 1}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172033] group-hover:text-amber-600 transition-colors mb-1.5">
                    {st.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#667085] leading-relaxed font-normal">
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. REAL-TIME KITCHEN KDS SHOWCASE                                         */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950 text-white rounded-3xl p-8 sm:p-14 shadow-2xl border border-slate-800">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-4 py-1.5 rounded-full border border-amber-400/20">
              ⚡ Zero Latency Sync
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Real-Time Kitchen Connection</h2>
            <p className="text-amber-200/80 text-sm font-bold">"Orders move from counter to kitchen screen in under 100ms."</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
            {/* Counter Terminal Mockup */}
            <div className="lg:col-span-5 bg-white text-gray-900 p-6 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-xs font-black text-amber-600 uppercase tracking-widest">COUNTER POS TERMINAL</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">PAID</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-gray-900">ORDER #1025</p>
                <div className="text-xs text-gray-600 space-y-1 font-medium">
                  <p className="flex justify-between"><span>Paneer Tikka × 2</span><span>₹560</span></p>
                  <p className="flex justify-between"><span>Butter Roti × 4</span><span>₹120</span></p>
                  <p className="flex justify-between"><span>Cold Drink × 1</span><span>₹50</span></p>
                </div>
                <div className="pt-2 border-t border-gray-100 flex justify-between text-xs font-bold">
                  <span>Total</span><span>₹730</span>
                </div>
              </div>
              <div className="w-full bg-emerald-600 text-white font-bold text-center py-2.5 rounded-xl text-xs uppercase tracking-wider">
                ORDER PLACED & SENT
              </div>
            </div>

            {/* Sync Indicator */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center text-amber-400 my-2 lg:my-0">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center animate-bounce">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest mt-2 text-amber-300">Syncing...</span>
            </div>

            {/* Kitchen KDS Mockup */}
            <div className="lg:col-span-5 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">KITCHEN DISPLAY (KDS)</span>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-800 animate-pulse">
                  NEW ORDER
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-white">NEW ORDER #1025</p>
                <div className="text-xs text-slate-300 space-y-1 font-medium">
                  <p>Paneer Tikka × 2</p>
                  <p>Butter Roti × 4</p>
                  <p>Cold Drink × 1</p>
                </div>
              </div>
              <button className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider">
                [ ACCEPT & START PREPARING ]
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. REQUEST DEMO FORM                                                      */}
      {/* ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <LeadForm />
      </section>

    </div>
  );
}
