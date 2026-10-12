'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Modal } from '@/components/ui/modal';
import { useApp } from '@/lib/context/app-context';
import { KhataAccount, PaymentMethod } from '@/types';
import { formatINR, formatDate } from '@/lib/utils';
import {
  BookOpen,
  IndianRupee,
  User,
  Phone,
  CheckCircle2,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  QrCode,
  Banknote,
  CreditCard,
  History,
} from 'lucide-react';
import { toast } from 'sonner';

export default function KhataBookPage() {
  const { khataAccounts, recordKhataPayment } = useApp();
  const [search, setSearch] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<KhataAccount | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('CASH');
  const [payNotes, setPayNotes] = useState('');
  const [filterDueOnly, setFilterDueOnly] = useState(false);

  // Filter accounts by search and due status
  const filteredAccounts = (khataAccounts || []).filter((account) => {
    const matchesSearch =
      account.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (account.customerPhone && account.customerPhone.includes(search));
    const matchesDue = filterDueOnly ? account.totalDue > 0 : true;
    return matchesSearch && matchesDue;
  });

  // Overview metrics
  const totalOutstandingDue = (khataAccounts || []).reduce((acc, a) => acc + a.totalDue, 0);
  const totalRecoveredPaid = (khataAccounts || []).reduce((acc, a) => acc + a.totalPaid, 0);
  const accountsWithDue = (khataAccounts || []).filter((a) => a.totalDue > 0).length;

  const handleOpenPayment = (acc: KhataAccount) => {
    setSelectedAccount(acc);
    setPayAmount(acc.totalDue.toString());
    setPayMethod('CASH');
    setPayNotes('');
    setIsPayModalOpen(true);
  };

  const handleConfirmPay = () => {
    if (!selectedAccount) return;
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }
    if (amount > selectedAccount.totalDue) {
      toast.error(`Amount cannot exceed the total due of ${formatINR(selectedAccount.totalDue)}`);
      return;
    }

    recordKhataPayment(selectedAccount.id, amount, payMethod, payNotes);
    setIsPayModalOpen(false);
    setSelectedAccount(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-amber-500" />
            Khata Book / Customer Udhar Ledger
          </h2>
          <p className="text-xs text-gray-500">
            Track customer balances, credit dues, and partial payments in real-time
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-rose-200 bg-rose-50/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
                Total Pending Due (Baaki)
              </p>
              <h3 className="text-2xl font-black text-rose-700 mt-1">
                {formatINR(totalOutstandingDue)}
              </h3>
              <p className="text-[10px] text-rose-600 font-semibold mt-0.5">
                {accountsWithDue} customers with active dues
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
              <ArrowDownLeft className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                Total Recovered (Paid)
              </p>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">
                {formatINR(totalRecoveredPaid)}
              </h3>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                Collected via counter & Khata
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Total Registered Customers
              </p>
              <h3 className="text-2xl font-black text-gray-900 mt-1">
                {(khataAccounts || []).length}
              </h3>
              <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                Recorded via counter POS
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <User className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search by Customer Name or Mobile..."
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterDueOnly(!filterDueOnly)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              filterDueOnly
                ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {filterDueOnly ? '✓ Showing Due Only' : 'Show All Accounts'}
          </button>
        </div>
      </div>

      {/* Khata Customer Cards Grid */}
      {filteredAccounts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-gray-900">No Khata Records Found</h4>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            When you create an order in Counter POS and enter customer partial payment (e.g. ₹100 paid, ₹20 due),
            their ledger and balance will automatically appear here!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAccounts.map((account) => (
            <div
              key={account.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                account.totalDue > 0 ? 'border-rose-200 ring-1 ring-rose-100' : 'border-gray-100'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-gray-900 text-base truncate max-w-[180px]">
                    {account.customerName}
                  </h4>
                  {account.customerPhone && (
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {account.customerPhone}
                    </p>
                  )}
                </div>
                {account.totalDue > 0 ? (
                  <Badge variant="danger" className="text-xs font-black px-2.5 py-1">
                    Due: {formatINR(account.totalDue)}
                  </Badge>
                ) : (
                  <Badge variant="success" className="text-xs font-bold px-2.5 py-1">
                    All Settled ✓
                  </Badge>
                )}
              </div>

              {/* Balance Summary Box */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="text-[11px] text-gray-500 block font-medium">Pending Due</span>
                  <span className={`text-base font-black ${account.totalDue > 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                    {formatINR(account.totalDue)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 block font-medium">Total Paid</span>
                  <span className="text-base font-bold text-emerald-600">
                    {formatINR(account.totalPaid)}
                  </span>
                </div>
              </div>

              {/* Recent Transactions List */}
              <div className="space-y-1.5 py-1">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <History className="w-3.5 h-3.5" /> Recent Entries ({account.transactions.length})
                </p>
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {account.transactions.slice(0, 3).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-gray-50/70 border border-gray-100"
                    >
                      <div className="truncate max-w-[140px]">
                        <span className="font-semibold text-gray-800 block truncate">
                          {tx.notes || (tx.type === 'DUE_ADDED' ? 'Order Due Added' : 'Payment Received')}
                        </span>
                        <span className="text-[10px] text-gray-400">{formatDate(tx.createdAt)}</span>
                      </div>
                      <span
                        className={`font-black text-xs shrink-0 ${
                          tx.type === 'DUE_ADDED' ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {tx.type === 'DUE_ADDED' ? `+${formatINR(tx.amount)}` : `-${formatINR(tx.amount)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                {account.totalDue > 0 ? (
                  <Button
                    size="sm"
                    onClick={() => handleOpenPayment(account)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5 mr-1" /> Clear Due / Jama Karein
                  </Button>
                ) : (
                  <div className="w-full py-1.5 text-center text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-200/60">
                    No Pending Balance
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear Due Payment Modal */}
      {selectedAccount && (
        <Modal
          isOpen={isPayModalOpen}
          onClose={() => {
            setIsPayModalOpen(false);
            setSelectedAccount(null);
          }}
          title={`Accept Payment for ${selectedAccount.customerName}`}
          maxWidth="md"
        >
          <div className="space-y-5 py-2">
            {/* Account Summary Banner */}
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-rose-700 font-bold uppercase tracking-wider">Current Pending Due</p>
                <h3 className="text-2xl font-black text-rose-700 mt-0.5">
                  {formatINR(selectedAccount.totalDue)}
                </h3>
              </div>
              <div className="text-right text-xs text-gray-600">
                <p className="font-bold text-gray-900">{selectedAccount.customerName}</p>
                {selectedAccount.customerPhone && <p>{selectedAccount.customerPhone}</p>}
              </div>
            </div>

            {/* Payment Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-800">Payment Amount (₹)</label>
                <button
                  type="button"
                  onClick={() => setPayAmount(selectedAccount.totalDue.toString())}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  Pay Full ({formatINR(selectedAccount.totalDue)})
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-gray-500">₹</span>
                <input
                  type="number"
                  min="1"
                  max={selectedAccount.totalDue}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full pl-7 pr-3 py-2.5 text-base font-black text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Payment Instrument */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-800">Payment Instrument</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'CASH' as PaymentMethod, label: 'Cash', icon: Banknote },
                  { id: 'UPI' as PaymentMethod, label: 'UPI / QR', icon: QrCode },
                  { id: 'CARD' as PaymentMethod, label: 'Card', icon: CreditCard },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSel = payMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayMethod(m.id)}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        isSel
                          ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/30'
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSel ? 'text-amber-600' : 'text-gray-500'}`} />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-bold text-gray-800 block mb-1">
                Remarks / Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Paid cash at counter"
                value={payNotes}
                onChange={(e) => setPayNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setIsPayModalOpen(false);
                  setSelectedAccount(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleConfirmPay}
                className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
              >
                Accept ₹{payAmount || 0} & Update Khata
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
