import { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import type { Node } from '../types';

interface FiltersProps {
  filters: {
    node: string;
    tags: string[];
    status: string;
    search: string;
  };
  onFilterChange: (filters: FiltersProps['filters']) => void;
  nodes: Node[];
  tags: string[];
  isLoading: boolean;
}

const TagsDropdown = ({
  tags,
  selectedTags,
  onTagToggle,
}: {
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as globalThis.Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredTags = tags.filter((tag) =>
    tag.toLowerCase().includes(tagSearch.toLowerCase())
  );

  return (
    <div className="mt-4" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Tags
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-proxmox-orange focus:border-transparent dark:bg-gray-700 dark:text-white text-left"
        >
          <span className="truncate">
            {selectedTags.length === 0
              ? 'Select tags...'
              : `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selected`}
          </span>
          <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
            {/* Search input */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-600">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  placeholder="Search tags..."
                  className="w-full pl-10 pr-4 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-proxmox-orange focus:border-transparent dark:bg-gray-800 dark:text-white"
                  autoFocus
                />
              </div>
            </div>

            {/* Tag list */}
            <ul className="max-h-48 overflow-y-auto py-1">
              {filteredTags.length === 0 ? (
                <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No tags found
                </li>
              ) : (
                filteredTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <li key={tag}>
                      <button
                        type="button"
                        onClick={() => onTagToggle(tag)}
                        className="w-full flex items-center gap-2 px-4 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-left"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="rounded border-gray-300 text-proxmox-orange focus:ring-proxmox-orange"
                        />
                        <span className={isSelected ? 'text-proxmox-orange font-medium' : 'text-gray-700 dark:text-gray-300'}>
                          {tag}
                        </span>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-proxmox-orange text-white"
            >
              {tag}
              <button type="button" onClick={() => onTagToggle(tag)} className="hover:text-orange-200">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const Filters = ({ filters, onFilterChange, nodes, tags, isLoading }: FiltersProps) => {
  const handleNodeChange = (node: string) => {
    onFilterChange({ ...filters, node });
  };

  const handleStatusChange = (status: string) => {
    onFilterChange({ ...filters, status });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onFilterChange({ ...filters, tags: newTags });
  };

  const handleSearchChange = (search: string) => {
    onFilterChange({ ...filters, search });
  };

  const clearFilters = () => {
    onFilterChange({ node: '', tags: [], status: '', search: '' });
  };

  const hasActiveFilters = filters.node || filters.tags.length > 0 || filters.status || filters.search;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="VM name, ID, node..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-proxmox-orange focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Node Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Node
          </label>
          <select
            value={filters.node}
            onChange={(e) => handleNodeChange(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-proxmox-orange focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
          >
            <option value="">All Nodes</option>
            {nodes.map((node) => (
              <option key={node.node} value={node.node}>
                {node.node} ({node.status})
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-proxmox-orange focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="running">Running</option>
            <option value="stopped">Stopped</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end">
          <button
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Tags Filter */}
      {tags.length > 0 && (
        <TagsDropdown
          tags={tags}
          selectedTags={filters.tags}
          onTagToggle={handleTagToggle}
        />
      )}
    </div>
  );
};

export default Filters;