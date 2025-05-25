'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Filter, Search, ChevronRight, Calendar, Tag, Users } from 'lucide-react'
import { useTaskStore } from '@/hooks/useTaskStore'
import { useAuth } from '@/contexts/AuthContext'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { Button } from '@/components/ui/Button'
import { CreateTaskModal } from '@/components/board/CreateTaskModal'
import { Task } from '@/lib/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

// Extended Task type to include sprint_id and other properties
interface ExtendedTask extends Task {
  sprint_id?: string | null
  storyPoints?: number
  subtasks?: Array<{
    id: string
    title: string
    completed: boolean
  }>
}

export default function BacklogPage() {
  const { user } = useAuth()
  const { currentWorkspace } = useWorkspace()
  const { tasks, fetchTasks, loading, updateTask } = useTaskStore()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())

  const memoizedFetchTasks = useCallback(() => {
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    if (user && currentWorkspace) {
      memoizedFetchTasks()
    }
  }, [user, currentWorkspace, memoizedFetchTasks])

  // Cast tasks to extended type for sprint_id access
  const extendedTasks = tasks as ExtendedTask[]

  // Get unique labels from all tasks
  const allLabels = Array.from(new Set(extendedTasks.flatMap(task => task.labels || [])))

  // Filter backlog tasks (tasks not assigned to any sprint)
  const backlogTasks = extendedTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority
    const matchesLabels = selectedLabels.length === 0 || 
                         selectedLabels.some(label => (task.labels || []).includes(label))
    // Filter out tasks that are assigned to a sprint
    return !task.sprint_id && matchesSearch && matchesPriority && matchesLabels
  })

  // Group tasks by readiness for sprint
  const groupedTasks = {
    todo: backlogTasks.filter(t => t.status === 'todo'),
    ready: backlogTasks.filter(t => t.status === 'todo' && t.assignee && t.storyPoints),
  }

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks)
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId)
    } else {
      newExpanded.add(taskId)
    }
    setExpandedTasks(newExpanded)
  }

  const toggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks)
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      newSelected.add(taskId)
    }
    setSelectedTasks(newSelected)
  }

  const moveSelectedToSprint = async (sprintId: string) => {
    for (const taskId of selectedTasks) {
      // Use type assertion to bypass the sprint_id type issue
      await updateTask(taskId, { sprint_id: sprintId } as Partial<Task>)
    }
    setSelectedTasks(new Set())
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🔴'
      case 'high': return '🟡'
      case 'medium': return '🔵'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Product Backlog</h1>
            <p className="text-gray-400 text-sm lg:text-base">
              {backlogTasks.length} items • {selectedTasks.size} selected
            </p>
          </div>
          
          <div className="flex gap-2">
            {selectedTasks.size > 0 && (
              <Button variant="secondary" onClick={() => moveSelectedToSprint('mock-sprint-id')}>
                Move to Sprint
              </Button>
            )}
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={16} />
              <span className="hidden sm:inline">Add Item</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900/50 border-b border-gray-800 p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Search backlog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-primary"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟡 High</option>
            <option value="medium">🔵 Medium</option>
            <option value="low">🟢 Low</option>
          </select>

          {/* Label Filters */}
          {allLabels.map(label => (
            <button
              key={label}
              onClick={() => {
                if (selectedLabels.includes(label)) {
                  setSelectedLabels(selectedLabels.filter(l => l !== label))
                } else {
                  setSelectedLabels([...selectedLabels, label])
                }
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm transition-colors",
                selectedLabels.includes(label)
                  ? "bg-primary text-white"
                  : "bg-gray-800 text-gray-400 hover:text-white"
              )}
            >
              <Tag size={12} className="inline mr-1" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Backlog Items */}
      <div className="flex-1 overflow-auto p-4 pb-20 lg:pb-4">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading backlog...</div>
        ) : backlogTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No items match your filters</p>
            <Button onClick={() => setIsCreateModalOpen(true)} variant="secondary">
              <Plus size={16} className="mr-2" />
              Create your first backlog item
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Ready for Sprint Section */}
            {groupedTasks.ready.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Ready for Sprint ({groupedTasks.ready.length})
                </h3>
                <div className="space-y-2">
                  {groupedTasks.ready.map(task => (
                    <BacklogItem
                      key={task.id}
                      task={task}
                      isExpanded={expandedTasks.has(task.id)}
                      isSelected={selectedTasks.has(task.id)}
                      onToggleExpand={() => toggleTaskExpansion(task.id)}
                      onToggleSelect={() => toggleTaskSelection(task.id)}
                      getPriorityIcon={getPriorityIcon}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Backlog Items */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Backlog ({groupedTasks.todo.length})
              </h3>
              <div className="space-y-2">
                {groupedTasks.todo.map(task => (
                  <BacklogItem
                    key={task.id}
                    task={task}
                    isExpanded={expandedTasks.has(task.id)}
                    isSelected={selectedTasks.has(task.id)}
                    onToggleExpand={() => toggleTaskExpansion(task.id)}
                    onToggleSelect={() => toggleTaskSelection(task.id)}
                    getPriorityIcon={getPriorityIcon}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <CreateTaskModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        defaultStatus="todo"
      />
    </div>
  )
}

// Backlog Item Component
function BacklogItem({ 
  task, 
  isExpanded, 
  isSelected, 
  onToggleExpand, 
  onToggleSelect,
  getPriorityIcon 
}: {
  task: ExtendedTask
  isExpanded: boolean
  isSelected: boolean
  onToggleExpand: () => void
  onToggleSelect: () => void
  getPriorityIcon: (priority: string) => string
}) {
  return (
    <div className={cn(
      "bg-gray-900 border rounded-lg transition-all",
      isSelected ? "border-primary" : "border-gray-800 hover:border-gray-700"
    )}>
      <div className="p-3 lg:p-4">
        <div className="flex items-start gap-3">
          {/* Selection Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="mt-1 rounded border-gray-600 bg-gray-800 text-primary focus:ring-primary"
          />

          {/* Expand Icon */}
          <button
            onClick={onToggleExpand}
            className="mt-1 text-gray-400 hover:text-white"
          >
            <ChevronRight 
              size={16} 
              className={cn("transition-transform", isExpanded && "rotate-90")}
            />
          </button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs text-gray-500">{task.id}</span>
              <span className="text-lg">{getPriorityIcon(task.priority)}</span>
              {task.storyPoints && (
                <span className="text-xs px-2 py-0.5 bg-gray-800 rounded">
                  {task.storyPoints} SP
                </span>
              )}
              {(task.labels || []).map(label => (
                <span key={label} className="text-xs px-2 py-0.5 bg-gray-800 rounded text-gray-400">
                  {label}
                </span>
              ))}
            </div>
            
            <h4 className="text-white font-medium break-words">{task.title}</h4>
            
            {task.description && (
              <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
              {task.assignee && (
                <div className="flex items-center gap-1">
                  <Users size={12} />
                  <span>
                    {typeof task.assignee === 'string' 
                      ? task.assignee 
                      : task.assignee?.name || 'Unknown'
                    }
                  </span>
                </div>
              )}
              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pl-11 space-y-3">
            {task.description && (
              <div>
                <h5 className="text-xs font-medium text-gray-400 mb-1">Description</h5>
                <p className="text-sm text-gray-300">{task.description}</p>
              </div>
            )}
            
            {task.subtasks && task.subtasks.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-gray-400 mb-1">Subtasks</h5>
                <div className="space-y-1">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        className="rounded border-gray-600 bg-gray-800"
                        readOnly
                      />
                      <span className={cn(
                        "text-gray-300",
                        subtask.completed && "line-through text-gray-500"
                      )}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="secondary">Edit</Button>
              <Button variant="secondary">Add to Sprint</Button>
              <Button variant="secondary">Delete</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}