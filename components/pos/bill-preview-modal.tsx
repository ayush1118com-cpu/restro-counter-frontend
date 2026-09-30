'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Order } from '@/types';
import { formatINR, formatDate } from '@/lib/utils';
import { Printer, Download, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/lib/context/app-context';

export interface BillPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export function BillPreviewModal({ isOpen, onClose, order }: BillPreviewModalProps) {
  const { currentUser, restaurants } = useApp();

  if (!order) return null;

  // ====== RESTAURANT DATA FOR BILL ======
  // Priority: match by restaurantId > match by email > match by phone > first restaurant in list
  const STALE_NAMES = ['Spice Garden Restaurant', 'Spice Garden', 'Counter Restaurant Outlet', 'Restro Counter Outlet'];

  const activeRestaurant =
    restaurants.find((r) => r.id === currentUser?.restaurantId) ||
    restaurants.find((r) => r.email === currentUser?.email) ||
    restaurants.find((r) => r.phone === currentUser?.phone) ||
    (restaurants.length > 0 ? restaurants[0] : null);

  // Restaurant Name: always use the ACTUAL restaurant record name
  const displayName = activeRestaurant?.name
    || (currentUser?.restaurantName && !STALE_NAMES.includes(currentUser.restaurantName) ? currentUser.restaurantName : null)
    || (currentUser?.name ? `${currentUser.name.replace(/\s*\(Counter Admin\)/i, '').replace(/\s*\(Admin\)/i, '').trim()}'s Restaurant` : 'Restaurant Counter');

  // Address: always from restaurant record
  const displayAddress = activeRestaurant
    ? `${activeRestaurant.address}, ${activeRestaurant.city}`
    : 'Counter Outlet';

  // Phone: always from restaurant record
  const displayPhone = activeRestaurant?.phone || currentUser?.phone || '';

  const handlePrint = () => {
    const printContent = document.getElementById('printable-receipt');
    if (!printContent) return;
    
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(`
        <html>
          <head>
            <title>Print Bill</title>
            <style>
              @page { size: 80mm auto; margin: 0; }
              body { 
                font-family: monospace; 
                width: 80mm; 
                margin: 0; 
                padding: 15px; 
                color: black; 
                background: white; 
              }
              * { box-sizing: border-box; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .font-bold, .font-black { font-weight: bold; }
              .uppercase { text-transform: uppercase; }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              .border-b { border-bottom: 1px dashed #000; }
              .border-dashed { border-style: dashed; }
              .border-gray-400, .border-gray-300 { border-color: #000 !important; }
              .py-2 { padding-top: 8px; padding-bottom: 8px; }
              .py-3 { padding-top: 12px; padding-bottom: 12px; }
              .pt-2 { padding-top: 8px; }
              .pb-2 { padding-bottom: 8px; }
              .pb-4 { padding-bottom: 16px; }
              .my-2 { margin-top: 8px; margin-bottom: 8px; }
              .mb-1 { margin-bottom: 4px; }
              .mt-1 { margin-top: 4px; }
              .mt-4 { margin-top: 16px; }
              .space-y-1 > * + * { margin-top: 4px; }
              .space-y-2 > * + * { margin-top: 8px; }
              .space-y-4 > * + * { margin-top: 16px; }
              .text-xs { font-size: 12px; }
              .text-sm { font-size: 14px; }
              .text-base { font-size: 16px; }
              p, h3 { margin: 0; }
              svg { display: none; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      iframeDoc.close();
      
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 500);
      }, 250);
    }
  };

  const handleDownload = () => {
    const textContent = `
========================================
   ${displayName.toUpperCase()}
   ${displayAddress}
   ${displayPhone ? `Phone: ${displayPhone}` : ''}
========================================
Order #${order.orderNumber}
Date: ${formatDate(order.createdAt)}
Payment Method: ${order.paymentMethod} (${order.paymentStatus})
----------------------------------------
${order.items.map((i) => `${i.name.padEnd(20)} ${i.quantity} x ${formatINR(i.price)} = ${formatINR(i.quantity * i.price)}`).join('\n')}
----------------------------------------
Subtotal:    ${formatINR(order.subtotal)}
Tax (5% GST): ${formatINR(order.tax)}
Discount:    ${formatINR(order.discount)}
TOTAL:       ${formatINR(order.total)}
========================================
   Thank you! Please visit again.
========================================
    `;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bill_Order_${order.orderNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tax Invoice & Bill Preview" maxWidth="md">
      <div className="space-y-6">
        {/* Printable Bill Area */}
        <div
          id="printable-receipt"
          className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs font-mono text-xs text-gray-900 space-y-4"
        >
          {/* Header */}
          <div className="text-center space-y-1 border-b border-dashed border-gray-400 pb-4">
            <h3 className="text-base font-black uppercase tracking-wider font-sans text-gray-900">
              {displayName}
            </h3>
            <p className="text-xs font-semibold text-gray-800">{displayAddress}</p>
            <p className="text-xs font-semibold text-gray-800">Ph: {displayPhone} | GSTIN: 07AAAAA0000A1Z5</p>
          </div>

          {/* Order Details */}
          <div className="flex items-center justify-between text-gray-900 py-1.5 border-b border-dashed border-gray-400">
            <div>
              <p className="font-bold text-gray-900 text-sm">Order #{order.orderNumber}</p>
              <p className="text-xs font-semibold text-gray-700">{formatDate(order.createdAt)}</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-900 text-[11px] font-extrabold rounded-full uppercase border border-emerald-300">
                PAID VIA {order.paymentMethod}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2 py-2">
            <div className="flex justify-between font-bold text-gray-900 border-b border-gray-400 pb-1">
              <span>Item Description</span>
              <span>Qty × Price</span>
              <span>Amount</span>
            </div>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-gray-900 font-semibold">
                <span className="truncate max-w-[140px] font-bold">{item.name}</span>
                <span className="text-gray-800">
                  {item.quantity} × {formatINR(item.price)}
                </span>
                <span className="font-extrabold text-gray-900">{formatINR(item.quantity * item.price)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-dashed border-gray-400 pt-3 space-y-1 text-gray-900 font-semibold">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold">{formatINR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (5% GST)</span>
              <span className="font-bold">{formatINR(order.tax)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Discount</span>
                <span>-{formatINR(order.discount)}</span>
              </div>
            )}
            <div className="border-t-2 border-gray-900 pt-2 flex justify-between font-black text-base text-gray-900">
              <span>TOTAL</span>
              <span>{formatINR(order.total)}</span>
            </div>
          </div>

          {/* Footer message */}
          <div className="text-center pt-4 border-t border-dashed border-gray-400 text-xs text-gray-800 font-sans">
            <p className="font-bold text-gray-900">Thank you for dining with us!</p>
            <p>Visit again soon for fresh counter meals.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 print:hidden">
          <Button variant="outline" size="md" onClick={handleDownload}>
            <Download className="w-4 h-4" /> Download Bill
          </Button>
          <Button variant="primary" size="md" onClick={handlePrint} className="font-bold shadow-md shadow-amber-500/20">
            <Printer className="w-4 h-4" /> Print Bill
          </Button>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 0;
            margin: 0;
            font-size: 12px;
            color: black;
          }
        }
      `}} />
    </Modal>
  );
}



