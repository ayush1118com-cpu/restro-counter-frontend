'use client';

import React, { useState } from 'react';
import { Eye, Phone, Mail, MapPin, Building, Calendar, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column } from '@/components/ui/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { Drawer } from '@/components/ui/drawer';
import { useApp } from '@/lib/context/app-context';
import { Lead, LeadStatus } from '@/types';
import { formatDate } from '@/lib/utils';

export default function LeadsManagementPage() {
  const { leads, updateLeadStatus } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filtered = leads.filter((l) => {
    const matchesSearch =
      l.restaurantName.toLowerCase().includes(search.toLowerCase()) ||
      l.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search);
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getLeadStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'NEW':
        return <Badge variant="warning">New Lead</Badge>;
      case 'CONTACTED':
        return <Badge variant="info">Contacted</Badge>;
      case 'DEMO_SCHEDULED':
        return <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">Demo Scheduled</Badge>;
      case 'CONVERTED':
        return <Badge variant="success">Converted</Badge>;
      case 'CLOSED':
        return <Badge variant="outline">Closed</Badge>;
    }
  };

  const columns: Column<Lead>[] = [
    {
      header: 'Restaurant',
      cell: (l) => (
        <div>
          <p className="font-bold text-gray-900">{l.restaurantName}</p>
          <p className="text-[11px] text-gray-500">{l.email}</p>
        </div>
      ),
    },
    {
      header: 'Owner',
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
      header: 'Orders/Day',
      accessorKey: 'approxOrdersPerDay',
    },
    {
      header: 'Status',
      cell: (l) => getLeadStatusBadge(l.status),
    },
    {
      header: 'Created At',
      cell: (l) => <span className="text-gray-500">{formatDate(l.createdAt)}</span>,
    },
    {
      header: 'Actions',
      cell: (l) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedLead(l)}
            className="text-xs"
          >
            <Eye className="w-3.5 h-3.5 mr-1" /> Inspect
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Website Demo Leads</h2>
        <p className="text-xs text-gray-500">Track and manage incoming restaurant sales leads</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-80">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search restaurant, phone, owner..."
          />
        </div>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { label: 'All Statuses', value: 'ALL' },
            { label: 'New Only', value: 'NEW' },
            { label: 'Contacted', value: 'CONTACTED' },
            { label: 'Demo Scheduled', value: 'DEMO_SCHEDULED' },
            { label: 'Converted', value: 'CONVERTED' },
            { label: 'Closed', value: 'CLOSED' },
          ]}
          className="w-48"
        />
      </div>

      {/* Table */}
      <DataTable columns={columns} data={paginatedData} emptyTitle="No leads found" />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filtered.length}
      />

      {/* Lead Details Drawer */}
      {selectedLead && (
        <Drawer
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          title={selectedLead.restaurantName}
          description="Lead Details & Status Pipeline"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-xs text-gray-500">Current Status:</span>
              {getLeadStatusBadge(selectedLead.status)}
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-400">Owner Name</p>
                  <p className="font-bold text-gray-900">{selectedLead.ownerName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-400">Phone</p>
                  <p className="font-bold text-gray-900">{selectedLead.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-400">Email</p>
                  <p className="font-bold text-gray-900">{selectedLead.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-400">City</p>
                  <p className="font-bold text-gray-900">{selectedLead.city}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-400">Current POS System</p>
                  <p className="font-bold text-gray-900">{selectedLead.currentPos || 'None specified'}</p>
                </div>
              </div>

              {selectedLead.message && (
                <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100 space-y-1">
                  <p className="font-bold text-amber-900 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-600" /> Lead Message:
                  </p>
                  <p className="text-gray-700 leading-relaxed">{selectedLead.message}</p>
                </div>
              )}
            </div>

            {/* Pipeline Stage Buttons */}
            <div className="pt-4 border-t border-gray-100 space-y-2">
              <p className="text-xs font-bold text-gray-900">Update Lead Stage:</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateLeadStatus(selectedLead.id, 'CONTACTED');
                    setSelectedLead({ ...selectedLead, status: 'CONTACTED' });
                  }}
                >
                  Mark Contacted
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateLeadStatus(selectedLead.id, 'DEMO_SCHEDULED');
                    setSelectedLead({ ...selectedLead, status: 'DEMO_SCHEDULED' });
                  }}
                >
                  Schedule Demo
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => {
                    updateLeadStatus(selectedLead.id, 'CONVERTED');
                    setSelectedLead({ ...selectedLead, status: 'CONVERTED' });
                  }}
                >
                  Convert to Client
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    updateLeadStatus(selectedLead.id, 'CLOSED');
                    setSelectedLead({ ...selectedLead, status: 'CLOSED' });
                  }}
                >
                  Close Lead
                </Button>
              </div>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
}
