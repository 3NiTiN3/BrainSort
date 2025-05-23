export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type Status = 'todo' | 'inProgress' | 'review' | 'done' | 'blocked'
export type ViewType = 'board' | 'calendar' | 'gantt' | 'table' | 'timeline'

export interface Task {
  id: string
  title: string
  description?: string
  content?: string // Rich text content
  status: Status
  priority: Priority
  assignee?: User
  assignees?: User[] // Multiple assignees
  labels: string[]
  storyPoints?: number
  startDate?: Date
  dueDate?: Date
  completedDate?: Date
  attachments?: Attachment[]
  comments?: Comment[]
  subtasks?: Subtask[]
  dependencies?: string[] // Task IDs
  watchers?: string[] // User IDs
  timeTracked?: number // in minutes
  estimatedTime?: number // in minutes
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastModifiedBy?: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role?: 'admin' | 'member' | 'viewer'
  status?: 'online' | 'offline' | 'away'
}

export interface Attachment {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedBy: string
  uploadedAt: Date
}

export interface Comment {
  id: string
  content: string
  author: User
  createdAt: Date
  updatedAt?: Date
  mentions?: string[] // User IDs
  reactions?: Reaction[]
  isEdited?: boolean
}

export interface Reaction {
  emoji: string
  users: string[] // User IDs
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
  assignee?: string
}

export interface Filter {
  id: string
  name: string
  query: FilterQuery
  isDefault?: boolean
  createdBy: string
}

export interface FilterQuery {
  status?: Status[]
  priority?: Priority[]
  assignees?: string[]
  labels?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  search?: string
}

export interface Sprint {
  id: string
  name: string
  startDate: Date
  endDate: Date
  goal?: string
  tasks: string[] // Task IDs
  status: 'planning' | 'active' | 'completed'
}

export interface Activity {
  id: string
  type: 'task_created' | 'task_updated' | 'task_moved' | 'comment_added' | 'attachment_added'
  taskId: string
  userId: string
  timestamp: Date
  details: any
}

export interface Notification {
  id: string
  type: 'mention' | 'assignment' | 'comment' | 'due_date' | 'status_change'
  title: string
  message: string
  taskId?: string
  read: boolean
  createdAt: Date
  userId: string
}