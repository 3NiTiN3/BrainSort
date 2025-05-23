import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Task, Filter, FilterQuery, Status, Activity, Notification } from '@/lib/types'

interface TaskStore {
  // Tasks
  tasks: Task[]
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  moveTask: (taskId: string, newStatus: Status) => void
  deleteTask: (id: string) => void
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

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      // Initial tasks
      tasks: [
        {
          id: 'BS-1234',
          title: 'Implement user authentication system with OAuth2',
          description: 'Add OAuth2 authentication with Google and GitHub providers',
          status: 'todo',
          priority: 'high',
          labels: ['Backend', 'Security'],
          assignee: { id: '1', name: 'John Doe', email: 'john@example.com' },
          startDate: new Date(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-1',
          attachments: [],
          comments: [],
          subtasks: [
            { id: 'st-1', title: 'Set up OAuth providers', completed: false },
            { id: 'st-2', title: 'Implement login flow', completed: false },
          ],
        },
        {
          id: 'BS-1235',
          title: 'Design responsive dashboard layout',
          status: 'inProgress',
          priority: 'medium',
          labels: ['Frontend', 'UI/UX'],
          assignee: { id: '2', name: 'Sarah Miller', email: 'sarah@example.com' },
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-1',
          timeTracked: 120,
          estimatedTime: 480,
        },
        {
          id: 'BS-1236',
          title: 'Update documentation for API endpoints',
          status: 'todo',
          priority: 'low',
          labels: ['Documentation'],
          assignee: { id: '3', name: 'Alex Johnson', email: 'alex@example.com' },
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-1',
        },
        {
          id: 'BS-1237',
          title: 'Fix performance issues in data grid',
          status: 'review',
          priority: 'high',
          labels: ['Bug', 'Performance'],
          assignee: { id: '4', name: 'Mike Kim', email: 'mike@example.com' },
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'user-1',
        },
      ],
      
      // Task actions
      addTask: (task) => {
        set((state) => ({ 
          tasks: [...state.tasks, task] 
        }))
        get().addActivity({
          id: Date.now().toString(),
          type: 'task_created',
          taskId: task.id,
          userId: task.createdBy,
          timestamp: new Date(),
          details: { title: task.title }
        })
      },
      
      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
          ),
        }))
        get().addActivity({
          id: Date.now().toString(),
          type: 'task_updated',
          taskId: id,
          userId: 'current-user',
          timestamp: new Date(),
          details: updates
        })
      },
      
      moveTask: (taskId, newStatus) => {
        const task = get().tasks.find(t => t.id === taskId)
        if (task) {
          get().updateTask(taskId, { status: newStatus })
          get().addActivity({
            id: Date.now().toString(),
            type: 'task_moved',
            taskId,
            userId: 'current-user',
            timestamp: new Date(),
            details: { from: task.status, to: newStatus }
          })
        }
      },
      
      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }))
      },
      
      removeTask: (id) => get().deleteTask(id),

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
        activities: [activity, ...state.activities].slice(0, 100) // Keep last 100
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
    }),
    {
      name: 'brainsort-storage',
      storage: createJSONStorage(() => localStorage), // Updated for v5
      partialize: (state) => ({
        tasks: state.tasks,
        savedFilters: state.savedFilters,
      }),
    }
  )
)

// Selector hooks for better performance
export const useFilteredTasks = () => useTaskStore(state => state.getFilteredTasks())
export const useTasks = () => useTaskStore(state => state.tasks)
export const useFilters = () => useTaskStore(state => state.filters)
export const useActivities = () => useTaskStore(state => state.activities)
export const useNotifications = () => useTaskStore(state => state.notifications)
export const useCurrentView = () => useTaskStore(state => state.currentView)