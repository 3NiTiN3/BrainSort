'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, ListOrdered } from 'lucide-react'

interface TaskEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function TaskEditor({ content, onChange, placeholder }: TaskEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Write a description...',
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: {
          items: ({ query }) => {
            // Return filtered users based on query
            return [
              { id: '1', name: 'John Doe' },
              { id: '2', name: 'Sarah Miller' },
            ].filter(user => 
              user.name.toLowerCase().includes(query.toLowerCase())
            )
          },
          render: () => {
            // Custom mention dropdown renderer
            return {
              onStart: () => {},
              onUpdate: () => {},
              onKeyDown: () => {},
              onExit: () => {},
            }
          },
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) return null

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-800 border-b border-gray-700 p-2 flex items-center gap-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-700 ${
            editor.isActive('bold') ? 'bg-gray-700' : ''
          }`}
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-700 ${
            editor.isActive('italic') ? 'bg-gray-700' : ''
          }`}
        >
          <Italic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-700 ${
            editor.isActive('bulletList') ? 'bg-gray-700' : ''
          }`}
        >
          <List size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-700 ${
            editor.isActive('orderedList') ? 'bg-gray-700' : ''
          }`}
        >
          <ListOrdered size={16} />
        </button>
      </div>
      <EditorContent 
        editor={editor} 
        className="prose prose-invert max-w-none p-4 min-h-[200px] focus:outline-none"
      />
    </div>
  )
}