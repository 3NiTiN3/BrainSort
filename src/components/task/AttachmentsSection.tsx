'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { File, Image, Video, FileText, Download, X, Upload } from 'lucide-react'
import { formatBytes } from '@/lib/utils'
import { Attachment } from '@/lib/types'

interface AttachmentsSectionProps {
  attachments: Attachment[]
  onUpload: (files: File[]) => void
  onDelete: (attachmentId: string) => void
}

export function AttachmentsSection({
  attachments,
  onUpload,
  onDelete,
}: AttachmentsSectionProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onUpload(acceptedFiles)
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10485760, // 10MB
  })

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image size={20} />
    if (type.startsWith('video/')) return <Video size={20} />
    if (type.includes('pdf')) return <FileText size={20} />
    return <File size={20} />
  }

  const getFilePreview = (attachment: Attachment) => {
    if (attachment.type.startsWith('image/')) {
      return (
        <img
          src={attachment.url}
          alt={attachment.name}
          className="w-full h-32 object-cover rounded"
        />
      )
    }
    return (
      <div className="w-full h-32 bg-gray-700 rounded flex items-center justify-center">
        {getFileIcon(attachment.type)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">
        Attachments ({attachments.length})
      </h3>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-2 text-gray-400" size={24} />
        <p className="text-gray-400">
          {isDragActive
            ? 'Drop files here...'
            : 'Drag & drop files here, or click to select'}
        </p>
        <p className="text-xs text-gray-500 mt-1">Maximum file size: 10MB</p>
      </div>

      {/* Attachments Grid */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="bg-gray-800 rounded-lg overflow-hidden group relative"
            >
              {getFilePreview(attachment)}
              
              <div className="p-3">
                <p className="text-sm text-white truncate">{attachment.name}</p>
                <p className="text-xs text-gray-400">
                  {formatBytes(attachment.size)}
                </p>
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                
                  href={attachment.url}
                  download={attachment.name}
                  className="p-1 bg-gray-900/80 rounded hover:bg-gray-900"
                >
                  <Download size={16} className="text-white" />
                </a>
                <button
                  onClick={() => onDelete(attachment.id)}
                  className="p-1 bg-gray-900/80 rounded hover:bg-gray-900"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}