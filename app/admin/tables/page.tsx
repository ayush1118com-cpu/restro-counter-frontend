'use client';

import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Plus,
  Trash2,
  Printer,
  Users,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  UtensilsCrossed,
  ArrowRight,
  Globe,
  Settings2,
} from 'lucide-react';
import { useApp } from '@/lib/context/app-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { RestaurantTable } from '@/types';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { APP_URL } from '@/lib/config';

export default function AdminTablesPage() {
  const { tables, addTable, deleteTable, updateTableStatus, currentRestaurant, currentUser, orders } = useApp();

  const defaultDomain = APP_URL || 'https://restro-counter.vercel.app';

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newCapacity, setNewCapacity] = useState('4');
  const [selectedTableForQr, setSelectedTableForQr] = useState<RestaurantTable | null>(null);
  const [scannerBaseUrl, setScannerBaseUrl] = useState(defaultDomain);
  const [isEditingBaseUrl, setIsEditingBaseUrl] = useState(false);
  const isPrintingRef = useRef(false);

  const restaurantId = currentUser?.restaurantId || currentRestaurant?.id || 'rest_1';
  const restaurantName = currentRestaurant?.name || currentUser?.restaurantName || 'Restaurant Counter';

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber.trim()) return;

    addTable(newTableNumber.trim(), parseInt(newCapacity, 10) || 4);
    setNewTableNumber('');
    setNewCapacity('4');
    setIsAddModalOpen(false);
  };

  const getTableOrderUrl = (tableNumber: string) => {
    const base = (scannerBaseUrl || defaultDomain).replace(/\/+$/, '');
    return `${base}/order/${restaurantId}/${encodeURIComponent(tableNumber)}`;
  };

  const handlePrintQr = () => {
    if (!selectedTableForQr || isPrintingRef.current) return;
    isPrintingRef.current = true;
    setTimeout(() => {
      isPrintingRef.current = false;
    }, 1500);

    const url = getTableOrderUrl(selectedTableForQr.tableNumber);
    const printWindow = window.open('', '_blank', 'width=520,height=680');
    if (!printWindow) {
      window.print();
      return;
    }

    const svgElement = document.querySelector('#printable-table-card svg');
    const svgHtml = svgElement ? svgElement.outerHTML : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Stand - ${selectedTableForQr.tableNumber} - ${restaurantName}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @page { size: auto; margin: 10mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #fff;
              color: #111827;
            }
            .card {
              width: 320px;
              border: 3px solid #f59e0b;
              border-radius: 24px;
              padding: 28px 24px;
              text-align: center;
              box-shadow: 0 4px 16px rgba(0,0,0,0.06);
              background: #ffffff;
            }
            .subtitle {
              font-size: 11px;
              font-weight: 800;
              color: #d97706;
              letter-spacing: 2px;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .restaurant {
              font-size: 22px;
              font-weight: 900;
              color: #0f172a;
              margin: 0 0 14px 0;
            }
            .badge {
              display: inline-block;
              background: #f59e0b;
              color: #000;
              font-size: 14px;
              font-weight: 900;
              padding: 6px 18px;
              border-radius: 9999px;
              margin-bottom: 18px;
            }
            .qr-box {
              padding: 16px;
              background: #ffffff;
              border: 2px solid #fef3c7;
              border-radius: 20px;
              display: inline-block;
              margin-bottom: 16px;
            }
            .instructions {
              font-size: 13px;
              font-weight: 700;
              color: #1e293b;
              margin: 4px 0;
            }
            .subtext {
              font-size: 11px;
              color: #64748b;
              margin: 4px 0 16px 0;
            }
            .footer {
              border-top: 1px dashed #e2e8f0;
              padding-top: 12px;
              font-size: 10px;
              font-weight: 700;
              color: #94a3b8;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="subtitle">Welcome To</div>
            <h1 class="restaurant">${restaurantName}</h1>
            <div class="badge">🍽️ ${selectedTableForQr.tableNumber}</div>
            <div class="qr-box">
              ${svgHtml}
            </div>
            <div class="instructions">📱 Scan with Camera to Order</div>
            <div class="subtext">Browse Menu • Order Food • Live Tracking</div>
            <div class="footer">Powered by ServDesk Restaurant POS</div>
          </div>
          <script>
            var hasPrinted = false;
            function doPrint() {
              if (hasPrinted) return;
              hasPrinted = true;
              window.print();
              setTimeout(function() { window.close(); }, 600);
            }
            window.addEventListener('load', doPrint);
            setTimeout(doPrint, 400);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Strict RBAC: Check if Super Admin turned off Table QR for this restaurant
  const isTableQrDisabled = currentRestaurant?.hasTableQrOrdering === false;

  if (isTableQrDisabled) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-gray-200 shadow-sm max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
          <QrCode className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Table QR Ordering is Disabled</h2>
        <p className="text-gray-600 text-sm max-w-md mb-6 leading-relaxed">
          Super Admin has currently disabled Table Management & QR Self-Ordering for <strong>{restaurantName}</strong>. Please contact your Super Administrator to activate this module.
        </p>
        <div className="flex gap-3">
          <Link href="/admin/dashboard">
            <Button variant="primary">Return to Dashboard</Button>
          </Link>
          <Link href="/admin/pos">
            <Button variant="outline">Go to Counter POS</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Tables & QR Codes</h2>
            <Badge variant="warning" className="bg-amber-100 text-amber-900 border-amber-300">
              <Sparkles className="w-3 h-3 mr-1 text-amber-600" /> Digital Self-Order
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Generate printable QR codes for dining tables. Customers scan and order directly from their phone.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="font-bold shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1" /> Add New Table
          </Button>
        </div>
      </div>

      {/* Live Scanner Domain Strip */}
      <div className="bg-purple-50/80 border border-purple-200/90 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 flex items-center gap-1.5 flex-wrap">
              <span>Table QR Stand Base URL:</span>
              <span className="font-mono text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200 text-[11px] truncate max-w-xs block">
                {scannerBaseUrl}
              </span>
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Ye base domain sabhi tables ke QR stands me encode hota hai taaki phone se direct live order page khule.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setScannerBaseUrl('http://172.20.10.3:3000')}
            className="text-[10px] font-bold text-purple-700 bg-white hover:bg-purple-100 border border-purple-200 px-2 py-1 h-7"
            title="Use local Wi-Fi IP to test scanning from phone connected to same Wi-Fi"
          >
            Wi-Fi IP (Phone Test)
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditingBaseUrl(!isEditingBaseUrl)}
            className="text-[10px] font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 px-2 py-1 h-7"
          >
            <Settings2 className="w-3 h-3 mr-1 text-gray-500" /> Edit URL
          </Button>
        </div>
      </div>

      {isEditingBaseUrl && (
        <div className="p-3 bg-white rounded-xl border border-purple-300 shadow-xs flex items-center gap-2 animate-fade-in text-xs">
          <span className="font-bold text-gray-700 shrink-0">Live Production Domain:</span>
          <input
            type="text"
            value={scannerBaseUrl}
            onChange={(e) => setScannerBaseUrl(e.target.value)}
            placeholder="e.g. https://your-live-domain.com or http://172.20.10.3:3000"
            className="flex-1 px-3 py-1.5 border border-purple-300 rounded-lg text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsEditingBaseUrl(false)}
            className="text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold h-7"
          >
            Apply URL
          </Button>
        </div>
      )}

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((tbl) => {
          const qrUrl = getTableOrderUrl(tbl.tableNumber);
          const isOccupied = tbl.status === 'OCCUPIED';

          // Check if table currently has an active order
          const activeOrder = orders.find(
            (o) =>
              o.tableNumber?.toLowerCase() === tbl.tableNumber.toLowerCase() &&
              (o.status === 'NEW' || o.status === 'ACCEPTED' || o.status === 'PREPARING' || o.status === 'READY')
          );

          return (
            <div
              key={tbl.id}
              className={`bg-white rounded-2xl border p-4.5 flex flex-col justify-between transition-all hover:shadow-md ${
                isOccupied
                  ? 'border-amber-300 ring-2 ring-amber-400/20 shadow-sm'
                  : 'border-gray-200/90 hover:border-gray-300'
              }`}
            >
              <div>
                {/* Table Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 font-black flex items-center justify-center text-sm border border-amber-200/60 shadow-2xs">
                      {tbl.tableNumber.replace(/[^0-9]/g, '') || 'T'}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">{tbl.tableNumber}</h3>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Users className="w-3 h-3 text-gray-400" /> {tbl.capacity || 4} Seater
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isOccupied
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isOccupied ? 'Occupied' : 'Vacant'}
                  </span>
                </div>

                {/* QR Code Preview Box */}
                <div className="my-4 p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center group cursor-pointer"
                  onClick={() => setSelectedTableForQr(tbl)}
                >
                  <div className="bg-white p-2.5 rounded-xl shadow-xs border border-gray-200/80 group-hover:scale-105 transition-transform duration-200">
                    <QRCodeSVG
                      value={qrUrl}
                      size={110}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 mt-2 flex items-center gap-1 group-hover:text-amber-600">
                    <Eye className="w-3 h-3" /> Click to View & Print Card
                  </p>
                </div>

                {/* Active Order Notice if Occupied */}
                {activeOrder && (
                  <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-xs mb-3 space-y-0.5">
                    <p className="font-bold text-amber-950 flex items-center justify-between">
                      <span>Order #{activeOrder.orderNumber}</span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-black">
                        {activeOrder.status}
                      </span>
                    </p>
                    <p className="text-[11px] text-amber-800 truncate">
                      {activeOrder.customerName} • ₹{activeOrder.total}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTableForQr(tbl)}
                  className="flex-1 text-xs font-bold"
                >
                  <Printer className="w-3.5 h-3.5 mr-1 text-gray-500" /> Print Stand
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const next = isOccupied ? 'VACANT' : 'OCCUPIED';
                    updateTableStatus(tbl.id, next);
                  }}
                  className={`text-xs font-bold px-2.5 ${
                    isOccupied ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'
                  }`}
                  title={isOccupied ? 'Mark as Vacant' : 'Mark as Occupied'}
                >
                  {isOccupied ? 'Free' : 'Occupy'}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    Swal.fire({
                      title: `Delete ${tbl.tableNumber}?`,
                      text: 'Table and its QR ordering link will be removed.',
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonText: 'Yes, Delete',
                      cancelButtonText: 'Cancel',
                      confirmButtonColor: '#e11d48',
                      customClass: { popup: 'rounded-2xl font-sans' },
                    }).then((result) => {
                      if (result.isConfirmed) {
                        deleteTable(tbl.id);
                      }
                    });
                  }}
                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Table Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Dining Table"
        maxWidth="sm"
      >
        <form onSubmit={handleAddTable} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Table Name / Number <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Table 5, Rooftop 1, Corner Booth"
              value={newTableNumber}
              onChange={(e) => setNewTableNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Seating Capacity (Guests)
            </label>
            <select
              value={newCapacity}
              onChange={(e) => setNewCapacity(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold bg-white"
            >
              <option value="2">2 Seater</option>
              <option value="4">4 Seater</option>
              <option value="6">6 Seater</option>
              <option value="8">8 Seater</option>
              <option value="12">Large Party (12+)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="font-bold">
              Save Table
            </Button>
          </div>
        </form>
      </Modal>

      {/* Printable QR Card Modal */}
      {selectedTableForQr && (
        <Modal
          isOpen={!!selectedTableForQr}
          onClose={() => setSelectedTableForQr(null)}
          title="Printable QR Table Stand"
          maxWidth="sm"
        >
          <div className="space-y-4">
            {/* The Printable Table Card Template */}
            <div
              id="printable-table-card"
              className="bg-gradient-to-b from-amber-50/70 via-white to-orange-50/60 p-6 rounded-2xl border-2 border-amber-300 text-center space-y-4 shadow-sm"
            >
              <div>
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                  WELCOME TO
                </p>
                <h2 className="text-xl font-black text-gray-900 tracking-tight mt-0.5">
                  {restaurantName}
                </h2>
              </div>

              <div className="inline-block bg-amber-500 text-slate-950 px-4 py-1.5 rounded-full font-black text-sm shadow-xs">
                🍽️ {selectedTableForQr.tableNumber}
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-4 rounded-2xl shadow-md border border-amber-200 inline-block mx-auto">
                <QRCodeSVG
                  value={getTableOrderUrl(selectedTableForQr.tableNumber)}
                  size={160}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-900 flex items-center justify-center gap-1">
                  <span>📱 Scan with Camera to Order</span>
                </p>
                <p className="text-[10px] text-gray-500">
                  Browse digital menu • Place live order • No app download required
                </p>
              </div>

              <div className="pt-2 border-t border-amber-200/60">
                <p className="text-[9px] font-bold text-gray-400">
                  Powered by ServDesk Restaurant POS
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={handlePrintQr}
                className="flex-1 font-bold shadow-md shadow-amber-500/20"
              >
                <Printer className="w-4 h-4 mr-1.5" /> Print Table Stand
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  const url = getTableOrderUrl(selectedTableForQr.tableNumber);
                  window.open(url, '_blank');
                }}
                className="font-semibold text-xs"
                title="Test customer order page in new tab"
              >
                <ExternalLink className="w-4 h-4 mr-1" /> Test URL
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
