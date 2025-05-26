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

      // Try to fetch workspaces - if tables don't exit handle gracefully
      try {
        const { data, error } = await supabase
          .from('workspaces')
          .select(`
            *,
            workspace_members!inner(role, user_id)
          `)
          .eq('workspace_members.user_id', user.id)

        if (error) {
          // If tables don't exist, create mock data for development
          console.warn('Workspace tables not found, using mock data:', error.message)
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
          setCurrentWorkspace(mockWorkspaces[0])
          return
        }

        setWorkspaces(data || [])
        
        // Set current workspace from localStorage or first workspace
        const savedWorkspaceId = typeof window !== 'undefined' ? localStorage.getItem('currentWorkspaceId') : null
        const savedWorkspace = data?.find(w => w.id === savedWorkspaceId)
        
        if (savedWorkspace) {
          setCurrentWorkspace(savedWorkspace)
        } else if (data && data.length > 0) {
          setCurrentWorkspace(data[0])
        }
      } catch (dbError: any) {
        console.warn('Database error, using mock workspace:', dbError.message)
        // Fallback to mock data if database tables don't exist
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
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          *,
          user:user_id(id, name, email, avatar_url)
        `)
        .eq('workspace_id', currentWorkspace.id)

      if (error) {
        console.warn('Could not fetch workspace members:', error.message)
        return
      }
      
      setMembers(data || [])
    } catch (error: any) {
      console.warn('Error fetching members:', error.message)
      setError(error.message)
    }
  }, [currentWorkspace, supabase])

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

      const slug = name.toLowerCase().replace(/\s+/g, '-')

      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          name,
          slug,
          description,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error

      await fetchWorkspaces()
      setCurrentWorkspace(data)
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
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

      const { error } = await supabase
        .from('workspace_invitations')
        .insert({
          workspace_id: currentWorkspace.id,
          email,
          role,
          token,
          invited_by: user.id,
          expires_at: expiresAt.toISOString(),
        })

      if (error) throw error

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

      // Get invitation
      const { data: invitation, error: inviteError } = await supabase
        .from('workspace_invitations')
        .select('*, workspace:workspace_id(*)')
        .eq('token', token)
        .single()

      if (inviteError) throw inviteError
      if (!invitation) throw new Error('Invalid invitation')
      if (invitation.accepted) throw new Error('Invitation already used')
      if (new Date(invitation.expires_at) < new Date()) throw new Error('Invitation expired')

      // Add user to workspace
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: invitation.workspace_id,
          user_id: user.id,
          role: invitation.role,
        })

      if (memberError) throw memberError

      // Mark invitation as accepted
      const { error: updateError } = await supabase
        .from('workspace_invitations')
        .update({ accepted: true })
        .eq('id', invitation.id)

      if (updateError) throw updateError

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