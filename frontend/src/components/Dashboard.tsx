import { useState } from 'react';
import { useVMs } from '../hooks/useVMs';
import { useNodes } from '../hooks/useNodes';
import { useTags } from '../hooks/useTags';
import VMTable from './VMTable';
import Filters from './Filters';
import Stats from './Stats';
import { Server, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const [filters, setFilters] = useState({
    node: '',
    tags: [] as string[],
    status: '',
    search: '',
  });

  const { data: vmsData, isLoading: vmsLoading, error: vmsError, refetch } = useVMs(filters);
  const { data: nodesData, isLoading: nodesLoading } = useNodes();
  const { data: tagsData, isLoading: tagsLoading } = useTags();

  const vms = vmsData?.data || [];
  const nodes = nodesData?.data || [];
  const tags = tagsData?.data || [];

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    refetch();
  };

  // Filter VMs by search term (client-side)
  const filteredVMs = vms.filter((vm) => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      vm.name?.toLowerCase().includes(searchLower) ||
      vm.vmid?.toString().includes(searchLower) ||
      vm.node?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Server className="w-8 h-8 text-proxmox-orange" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Proxmox VM Dashboard
              </h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={vmsLoading}
              className="flex items-center gap-2 px-4 py-2 bg-proxmox-orange text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${vmsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <Stats vms={vms} nodes={nodes} />

        {/* Filters */}
        <div className="mb-6">
          <Filters
            filters={filters}
            onFilterChange={handleFilterChange}
            nodes={nodes}
            tags={tags}
            isLoading={nodesLoading || tagsLoading}
          />
        </div>

        {/* Error State */}
        {vmsError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">
              <strong>Error:</strong> {vmsError.message}
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              Make sure the backend is running and Proxmox credentials are configured.
            </p>
          </div>
        )}

        {/* VM Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <VMTable vms={filteredVMs} isLoading={vmsLoading} />
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Showing {filteredVMs.length} of {vms.length} VMs
            {filters.node && ` on node "${filters.node}"`}
            {filters.tags.length > 0 && ` with tags: ${filters.tags.join(', ')}`}
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;