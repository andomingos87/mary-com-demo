'use client'

import {
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  FileVideo,
  FileArchive,
  FileCode,
  FileAudio,
  Presentation,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// File type configuration with icons and colors
const FILE_TYPE_CONFIG: Record<string, {
  icon: React.ElementType
  color: string
  bgColor: string
  label: string
}> = {
  // PDF
  pdf: {
    icon: FileText,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'PDF',
  },
  // Word documents
  doc: {
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Word',
  },
  docx: {
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Word',
  },
  // Excel/Spreadsheets
  xls: {
    icon: FileSpreadsheet,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Excel',
  },
  xlsx: {
    icon: FileSpreadsheet,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Excel',
  },
  csv: {
    icon: FileSpreadsheet,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'CSV',
  },
  // PowerPoint
  ppt: {
    icon: Presentation,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    label: 'PowerPoint',
  },
  pptx: {
    icon: Presentation,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    label: 'PowerPoint',
  },
  // Images
  png: {
    icon: FileImage,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Imagem',
  },
  jpg: {
    icon: FileImage,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Imagem',
  },
  jpeg: {
    icon: FileImage,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Imagem',
  },
  gif: {
    icon: FileImage,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Imagem',
  },
  webp: {
    icon: FileImage,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Imagem',
  },
  svg: {
    icon: FileImage,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Imagem',
  },
  // Video
  mp4: {
    icon: FileVideo,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    label: 'Vídeo',
  },
  mov: {
    icon: FileVideo,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    label: 'Vídeo',
  },
  avi: {
    icon: FileVideo,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    label: 'Vídeo',
  },
  mkv: {
    icon: FileVideo,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    label: 'Vídeo',
  },
  webm: {
    icon: FileVideo,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    label: 'Vídeo',
  },
  // Audio
  mp3: {
    icon: FileAudio,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    label: 'Áudio',
  },
  wav: {
    icon: FileAudio,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    label: 'Áudio',
  },
  ogg: {
    icon: FileAudio,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    label: 'Áudio',
  },
  // Archives
  zip: {
    icon: FileArchive,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    label: 'Arquivo',
  },
  rar: {
    icon: FileArchive,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    label: 'Arquivo',
  },
  '7z': {
    icon: FileArchive,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    label: 'Arquivo',
  },
  tar: {
    icon: FileArchive,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    label: 'Arquivo',
  },
  gz: {
    icon: FileArchive,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    label: 'Arquivo',
  },
  // Code
  json: {
    icon: FileCode,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    label: 'JSON',
  },
  xml: {
    icon: FileCode,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    label: 'XML',
  },
  html: {
    icon: FileCode,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    label: 'HTML',
  },
  txt: {
    icon: FileText,
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    label: 'Texto',
  },
}

// Default config for unknown file types
const DEFAULT_CONFIG = {
  icon: File,
  color: 'text-gray-500',
  bgColor: 'bg-gray-100',
  label: 'Arquivo',
}

/**
 * Extract file extension from URL or file type string
 */
function getExtension(fileTypeOrUrl?: string | null): string {
  if (!fileTypeOrUrl) return ''
  
  // If it's already an extension (no dots or slashes)
  if (!fileTypeOrUrl.includes('.') && !fileTypeOrUrl.includes('/')) {
    return fileTypeOrUrl.toLowerCase()
  }
  
  // Try to extract from URL
  try {
    const url = new URL(fileTypeOrUrl)
    const pathname = url.pathname
    const lastDot = pathname.lastIndexOf('.')
    if (lastDot !== -1) {
      return pathname.slice(lastDot + 1).toLowerCase()
    }
  } catch {
    // Not a valid URL, try to extract extension directly
    const lastDot = fileTypeOrUrl.lastIndexOf('.')
    if (lastDot !== -1) {
      return fileTypeOrUrl.slice(lastDot + 1).toLowerCase()
    }
  }
  
  return ''
}

/**
 * Get file type configuration from extension or URL
 */
export function getFileTypeConfig(fileTypeOrUrl?: string | null) {
  const ext = getExtension(fileTypeOrUrl)
  return FILE_TYPE_CONFIG[ext] || DEFAULT_CONFIG
}

interface FileTypeIconProps {
  /** File type extension or URL */
  fileType?: string | null
  /** Icon size */
  size?: 'sm' | 'md' | 'lg'
  /** Show background container */
  showBackground?: boolean
  /** Additional class names */
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

const containerSizeClasses = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-2.5',
}

export function FileTypeIcon({
  fileType,
  size = 'md',
  showBackground = true,
  className,
}: FileTypeIconProps) {
  const config = getFileTypeConfig(fileType)
  const Icon = config.icon
  
  if (showBackground) {
    return (
      <div className={cn(
        'rounded-md shrink-0',
        containerSizeClasses[size],
        config.bgColor,
        className
      )}>
        <Icon className={cn(sizeClasses[size], config.color)} />
      </div>
    )
  }
  
  return (
    <Icon className={cn(sizeClasses[size], config.color, className)} />
  )
}

/**
 * Get file type label for display
 */
export function getFileTypeLabel(fileType?: string | null): string {
  const config = getFileTypeConfig(fileType)
  return config.label
}
