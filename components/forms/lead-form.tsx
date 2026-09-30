'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useApp } from '@/lib/context/app-context';
import { CheckCircle2, Sparkles, Send } from 'lucide-react';

const leadSchema = z.object({
  restaurantName: z.string().min(2, 'Restaurant name is required'),
  ownerName: z.string().min(2, 'Owner name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  email: z.string().email('Valid email address is required'),
  city: z.string().min(2, 'City is required'),
  approxOrdersPerDay: z.string().min(1, 'Please select approximate orders per day'),
  currentPos: z.string().optional(),
  message: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

export function LeadForm() {
  const { addLead } = useApp();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      approxOrdersPerDay: '50-150',
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    addLead(data);
    setSubmitted(true);
    reset();
  };

  if (submitted) {
    return (
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-emerald-200 shadow-xl text-center space-y-4 animate-in zoom-in-95 duration-300 max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm border border-emerald-200/80">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-[#172033]">Thank you! Demo request received.</h3>
        <p className="text-sm text-[#667085] max-w-md mx-auto leading-relaxed">
          Our restaurant onboarding specialist will contact you shortly to set up your personalized Restro Counter demo.
        </p>
        <Button
          variant="outline"
          size="md"
          onClick={() => setSubmitted(false)}
          className="mt-2 text-xs border-[#E7EAF0] text-[#172033] hover:bg-gray-50 rounded-xl"
        >
          Submit Another Demo Request
        </Button>
      </div>
    );
  }

  return (
    <form
      id="demo-form"
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-6 sm:p-10 rounded-3xl border border-[#E7EAF0] shadow-xl space-y-6 text-[#172033]"
    >
      <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200">
        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
        <span>Request Free Demo & Instant Access</span>
      </div>

      <div>
        <h3 className="text-2xl sm:text-3xl font-bold text-[#172033] tracking-tight">
          Transform Your Restaurant Counter
        </h3>
        <p className="text-xs sm:text-sm text-[#667085] mt-1 font-medium">
          Fill in the details below to test drive Restro Counter POS & KDS platform.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Restaurant Name *"
          placeholder="e.g. Spice Garden Restaurant"
          {...register('restaurantName')}
          error={errors.restaurantName?.message}
        />
        <Input
          label="Owner / Manager Name *"
          placeholder="e.g. Rahul Sharma"
          {...register('ownerName')}
          error={errors.ownerName?.message}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Phone Number *"
          placeholder="e.g. 9876543210"
          {...register('phone')}
          error={errors.phone?.message}
        />
        <Input
          label="Email Address *"
          type="email"
          placeholder="e.g. rahul@spicegarden.com"
          {...register('email')}
          error={errors.email?.message}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="City *"
          placeholder="e.g. New Delhi"
          {...register('city')}
          error={errors.city?.message}
        />
        <Select
          label="Approx. Orders Per Day *"
          options={[
            { label: 'Under 50 orders/day', value: '<50' },
            { label: '50 - 150 orders/day', value: '50-150' },
            { label: '150 - 300 orders/day', value: '150-300' },
            { label: '300+ orders/day', value: '300+' },
          ]}
          {...register('approxOrdersPerDay')}
          error={errors.approxOrdersPerDay?.message}
        />
      </div>

      <Input
        label="Current POS / Billing System (Optional)"
        placeholder="e.g. Petpooja, Vyapar, Manual Paper Bills"
        {...register('currentPos')}
        error={errors.currentPos?.message}
      />

      <div className="w-full">
        <label className="block text-xs font-bold text-[#172033] mb-1.5">
          Additional Requirements / Message (Optional)
        </label>
        <textarea
          rows={3}
          placeholder="Tell us about your counter setup or any specific features you need..."
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E7EAF0] rounded-xl text-[#172033] placeholder:text-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
          {...register('message')}
        />
      </div>

      <Button
        type="submit"
        isLoading={isSubmitting}
        className="w-full font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 py-3.5 h-12 text-sm rounded-xl gap-2 cursor-pointer"
      >
        <Send className="w-4 h-4" /> Request Demo
      </Button>
    </form>
  );
}
