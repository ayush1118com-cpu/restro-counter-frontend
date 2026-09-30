import React from 'react';
import { LeadForm } from '@/components/forms/lead-form';

export default function HowItWorksPage() {
  const steps = [
    { num: '01', title: 'Customer Walk-in & Order', desc: 'Customer approaches counter and selects items from menu board or display.' },
    { num: '02', title: 'Fast Counter POS Billing', desc: 'Counter staff adds items to POS screen in 2 taps with instant GST calculation.' },
    { num: '03', title: 'Instant Payment Settlement', desc: 'Payment is confirmed via UPI QR code, Cash, or Credit/Debit Card.' },
    { num: '04', title: 'Live Kitchen Ticket Dispatch', desc: 'Order routes instantly to Kitchen Display System (KDS) screen with chime alert.' },
    { num: '05', title: 'Kitchen Cooking & Timer', desc: 'Chef accepts order ticket and starts cooking with real-time stopwatch tracking.' },
    { num: '06', title: 'Order Pickup & Thermal Bill', desc: 'Chef marks Ready for pickup; staff hands over order & thermal bill receipt.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-4 py-1.5 rounded-full uppercase tracking-wider border border-amber-200">
          Workflow Architecture
        </span>
        <h1 className="text-4xl font-extrabold text-[#172033]">How Restro Counter Works</h1>
        <p className="text-[#667085] text-base">
          A seamless flow designed to eliminate delays between customer payment and kitchen preparation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((st, idx) => (
          <div key={idx} className="bg-white p-7 rounded-3xl border border-[#E7EAF0] shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white font-black flex items-center justify-center text-sm shadow-md shadow-amber-500/25">
                {st.num}
              </div>
              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                Step {idx + 1}
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#172033] mb-1.5">{st.title}</h3>
              <p className="text-xs sm:text-sm text-[#667085] leading-relaxed font-normal">{st.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto pt-8">
        <LeadForm />
      </div>
    </div>
  );
}
