'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Eye, Edit, ShieldAlert, CheckCircle, Ban, Building2, ChefHat, Trash2, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { useApp } from '@/lib/context/app-context';
import { Restaurant, RestaurantStatus } from '@/types';
import { formatDate, formatINR } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import Swal from 'sweetalert2';

export default function RestaurantsPage() {
  const { restaurants, updateRestaurantStatus, deleteRestaurant, updateRestaurantPassword } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [cityFilter, setCityFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [passwordModalRestro, setPasswordModalRestro] = useState<Restaurant | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const uniqueCities = Array.from(new Set(restaurants.map((r) => r.city)));

  const filtered = restaurants.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesCity = cityFilter === 'ALL' || r.city === cityFilter;
    return matchesSearch && matchesStatus && matchesCity;
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status: RestaurantStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success">Active</Badge>;
      case 'SUSPENDED':
        return <Badge variant="warning">Suspended</Badge>;
      case 'BLOCKED':
        return <Badge variant="danger">Blocked</Badge>;
    }
  };

  const columns: Column<Restaurant>[] = [
    {
      header: 'Restaurant',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs border border-amber-200/60">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-gray-900">{r.name}</p>
            <p className="text-[11px] text-gray-500">{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Admin / Owner',
      accessorKey: 'ownerName',
    },
    {
      header: 'Phone',
      accessorKey: 'phone',
    },
    {
      header: 'City',
      accessorKey: 'city',
    },
    {
      header: 'Status',
      cell: (r) => getStatusBadge(r.status),
    },
    {
      header: 'Orders',
      cell: (r) => (
        <span className="font-bold text-gray-900">{r.ordersCount.toLocaleString()}</span>
      ),
    },
    {
      header: 'Created At',
      cell: (r) => <span className="text-gray-500">{formatDate(r.createdAt)}</span>,
    },
    {
      header: 'Actions',
      cell: (r) => (
        <div className="flex items-center gap-1.5">
          <Link href="/admin/kitchen" target="_blank">
            <Button variant="ghost" size="sm" className="text-xs text-amber-600 hover:bg-amber-50 px-2 font-bold border border-amber-200/60" title="Open Kitchen Display (KDS)">
              <ChefHat className="w-3.5 h-3.5 mr-1 text-amber-600" /> Kitchen
            </Button>
          </Link>
          <Link href={`/super-admin/restaurants/${r.id}`}>
            <Button variant="ghost" size="icon" title="View Details">
              <Eye className="w-4 h-4 text-gray-600" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            title="Edit Details"
            onClick={() => setSelectedRestaurant(r)}
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            title="Update Admin Password"
            onClick={() => {
              setPasswordModalRestro(r);
              setNewPassword('');
            }}
          >
            <KeyRound className="w-4 h-4 text-amber-600" />
          </Button>

          {r.status !== 'ACTIVE' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-emerald-600 hover:bg-emerald-50 px-2"
              onClick={() => updateRestaurantStatus(r.id, 'ACTIVE')}
            >
              Activate
            </Button>
          )}

          {r.status !== 'SUSPENDED' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-amber-600 hover:bg-amber-50 px-2"
              onClick={() => updateRestaurantStatus(r.id, 'SUSPENDED')}
            >
              Suspend
            </Button>
          )}

          {r.status !== 'BLOCKED' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-red-600 hover:bg-red-50 px-2"
              onClick={() => updateRestaurantStatus(r.id, 'BLOCKED')}
            >
              Block
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            title="Delete Restaurant"
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            onClick={() => {
              Swal.fire({
                title: 'Delete Restaurant?',
                html: `Are you sure you want to completely delete <b>${r.name}</b>?<br/><span class="text-xs text-red-500 font-semibold">This will permanently delete this outlet, its menu items, categories, and orders.</span>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Yes, Delete Outlet',
                cancelButtonText: 'Cancel',
                customClass: {
                  popup: 'rounded-3xl font-sans',
                  title: 'font-black text-gray-900',
                },
              }).then(async (result) => {
                if (result.isConfirmed) {
                  await deleteRestaurant(r.id);
                }
              });
            }}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Restaurant Outlets</h2>
          <p className="text-xs text-gray-500">Manage registered restaurant accounts and statuses</p>
        </div>
        <Link href="/super-admin/restaurants/new">
          <Button variant="primary" size="md" className="font-bold shadow-md shadow-amber-500/20">
            <Plus className="w-4 h-4" /> Add Restaurant
          </Button>
        </Link>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-72">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search restaurant, owner, email..."
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Active Only', value: 'ACTIVE' },
              { label: 'Suspended Only', value: 'SUSPENDED' },
              { label: 'Blocked Only', value: 'BLOCKED' },
            ]}
            className="w-40"
          />

          <Select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            options={[
              { label: 'All Cities', value: 'ALL' },
              ...uniqueCities.map((c) => ({ label: c, value: c })),
            ]}
            className="w-40"
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable columns={columns} data={paginatedData} emptyTitle="No restaurants found" />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filtered.length}
      />

      {/* Quick Edit Modal */}
      {selectedRestaurant && (
        <Modal
          isOpen={!!selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
          title={`Edit ${selectedRestaurant.name}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              Quick update status and contact for <strong className="text-gray-900">{selectedRestaurant.name}</strong>.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="success"
                size="sm"
                className="w-full"
                onClick={() => {
                  updateRestaurantStatus(selectedRestaurant.id, 'ACTIVE');
                  setSelectedRestaurant(null);
                }}
              >
                Set Active
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => {
                  updateRestaurantStatus(selectedRestaurant.id, 'SUSPENDED');
                  setSelectedRestaurant(null);
                }}
              >
                Set Suspended
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="w-full"
                onClick={() => {
                  updateRestaurantStatus(selectedRestaurant.id, 'BLOCKED');
                  setSelectedRestaurant(null);
                }}
              >
                Set Blocked
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Update Restaurant Admin Password Modal */}
      {passwordModalRestro && (
        <Modal
          isOpen={!!passwordModalRestro}
          onClose={() => {
            setPasswordModalRestro(null);
            setNewPassword('');
          }}
          title={`Update Admin Password - ${passwordModalRestro.name}`}
          maxWidth="md"
        >
          <div className="space-y-4 py-2">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-900">
              <p className="font-bold">Outlet: {passwordModalRestro.name}</p>
              <p className="text-[11px] text-gray-600 mt-0.5">Admin Email: {passwordModalRestro.email}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1.5">
                New Password (minimum 6 characters)
              </label>
              <input
                type="text"
                placeholder="Enter new password (e.g. Kulhad@123)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="md"
                className="flex-1"
                onClick={() => {
                  setPasswordModalRestro(null);
                  setNewPassword('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1 font-bold bg-amber-500 hover:bg-amber-600 text-white"
                disabled={!newPassword || newPassword.length < 6 || isUpdatingPassword}
                onClick={async () => {
                  setIsUpdatingPassword(true);
                  const success = await updateRestaurantPassword(passwordModalRestro.id, newPassword);
                  setIsUpdatingPassword(false);
                  if (success) {
                    setPasswordModalRestro(null);
                    setNewPassword('');
                  }
                }}
              >
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
