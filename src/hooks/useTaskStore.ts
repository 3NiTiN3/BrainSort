import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { Task, Filter, FilterQuery, Status, Activity, Notification } from '@/lib/types'
import { Database } from '@/lib/supabase/database.types'

type DbTask = Database['public']['Tables']['tasks']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

interface TaskStore {
  // Tasks
  tasks: Task[]
  loading: boolean
  error: string | null
  
  // Task actions
  fetchTasks: () => Promise<void>
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  moveTask: (taskId: string, newStatus: Status) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  removeTask: (id: string) => void

  // Filters
  filters: FilterQuery
  setFilters: (filters: FilterQuery) => void
  savedFilters: Filter[]
  saveFilter: (filter: Filter) => void
  deleteFilter: (filterId: string) => void
  
  // Views
  currentView: 'board' | 'calendar' | 'table' | 'timeline'
  setCurrentView: (view: 'board' | 'calendar' | 'table' | 'timeline') => void
  
  // UI State
  isCommandPaletteOpen: boolean
  setIsCommandPaletteOpen: (open: boolean) => void
  isCreateTaskOpen: boolean
  setIsCreateTaskOpen: (open: boolean) => void
  
  // Activity & Notifications
  activities: Activity[]
  addActivity: (activity: Activity) => void
  notifications: Notification[]
  addNotification: (notification: Notification) => void
  markNotificationAsRead: (id: string) => void
  
  // Computed
  getFilteredTasks: () => Task[]
}

