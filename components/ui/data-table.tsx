import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';
import { EmptyState } from './empty-state';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  isLoading = false,
  emptyTitle = 'No data available',
  emptyDescription,
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full space-y-3 p-4 bg-white rounded-xl border border-gray-100">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} className="my-4" />;
  }

  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-xs', className)}>
      <table className="w-full text-left text-xs text-gray-600 border-collapse">
        <thead className="bg-gray-50/80 text-gray-700 font-semibold border-b border-gray-100 uppercase tracking-wider">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className={cn('px-4 py-3.5 whitespace-nowrap', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, rowIdx) => (
            <tr key={row.id ?? rowIdx} className="hover:bg-amber-50/20 transition-colors">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className={cn('px-4 py-3.5 whitespace-nowrap font-medium text-gray-900', col.className)}>
                  {col.cell ? col.cell(row) : col.accessorKey ? String(row[col.accessorKey] ?? '') : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
