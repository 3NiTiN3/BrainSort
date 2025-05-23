'use client'

import { Calendar, momentLocalizer, View } from 'react-big-calendar'
import moment from 'moment'
import { Task } from '@/lib/types'
import { useFilteredTasks } from '@/hooks/useTaskStore'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

export function CalendarView() {
  const tasks = useFilteredTasks() || [] // Add default empty array
  const router = useRouter()
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())

  // Convert tasks to calendar events
  const events = tasks
    .filter(task => task.dueDate)
    .map(task => ({
      id: task.id,
      title: task.title,
      start: new Date(task.dueDate!),
      end: new Date(task.dueDate!),
      resource: task,
    }))

  const handleSelectEvent = (event: any) => {
    router.push(`/task/${event.id}`)
  }

  const eventStyleGetter = (event: any) => {
    const task = event.resource as Task
    let backgroundColor = '#374151'

    switch (task.priority) {
      case 'urgent':
        backgroundColor = '#DC2626'
        break
      case 'high':
        backgroundColor = '#F59E0B'
        break
      case 'medium':
        backgroundColor = '#3B82F6'
        break
      case 'low':
        backgroundColor = '#10B981'
        break
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  return (
    <div className="h-[calc(100vh-200px)] bg-gray-900 rounded-lg p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        className="calendar-dark"
      />
    </div>
  )
}