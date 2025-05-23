'use client'

import { useState } from 'react'
import { Search, Filter, X, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useTaskStore } from '@/hooks/useTaskStore'
import { FilterQuery, Status, Priority } from '@/lib/types'

export function FilterBar() {
  const { filters, setFilters, savedFilters, saveFilter } = useTaskStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const [filterName, setFilterName] = useState('')

  const handleFilterChange = (key: keyof FilterQuery, value: any) => {
    setFilters({ ...filters, [key]: value })
  }

  const handleSaveFilter = () => {
    if (filterName) {
      saveFilter({
        id: Date.now().toString(),
        name: filterName,
        query: filters,
        createdBy: 'current-user',
      })
      setFilterName('')
    }
  }

  const clearFilters = () => {
    setFilters({})
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <Input
            type="text"
            placeholder="Search tasks..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Filter size={16} />
          Filters {Object.keys(filters).length > 0 && `(${Object.keys(filters).length})`}
        </Button>
        {Object.keys(filters).length > 0 && (
          <Button variant="secondary" onClick={clearFilters}>
            <X size={16} />
            Clear
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-4 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Status
              </label>
              <Select
                multiple
                value={filters.status || []}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value as Status)
                  handleFilterChange('status', values)
                }}
              >
                <option value="todo">To Do</option>
                <option value="inProgress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Done</option>
                <option value="blocked">Blocked</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Priority
              </label>
              <Select
                multiple
                value={filters.priority || []}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value as Priority)
                  handleFilterChange('priority', values)
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Labels
              </label>
              <Input
                type="text"
                placeholder="Enter labels separated by commas"
                onChange={(e) => {
                  const labels = e.target.value.split(',').map(l => l.trim()).filter(Boolean)
                  handleFilterChange('labels', labels)
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Input
              type="text"
              placeholder="Filter name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={handleSaveFilter} disabled={!filterName}>
              <Save size={16} />
              Save Filter
            </Button>
          </div>

          {savedFilters.length > 0 && (
            <div className="pt-4 border-t border-gray-800">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Saved Filters</h4>
              <div className="flex flex-wrap gap-2">
                {savedFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setFilters(filter.query)}
                    className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300"
                  >
                    {filter.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}