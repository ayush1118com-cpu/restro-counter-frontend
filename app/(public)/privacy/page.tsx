'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#0b0f17] min-h-screen text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header Back Button */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        {/* Title */}
        <div className="space-y-3 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
            <ShieldCheck className="w-4 h-4" /> Legal & Compliance
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Privacy Policy</h1>
          <p className="text-xs text-slate-400 font-medium">Last Updated: September 30, 2026 • Restro Counter System</p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-sm text-slate-300 font-normal leading-relaxed">
          
          <section className="space-y-3 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" /> 1. Information We Collect
            </h2>
            <p>
              When you register or request a demo for Restro Counter System, we collect information necessary to provide high-performance POS & Kitchen Display services. This includes restaurant business names, owner contact details, email addresses, phone numbers, and operational metrics (such as daily counter order volume).
            </p>
          </section>

          <section className="space-y-3 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-400" /> 2. How We Use Your Information
            </h2>
            <p>
              We utilize collected data strictly for:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Configuring your restaurant counter POS terminal & kitchen display (KDS) feeds.</li>
              <li>Processing instant UPI, Cash, and Card transaction records.</li>
              <li>Generating accurate sales analytics and daily revenue reports for store managers.</li>
              <li>Providing technical customer support and system updates.</li>
            </ul>
          </section>

          <section className="space-y-3 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" /> 3. Data Security & Storage
            </h2>
            <p>
              Your counter orders, payment statuses, and customer receipts are encrypted in transit and at rest using bank-grade 256-bit encryption. We never sell, rent, or share your proprietary restaurant business data with unauthorized third parties.
            </p>
          </section>

          <section className="space-y-3 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-lg font-bold text-white">4. Contact Our Data Protection Officer</h2>
            <p>
              If you have any questions or concerns regarding our privacy practices or data retention policies, please reach out to our legal team at <span className="text-amber-400 font-semibold">privacy@restrocounter.com</span>.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
