'use client'

import { formatDistanceToNow } from 'date-fns'
import { 
  Plus, 
  Edit, 
  ArrowRight, 
  MessageCircle, 
  Paperclip,
  Clock
} from 'lucide-react'
import { Activity } from '@/lib/types'
import { useTaskStore } from '@/hooks/useTaskStore'

export function ActivityFeed() {
  const { activities } = useTaskStore()

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'task_created':
        return <Plus size={16} className="text-green-400" />
      case 'task_updated':
        return <Edit size={16} className="text-blue-400" />
      case 'task_moved':
        return <ArrowRight size={16} className="text-purple-400" />
      case 'comment_added':
        return <MessageCircle size={16} className="text-yellow-400" />
      case 'attachment_added':
        return <Paperclip size={16} className="text-gray-400" />
    }
  }

  const getActivityMessage = (activity: Activity) => {
    switch (activity.type) {
      case 'task_created':
        return `created task "${activity.details.title}"`
      case 'task_updated':
        return `updated task`
      case 'task_moved':
        return `moved task from ${activity.details.from} to ${activity.details.to}`
      case 'comment_added':
        return `commented on task`
      case 'attachment_added':
        return `added attachment to task`
    }
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-white">Activity Feed</h3>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No activity yet</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="mt-1">{getActivityIcon(activity.type)}</div>
              <div className="flex-1">
                <p className="text-sm text-gray-300">
                  <span className="font-medium text-white">User</span>{' '}
                  {getActivityMessage(activity)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}