// Helper function to convert DB task to app Task
const convertDbTaskToTask = (dbTask: any): Task => {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description || undefined,
    content: dbTask.content || undefined,
    status: dbTask.status as Status,
    priority: dbTask.priority as Task['priority'],
    assignee: dbTask.assignee ? {
      id: dbTask.assignee.id,
      name: dbTask.assignee.name || '',
      email: dbTask.assignee.email,
      avatar: dbTask.assignee.avatar_url || undefined,
    } : undefined,
    labels: dbTask.labels || [],
    storyPoints: dbTask.story_points || undefined,
    startDate: dbTask.start_date ? new Date(dbTask.start_date) : undefined,
    dueDate: dbTask.due_date ? new Date(dbTask.due_date) : undefined,
    completedDate: dbTask.completed_date ? new Date(dbTask.completed_date) : undefined,
    timeTracked: dbTask.time_tracked || undefined,
    estimatedTime: dbTask.estimated_time || undefined,
    createdBy: dbTask.created_by,
    createdAt: new Date(dbTask.created_at),
    updatedAt: new Date(dbTask.updated_at),
    attachments: dbTask.attachments || [],
    comments: dbTask.comments?.map((comment: any) => ({
      id: comment.id,
      content: comment.content,
      author: {
        id: comment.author.id,
        name: comment.author.name || '',
        email: comment.author.email,
        avatar: comment.author.avatar_url || undefined,
      },
      createdAt: new Date(comment.created_at),
      updatedAt: comment.updated_at ? new Date(comment.updated_at) : undefined,
      isEdited: comment.is_edited || false,
    })) || [],
    subtasks: dbTask.subtasks?.map((subtask: any) => ({
      id: subtask.id,
      title: subtask.title,
      completed: subtask.completed || false,
      assignee: subtask.assignee_id || undefined,
    })) || [],
  }
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial state
  tasks: [],
  loading: false,
  error: null,
  
  // Fetch tasks from Supabase
  fetchTasks: async () => {
    const supabase = createClient()
    set({ loading: true, error: null })
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assignee_id(id, name, email, avatar_url),
          subtasks(*, assignee:assignee_id(id, name, email, avatar_url)),
          comments(*, author:author_id(id, name, email, avatar_url)),
          attachments(*)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      const tasks = data?.map(convertDbTaskToTask) || []
      set({ tasks, loading: false })
    } catch (error: any) {
      console.error('Error fetching tasks:', error)
      set({ error: error.message, loading: false })
    }
  },
  
  // Add new task
  addTask: async (taskData) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      set({ error: 'Not authenticated' })
      return
    }
    
    set({ loading: true, error: null })
    
    try {
      // Convert dates to ISO strings for database
      const dbTask = {
        title: taskData.title,
        description: taskData.description || null,
        content: taskData.content || null,
        status: taskData.status,
        priority: taskData.priority,
        assignee_id: taskData.assignee?.id || null,
        labels: taskData.labels || [],
        story_points: taskData.storyPoints || null,
        start_date: taskData.startDate?.toISOString() || null,
        due_date: taskData.dueDate?.toISOString() || null,
        time_tracked: taskData.timeTracked || 0,
        estimated_time: taskData.estimatedTime || null,
        created_by: user.id,
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(dbTask)
        .select(`
          *,
          assignee:assignee_id(id, name, email, avatar_url),
          subtasks(*),
          comments(*, author:author_id(id, name, email, avatar_url)),
          attachments(*)
        `)
        .single()
      
      if (error) throw error
      
      const newTask = convertDbTaskToTask(data)
      set(state => ({ 
        tasks: [newTask, ...state.tasks],
        loading: false 
      }))
      
      // Add activity
      get().addActivity({
        id: Date.now().toString(),
        type: 'task_created',
        taskId: newTask.id,
        userId: user.id,
        timestamp: new Date(),
        details: { title: newTask.title }
      })
    } catch (error: any) {
      console.error('Error adding task:', error)
      set({ error: error.message, loading: false })
    }
  },
  
  // Update task
  updateTask: async (id, updates) => {
    const supabase = createClient()
    set({ error: null })
    
    try {
      // Prepare update data
      const updateData: any = {}
      
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.content !== undefined) updateData.content = updates.content
      if (updates.status !== undefined) updateData.status = updates.status
      if (updates.priority !== undefined) updateData.priority = updates.priority
      if (updates.assignee !== undefined) updateData.assignee_id = updates.assignee?.id || null
      if (updates.labels !== undefined) updateData.labels = updates.labels
      if (updates.storyPoints !== undefined) updateData.story_points = updates.storyPoints
      if (updates.startDate !== undefined) updateData.start_date = updates.startDate?.toISOString() || null
      if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate?.toISOString() || null
      if (updates.completedDate !== undefined) updateData.completed_date = updates.completedDate?.toISOString() || null
      if (updates.timeTracked !== undefined) updateData.time_tracked = updates.timeTracked
      if (updates.estimatedTime !== undefined) updateData.estimated_time = updates.estimatedTime
      
      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
      
      if (error) throw error
      
      // Update local state
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
        )
      }))
      
      // Add activity
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        get().addActivity({
          id: Date.now().toString(),
          type: 'task_updated',
          taskId: id,
          userId: user.id,
          timestamp: new Date(),
          details: updates
        })
      }
    } catch (error: any) {
      console.error('Error updating task:', error)
      set({ error: error.message })
    }
  },
  
  // Move task (update status)
  moveTask: async (taskId, newStatus) => {
    const task = get().tasks.find(t => t.id === taskId)
    if (!task) return
    
    await get().updateTask(taskId, { status: newStatus })
    
    // Add activity for move
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      get().addActivity({
        id: Date.now().toString(),
        type: 'task_moved',
        taskId,
        userId: user.id,
        timestamp: new Date(),
        details: { from: task.status, to: newStatus }
      })
    }
  },
  
  // Delete task
  deleteTask: async (id) => {
    const supabase = createClient()
    set({ error: null })
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id)
      }))
    } catch (error: any) {
      console.error('Error deleting task:', error)
      set({ error: error.message })
    }
  },
  
  removeTask: (id) => {
    set(state => ({
      tasks: state.tasks.filter(task => task.id !== id)
    }))
  },

  // Filters
  filters: {},
  setFilters: (filters) => set({ filters }),
  savedFilters: [],
  saveFilter: (filter) => set((state) => ({
    savedFilters: [...state.savedFilters, filter]
  })),
  deleteFilter: (filterId) => set((state) => ({
    savedFilters: state.savedFilters.filter(f => f.id !== filterId)
  })),
  
  // Views
  currentView: 'board',
  setCurrentView: (view) => set({ currentView: view }),
  
  // UI State
  isCommandPaletteOpen: false,
  setIsCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  isCreateTaskOpen: false,
  setIsCreateTaskOpen: (open) => set({ isCreateTaskOpen: open }),
  
  // Activity & Notifications
  activities: [],
  addActivity: (activity) => set((state) => ({
    activities: [activity, ...state.activities].slice(0, 100)
  })),
  
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications]
  })),
  markNotificationAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    )
  })),
  
  // Computed
  getFilteredTasks: () => {
    const { tasks, filters } = get()
    
    return tasks.filter(task => {
      if (filters.status?.length && !filters.status.includes(task.status))
        return false
        
      if (filters.priority?.length && !filters.priority.includes(task.priority))
        return false
        
      if (filters.assignees?.length && !filters.assignees.includes(task.assignee?.id || ''))
        return false
        
      if (filters.labels?.length) {
        const hasLabel = filters.labels.some(label => task.labels.includes(label))
        if (!hasLabel) return false
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        if (
          !task.title.toLowerCase().includes(searchLower) &&
          !task.description?.toLowerCase().includes(searchLower) &&
          !task.id.toLowerCase().includes(searchLower)
        ) {
          return false
        }
      }
      
      if (filters.dateRange) {
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate)
          if (dueDate < filters.dateRange.start || dueDate > filters.dateRange.end) {
            return false
          }
        }
      }
      
      return true
    })
  },
}))

// Selector hooks
export const useFilteredTasks = () => useTaskStore(state => state.getFilteredTasks())
export const useTasks = () => useTaskStore(state => state.tasks)
export const useFilters = () => useTaskStore(state => state.filters)
export const useActivities = () => useTaskStore(state => state.activities)
export const useNotifications = () => useTaskStore(state => state.notifications)
export const useCurrentView = () => useTaskStore(state => state.currentView)