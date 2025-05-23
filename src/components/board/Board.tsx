'use client'

import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Column } from './Column'
import { useTaskStore } from '@/hooks/useTaskStore'
import { Status } from '@/lib/types'

const columns: { id: Status; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'inProgress', title: 'In Progress' },
  { id: 'review', title: 'In Review' },
  { id: 'done', title: 'Done' },
]

export function Board() {
  const { tasks, moveTask } = useTaskStore()

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const taskId = active.id as string
      const newStatus = over.id as Status
      moveTask(taskId, newStatus)
    }
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.id)
          
          return (
            <SortableContext
              key={column.id}
              items={columnTasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <Column
                id={column.id}
                title={column.title}
                tasks={columnTasks}
              />
            </SortableContext>
          )
        })}
      </div>
    </DndContext>
  )
}