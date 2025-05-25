'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Calendar, Users, Target, Play, CheckCircle, Clock, TrendingUp, X } from 'lucide-react'
import { useTaskStore } from '@/hooks/useTaskStore'
import { useAuth } from '@/contexts/AuthContext'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { Button } from '@/components/ui/Button'
import { format, differenceInDays, startOfDay, endOfDay } from 'date-fns'
import { cn } from '@/lib/utils'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Sprint {
  id: string
  name: string
  goal: string
  startDate: Date
  endDate: Date
  status: 'planning' | 'active' | 'completed'
  tasks: string[]
}

export default function SprintsPage() {
  const { user } = useAuth()
  const { currentWorkspace } = useWorkspace()
  const { tasks, fetchTasks } = useTaskStore()
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Mock sprints data - replace with Supabase
  const [sprints, setSprints] = useState<Sprint[]>([
    {
      id: 'sprint-1',
      name: 'Sprint 23',
      goal: 'Complete user authentication and core dashboard',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-01-29'),
      status: 'active',
      tasks: tasks.filter(t => t.status !== 'todo').map(t => t.id)
    },
    {
      id: 'sprint-2',
      name: 'Sprint 24',
      goal: 'Implement collaboration features',
      startDate: new Date('2025-01-29'),
      endDate: new Date('2025-02-12'),
      status: 'planning',
      tasks: []
    }
  ])

  const memoizedFetchTasks = useCallback(() => {
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    if (user && currentWorkspace) {
      memoizedFetchTasks()
    }
  }, [user, currentWorkspace, memoizedFetchTasks])

  const activeSprint = sprints.find(s => s.status === 'active')
  const planningSprints = sprints.filter(s => s.status === 'planning')
  const completedSprints = sprints.filter(s => s.status === 'completed')

  const getSprintMetrics = (sprint: Sprint) => {
    const sprintTasks = tasks.filter(task => sprint.tasks.includes(task.id))
    const completed = sprintTasks.filter(t => t.status === 'done').length
    const inProgress = sprintTasks.filter(t => t.status === 'inProgress').length
    const totalPoints = sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0)
    const completedPoints = sprintTasks
      .filter(t => t.status === 'done')
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0)
    
    const totalDays = differenceInDays(sprint.endDate, sprint.startDate)
    const daysElapsed = differenceInDays(new Date(), sprint.startDate)
    const daysRemaining = differenceInDays(sprint.endDate, new Date())
    
    return {
      totalTasks: sprintTasks.length,
      completed,
      inProgress,
      totalPoints,
      completedPoints,
      velocity: completedPoints,
      progress: sprintTasks.length > 0 ? Math.round((completed / sprintTasks.length) * 100) : 0,
      totalDays,
      daysElapsed: Math.max(0, daysElapsed),
      daysRemaining: Math.max(0, daysRemaining),
      burndownData: generateBurndownData(sprint, sprintTasks)
    }
  }

  const generateBurndownData = (sprint: Sprint, sprintTasks: any[]) => {
    const totalPoints = sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0)
    const days = differenceInDays(sprint.endDate, sprint.startDate)
    const idealBurnRate = totalPoints / days
    
    const data = []
    for (let i = 0; i <= days; i++) {
      data.push({
        day: i,
        ideal: Math.max(0, totalPoints - (idealBurnRate * i)),
        actual: totalPoints - (Math.random() * idealBurnRate * i) // Replace with actual data
      })
    }
    return data
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Sprints</h1>
            <p className="text-gray-400 text-sm lg:text-base">
              Manage your team&apos;s iterations
            </p>
          </div>
          
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            <span className="hidden sm:inline">Create Sprint</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 pb-20 lg:pb-4">
        {/* Active Sprint */}
        {activeSprint && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Play className="text-green-400" size={20} />
              Active Sprint
            </h2>
            <SprintCard
              sprint={activeSprint}
              metrics={getSprintMetrics(activeSprint)}
              isActive={true}
              onSelect={() => setSelectedSprint(activeSprint)}
            />
          </div>
        )}

        {/* Planning Sprints */}
        {planningSprints.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="text-yellow-400" size={20} />
              Planning
            </h2>
            <div className="space-y-4">
              {planningSprints.map(sprint => (
                <SprintCard
                  key={sprint.id}
                  sprint={sprint}
                  metrics={getSprintMetrics(sprint)}
                  onSelect={() => setSelectedSprint(sprint)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Sprints */}
        {completedSprints.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="text-gray-400" size={20} />
              Completed
            </h2>
            <div className="space-y-4">
              {completedSprints.map(sprint => (
                <SprintCard
                  key={sprint.id}
                  sprint={sprint}
                  metrics={getSprintMetrics(sprint)}
                  isCompleted={true}
                  onSelect={() => setSelectedSprint(sprint)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sprint Details Modal */}
      {selectedSprint && (
        <SprintDetailsModal
          sprint={selectedSprint}
          metrics={getSprintMetrics(selectedSprint)}
          tasks={tasks.filter(t => selectedSprint.tasks.includes(t.id))}
          onClose={() => setSelectedSprint(null)}
        />
      )}
    </div>
  )
}

// Sprint Card Component
function SprintCard({ 
  sprint, 
  metrics, 
  isActive = false, 
  isCompleted = false,
  onSelect 
}: {
  sprint: Sprint
  metrics: any
  isActive?: boolean
  isCompleted?: boolean
  onSelect: () => void
}) {
  return (
    <div 
      onClick={onSelect}
      className={cn(
        "bg-gray-900 border rounded-lg p-4 lg:p-6 cursor-pointer transition-all",
        isActive && "border-green-500/50 shadow-lg shadow-green-500/10",
        isCompleted && "opacity-75",
        !isActive && !isCompleted && "border-gray-800 hover:border-gray-700"
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">{sprint.name}</h3>
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              isActive && "bg-green-500/20 text-green-400",
              sprint.status === 'planning' && "bg-yellow-500/20 text-yellow-400",
              isCompleted && "bg-gray-500/20 text-gray-400"
            )}>
              {sprint.status.charAt(0).toUpperCase() + sprint.status.slice(1)}
            </span>
          </div>
          
          <p className="text-gray-400 text-sm mb-3">{sprint.goal}</p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{format(sprint.startDate, 'MMM d')} - {format(sprint.endDate, 'MMM d')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Target size={14} />
              <span>{metrics.completedPoints}/{metrics.totalPoints} points</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{metrics.totalTasks} tasks</span>
            </div>
          </div>
        </div>

        {/* Progress Circle */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="24"
                stroke="#374151"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r="24"
                stroke={isActive ? '#10b981' : '#6b7280'}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(metrics.progress / 100) * 150.8} 150.8`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{metrics.progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {isActive && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">{metrics.daysRemaining}</div>
            <div className="text-xs text-gray-400">Days Left</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400">{metrics.completed}</div>
            <div className="text-xs text-gray-400">Completed</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-yellow-400">{metrics.inProgress}</div>
            <div className="text-xs text-gray-400">In Progress</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-400">{metrics.velocity}</div>
            <div className="text-xs text-gray-400">Velocity</div>
          </div>
        </div>
      )}
    </div>
  )
}

// Sprint Details Modal
function SprintDetailsModal({ sprint, metrics, tasks, onClose }: any) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 p-4 lg:p-6 border-b border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-white">{sprint.name}</h2>
              <p className="text-gray-400 mt-1">{sprint.goal}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4 overflow-x-auto">
            {['overview', 'tasks', 'burndown', 'team'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                  activeTab === tab
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Sprint Info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Duration</h4>
                  <p className="text-white">
                    {format(sprint.startDate, 'MMM d')} - {format(sprint.endDate, 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {metrics.totalDays} days • {metrics.daysRemaining} remaining
                  </p>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Progress</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${metrics.progress}%` }}
                      />
                    </div>
                    <span className="text-white font-medium">{metrics.progress}%</span>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Velocity</h4>
                  <p className="text-2xl font-bold text-white">
                    {metrics.velocity} <span className="text-sm font-normal text-gray-400">points</span>
                  </p>
                </div>
              </div>

              {/* Task Breakdown */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-4">Task Breakdown</h4>
                <div className="space-y-2">
                  {['todo', 'inProgress', 'review', 'done'].map(status => {
                    const count = tasks.filter((t: any) => t.status === status).length
                    const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0
                    
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <span className="text-sm text-gray-400 w-24">
                          {status === 'inProgress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div
                            className={cn(
                              "rounded-full h-2 transition-all",
                              status === 'todo' && "bg-gray-500",
                              status === 'inProgress' && "bg-yellow-500",
                              status === 'review' && "bg-blue-500",
                              status === 'done' && "bg-green-500"
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-white w-12 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Sprint Tasks</h4>
              {tasks.length === 0 ? (
                <p className="text-gray-400">No tasks in this sprint</p>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task: any) => (
                    <div key={task.id} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-white font-medium">{task.title}</h5>
                          <p className="text-gray-400 text-sm">{task.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            task.status === 'todo' && "bg-gray-500/20 text-gray-400",
                            task.status === 'inProgress' && "bg-yellow-500/20 text-yellow-400",
                            task.status === 'review' && "bg-blue-500/20 text-blue-400",
                            task.status === 'done' && "bg-green-500/20 text-green-400"
                          )}>
                            {task.status === 'inProgress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                          </span>
                          {task.storyPoints && (
                            <span className="text-xs px-2 py-1 bg-gray-700 rounded">
                              {task.storyPoints} SP
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'burndown' && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-400 mb-4">Sprint Burndown</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.burndownData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="ideal"
                      stroke="#9CA3AF"
                      strokeDasharray="5 5"
                      name="Ideal"
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Actual"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Team Performance</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-400 mb-3">Task Distribution</h5>
                  <div className="space-y-2">
                    {/* Mock team member data */}
                    {[
                      { name: 'John Doe', tasks: 5, completed: 3 },
                      { name: 'Jane Smith', tasks: 4, completed: 4 },
                      { name: 'Bob Johnson', tasks: 3, completed: 1 },
                    ].map((member) => (
                      <div key={member.name} className="flex items-center justify-between">
                        <span className="text-white text-sm">{member.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{member.completed}/{member.tasks}</span>
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2 transition-all"
                              style={{ width: `${(member.completed / member.tasks) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-gray-400 mb-3">Sprint Capacity</h5>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm">Total Capacity</span>
                      <span className="text-white font-medium">40 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm">Hours Logged</span>
                      <span className="text-white font-medium">32 hours</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm">Utilization</span>
                      <span className="text-green-400 font-medium">80%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div className="bg-green-400 rounded-full h-2 transition-all" style={{ width: '80%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}