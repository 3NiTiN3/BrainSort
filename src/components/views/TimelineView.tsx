'use client'

import { useMemo } from 'react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns'
import { Task } from '@/lib/types'
import { useTaskStore, useFilteredTasks } from '@/hooks/useTaskStore'
import { cn } from '@/lib/utils'

export function TimelineView() {
  const filteredTasks = useFilteredTasks() || [] // Add default empty array
  
  const dateRange = useMemo(() => {
    const today = new Date()
    const start = startOfWeek(today)
    const end = new Date(today)
    end.setDate(end.getDate() + 30) // Show 30 days
    
    return eachDayOfInterval({ start, end })
  }, [])

  const tasksWithDates = filteredTasks.filter(task => task.startDate || task.dueDate)

  const getTaskPosition = (task: Task, date: Date) => {
    const taskStart = task.startDate ? new Date(task.startDate) : new Date(task.dueDate!)
    const taskEnd = task.dueDate ? new Date(task.dueDate) : taskStart
    
    const dateTime = date.getTime()
    const startTime = taskStart.getTime()
    const endTime = taskEnd.getTime()
    
    if (dateTime >= startTime && dateTime <= endTime) {
      return 'active'
    }
    return null
  }

  const getTaskWidth = (task: Task) => {
    if (!task.startDate || !task.dueDate) return 1
    
    const start = new Date(task.startDate)
    const end = new Date(task.dueDate)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    
    return Math.max(1, days)
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
      <div className="min-w-[1200px]">
        {/* Header with dates */}
        <div className="flex border-b border-gray-700 pb-2 mb-4">
          <div className="w-48 flex-shrink-0 font-medium text-gray-400">Tasks</div>
          <div className="flex flex-1">
            {dateRange.map((date) => (
              <div
                key={date.toISOString()}
                className={cn(
                  "flex-1 text-center text-xs px-1",
                  isToday(date) ? "text-primary font-bold" : "text-gray-400"
                )}
              >
                <div>{format(date, 'EEE')}</div>
                <div>{format(date, 'd')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-2">
          {tasksWithDates.map((task) => {
            const taskStart = task.startDate ? new Date(task.startDate) : new Date(task.dueDate!)
            const startIndex = dateRange.findIndex(date => 
              format(date, 'yyyy-MM-dd') === format(taskStart, 'yyyy-MM-dd')
            )
            
            if (startIndex === -1) return null
            
            const width = getTaskWidth(task)
            
            return (
              <div key={task.id} className="flex items-center">
                <div className="w-48 flex-shrink-0 pr-4">
                  <div className="text-sm font-medium text-white truncate">
                    {task.title}
                  </div>
                  {task.assignee && (
                    <div className="text-xs text-gray-400">
                      {task.assignee.name}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-1 relative h-10">
                  {dateRange.map((date, index) => (
                    <div
                      key={date.toISOString()}
                      className={cn(
                        "flex-1 border-l border-gray-800 relative",
                        isToday(date) && "bg-primary/5"
                      )}
                    >
                      {index === startIndex && (
                        <div
                          className={cn(
                            "absolute top-1 left-0 h-8 rounded px-2 flex items-center text-xs font-medium z-10",
                            task.priority === 'urgent' && "bg-red-500 text-white",
                            task.priority === 'high' && "bg-yellow-500 text-white",
                            task.priority === 'medium' && "bg-blue-500 text-white",
                            task.priority === 'low' && "bg-green-500 text-white"
                          )}
                          style={{ width: `${width * 100}%` }}
                        >
                          {task.title}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}