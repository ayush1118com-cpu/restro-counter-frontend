import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PricingPage() {
  const plans = [
    {
      name: 'Single Outlet',
      price: '₹1,499',
      period: '/ month',
      desc: 'Ideal for independent food counters & QSR outlets.',
      features: [
        '1 Counter POS Terminal',
        '1 Kitchen Display Screen',
        'Unlimited Orders & Bills',
        'Cash, UPI & Card Tracking',
        'Menu & Category Management',
        'Standard Email Support',
      ],
      popular: false,
    },
    {
      name: 'Pro Counter',
      price: '₹2,999',
      period: '/ month',
      desc: 'Best for busy food courts & multi-terminal counters.',
      features: [
        'Up to 3 Counter POS Terminals',
        '2 Kitchen Display Screens',
        'Real-time Socket Sync',
        'Advanced Sales & Inventory Reports',
        'Bill Customization & Logo',
        '24/7 Priority Support',
      ],
      popular: true,
    },
    {
      name: 'Multi-Branch Franchise',
      price: '₹5,999',
      period: '/ month',
      desc: 'For restaurant chains & multi-city brands.',
      features: [
        'Unlimited Outlets & POS',
        'Super Admin Multi-Restaurant Dashboard',
        'Centralized Menu Distribution',
        'Custom Hardware Integrations',
        'Dedicated Account Manager',
        'SLA Guaranteed Uptime',
      ],
      popular: false,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Transparent Pricing
        </span>
        <h1 className="text-4xl font-black text-gray-900">Simple Plans for Every Counter</h1>
        <p className="text-gray-600 text-base">
          No hidden fees or commission on your orders. Choose the plan that fits your restaurant.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`bg-white p-8 rounded-3xl border flex flex-col justify-between relative shadow-xs transition-all ${
              plan.popular ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xl scale-105' : 'border-gray-100'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Most Popular
              </span>
            )}

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-xs text-gray-500">{plan.desc}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                <span className="text-xs font-semibold text-gray-500">{plan.period}</span>
              </div>

              <ul className="space-y-3 pt-4 border-t border-gray-100 text-xs text-gray-700">
                {plan.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <Link href="/#demo-form">
                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  size="md"
                  className="w-full font-bold justify-center"
                >
                  Get Started Now
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
