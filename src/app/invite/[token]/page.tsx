'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkspace } from '@/contexts/WorkspaceContext'
import { Button } from '@/components/ui/Button'
import { Loader2 } from 'lucide-react'

export default function InvitePage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const { acceptInvitation } = useWorkspace()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAccept = async () => {
    try {
      setLoading(true)
      await acceptInvitation(params.token)
      router.push('/')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-4">
          You&apos;ve been invited to join a workspace
        </h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <p className="text-gray-400 mb-6">
          Click accept to join the workspace and start collaborating with your team.
        </p>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => router.push('/')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Accepting...
              </>
            ) : (
              'Accept Invitation'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}