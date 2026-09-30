'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileCheck } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="bg-[#0b0f17] min-h-screen text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <div className="space-y-3 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
            <FileCheck className="w-4 h-4" /> Terms & Conditions
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Terms of Service</h1>
          <p className="text-xs text-slate-400 font-medium">Last Updated: September 30, 2026 • Restro Counter System</p>
        </div>

        <div className="space-y-8 text-sm text-slate-300 font-normal leading-relaxed">
          <section className="space-y-3 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold text-white">1. Service Agreement</h2>
            <p>
              By accessing or using Restro Counter POS & Kitchen Display System (KDS), you agree to comply with these terms. Restro Counter provides software solutions for counter order management, billing, and real-time kitchen tracking.
            </p>
          </section>

          <section className="space-y-3 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold text-white">2. POS Terminal Use</h2>
            <p>
              Restaurants are responsible for maintaining authorized access to their counter terminals and kitchen display devices. Any fraudulent order creation or unverified refunds are the sole responsibility of the store account administrator.
            </p>
          </section>

          <section className="space-y-3 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold text-white">3. System Uptime & Support</h2>
            <p>
              Restro Counter guarantees a 99.9% uptime SLA for counter billing and real-time KDS syncing. Technical assistance is provided 24/7 via live support chat and phone.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
