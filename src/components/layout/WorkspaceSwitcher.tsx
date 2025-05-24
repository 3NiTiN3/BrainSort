'use client'

import { useState } from 'react'
import { ChevronDown, Plus, Settings, Users } from 'lucide-react'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { cn } from '@/lib/utils'

export function WorkspaceSwitcher() {
  const { currentWorkspace, workspaces, setCurrentWorkspace } = useWorkspace()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors w-full"
      >
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
          {currentWorkspace?.name.charAt(0).toUpperCase() || 'W'}
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-white">
            {currentWorkspace?.name || 'Select Workspace'}
          </p>
        </div>
        <ChevronDown size={16} className="text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-20">
            <div className="p-2">
              {/* Workspace List */}
              {workspaces.map(workspace => (
                <button
                  key={workspace.id}
                  onClick={() => {
                    setCurrentWorkspace(workspace)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors text-left",
                    currentWorkspace?.id === workspace.id
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm">{workspace.name}</span>
                </button>
              ))}

              {/* Divider */}
              <div className="border-t border-gray-800 my-2" />

              {/* Actions */}
              <button
                onClick={() => {
                  // Navigate to create workspace
                  setIsOpen(false)
                }}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <Plus size={16} />
                <span className="text-sm">Create Workspace</span>
              </button>

              {currentWorkspace && (
                <>
                  <button
                    onClick={() => {
                      // Navigate to workspace settings
                      setIsOpen(false)
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    <Settings size={16} />
                    <span className="text-sm">Workspace Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      // Navigate to members
                      setIsOpen(false)
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    <Users size={16} />
                    <span className="text-sm">Manage Members</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}