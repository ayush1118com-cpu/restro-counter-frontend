'use client';

import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle, UtensilsCrossed, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { useApp } from '@/lib/context/app-context';
import { MenuItem } from '@/types';
import { formatINR } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  POPULAR_MENU_SUGGESTIONS,
  DEFAULT_PRESET_CATEGORIES,
  MenuTemplateItem,
} from '@/lib/constants/menu-templates';

const menuItemSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().min(2, 'Description is required'),
  price: z.coerce.number().min(1, 'Valid price is required'),
  discountPrice: z.coerce.number().optional(),
  image: z.string().optional(),
  requiresKitchen: z.boolean().optional(),
  isAvailable: z.boolean(),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

export default function MenuManagementPage() {
  const {
    menuItems,
    categories,
    addCategory,
    addMenuItem,
    updateMenuItem,
    toggleMenuItemAvailability,
    deleteMenuItem,
  } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Auto-suggestion state
  const [nameQuery, setNameQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      isAvailable: true,
    },
  });

  const matchingSuggestions = React.useMemo(() => {
    if (!nameQuery.trim()) {
      return POPULAR_MENU_SUGGESTIONS.slice(0, 6);
    }
    const q = nameQuery.toLowerCase();
    return POPULAR_MENU_SUGGESTIONS.filter(
      (item) => item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [nameQuery]);

  const categoryOptions = React.useMemo(() => {
    const existing = categories
      .filter((c) => c.id !== 'cat_all')
      .map((c) => ({ label: c.name, value: c.id }));

    if (existing.length > 0) return existing;

    // Fallback preset options so category dropdown is never empty
    return DEFAULT_PRESET_CATEGORIES.map((p) => ({ label: p.name, value: p.name }));
  }, [categories]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setNameQuery('');
    setShowSuggestions(false);
    reset({
      name: '',
      categoryId: categories.find((c) => c.id !== 'cat_all')?.id || DEFAULT_PRESET_CATEGORIES[0].name,
      description: '',
      price: '' as any,
      discountPrice: undefined,
      image: '',
      isAvailable: true,
      requiresKitchen: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setNameQuery(item.name);
    setShowSuggestions(false);
    setValue('name', item.name);
    setValue('categoryId', item.categoryId);
    setValue('description', item.description);
    setValue('price', item.price);
    setValue('discountPrice', item.discountPrice);
    setValue('image', item.image || '');
    setValue('isAvailable', item.isAvailable);
    setValue('requiresKitchen', item.requiresKitchen !== false);
    setIsModalOpen(true);
  };

  const handleSelectSuggestion = async (item: MenuTemplateItem) => {
    setValue('name', item.name);
    setValue('description', item.description);
    setValue('price', item.price);
    if (item.image) {
      setValue('image', item.image);
    }
    setValue('requiresKitchen', item.requiresKitchen);

    // Find or create matching category
    let matchedCat = categories.find(
      (c) => c.name.toLowerCase() === item.category.toLowerCase()
    );
    if (!matchedCat) {
      await addCategory(item.category, `${item.category} items`);
      matchedCat = categories.find((c) => c.name.toLowerCase() === item.category.toLowerCase());
    }

    if (matchedCat) {
      setValue('categoryId', matchedCat.id);
    } else {
      setValue('categoryId', item.category);
    }

    setNameQuery(item.name);
    setShowSuggestions(false);
  };

  const handleQuickAddCategory = async (catName: string) => {
    let existing = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
    if (!existing) {
      await addCategory(catName, `${catName} items`);
      existing = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
    }
    if (existing) {
      setValue('categoryId', existing.id);
    } else {
      setValue('categoryId', catName);
    }
  };

  const onSubmit = async (data: MenuItemFormData) => {
    let categoryObj = categories.find(
      (c) => c.id === data.categoryId || c.name.toLowerCase() === data.categoryId.toLowerCase()
    );
    let finalCategoryId = data.categoryId;
    let categoryName = categoryObj?.name || data.categoryId;

    if (!categoryObj && data.categoryId) {
      await addCategory(data.categoryId, `${data.categoryId} items`);
      categoryObj = categories.find((c) => c.name.toLowerCase() === data.categoryId.toLowerCase());
      if (categoryObj) {
        finalCategoryId = categoryObj.id;
        categoryName = categoryObj.name;
      }
    }

    if (editingItem) {
      await updateMenuItem(editingItem.id, {
        ...data,
        categoryId: finalCategoryId,
        categoryName,
      });
    } else {
      await addMenuItem({
        ...data,
        categoryId: finalCategoryId,
        categoryName,
      });
    }
    setIsModalOpen(false);
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.categoryId === categoryFilter;
    const matchesAvailability =
      availabilityFilter === 'ALL' ||
      (availabilityFilter === 'AVAILABLE' && item.isAvailable) ||
      (availabilityFilter === 'OUT_OF_STOCK' && !item.isAvailable);
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const columns: Column<MenuItem>[] = [
    {
      header: 'Image',
      cell: (item) => (
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Item Name',
      cell: (item) => (
        <div>
          <p className="font-bold text-gray-900">{item.name}</p>
          <p className="text-[11px] text-gray-500 line-clamp-1">{item.description}</p>
        </div>
      ),
    },
    {
      header: 'Category',
      accessorKey: 'categoryName',
    },
    {
      header: 'Price',
      cell: (item) => (
        <div>
          <span className="font-bold text-gray-900">{formatINR(item.discountPrice || item.price)}</span>
          {item.discountPrice && (
            <span className="text-[10px] text-gray-400 line-through ml-1.5">{formatINR(item.price)}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Availability',
      cell: (item) => (
        <button onClick={() => toggleMenuItemAvailability(item.id)}>
          {item.isAvailable ? (
            <Badge variant="success" className="cursor-pointer hover:opacity-80">Available</Badge>
          ) : (
            <Badge variant="danger" className="cursor-pointer hover:opacity-80">Out of Stock</Badge>
          )}
        </button>
      ),
    },
    {
      header: 'Actions',
      cell: (item) => (
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={() => handleOpenEditModal(item)}>
            <Edit2 className="w-4 h-4 text-blue-600" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setDeletingId(item.id)}>
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Menu Items</h2>
          <p className="text-xs text-gray-500">Manage restaurant menu catalog, prices, and stock availability</p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenAddModal} className="font-bold shadow-md shadow-amber-500/20">
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-72">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search dish name..."
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { label: 'All Categories', value: 'ALL' },
              ...categories.map((c) => ({ label: c.name, value: c.id })),
            ]}
            className="w-44"
          />

          <Select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            options={[
              { label: 'All Availability', value: 'ALL' },
              { label: 'Available Only', value: 'AVAILABLE' },
              { label: 'Out of Stock Only', value: 'OUT_OF_STOCK' },
            ]}
            className="w-44"
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable columns={columns} data={filteredItems} emptyTitle="No menu items found" />

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Item Name with Auto-Suggest Dropdown & Quick Suggestions */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Item Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Cold Coffee, Paneer Tikka, Veg Burger..."
                {...register('name')}
                onChange={(e) => {
                  register('name').onChange(e);
                  setNameQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-medium"
              />
              <Sparkles className="w-4 h-4 text-amber-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}

            {/* Auto-Suggestions Dropdown */}
            {showSuggestions && matchingSuggestions.length > 0 && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-amber-200 overflow-hidden max-h-56 overflow-y-auto">
                <div className="p-2 bg-amber-50/80 border-b border-amber-100 flex items-center justify-between text-[11px] font-bold text-amber-800">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Click to Auto-Fill Dish
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(false)}
                    className="text-gray-400 hover:text-gray-700 text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
                {matchingSuggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSuggestion(sug)}
                    className="w-full px-3.5 py-2 text-left hover:bg-amber-50/70 transition-colors border-b border-gray-100 last:border-0 flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900">{sug.name}</p>
                      <p className="text-[10px] text-gray-500 line-clamp-1">{sug.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-amber-600">{formatINR(sug.price)}</span>
                      <span className="block text-[9px] text-gray-400 font-semibold uppercase">{sug.category}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Quick Popular Pills (Cold Coffee, Paneer Tikka, etc.) */}
            <div className="mt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-gray-400 font-bold uppercase shrink-0">Popular:</span>
              {['Cold Coffee', 'Hot Coffee', 'Paneer Tikka', 'French Fries', 'Veg Burger', 'Kadhai Paneer', 'Butter Roti'].map((popName) => {
                const match = POPULAR_MENU_SUGGESTIONS.find((p) => p.name === popName);
                if (!match) return null;
                return (
                  <button
                    key={popName}
                    type="button"
                    onClick={() => handleSelectSuggestion(match)}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-gray-100 hover:bg-amber-100 hover:text-amber-800 text-gray-600 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    +{popName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Select + Quick Category Pills */}
          <div>
            <Select
              label="Category *"
              options={categoryOptions}
              {...register('categoryId')}
              error={errors.categoryId?.message}
            />

            {/* Quick Add Preset Category Pills */}
            <div className="mt-2 space-y-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Quick Category Select:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {DEFAULT_PRESET_CATEGORIES.map((preset) => {
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleQuickAddCategory(preset.name)}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-gray-100 hover:bg-amber-100 hover:text-amber-800 text-gray-600 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      +{preset.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="w-full">
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description *</label>
            <textarea
              rows={2}
              className="w-full px-3.5 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              {...register('description')}
            />
            {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Base Price (₹) *" type="number" {...register('price')} error={errors.price?.message} />
            <Input label="Discount Price (₹)" type="number" {...register('discountPrice')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Item Image (URL or Local File Upload)</label>
            <div className="flex gap-2 items-center">
              <Input
                placeholder="https://images.unsplash.com/..."
                {...register('image')}
                className="flex-1"
              />
              <label className="px-3.5 py-2 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded-lg cursor-pointer whitespace-nowrap transition-colors flex items-center gap-1.5">
                📁 Browse File
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setValue('image', reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Paste image URL or click 'Browse File' to upload an image from your device.</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="requiresKitchen" className="rounded border-gray-300 text-amber-500" {...register('requiresKitchen')} defaultChecked={editingItem ? editingItem.requiresKitchen !== false : true} />
              <label htmlFor="requiresKitchen" className="text-xs font-bold text-gray-800 cursor-pointer">
                Send Order to Kitchen Display System (KDS)
              </label>
            </div>
            <p className="text-[11px] text-gray-400 pl-6">Uncheck for instant counter sales like Chai, Cigarettes, Water Bottles (Auto-completes order & bypasses Kitchen alerts).</p>

            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="isAvailable" className="rounded border-gray-300 text-amber-500" {...register('isAvailable')} />
              <label htmlFor="isAvailable" className="text-xs font-bold text-gray-700 cursor-pointer">
                Item Currently Available for Sale
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="font-bold" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Item'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) deleteMenuItem(deletingId);
          setDeletingId(null);
        }}
        title="Delete Menu Item"
        message="Are you sure you want to delete this menu item from your counter catalog?"
        confirmText="Delete Item"
      />
    </div>
  );
}


