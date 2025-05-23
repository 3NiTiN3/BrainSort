import { NextRequest, NextResponse } from 'next/server'
import { Task } from '@/lib/types'

// Mock database - in production, use a real database
let tasks: Task[] = [
  {
    id: 'BS-1234',
    title: 'Implement user authentication system with OAuth2',
    status: 'todo',
    priority: 'high',
    labels: ['Backend', 'Security'],
    assignee: { id: '1', name: 'John Doe', email: 'john@example.com' },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export async function GET() {
  return NextResponse.json(tasks)
}

export async function POST(request: NextRequest) {
  const data = await request.json()
  const newTask: Task = {
    ...data,
    id: `BS-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  
  tasks.push(newTask)
  return NextResponse.json(newTask, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const { id, ...updates } = await request.json()
  
  const taskIndex = tasks.findIndex(t => t.id === id)
  if (taskIndex === -1) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...updates,
    updatedAt: new Date(),
  }
  
  return NextResponse.json(tasks[taskIndex])
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }
  
  tasks = tasks.filter(t => t.id !== id)
  return NextResponse.json({ success: true })
}