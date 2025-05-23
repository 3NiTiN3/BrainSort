'use client'

import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Plus, 
  Calendar, 
  Table, 
  BarChart3,
  Settings,
  User,
  LogOut 
} from 'lucide-react'
import { useTaskStore } from '@/hooks/useTaskStore'

export function CommandPalette() {
  const router = useRouter()
  const { isCommandPaletteOpen, setIsCommandPaletteOpen, tasks } = useTaskStore()
  const [search, setSearch] = useState('')

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsCommandPaletteOpen(!isCommandPaletteOpen)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen])

  if (!isCommandPaletteOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={() => setIsCommandPaletteOpen(false)}
      />
      <div className="relative max-w-2xl mx-auto mt-20">
        <Command className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command or search..."
            className="w-full px-4 py-3 bg-transparent text-white placeholder-gray-400 border-b border-gray-700 focus:outline-none"
          />
          
          <Command.List className="max-h-96 overflow-auto p-2">
            <Command.Empty className="text-center py-8 text-gray-400">
              No results found.
            </Command.Empty>

            <Command.Group heading="Actions" className="text-gray-400 text-xs font-medium px-2 py-1">
              <Command.Item
                onSelect={() => {
                  setIsCommandPaletteOpen(false)
                  router.push('/task/new')
                }}
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 cursor-pointer"
              >
                <Plus size={16} />
                Create New Task
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Navigation" className="text-gray-400 text-xs font-medium px-2 py-1 mt-2">
              <Command.Item
                onSelect={() => {
                  setIsCommandPaletteOpen(false)
                  router.push('/')
                }}
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 cursor-pointer"
              >
                <BarChart3 size={16} />
                Board View
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  setIsCommandPaletteOpen(false)
                  router.push('/calendar')
                }}
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 cursor-pointer"
              >
                <Calendar size={16} />
                Calendar View
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  setIsCommandPaletteOpen(false)
                  router.push('/table')
                }}
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 cursor-pointer"
              >
                <Table size={16} />
                Table View
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Tasks" className="text-gray-400 text-xs font-medium px-2 py-1 mt-2">
              {tasks.slice(0, 5).map((task) => (
                <Command.Item
                  key={task.id}
                  onSelect={() => {
                    setIsCommandPaletteOpen(false)
                    router.push(`/task/${task.id}`)
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800 cursor-pointer"
                >
                  <Search size={16} />
                  <div>
                    <div className="text-sm">{task.title}</div>
                    <div className="text-xs text-gray-400">{task.id}</div>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  )
}