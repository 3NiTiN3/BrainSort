import { useHotkeys } from 'react-hotkeys-hook'
import { useRouter } from 'next/navigation'
import { useTaskStore } from './useTaskStore'

export function useKeyboardShortcuts() {
  const router = useRouter()
  const { setIsCommandPaletteOpen, setIsCreateTaskOpen } = useTaskStore()

  // Command palette
  useHotkeys('cmd+k, ctrl+k', (e) => {
    e.preventDefault()
    setIsCommandPaletteOpen(true)
  })

  // Create new task
  useHotkeys('cmd+n, ctrl+n', (e) => {
    e.preventDefault()
    setIsCreateTaskOpen(true)
  })

  // Navigate to board
  useHotkeys('cmd+b, ctrl+b', () => {
    router.push('/')
  })

  // Navigate to calendar
  useHotkeys('cmd+shift+c, ctrl+shift+c', () => {
    router.push('/calendar')
  })

  // Navigate to table
  useHotkeys('cmd+t, ctrl+t', () => {
    router.push('/table')
  })

  // Search
  useHotkeys('cmd+f, ctrl+f', (e) => {
    e.preventDefault()
    document.getElementById('search-input')?.focus()
  })
}