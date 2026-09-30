import React from 'react';
import Link from 'next/link';
import { ChefHat, Mail, Phone, MapPin, ShieldCheck, Zap } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-[#0b0f17] text-slate-400 text-xs border-t border-slate-800/80 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-orange-500/20">
                <ChefHat className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight">Restro Counter</span>
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">POS & KDS System</span>
              </div>
            </Link>

            <p className="text-slate-400 leading-relaxed font-normal text-xs max-w-sm">
              High-velocity POS & real-time Kitchen Display System (KDS) built for modern counter-service restaurants, QSRs, food courts, and cafes.
            </p>

            {/* Live Operational Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All POS & KDS Systems Operational</span>
            </div>
          </div>

          {/* Solutions Column */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 text-orange-400">Products & Modules</h4>
            <ul className="space-y-2.5 font-medium">
              <li><Link href="/admin/pos" className="hover:text-amber-400 transition-colors">Counter POS Terminal</Link></li>
              <li><Link href="/admin/kitchen" className="hover:text-amber-400 transition-colors">Kitchen Display (KDS)</Link></li>
              <li><Link href="/admin/menu" className="hover:text-amber-400 transition-colors">Menu Management</Link></li>
              <li><Link href="/admin/dashboard" className="hover:text-amber-400 transition-colors">Sales & Reports Analytics</Link></li>
              <li><Link href="/super-admin" className="hover:text-amber-400 transition-colors">Multi-Outlet Admin</Link></li>
            </ul>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 text-orange-400">Company & Legal</h4>
            <ul className="space-y-2.5 font-medium">
              <li><Link href="/features" className="hover:text-amber-400 transition-colors">Features</Link></li>
              <li><Link href="/how-it-works" className="hover:text-amber-400 transition-colors">How It Works</Link></li>
              <li><Link href="/pricing" className="hover:text-amber-400 transition-colors">Pricing</Link></li>
              <li><Link href="/contact" className="hover:text-amber-400 transition-colors">Contact Support</Link></li>
              <li><Link href="/privacy" className="hover:text-amber-400 font-semibold text-amber-400/90 transition-colors flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact Info Column */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 text-orange-400">Contact Us</h4>
            <ul className="space-y-3 text-slate-300 font-medium">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-orange-400" />
                <span>+91 (800) 456-RESTRO</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-orange-400" />
                <span>support@restrocounter.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-orange-400" />
                <span>New Delhi, India</span>
              </li>
              <li className="pt-2 text-[11px] text-slate-400">
                Support Hours: 24/7 Live POS Assistance
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Legal Links Bar */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-[11px] font-medium">
          <p>© {new Date().getFullYear()} Restro Counter System. All rights reserved.</p>
          
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-amber-400 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/terms" className="hover:text-amber-400 transition-colors">
              Terms of Service
            </Link>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
