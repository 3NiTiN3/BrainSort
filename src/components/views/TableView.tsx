'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react'
import { Task, Priority, Status } from '@/lib/types'
import { useTaskStore, useFilteredTasks } from '@/hooks/useTaskStore'
import { formatDate } from '@/lib/utils'

type SortField = 'title' | 'status' | 'priority' | 'dueDate' | 'assignee'
type SortOrder = 'asc' | 'desc'

export function TableView() {
  const filteredTasks = useFilteredTasks() // Use the selector hook
  const { updateTask, deleteTask } = useTaskStore()
  const [sortField, setSortField] = useState<SortField>('title')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    if (sortField === 'assignee') {
      aValue = a.assignee?.name || ''
      bValue = b.assignee?.name || ''
    }

    if (sortField === 'dueDate') {
      aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0
      bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="opacity-30" size={16} />
    return sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
  }

  const handleInlineEdit = (task: Task, field: keyof Task, value: any) => {
    updateTask(task.id, { [field]: value })
    if (field === 'title') setEditingId(null)
  }

  const getPriorityClass = (priority: Priority): string => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400'
      case 'high': return 'bg-yellow-500/20 text-yellow-400'
      case 'medium': return 'bg-blue-500/20 text-blue-400'
      case 'low': return 'bg-green-500/20 text-green-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800 border-b border-gray-700">
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-1 text-gray-300 hover:text-white"
                >
                  Title <SortIcon field="title" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-1 text-gray-300 hover:text-white"
                >
                  Status <SortIcon field="status" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center gap-1 text-gray-300 hover:text-white"
                >
                  Priority <SortIcon field="priority" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('assignee')}
                  className="flex items-center gap-1 text-gray-300 hover:text-white"
                >
                  Assignee <SortIcon field="assignee" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('dueDate')}
                  className="flex items-center gap-1 text-gray-300 hover:text-white"
                >
                  Due Date <SortIcon field="dueDate" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-white">Labels</th>
              <th className="px-4 py-3 text-right text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.map((task) => (
              <tr key={task.id} className="border-b border-gray-800 text-white hover:bg-gray-800/50">
                <td className="px-4 py-3">
                  {editingId === task.id ? (
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) => handleInlineEdit(task, 'title', e.target.value)}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                      className="bg-gray-800 px-2 py-1 rounded w-full"
                      autoFocus
                    />
                  ) : (
                    <span
                      onClick={() => setEditingId(task.id)}
                      className="cursor-pointer hover:text-primary"
                    >
                      {task.title}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={task.status}
                    onChange={(e) => handleInlineEdit(task, 'status', e.target.value as Status)}
                    className="bg-gray-800 px-2 py-1 rounded text-sm"
                  >
                    <option value="todo">To Do</option>
                    <option value="inProgress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={task.priority}
                    onChange={(e) => handleInlineEdit(task, 'priority', e.target.value as Priority)}
                    className={`px-2 py-1 rounded text-sm ${getPriorityClass(task.priority)}`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  {task.assignee && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs">
                        {task.assignee.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm">{task.assignee.name}</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {task.dueDate && formatDate(task.dueDate)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {task.labels.map((label) => (
                      <span
                        key={label}
                        className="text-xs px-2 py-1 bg-gray-800 rounded"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}