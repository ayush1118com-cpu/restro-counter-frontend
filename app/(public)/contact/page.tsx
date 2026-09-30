import React from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { LeadForm } from '@/components/forms/lead-form';

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-wider">
          Get in Touch
        </span>
        <h1 className="text-4xl font-black text-gray-900">We'd Love to Hear From You</h1>
        <p className="text-gray-600 text-base">
          Have questions about onboarding your restaurant or request a customized software demo?
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
            
            <div className="space-y-4 text-xs text-gray-600">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900">Sales & Support</p>
                  <p>+91 (800) 456-RESTRO</p>
                  <p>+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900">Email Address</p>
                  <p>support@restrocounter.com</p>
                  <p>sales@restrocounter.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900">Headquarters</p>
                  <p>Restro Counter Technologies Pvt Ltd</p>
                  <p>Block C, Connaught Place, New Delhi 110001</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-900">Business Hours</p>
                  <p>Monday - Sunday: 9:00 AM - 10:00 PM IST</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <LeadForm />
        </div>
      </div>
    </div>
  );
}
