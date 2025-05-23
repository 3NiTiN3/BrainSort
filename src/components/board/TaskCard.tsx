import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '@/lib/types'
import { getInitials, getPriorityColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "task-card",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-gray-500 font-medium">{task.id}</span>
        <span className={cn(
          "text-xs px-2 py-1 rounded border font-semibold",
          getPriorityColor(task.priority)
        )}>
          {task.priority.toUpperCase()}
        </span>
      </div>

      <h4 className="text-sm font-medium text-white mb-3 line-clamp-2">
        {task.title}
      </h4>

      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {task.labels.map((label) => (
            <span
              key={label}
              className="text-xs px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-400"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {task.assignee && (
        <div className="flex items-center gap-2 mt-4">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white">
            {getInitials(task.assignee.name)}
          </div>
          <span className="text-xs text-gray-500">{task.assignee.name}</span>
        </div>
      )}
    </div>
  )
}