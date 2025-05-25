'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// Define the workspace and member types directly since they might not be in the generated database types
interface Workspace {
  id: string
  name: string
  slug: string
  description?: string
  created_by: string
  created_at: string
  updated_at: string
}

interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: string
  joined_at: string
  user?: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
}

interface WorkspaceInvitation {
  id: string
  workspace_id: string
  email: string
  role: string
  token: string
  invited_by: string
  expires_at: string
  accepted: boolean
  created_at: string
}

interface WorkspaceContextType {
  currentWorkspace: Workspace | null
  workspaces: Workspace[]
  members: WorkspaceMember[]
  loading: boolean
  error: string | null
  setCurrentWorkspace: (workspace: Workspace) => void
  createWorkspace: (name: string, description?: string) => Promise<void>
  inviteToWorkspace: (email: string, role: string) => Promise<void>
  acceptInvitation: (token: string) => Promise<void>
  fetchWorkspaces: () => Promise<void>
  fetchMembers: () => Promise<void>
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  currentWorkspace: null,
  workspaces: [],
  members: [],
  loading: false,
  error: null,
  setCurrentWorkspace: () => {},
  createWorkspace: async () => {},
  inviteToWorkspace: async () => {},
  acceptInvitation: async () => {},
  fetchWorkspaces: async () => {},
  fetchMembers: async () => {},
})

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext)
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider')
  }
  return context
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      // Since workspace tables don't exist in the current schema, use mock data
      console.log('Using mock workspace data as database tables are not available')
      const mockWorkspaces: Workspace[] = [
        {
          id: 'mock-workspace-1',
          name: 'My Workspace',
          slug: 'my-workspace',
          description: 'Default workspace for development',
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ]
      
      setWorkspaces(mockWorkspaces)
      
      // Set current workspace from localStorage or first workspace
      const savedWorkspaceId = typeof window !== 'undefined' ? localStorage.getItem('currentWorkspaceId') : null
      const savedWorkspace = mockWorkspaces.find(w => w.id === savedWorkspaceId)
      
      if (savedWorkspace) {
        setCurrentWorkspace(savedWorkspace)
      } else {
        setCurrentWorkspace(mockWorkspaces[0])
      }
    } catch (error: any) {
      setError(error.message)
      console.error('Error in fetchWorkspaces:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const fetchMembers = useCallback(async () => {
    if (!currentWorkspace) return

    try {
      // Since workspace_members table doesn't exist, use mock data
      console.log('Using mock member data as database tables are not available')
      const mockMembers: WorkspaceMember[] = [
        {
          id: 'mock-member-1',
          workspace_id: currentWorkspace.id,
          user_id: 'mock-user-1',
          role: 'admin',
          joined_at: new Date().toISOString(),
          user: {
            id: 'mock-user-1',
            name: 'Current User',
            email: 'user@example.com',
            avatar_url: undefined
          }
        }
      ]
      
      setMembers(mockMembers)
    } catch (error: any) {
      console.warn('Error fetching members:', error.message)
      setError(error.message)
    }
  }, [currentWorkspace])

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  useEffect(() => {
    if (currentWorkspace) {
      fetchMembers()
      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentWorkspaceId', currentWorkspace.id)
      }
    }
  }, [currentWorkspace, fetchMembers])

  const createWorkspace = async (name: string, description?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Since workspace table doesn't exist, simulate creation
      const newWorkspace: Workspace = {
        id: crypto.randomUUID(),
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // Add to existing workspaces
      setWorkspaces(prev => [...prev, newWorkspace])
      setCurrentWorkspace(newWorkspace)
      
      console.log('Mock workspace created:', newWorkspace)
      router.push('/')
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }

  const inviteToWorkspace = async (email: string, role: string) => {
    if (!currentWorkspace) throw new Error('No workspace selected')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const token = crypto.randomUUID()
      
      // Since workspace_invitations table doesn't exist, simulate the invitation
      console.log('Mock invitation created:', {
        workspace: currentWorkspace.name,
        email,
        role,
        token,
        invitedBy: user.email
      })

      // Send invitation email (you'll need to set up email sending)
      if (typeof window !== 'undefined') {
        console.log(`Invitation link: ${window.location.origin}/invite/${token}`)
      }
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }

  const acceptInvitation = async (token: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Since workspace_invitations table doesn't exist, simulate acceptance
      console.log('Mock invitation accepted:', { token, user: user.email })
      
      // Simulate adding user to workspace
      await fetchWorkspaces()
      router.push('/')
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }

  return (
    <WorkspaceContext.Provider value={{
      currentWorkspace,
      workspaces,
      members,
      loading,
      error,
      setCurrentWorkspace,
      createWorkspace,
      inviteToWorkspace,
      acceptInvitation,
      fetchWorkspaces,
      fetchMembers,
    }}>
      {children}
    </WorkspaceContext.Provider>
  )
}