'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  History,
  X,
  Clock,
  User,
  RotateCcw,
  Save,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Version {
  id: string
  version: number
  content: string
  description?: string
  author: {
    id: string
    name: string
    image?: string
  }
  createdAt: string
}

interface VersionHistoryProps {
  storyId: string
  onClose: () => void
}

export function VersionHistory({ storyId, onClose }: VersionHistoryProps) {
  const { data: session } = useSession()
  const [versions, setVersions] = useState<Version[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)
  const [isRestoring, setIsRestoring] = useState(false)

  // Load versions
  useEffect(() => {
    const loadVersions = async () => {
      try {
        const response = await fetch(`/api/stories/${storyId}/versions`)
        if (response.ok) {
          const data = await response.json()
          setVersions(data.versions || [])
        }
      } catch (error) {
        console.error('Error loading versions:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadVersions()
  }, [storyId])

  const handleRestoreVersion = async (version: Version) => {
    if (!confirm(`Are you sure you want to restore to version ${version.version}?`)) {
      return
    }

    setIsRestoring(true)
    try {
      const response = await fetch(`/api/stories/${storyId}/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          versionId: version.id,
          description: `Restored from version ${version.version}`
        })
      })

      if (response.ok) {
        toast.success('Version restored successfully!')
        onClose()
        // Reload the page to get the updated content
        window.location.reload()
      } else {
        toast.error('Failed to restore version')
      }
    } catch (error) {
      console.error('Error restoring version:', error)
      toast.error('Failed to restore version')
    } finally {
      setIsRestoring(false)
    }
  }

  const handleSaveVersion = async () => {
    const description = prompt('Enter a description for this version:')
    if (!description) return

    try {
      const response = await fetch(`/api/stories/${storyId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      })

      if (response.ok) {
        toast.success('Version saved successfully!')
        // Reload versions
        const loadVersions = async () => {
          const response = await fetch(`/api/stories/${storyId}/versions`)
          if (response.ok) {
            const data = await response.json()
            setVersions(data.versions || [])
          }
        }
        loadVersions()
      } else {
        toast.error('Failed to save version')
      }
    } catch (error) {
      console.error('Error saving version:', error)
      toast.error('Failed to save version')
    }
  }

  const handleDownloadVersion = (version: Version) => {
    const blob = new Blob([version.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `story-version-${version.version}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Version History</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={handleSaveVersion}>
            <Save className="w-4 h-4 mr-1" />
            Save Version
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Versions list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8 px-4">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No versions saved yet. Save your first version to start tracking changes.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {versions.map((version, index) => (
              <motion.div
                key={version.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedVersion?.id === version.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => setSelectedVersion(version)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Version {version.version}
                      </span>
                      {index === 0 && (
                        <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                          Latest
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownloadVersion(version)
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRestoreVersion(version)
                      }}
                      disabled={isRestoring}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatRelativeTime(version.createdAt)}</span>
                  <span>•</span>
                  <span>{formatDate(version.createdAt)}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <User className="w-4 h-4" />
                  <span>{version.author.name}</span>
                </div>

                {version.description && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
                    {version.description}
                  </p>
                )}

                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {version.content.length} characters • {version.content.split(/\s+/).filter(word => word.length > 0).length} words
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Version preview */}
      {selectedVersion && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 max-h-48 overflow-y-auto">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Version {selectedVersion.version} Preview
          </h4>
          <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded max-h-32 overflow-y-auto">
            {selectedVersion.content.length > 200
              ? `${selectedVersion.content.substring(0, 200)}...`
              : selectedVersion.content
            }
          </div>
        </div>
      )}
    </div>
  )
}
