'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { useTaskStore } from '@/hooks/useTaskStore'

export function StatsGrid() {
  const tasks = useTaskStore((state) => state.tasks)
  
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'inProgress').length,
    velocity: 87, // This would be calculated from sprint data
  }

  const statCards = [
    {
      label: 'Total Tasks',
      value: stats.total,
      change: 12,
      trend: 'up',
    },
    {
      label: 'Completed',
      value: stats.completed,
      change: 8,
      trend: 'up',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      change: -2,
      trend: 'down',
    },
    {
      label: 'Team Velocity',
      value: stats.velocity,
      change: 5,
      trend: 'up',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => (
        <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
          
          <p className="text-sm text-gray-400 mb-2">{stat.label}</p>
          <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
          
          <div className={`flex items-center gap-1 text-sm ${
            stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
          }`}>
            {stat.trend === 'up' ? (
              <TrendingUp size={16} />
            ) : (
              <TrendingDown size={16} />
            )}
            <span>{Math.abs(stat.change)}% from last week</span>
          </div>
        </div>
      ))}
    </div>
  )
}