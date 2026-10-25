'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Plus,
  Trash2,
  Printer,
  Users,
  ExternalLink,
  Sparkles,
  Building2,
  X,
  CheckCircle,
  Copy,
  Check,
  Globe,
  Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Restaurant, RestaurantTable } from '@/types';
import { useApp } from '@/lib/context/app-context';
import { APP_URL } from '@/lib/config';
import Swal from 'sweetalert2';

interface RestaurantTablesModalProps {
  restaurant: Restaurant | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RestaurantTablesModal({
  restaurant,
  isOpen,
  onClose,
}: RestaurantTablesModalProps) {
  const { getRestaurantTables, addTable, deleteTable, updateRestaurant } = useApp();

  const defaultDomain = APP_URL || 'https://restro-counter.vercel.app';

  const [tablesList, setTablesList] = useState<RestaurantTable[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newCapacity, setNewCapacity] = useState('4');
  const [copiedUrlTableId, setCopiedUrlTableId] = useState<string | null>(null);
  const [scannerBaseUrl, setScannerBaseUrl] = useState(defaultDomain);
  const [isEditingBaseUrl, setIsEditingBaseUrl] = useState(false);
  const isPrintingRef = useRef(false);

  // Sync tables whenever restaurant changes or modal opens
  useEffect(() => {
    if (restaurant && isOpen) {
      const loaded = getRestaurantTables(restaurant.id);
      setTablesList(loaded);
    }
  }, [restaurant, isOpen]);

  if (!restaurant || !isOpen) return null;

  const refreshTables = () => {
    const loaded = getRestaurantTables(restaurant.id);
    setTablesList(loaded);
  };

  const getTableOrderUrl = (tableNumber: string) => {
    const base = (scannerBaseUrl || defaultDomain).replace(/\/+$/, '');
    return `${base}/order/${restaurant.id}/${encodeURIComponent(tableNumber)}`;
  };

  const handleCopyUrl = (tbl: RestaurantTable) => {
    const url = getTableOrderUrl(tbl.tableNumber);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedUrlTableId(tbl.id);
      setTimeout(() => setCopiedUrlTableId(null), 2000);
    }
  };

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNumber.trim()) return;

    addTable(newTableNumber.trim(), parseInt(newCapacity, 10) || 4, restaurant.id);
    setNewTableNumber('');
    setNewCapacity('4');
    setShowAddForm(false);
    refreshTables();
  };

  const handleDeleteTable = (tbl: RestaurantTable) => {
    Swal.fire({
      title: `Delete ${tbl.tableNumber}?`,
      text: `Are you sure you want to remove ${tbl.tableNumber} from ${restaurant.name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      customClass: { popup: 'rounded-2xl font-sans' },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteTable(tbl.id, restaurant.id);
        refreshTables();
      }
    });
  };

  const handleToggleQrOrdering = async () => {
    const nextVal = !restaurant.hasTableQrOrdering;
    await updateRestaurant(restaurant.id, { hasTableQrOrdering: nextVal, tableQrEnabled: nextVal });
    restaurant.hasTableQrOrdering = nextVal;
    Swal.fire({
      icon: nextVal ? 'success' : 'info',
      title: nextVal ? 'Table QR Ordering Enabled!' : 'Table QR Ordering Disabled',
      text: nextVal
        ? `Table QR ordering & Table scanner stand is now ENABLED for ${restaurant.name}.`
        : `Table QR ordering is now DISABLED for ${restaurant.name}.`,
      timer: 2000,
      showConfirmButton: false,
      customClass: { popup: 'rounded-2xl font-sans' },
    });
  };

  // Print a single table stand
  const handlePrintSingleStand = (tbl: RestaurantTable) => {
    if (isPrintingRef.current) return;
    isPrintingRef.current = true;
    setTimeout(() => {
      isPrintingRef.current = false;
    }, 1500);

    const url = getTableOrderUrl(tbl.tableNumber);
    const printWindow = window.open('', '_blank', 'width=560,height=750');
    if (!printWindow) {
      window.print();
      return;
    }

    const svgElement = document.querySelector(`#qr-stand-svg-${tbl.id} svg`);
    const svgHtml = svgElement ? svgElement.outerHTML : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Table Stand - ${tbl.tableNumber} - ${restaurant.name}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @page { size: A5; margin: 8mm; }
            * { box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: #ffffff;
              color: #0f172a;
            }
            .stand {
              width: 340px;
              border: 3.5px solid #d97706;
              border-radius: 28px;
              padding: 32px 24px;
              text-align: center;
              box-shadow: 0 10px 25px rgba(0,0,0,0.06);
              background: #fff;
              position: relative;
            }
            .stand::before {
              content: "";
              position: absolute;
              top: 8px; left: 8px; right: 8px; bottom: 8px;
              border: 1px dashed #fcd34d;
              border-radius: 20px;
              pointer-events: none;
            }
            .welcome {
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 2px;
              text-transform: uppercase;
              color: #b45309;
              margin-bottom: 4px;
            }
            .restaurant {
              font-size: 24px;
              font-weight: 900;
              color: #0f172a;
              margin: 0 0 14px 0;
              line-height: 1.2;
            }
            .table-badge {
              display: inline-block;
              background: #f59e0b;
              color: #111827;
              font-size: 16px;
              font-weight: 900;
              padding: 7px 22px;
              border-radius: 9999px;
              margin-bottom: 18px;
              letter-spacing: 0.5px;
            }
            .qr-wrapper {
              background: #fff;
              border: 2px solid #fef3c7;
              border-radius: 22px;
              padding: 16px;
              display: inline-block;
              margin-bottom: 16px;
            }
            .cta {
              font-size: 14px;
              font-weight: 800;
              color: #1e293b;
              margin: 4px 0;
            }
            .sub-cta {
              font-size: 11px;
              color: #64748b;
              margin: 4px 0 16px 0;
              font-weight: 500;
            }
            .footer {
              border-top: 1px dashed #e2e8f0;
              padding-top: 12px;
              font-size: 10px;
              font-weight: 700;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
          </style>
        </head>
        <body>
          <div class="stand">
            <div class="welcome">Welcome To</div>
            <h1 class="restaurant">${restaurant.name}</h1>
            <div class="table-badge">🍽️ ${tbl.tableNumber}</div>
            <div class="qr-wrapper">
              ${svgHtml}
            </div>
            <div class="cta">📱 Scan Camera to Order</div>
            <div class="sub-cta">Browse Digital Menu • Instant Kitchen Dispatch</div>
            <div class="footer">ServDesk Fast POS • Table Self-Ordering</div>
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

  // Batch Print All Table Stands
  const handlePrintAllStands = () => {
    if (tablesList.length === 0 || isPrintingRef.current) return;
    isPrintingRef.current = true;
    setTimeout(() => {
      isPrintingRef.current = false;
    }, 2000);

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      window.print();
      return;
    }

    const standsHtml = tablesList
      .map((tbl) => {
        const svgElement = document.querySelector(`#qr-stand-svg-${tbl.id} svg`);
        const svgHtml = svgElement ? svgElement.outerHTML : '';

        return `
        <div class="page-break">
          <div class="stand">
            <div class="welcome">Welcome To</div>
            <h1 class="restaurant">${restaurant.name}</h1>
            <div class="table-badge">🍽️ ${tbl.tableNumber}</div>
            <div class="qr-wrapper">
              ${svgHtml}
            </div>
            <div class="cta">📱 Scan Camera to Order</div>
            <div class="sub-cta">Browse Digital Menu • Instant Kitchen Dispatch</div>
            <div class="footer">ServDesk Fast POS • Table Self-Ordering</div>
          </div>
        </div>
      `;
      })
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Batch QR Stands - ${restaurant.name}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @page { size: A5; margin: 10mm; }
            * { box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              margin: 0;
              background: #fff;
              color: #0f172a;
            }
            .page-break {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              page-break-after: always;
              break-after: page;
            }
            .stand {
              width: 340px;
              border: 3.5px solid #d97706;
              border-radius: 28px;
              padding: 32px 24px;
              text-align: center;
              background: #fff;
              position: relative;
            }
            .stand::before {
              content: "";
              position: absolute;
              top: 8px; left: 8px; right: 8px; bottom: 8px;
              border: 1px dashed #fcd34d;
              border-radius: 20px;
              pointer-events: none;
            }
            .welcome {
              font-size: 11px;
              font-weight: 800;
              letter-spacing: 2px;
              text-transform: uppercase;
              color: #b45309;
              margin-bottom: 4px;
            }
            .restaurant {
              font-size: 24px;
              font-weight: 900;
              color: #0f172a;
              margin: 0 0 14px 0;
              line-height: 1.2;
            }
            .table-badge {
              display: inline-block;
              background: #f59e0b;
              color: #111827;
              font-size: 16px;
              font-weight: 900;
              padding: 7px 22px;
              border-radius: 9999px;
              margin-bottom: 18px;
            }
            .qr-wrapper {
              background: #fff;
              border: 2px solid #fef3c7;
              border-radius: 22px;
              padding: 16px;
              display: inline-block;
              margin-bottom: 16px;
            }
            .cta {
              font-size: 14px;
              font-weight: 800;
              color: #1e293b;
              margin: 4px 0;
            }
            .sub-cta {
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
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          ${standsHtml}
          <script>
            var hasPrinted = false;
            function doPrint() {
              if (hasPrinted) return;
              hasPrinted = true;
              window.print();
              setTimeout(function() { window.close(); }, 800);
            }
            window.addEventListener('load', doPrint);
            setTimeout(doPrint, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden my-auto">
        {/* Modal Top Bar */}
        <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50/60 via-white to-purple-50/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-gray-900 text-lg leading-tight">
                  {restaurant.name}
                </h3>
                <span className="text-xs text-gray-400 font-semibold">• {restaurant.city}</span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Table QR Scanner Management & Printable Acrylic Stands
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Table QR Ordering Toggle Switch */}
            <button
              type="button"
              onClick={handleToggleQrOrdering}
              className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                restaurant.hasTableQrOrdering
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                  : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
              }`}
              title="Toggle customer table self-ordering feature"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  restaurant.hasTableQrOrdering ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                }`}
              />
              <span>Table QR: {restaurant.hasTableQrOrdering ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content / Controls Bar */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Live Scanner Domain Strip */}
          <div className="bg-purple-50/80 border border-purple-200/90 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 flex items-center gap-1.5 flex-wrap">
                  <span>Scanner Stand Live URL:</span>
                  <span className="font-mono text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200 text-[11px] truncate max-w-xs block">
                    {scannerBaseUrl}
                  </span>
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Ye base domain table QR stands me encode hoga taaki phone camera se scan karte hi direct live menu open ho.
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
              <span className="font-bold text-gray-700 shrink-0">Live Website Domain:</span>
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

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-200/80">
            <div className="flex items-center gap-2">
              <Badge variant="warning" className="bg-amber-100 text-amber-900 font-bold border-amber-300">
                {tablesList.length} Active Tables
              </Badge>
              <span className="text-xs text-gray-500 font-medium">
                Customer scans QR code &gt; Orders directly &gt; POS &amp; Kitchen receive instantly.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintAllStands}
                disabled={tablesList.length === 0}
                className="text-xs font-bold text-gray-700 bg-white border-gray-300 hover:bg-gray-100 shadow-2xs"
                title="Print all table stands together"
              >
                <Printer className="w-3.5 h-3.5 mr-1 text-gray-600" /> Print All Stands
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Table
              </Button>
            </div>
          </div>

          {/* Add Table Form Dropdown */}
          {showAddForm && (
            <form
              onSubmit={handleAddTable}
              className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row items-center gap-3 animate-fade-in"
            >
              <div className="flex-1 w-full sm:w-auto">
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Table Name / Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. Table 5, Rooftop 2, Balcony A"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white font-medium"
                  required
                />
              </div>

              <div className="w-full sm:w-32">
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Capacity (Persons)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-5 w-full sm:w-auto">
                <Button
                  type="submit"
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
                >
                  Save Table
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-gray-500"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Tables Grid */}
          {tablesList.length === 0 ? (
            <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-600">No tables created yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Click "+ Add Table" above to create table scanner stands for {restaurant.name}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {tablesList.map((tbl) => {
                const qrUrl = getTableOrderUrl(tbl.tableNumber);
                const isOccupied = tbl.status === 'OCCUPIED';

                return (
                  <div
                    key={tbl.id}
                    className="bg-white rounded-2xl border border-gray-200/80 p-4 flex flex-col justify-between hover:shadow-md transition-shadow relative group"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 font-black flex items-center justify-center text-xs border border-amber-200/60 shadow-2xs">
                          {tbl.tableNumber.replace(/[^0-9]/g, '') || 'T'}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-gray-900 leading-tight">
                            {tbl.tableNumber}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                            <Users className="w-2.5 h-2.5" /> {tbl.capacity || 4} Seater
                          </span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          isOccupied
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isOccupied ? 'Occupied' : 'Vacant'}
                      </span>
                    </div>

                    {/* QR Code Graphic Box */}
                    <div
                      id={`qr-stand-svg-${tbl.id}`}
                      className="my-3 p-3 bg-amber-50/30 rounded-xl border border-amber-100/80 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-amber-50/60 transition-colors"
                      onClick={() => handlePrintSingleStand(tbl)}
                      title="Click to print QR stand"
                    >
                      <QRCodeSVG
                        value={qrUrl}
                        size={120}
                        level="H"
                        includeMargin={false}
                        fgColor="#111827"
                        bgColor="transparent"
                      />
                      <p className="text-[10px] text-gray-500 font-medium mt-2 flex items-center gap-1">
                        <Printer className="w-3 h-3 text-amber-600" /> Click to print stand
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1 text-xs">
                      {/* Copy Direct Ordering Link */}
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(tbl)}
                        className="px-2 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 font-semibold text-[10px] flex items-center gap-1 transition-colors"
                        title="Copy Customer Ordering Link"
                      >
                        {copiedUrlTableId === tbl.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-gray-400" /> Link
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-1">
                        {/* Test URL in new tab */}
                        <a
                          href={qrUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Open Table Self-Order page in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {/* Print Stand Button */}
                        <button
                          type="button"
                          onClick={() => handlePrintSingleStand(tbl)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Print Stand"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Table */}
                        <button
                          type="button"
                          onClick={() => handleDeleteTable(tbl)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Remove Table"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Real-time Live Table Sync</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs font-bold text-gray-700 bg-white"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
