'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Order, MenuItem, PaymentMethod } from '@/types';
import { formatINR } from '@/lib/utils';
import { useApp } from '@/lib/context/app-context';
import { Search, Plus, Minus, Trash2, Printer, CheckCircle, UtensilsCrossed, User, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface AddItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onPrintBill?: (order: Order) => void;
}

export function AddItemsModal({ isOpen, onClose, order, onPrintBill }: AddItemsModalProps) {
  const { menuItems, categories, addItemsToOrder } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedItems, setSelectedItems] = useState<{ [itemId: string]: { item: MenuItem; quantity: number } }>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatedOrder, setUpdatedOrder] = useState<Order | null>(null);

  if (!order) return null;

  const handleAddItem = (item: MenuItem) => {
    setSelectedItems((prev) => {
      const currentQty = prev[item.id]?.quantity || 0;
      return {
        ...prev,
        [item.id]: {
          item,
          quantity: currentQty + 1,
        },
      };
    });
  };

  const handleUpdateQty = (itemId: string, newQty: number) => {
    setSelectedItems((prev) => {
      if (newQty <= 0) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return {
        ...prev,
        [itemId]: {
          ...prev[itemId],
          quantity: newQty,
        },
      };
    });
  };

  const selectedList = Object.values(selectedItems);
  const additionalSubtotal = selectedList.reduce(
    (acc, { item, quantity }) => acc + (item.discountPrice || item.price) * quantity,
    0
  );
  const additionalTax = Math.round(additionalSubtotal * 0.05);
  const additionalTotal = additionalSubtotal + additionalTax;

  const handleConfirmAddItems = async () => {
    if (selectedList.length === 0) {
      toast.error('Please select at least 1 item to add');
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsPayload = selectedList.map(({ item, quantity }) => ({
        itemId: item.id,
        name: item.name,
        price: item.discountPrice || item.price,
        quantity,
        requiresKitchen: item.requiresKitchen !== false,
      }));

      const result = await addItemsToOrder(order.id, itemsPayload, paymentMethod);
      if (result) {
        setUpdatedOrder(result);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to add items to order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedItems({});
    setUpdatedOrder(null);
    setSearch('');
    onClose();
  };

  const allCategories = React.useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    categories.forEach((c) => {
      if (c.id !== 'cat_all' && c.name) map.set(c.id, { id: c.id, name: c.name });
    });
    menuItems.forEach((m) => {
      if (m.categoryId && m.categoryName && m.categoryId !== 'cat_all' && !map.has(m.categoryId)) {
        map.set(m.categoryId, { id: m.categoryId, name: m.categoryName });
      }
    });
    return Array.from(map.values());
  }, [categories, menuItems]);

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.isAvailable) return false;
    const matchesCat =
      selectedCategory === 'ALL' ||
      item.categoryId === selectedCategory ||
      (item.categoryName && item.categoryName.toLowerCase() === selectedCategory.toLowerCase());
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.categoryName || '').toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={updatedOrder ? undefined : `Add Items to Order #${order.orderNumber}`}
      maxWidth="lg"
    >
      {updatedOrder ? (
        /* SUCCESS SUMMARY & PRINT */
        <div className="text-center space-y-5 py-4 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black text-gray-900">Items Added Successfully!</h3>
            <p className="text-sm font-bold text-amber-600">Order #{updatedOrder.orderNumber} Updated</p>
            <p className="text-xs text-gray-500 pt-1">
              New Grand Total: <strong className="text-gray-900 text-base">{formatINR(updatedOrder.total)}</strong>
            </p>
            {updatedOrder.customerName && (
              <p className="text-xs text-gray-600">
                Customer: <strong>{updatedOrder.customerName}</strong>
              </p>
            )}
          </div>

          <div className="pt-4 flex items-center justify-center gap-3">
            {onPrintBill && (
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  onPrintBill(updatedOrder);
                  handleClose();
                }}
                className="font-bold shadow-md shadow-amber-500/20"
              >
                <Printer className="w-4 h-4 mr-1.5" /> Print Single Updated Bill
              </Button>
            )}
            <Button variant="outline" size="md" onClick={handleClose} className="font-semibold">
              Done
            </Button>
          </div>
        </div>
      ) : (
        /* ADD ITEMS UI */
        <div className="space-y-4">
          {/* Order & Customer Summary Header */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-black text-sm text-amber-700 bg-white px-2.5 py-1 rounded-xl border border-amber-200">
                #{order.orderNumber}
              </span>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-gray-900">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>{order.customerName || 'Walk-in Customer'}</span>
                </div>
                {order.customerPhone && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-500">
                    <Phone className="w-3 h-3 text-gray-400" />
                    <span>{order.customerPhone}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">Existing Bill Total</span>
              <span className="font-black text-gray-900 text-sm">{formatINR(order.total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LEFT: MENU BROWSER */}
            <div className="space-y-3 flex flex-col h-[340px]">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search item to add..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar shrink-0 pb-1">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                    selectedCategory === 'ALL'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {allCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                      selectedCategory === c.id
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {filteredMenuItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 text-xs">
                    <UtensilsCrossed className="w-6 h-6 mb-1 text-gray-300" />
                    No menu items found
                  </div>
                ) : (
                  filteredMenuItems.map((item) => {
                    const inCartQty = selectedItems[item.id]?.quantity || 0;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-gray-50/70 hover:bg-amber-50/40 border border-gray-200/80 transition-all text-xs"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-bold text-gray-900 truncate">{item.name}</p>
                          <p className="text-[11px] text-amber-700 font-semibold">
                            {formatINR(item.discountPrice || item.price)}
                          </p>
                        </div>
                        {inCartQty > 0 ? (
                          <div className="flex items-center gap-1.5 bg-white border border-amber-300 rounded-lg px-1.5 py-0.5">
                            <button
                              onClick={() => handleUpdateQty(item.id, inCartQty - 1)}
                              className="text-gray-600 hover:text-rose-600 font-bold"
                            >
                              -
                            </button>
                            <span className="font-black text-amber-700 text-xs px-1">{inCartQty}</span>
                            <button
                              onClick={() => handleUpdateQty(item.id, inCartQty + 1)}
                              className="text-gray-600 hover:text-emerald-600 font-bold"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddItem(item)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Plus className="w-3 h-3" /> Add
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT: SELECTED ITEMS & SUMMARY */}
            <div className="border border-gray-200 rounded-2xl p-3 flex flex-col justify-between h-[340px] bg-gray-50/50">
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  New Items to Add:
                </span>
                <div className="max-h-[170px] overflow-y-auto space-y-1.5 pr-1">
                  {selectedList.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-8">Select items from the left menu</p>
                  ) : (
                    selectedList.map(({ item, quantity }) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-gray-200"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-bold text-gray-900 truncate">{item.name}</p>
                          <p className="text-[11px] text-gray-500">
                            {formatINR(item.discountPrice || item.price)} × {quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-gray-900">
                            {formatINR((item.discountPrice || item.price) * quantity)}
                          </span>
                          <button
                            onClick={() => handleUpdateQty(item.id, 0)}
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* PAYMENT & SUMMARY FOOTER */}
              <div className="space-y-2.5 border-t border-gray-200 pt-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 font-semibold">Payment for New Items:</span>
                  <div className="flex gap-1">
                    {(['CASH', 'UPI', 'CARD'] as PaymentMethod[]).map((pm) => (
                      <button
                        key={pm}
                        onClick={() => setPaymentMethod(pm)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          paymentMethod === pm
                            ? 'bg-amber-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-600'
                        }`}
                      >
                        {pm}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                  <span>Additional Amount:</span>
                  <span className="text-amber-600 font-black text-sm">+{formatINR(additionalTotal)}</span>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-gray-900 border-t border-gray-200/80 pt-1.5">
                  <span>New Grand Total:</span>
                  <span className="text-emerald-700 font-black text-base">
                    {formatINR(order.total + additionalTotal)}
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  disabled={selectedList.length === 0 || isSubmitting}
                  onClick={handleConfirmAddItems}
                  className="w-full font-bold shadow-md shadow-amber-500/20"
                >
                  {isSubmitting ? 'Updating Order...' : `Confirm & Add to Bill (+${formatINR(additionalTotal)})`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
