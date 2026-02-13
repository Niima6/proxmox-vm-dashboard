import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { formatBytes, formatPercentage, formatUptime } from '../utils/formatters';
import { ChevronUp, ChevronDown, Server, HardDrive, Cpu, MemoryStick } from 'lucide-react';
import type { VM } from '../types';

interface VMTableProps {
  vms: VM[];
  isLoading: boolean;
}

const columnHelper = createColumnHelper<VM>();

const VMTable = ({ vms, isLoading }: VMTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('vmid', {
        header: 'ID',
        cell: (info) => (
          <span className="font-mono text-sm font-semibold">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => (
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{info.getValue()}</span>
          </div>
        ),
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          return (
            <span
              className={`status-badge ${
                status === 'running'
                  ? 'status-running'
                  : status === 'stopped'
                  ? 'status-stopped'
                  : 'status-paused'
              }`}
            >
              {status}
            </span>
          );
        },
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: (info) => (
          <span className="text-sm uppercase text-gray-600 dark:text-gray-400">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('node', {
        header: 'Node',
        cell: (info) => (
          <span className="text-sm font-medium text-proxmox-blue">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('cpu', {
        header: 'CPU',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-gray-400" />
              <span className="text-sm">
                {formatPercentage(row.cpu || 0)} ({row.cpus} cores)
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor('mem', {
        header: 'Memory',
        cell: (info) => {
          const row = info.row.original;
          const percentage = row.maxmem ? ((row.mem ?? 0) / row.maxmem) * 100 : 0;
          return (
            <div className="flex items-center gap-2">
              <MemoryStick className="w-4 h-4 text-gray-400" />
              <span className="text-sm">
                {formatBytes(row.mem)} / {formatBytes(row.maxmem)}
                <span className="text-gray-500 ml-1">({formatPercentage(percentage)})</span>
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor('disk', {
        header: 'Disk',
        cell: (info) => {
          const row = info.row.original;
          const percentage = row.maxdisk ? ((row.disk ?? 0) / row.maxdisk) * 100 : 0;
          return (
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-gray-400" />
              <span className="text-sm">
                {formatBytes(row.disk)} / {formatBytes(row.maxdisk)}
                <span className="text-gray-500 ml-1">({formatPercentage(percentage)})</span>
              </span>
            </div>
          );
        },
      }),
      columnHelper.accessor('uptime', {
        header: 'Uptime',
        cell: (info) => (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {formatUptime(info.getValue() || 0)}
          </span>
        ),
      }),
      columnHelper.accessor('tags', {
        header: 'Tags',
        cell: (info) => {
          const tags = info.getValue();
          return (
            <div className="flex flex-wrap gap-1">
              {tags && tags.length > 0 ? (
                tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-xs">No tags</span>
              )}
            </div>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: vms,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-proxmox-orange"></div>
      </div>
    );
  }

  if (vms.length === 0) {
    return (
      <div className="text-center py-12">
        <Server className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No VMs found</p>
      </div>
    );
  }

  return (
    <div className="vm-table-container">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-2">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: <ChevronUp className="w-4 h-4" />,
                      desc: <ChevronDown className="w-4 h-4" />,
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VMTable;

