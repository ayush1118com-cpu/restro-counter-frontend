'use client';

import React, { useState } from 'react';
import { Plus, Tags, Edit2, Trash2, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { useApp } from '@/lib/context/app-context';
import { Category } from '@/types';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function CategoryManagementPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const displayCategories = categories.filter((c) => c.id !== 'cat_all');

  const handleOpenAdd = () => {
    setEditingCat(null);
    setCatName('');
    setCatDesc('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    if (editingCat) {
      updateCategory(editingCat.id, catName, catDesc);
    } else {
      addCategory(catName, catDesc);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Category Management</h2>
          <p className="text-xs text-gray-500">Organize menu catalog into dish categories</p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenAdd} className="font-bold shadow-md shadow-amber-500/20">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayCategories.map((cat) => (
          <Card key={cat.id} className="hover:border-amber-200 transition-all flex flex-col justify-between">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Tags className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                  {cat.itemCount} items
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900">{cat.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{cat.description || 'No description provided.'}</p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(cat)} className="text-xs text-blue-600">
                  <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeletingId(cat.id)} className="text-xs text-red-600">
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCat ? 'Edit Category' : 'Add Category'} maxWidth="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Category Name *"
            placeholder="e.g. Starters"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
          />
          <Input
            label="Description"
            placeholder="e.g. Appetizers and quick bites"
            value={catDesc}
            onChange={(e) => setCatDesc(e.target.value)}
          />
          <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="font-bold">
              Save Category
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) deleteCategory(deletingId);
          setDeletingId(null);
        }}
        title="Delete Category"
        message="Are you sure you want to delete this menu category?"
        confirmText="Delete Category"
      />
    </div>
  );
}
