import React from 'react';
import {
  Zap,
  Flame,
  Utensils,
  CreditCard,
  Receipt,
  History,
  LayoutDashboard,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { LeadForm } from '@/components/forms/lead-form';

export default function FeaturesPage() {
  const detailedFeatures = [
    {
      title: 'Fast Counter Ordering',
      desc: 'Create customer orders quickly from the restaurant counter with single-tap add, quantity buttons, and barcode or search filters.',
      icon: Zap,
    },
    {
      title: 'Real-Time Kitchen Display',
      desc: 'Orders appear instantly on kitchen monitors with sound chime, visual urgency timers, and status progression buttons.',
      icon: Flame,
    },
    {
      title: 'Dynamic Menu Management',
      desc: 'Add, edit, categorizer and toggle item stock availability in real time so counter staff never sell sold-out dishes.',
      icon: Utensils,
    },
    {
      title: 'Multi-Payment Tracking',
      desc: 'Full support for Cash, UPI QR payments, and Credit/Debit cards with auto calculation of totals, taxes, and discounts.',
      icon: CreditCard,
    },
    {
      title: 'Instant Thermal Billing',
      desc: 'Generate printable receipts formatted for standard 80mm/58mm thermal printers immediately after payment confirmation.',
      icon: Receipt,
    },
    {
      title: 'Searchable Order History',
      desc: 'Inspect previous transactions, reprint receipts, and track order lifecycles with advanced filters by date and status.',
      icon: History,
    },
    {
      title: 'Analytics & Sales Dashboard',
      desc: 'Monitor real-time sales revenue, average ticket size, item popularity, and peak operating hours with rich charts.',
      icon: LayoutDashboard,
    },
    {
      title: 'Multi-Restaurant Management',
      desc: 'Super Admin panel empowers platform owners to onboard, monitor, activate, or suspend multiple restaurant branches.',
      icon: Building2,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Complete Feature Suite
        </span>
        <h1 className="text-4xl font-black text-gray-900">Engineered for Counter Efficiency</h1>
        <p className="text-gray-600 text-base">
          Discover all the tools Restro Counter system brings to simplify your counter and kitchen operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {detailedFeatures.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xs hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{feat.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{feat.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="pt-8 max-w-3xl mx-auto">
        <LeadForm />
      </div>
    </div>
  );
}
