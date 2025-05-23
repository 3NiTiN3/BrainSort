'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Send, Edit2, Trash2, Smile } from 'lucide-react'
import { Comment, User } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { TaskEditor } from './TaskEditor'

interface CommentsSectionProps {
  comments: Comment[]
  taskId: string
  currentUser: User
  onAddComment: (content: string) => void
  onEditComment: (commentId: string, content: string) => void
  onDeleteComment: (commentId: string) => void
}

export function CommentsSection({
  comments,
  taskId,
  currentUser,
  onAddComment,
  onEditComment,
  onDeleteComment,
}: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment(newComment)
      setNewComment('')
    }
  }

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id)
    setEditContent(comment.content)
  }

  const handleSaveEdit = () => {
    if (editingId && editContent.trim()) {
      onEditComment(editingId, editContent)
      setEditingId(null)
      setEditContent('')
    }
  }

  const handleReaction = (commentId: string, emoji: string) => {
    // Handle emoji reactions
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">
        Comments ({comments.length})
      </h3>

      {/* Comments List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white">
                {comment.author.name.split(' ').map(n => n[0]).join('')}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-white">
                      {comment.author.name}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                    {comment.isEdited && (
                      <span className="text-xs text-gray-500 ml-2">(edited)</span>
                    )}
                  </div>
                  
                  {comment.author.id === currentUser.id && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(comment)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {editingId === comment.id ? (
                  <div className="space-y-2">
                    <TaskEditor
                      content={editContent}
                      onChange={setEditContent}
                      placeholder="Edit comment..."
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div 
                      className="text-gray-300 prose prose-invert prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: comment.content }}
                    />
                    
                    {/* Reactions */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleReaction(comment.id, '👍')}
                        className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                      >
                        👍
                      </button>
                      <button className="text-gray-400 hover:text-white">
                        <Smile size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Comment */}
      <div className="border-t border-gray-700 pt-4">
        <TaskEditor
          content={newComment}
          onChange={setNewComment}
          placeholder="Write a comment... Use @ to mention someone"
        />
        <div className="mt-2 flex justify-end">
          <Button onClick={handleSubmit} disabled={!newComment.trim()}>
            <Send size={16} />
            Comment
          </Button>
        </div>
      </div>
    </div>
  )
}