import { useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useTaskStore } from './useTaskStore'
import { toast } from 'react-hot-toast'

let socket: Socket

export function useRealtimeBoard(boardId: string) {
  const { moveTask, updateTask, addTask, removeTask } = useTaskStore()
  const currentUserId = 'current-user-id' // Get from auth context

  const memoizedMoveTask = useCallback(moveTask, [moveTask])
  const memoizedUpdateTask = useCallback(updateTask, [updateTask])
  const memoizedAddTask = useCallback(addTask, [addTask])
  const memoizedRemoveTask = useCallback(removeTask, [removeTask])

  useEffect(() => {
    // Initialize socket connection
    socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
      auth: {
        boardId,
        userId: currentUserId,
      },
    })

    // Join board room
    socket.emit('join-board', boardId)

    // Handle real-time events
    socket.on('task-moved', ({ taskId, newStatus, userId, userName }) => {
      if (userId !== currentUserId) {
        memoizedMoveTask(taskId, newStatus)
        toast.success(`${userName} moved a task to ${newStatus}`)
      }
    })

    socket.on('task-updated', ({ task, userId, userName }) => {
      if (userId !== currentUserId) {
        memoizedUpdateTask(task.id, task)
        toast.success(`${userName} updated "${task.title}"`)
      }
    })

    socket.on('task-created', ({ task, userId, userName }) => {
      if (userId !== currentUserId) {
        memoizedAddTask(task)
        toast.success(`${userName} created "${task.title}"`)
      }
    })

    socket.on('task-deleted', ({ taskId, userId, userName }) => {
      if (userId !== currentUserId) {
        memoizedRemoveTask(taskId)
        toast.success(`${userName} deleted a task`)
      }
    })

    socket.on('user-joined', ({ userId, userName }) => {
      toast(`${userName} joined the board`, { icon: '👋' })
    })

    socket.on('user-left', ({ userId, userName }) => {
      toast(`${userName} left the board`, { icon: '👋' })
    })

    // Cleanup
    return () => {
      socket.emit('leave-board', boardId)
      socket.disconnect()
    }
  }, [boardId, currentUserId, memoizedMoveTask, memoizedUpdateTask, memoizedAddTask, memoizedRemoveTask])

  const emitTaskMove = useCallback((taskId: string, newStatus: string) => {
    socket.emit('task-move', { taskId, newStatus })
  }, [])

  const emitTaskUpdate = useCallback((task: any) => {
    socket.emit('task-update', { task })
  }, [])

  const emitTaskCreate = useCallback((task: any) => {
    socket.emit('task-create', { task })
  }, [])

  const emitTaskDelete = useCallback((taskId: string) => {
    socket.emit('task-delete', { taskId })
  }, [])

  return {
    emitTaskMove,
    emitTaskUpdate,
    emitTaskCreate,
    emitTaskDelete,
  }
}