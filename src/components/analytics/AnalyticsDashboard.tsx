'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { useTasks } from '@/hooks/useTaskStore'
import { format, subDays, eachDayOfInterval } from 'date-fns'

export function AnalyticsDashboard() {
  const tasks = useTasks() || [] // Add default empty array

  // Task status distribution
  const statusData = useMemo(() => {
    const counts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(counts).map(([status, count]) => ({
      name: status,
      value: count,
    }))
  }, [tasks])

  // Priority distribution
  const priorityData = useMemo(() => {
    const counts = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(counts).map(([priority, count]) => ({
      name: priority,
      value: count,
    }))
  }, [tasks])

  // Tasks created over time (last 30 days)
  const timelineData = useMemo(() => {
    const thirtyDaysAgo = subDays(new Date(), 30)
    const dateRange = eachDayOfInterval({
      start: thirtyDaysAgo,
      end: new Date(),
    })

    return dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const created = tasks.filter(task => 
        format(new Date(task.createdAt), 'yyyy-MM-dd') === dateStr
      ).length
      const completed = tasks.filter(task => 
        task.completedDate && format(new Date(task.completedDate), 'yyyy-MM-dd') === dateStr
      ).length

      return {
        date: format(date, 'MMM dd'),
        created,
        completed,
      }
    })
  }, [tasks])

  const COLORS = {
    todo: '#9CA3AF',
    inProgress: '#3B82F6',
    review: '#F59E0B',
    done: '#10B981',
    blocked: '#EF4444',
    low: '#10B981',
    medium: '#3B82F6',
    high: '#F59E0B',
    urgent: '#EF4444',
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Analytics Dashboard</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Task Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution */}
        <div className="bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              />
              <Bar dataKey="value" fill="#8884d8">
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tasks Over Time */}
        <div className="bg-gray-900 rounded-lg p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Tasks Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="created"
                stroke="#3B82F6"
                name="Created"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#10B981"
                name="Completed"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}