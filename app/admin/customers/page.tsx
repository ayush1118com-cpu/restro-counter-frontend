'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Modal } from '@/components/ui/modal';
import { useApp } from '@/lib/context/app-context';
import { Order, KhataAccount } from '@/types';
import { formatINR, formatDate, formatTime } from '@/lib/utils';
import {
  Users,
  User,
  Phone,
  ShoppingBag,
  IndianRupee,
  Clock,
  History,
  BookOpen,
  ArrowRight,
  UtensilsCrossed,
  Calendar,
  Eye,
  Car,
} from 'lucide-react';
import { OrderDetailsModal } from '@/components/pos/order-details-modal';
import Link from 'next/link';

export interface AggregatedCustomer {
  id: string; // phone or normalized name
  name: string;
  phone?: string;
  vehicleNumber?: string;
  totalOrders: number;
  totalSpent: number;
  pendingDue: number;
  lastVisit: string;
  orders: Order[];
}

export default function AdminCustomersPage() {
  const { orders, khataAccounts, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<AggregatedCustomer | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [filterDueOnly, setFilterDueOnly] = useState(false);

  // Group and aggregate customers strictly for the current restaurant admin
  const customers = useMemo(() => {
    const customerMap = new Map<string, AggregatedCustomer>();

    // 1. Process all orders belonging to this restaurant
    orders.forEach((o) => {
      // Must have at least customerName or customerPhone
      const rawName = (o.customerName || '').trim();
      const rawPhone = (o.customerPhone || '').trim();

      if (!rawName && !rawPhone) return;

      // Unique identifier priority: phone number > lowercased name
      const key = rawPhone ? `phone_${rawPhone}` : `name_${rawName.toLowerCase()}`;

      if (!customerMap.has(key)) {
        customerMap.set(key, {
          id: key,
          name: rawName || 'Valued Guest',
          phone: rawPhone || undefined,
          vehicleNumber: o.vehicleNumber || undefined,
          totalOrders: 0,
          totalSpent: 0,
          pendingDue: 0,
          lastVisit: o.createdAt,
          orders: [],
        });
      }

      const cust = customerMap.get(key)!;
      cust.totalOrders += 1;
      cust.totalSpent += (o.total || 0);
      cust.orders.push(o);

      if (o.vehicleNumber && !cust.vehicleNumber) {
        cust.vehicleNumber = o.vehicleNumber;
      }
      if (rawName && (!cust.name || cust.name === 'Valued Guest')) {
        cust.name = rawName;
      }

      // Track latest visit
      if (new Date(o.createdAt).getTime() > new Date(cust.lastVisit).getTime()) {
        cust.lastVisit = o.createdAt;
      }
    });

    // 2. Link Khata Accounts (pending dues/udhar balances)
    (khataAccounts || []).forEach((ka: KhataAccount) => {
      const rawName = (ka.customerName || '').trim();
      const rawPhone = (ka.customerPhone || '').trim();
      const key = rawPhone ? `phone_${rawPhone}` : `name_${rawName.toLowerCase()}`;

      if (customerMap.has(key)) {
        const cust = customerMap.get(key)!;
        cust.pendingDue = ka.totalDue || 0;
      } else if (rawName || rawPhone) {
        // Customer exists in Khata book
        customerMap.set(key, {
          id: key,
          name: rawName || 'Khata Guest',
          phone: rawPhone || undefined,
          totalOrders: ka.ordersCount || 0,
          totalSpent: (ka.totalPaid || 0) + (ka.totalDue || 0),
          pendingDue: ka.totalDue || 0,
          lastVisit: ka.lastUpdated || new Date().toISOString(),
          orders: [],
        });
      }
    });

    // Sort by latest visit
    return Array.from(customerMap.values()).sort(
      (a, b) => new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
    );
  }, [orders, khataAccounts]);

  // Search filter
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search)) ||
        (c.vehicleNumber && c.vehicleNumber.toLowerCase().includes(search.toLowerCase()));

      const matchesDue = filterDueOnly ? c.pendingDue > 0 : true;

      return matchesSearch && matchesDue;
    });
  }, [customers, search, filterDueOnly]);

  // Overall metrics
  const totalCustomersCount = customers.length;
  const totalCustomerSpend = customers.reduce((acc, c) => acc + c.totalSpent, 0);
  const totalCustomerDues = customers.reduce((acc, c) => acc + c.pendingDue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-amber-500" />
            Customer Directory
          </h2>
          <p className="text-xs text-gray-500">
            Registered customers and guest visit histories for{' '}
            <strong className="text-gray-900">{currentUser?.restaurantName || 'your outlet'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/khata">
            <Button variant="outline" size="sm" className="font-bold border-amber-300 text-amber-700 bg-amber-50/50">
              <BookOpen className="w-4 h-4 mr-1.5" /> Open Khata Book
            </Button>
          </Link>
          <Link href="/admin/pos">
            <Button variant="primary" size="sm" className="font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm">
              <ShoppingBag className="w-4 h-4 mr-1.5" /> New Order POS
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-gray-200 bg-white shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Customers</p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">{totalCustomersCount}</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Recorded across all counter orders</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/50 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Total Revenue from Customers</p>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">{formatINR(totalCustomerSpend)}</h3>
              <p className="text-[10px] text-emerald-600 mt-0.5">Subtotal & taxes included</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-300/60 flex items-center justify-center font-bold">
              <IndianRupee className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-rose-50/50 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Outstanding Khata Dues</p>
              <h3 className="text-2xl font-black text-rose-700 mt-1">{formatINR(totalCustomerDues)}</h3>
              <p className="text-[10px] text-rose-600 mt-0.5">Pending credit to be collected</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 border border-rose-300/60 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="w-full sm:w-96">
          <SearchInput
            placeholder="Search by customer name, phone number, or vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={filterDueOnly ? 'danger' : 'outline'}
            size="sm"
            onClick={() => setFilterDueOnly(!filterDueOnly)}
            className="text-xs font-bold"
          >
            {filterDueOnly ? 'Showing: Has Due Only' : 'Filter: Has Khata Due'}
          </Button>
        </div>
      </div>

      {/* Customers List / Table */}
      {filteredCustomers.length === 0 ? (
        <Card className="p-12 text-center bg-white border-dashed border-2 border-gray-200">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 mx-auto flex items-center justify-center mb-3 border border-amber-200/60">
            <Users className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-gray-900">No Customers Found</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            {search
              ? `No customer matching "${search}". Try searching with a different name or number.`
              : 'Add customer names or phone numbers when generating orders at the Counter POS to see them here.'}
          </p>
          <div className="mt-4">
            <Link href="/admin/pos">
              <Button variant="primary" size="sm" className="font-bold bg-amber-500 hover:bg-amber-600 text-white">
                Go to Counter POS
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((cust) => (
            <Card
              key={cust.id}
              className="bg-white border-gray-200 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => setSelectedCustomer(cust)}
            >
              <CardContent className="p-4 space-y-3">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-amber-600 transition-colors">
                        {cust.name}
                      </h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1 font-medium mt-0.5">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {cust.phone || 'No phone provided'}
                      </p>
                    </div>
                  </div>

                  {cust.pendingDue > 0 && (
                    <Badge variant="danger" className="text-[10px] font-bold shrink-0">
                      Due: {formatINR(cust.pendingDue)}
                    </Badge>
                  )}
                </div>

                {/* Details Pills */}
                {cust.vehicleNumber && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider">
                    <Car className="w-3 h-3" /> {cust.vehicleNumber}
                  </div>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 block uppercase">Total Orders</span>
                    <span className="font-extrabold text-gray-900">{cust.totalOrders} Orders</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-gray-400 block uppercase">Total Spent</span>
                    <span className="font-extrabold text-emerald-600">{formatINR(cust.totalSpent)}</span>
                  </div>
                </div>

                {/* Footer timestamp & action */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-gray-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Last: {formatDate(cust.lastVisit)}
                  </span>
                  <span className="text-amber-600 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    View Orders <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Customer Order History Detail Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title={`Customer Profile: ${selectedCustomer.name}`}
          maxWidth="lg"
        >
          <div className="space-y-5 py-2">
            {/* Header customer summary */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-gray-900 text-base">{selectedCustomer.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-600">
                    <span className="flex items-center gap-1 font-medium">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {selectedCustomer.phone || 'No Phone Number'}
                    </span>
                    {selectedCustomer.vehicleNumber && (
                      <span className="px-1.5 py-0.5 bg-white border border-amber-300 rounded text-amber-900 font-bold text-[10px]">
                        🚗 {selectedCustomer.vehicleNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Total Spend</span>
                  <span className="text-base font-black text-emerald-600">{formatINR(selectedCustomer.totalSpent)}</span>
                </div>
                {selectedCustomer.pendingDue > 0 && (
                  <div className="border-l border-amber-200 pl-3">
                    <span className="text-[10px] uppercase font-bold text-rose-500 block">Khata Due</span>
                    <span className="text-base font-black text-rose-600">{formatINR(selectedCustomer.pendingDue)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Past orders by this customer */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                <History className="w-4 h-4 text-amber-500" /> Order History ({selectedCustomer.orders.length})
              </h4>

              {selectedCustomer.orders.length === 0 ? (
                <p className="text-xs text-gray-500 p-4 bg-gray-50 rounded-xl text-center">
                  Orders were recorded in the Khata book or previous sessions.
                </p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {selectedCustomer.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3 bg-white border border-gray-200 rounded-xl flex items-center justify-between hover:border-amber-300 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-gray-900">#{ord.orderNumber}</span>
                          <Badge
                            variant={
                              ord.status === 'READY' || ord.status === 'COMPLETED'
                                ? 'success'
                                : ord.status === 'CANCELLED'
                                ? 'danger'
                                : 'warning'
                            }
                            className="text-[10px] py-0"
                          >
                            {ord.status}
                          </Badge>
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                            {ord.paymentMethod}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500">
                          {formatDate(ord.createdAt)} at {formatTime(ord.createdAt)} • {ord.items.length} items
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-black text-gray-900 text-sm">{formatINR(ord.total)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedOrderDetails(ord)}
                          title="View Order Details"
                          className="h-8 w-8 text-gray-600 hover:text-amber-600 hover:bg-amber-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="md" onClick={() => setSelectedCustomer(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Nested Order Details Modal */}
      {selectedOrderDetails && (
        <OrderDetailsModal
          isOpen={!!selectedOrderDetails}
          onClose={() => setSelectedOrderDetails(null)}
          order={selectedOrderDetails}
        />
      )}
    </div>
  );
}
