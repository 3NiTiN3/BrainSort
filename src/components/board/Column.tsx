import { useDroppable } from '@dnd-kit/core'
import { TaskCard } from './TaskCard'
import { Task, Status } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ColumnProps {
  id: Status
  title: string
  tasks: Task[]
}

export function Column({ id, title, tasks }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "column min-h-[200px] transition-colors",
        isOver && "border-primary bg-primary/5"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          {title}
          <span className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-400">
            {tasks.length}
          </span>
        </h3>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}