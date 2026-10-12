'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Check, Lock, Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useApp } from '@/lib/context/app-context';
import { toast } from 'sonner';

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  popular: boolean;
}

export default function PricingPage() {
  const { addLead } = useApp();

  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unlockedPlans, setUnlockedPlans] = useState<Set<string>>(new Set());

  // Form State
  const [restaurantName, setRestaurantName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [approxOrders, setApproxOrders] = useState('50-150');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  const plans: PricingPlan[] = [
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
        'Advanced Sales & Khata Book Reports',
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

  const handleOpenUnlockModal = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setIsSubmittedSuccess(false);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantName.trim() || !ownerName.trim() || !phone.trim() || !email.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await addLead({
        restaurantName: restaurantName.trim(),
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        city: city.trim() || 'Jaipur',
        approxOrdersPerDay: approxOrders,
        currentPos: selectedPlan ? `Pricing Inquiry: ${selectedPlan.name}` : 'General Inquiry',
        message: notes.trim() ? `${notes.trim()} (Plan: ${selectedPlan?.name})` : `Inquired about ${selectedPlan?.name} plan pricing`,
      });

      if (selectedPlan) {
        setUnlockedPlans((prev) => new Set([...prev, selectedPlan.name]));
      }
      setIsSubmittedSuccess(true);
      toast.success('Pricing details unlocked successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Heading */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Transparent & Direct Pricing</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">
          Simple Plans for Every Restaurant Counter
        </h1>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          Zero commissions on orders. Click any plan below to unlock custom discounted pricing and get a personalized quote.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, idx) => {
          const isUnlocked = unlockedPlans.has(plan.name);

          return (
            <div
              key={idx}
              className={`bg-white p-8 rounded-3xl border flex flex-col justify-between relative shadow-xs transition-all hover:shadow-xl ${
                plan.popular ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-xl md:scale-105' : 'border-gray-200/80'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-[11px] px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                  Most Popular
                </span>
              )}

              <div className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{plan.desc}</p>
                </div>

                {/* BLURRED / UNLOCKED PRICE CONTAINER */}
                <div
                  onClick={() => !isUnlocked && handleOpenUnlockModal(plan)}
                  className={`relative p-3.5 rounded-2xl transition-all border ${
                    isUnlocked
                      ? 'bg-amber-50/50 border-amber-200/80'
                      : 'bg-gray-50/80 border-gray-200 hover:border-amber-300 hover:bg-amber-50/40 cursor-pointer group/price'
                  }`}
                  title={isUnlocked ? 'Unlocked' : 'Click to unlock price'}
                >
                  <div
                    className={`flex items-baseline gap-1.5 transition-all duration-300 select-none ${
                      isUnlocked ? 'filter-none' : 'filter blur-md opacity-70'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">{plan.price}</span>
                    <span className="text-xs font-bold text-gray-500">{plan.period}</span>
                  </div>

                  {/* Lock Overlay when blurred */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/90 text-white text-[11px] font-bold shadow-lg backdrop-blur-md group-hover/price:bg-orange-600 transition-all group-hover/price:scale-105">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Click to Unlock Price</span>
                      </span>
                    </div>
                  )}

                  {isUnlocked && (
                    <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Special Rate Unlocked
                    </div>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-3 pt-4 border-t border-gray-100 text-xs text-gray-700 font-medium">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  size="md"
                  onClick={() => handleOpenUnlockModal(plan)}
                  className={`w-full font-bold justify-center rounded-xl py-3 text-xs sm:text-sm ${
                    plan.popular
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 border-0 shadow-lg shadow-orange-500/25'
                      : 'border-gray-300 hover:border-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {isUnlocked ? 'Contact Sales / Inquire Again' : 'Unlock Price & Get Quote'}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* POPUP LEAD MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isSubmittedSuccess ? 'Pricing Details Unlocked!' : `Unlock Pricing for ${selectedPlan?.name || 'ServDesk'}`}
        maxWidth="md"
      >
        {isSubmittedSuccess ? (
          <div className="py-6 px-2 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900">Thank You, {ownerName}!</h3>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                Special pricing for <span className="font-bold text-gray-900">{selectedPlan?.name}</span> ({selectedPlan?.price}) has been unblurred on this page.
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-left text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Lead forwarded to Super Admin</span>
              </div>
              <p className="text-amber-800 text-[11px]">
                Our restaurant specialist will call you at <span className="font-bold">{phone}</span> with onboarding details.
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="primary"
                onClick={() => setIsModalOpen(false)}
                className="w-full font-bold bg-gray-900 hover:bg-black text-white rounded-xl"
              >
                Close & View Unlocked Price
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            {/* Brand Header */}
            <div className="flex items-center justify-between p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-orange-500/30 shrink-0">
                  <Image src="/logo.png" alt="ServDesk Logo" fill className="object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">Plan: {selectedPlan?.name}</p>
                  <p className="text-[10px] text-amber-700 font-semibold">Special rates & free installation</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded-full">
                Instant Unlock
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Restaurant Name *"
                placeholder="e.g. Royal Spice Cafe"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                required
              />
              <Input
                label="Owner / Manager Name *"
                placeholder="e.g. Rahul Sharma"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Mobile Number *"
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Input
                label="Email Address *"
                type="email"
                placeholder="e.g. contact@restaurant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="City *"
                placeholder="e.g. Jaipur"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <Select
                label="Daily Orders"
                value={approxOrders}
                onChange={(e) => setApproxOrders(e.target.value)}
                options={[
                  { label: 'Under 50 orders/day', value: 'Under 50' },
                  { label: '50 - 150 orders/day', value: '50-150' },
                  { label: '150 - 300 orders/day', value: '150-300' },
                  { label: '300+ orders/day (High Volume)', value: '300+' },
                ]}
              />
            </div>

            <Input
              label="Additional Notes / Hardware Requirement (Optional)"
              placeholder="e.g. Need thermal printer & dual KDS screens"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-semibold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={isSubmitting}
                className="font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 border-0 shadow-md shadow-orange-500/20 text-xs sm:text-sm rounded-xl px-5"
              >
                <Lock className="w-3.5 h-3.5 mr-1.5" />
                Unlock Pricing Now
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
