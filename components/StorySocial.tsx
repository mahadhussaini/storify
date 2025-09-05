'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Send,
  X,
  ThumbsUp,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatRelativeTime } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Comment {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string
    image?: string
  }
}

interface StorySocialProps {
  storyId: string
  onClose: () => void
}

export function StorySocial({ storyId, onClose }: StorySocialProps) {
  const { data: session } = useSession()
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadSocialData = useCallback(async () => {
    try {
      const [likesRes, commentsRes, bookmarkRes] = await Promise.all([
        fetch(`/api/stories/${storyId}/likes`),
        fetch(`/api/stories/${storyId}/comments`),
        session ? fetch(`/api/stories/${storyId}/bookmark`) : Promise.resolve({ ok: false, json: () => Promise.resolve({}) })
      ])

      if (likesRes.ok) {
        const likesData = await likesRes.json()
        setLikes(likesData.count)
        setIsLiked(likesData.isLiked)
      }

      if (commentsRes.ok) {
        const commentsData = await commentsRes.json()
        setComments(commentsData.comments)
      }

      if (bookmarkRes.ok) {
        const bookmarkData = await bookmarkRes.json()
        setIsBookmarked(bookmarkData.isBookmarked)
      }
    } catch (error) {
      console.error('Error loading social data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [storyId, session])

  useEffect(() => {
    loadSocialData()
  }, [loadSocialData])

  const handleLike = async () => {
    if (!session) {
      toast.error('Please sign in to like stories')
      return
    }

    try {
      const response = await fetch(`/api/stories/${storyId}/likes`, {
        method: isLiked ? 'DELETE' : 'POST'
      })

      if (response.ok) {
        setIsLiked(!isLiked)
        setLikes(prev => isLiked ? prev - 1 : prev + 1)
        toast.success(isLiked ? 'Removed like' : 'Story liked!')
      }
    } catch (error) {
      toast.error('Failed to update like')
    }
  }

  const handleBookmark = async () => {
    if (!session) {
      toast.error('Please sign in to bookmark stories')
      return
    }

    try {
      const response = await fetch(`/api/stories/${storyId}/bookmark`, {
        method: isBookmarked ? 'DELETE' : 'POST'
      })

      if (response.ok) {
        setIsBookmarked(!isBookmarked)
        toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks!')
      }
    } catch (error) {
      toast.error('Failed to update bookmark')
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || !newComment.trim()) return

    try {
      const response = await fetch(`/api/stories/${storyId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() })
      })

      if (response.ok) {
        const newCommentData = await response.json()
        setComments(prev => [newCommentData.comment, ...prev])
        setNewComment('')
        toast.success('Comment added!')
      }
    } catch (error) {
      toast.error('Failed to add comment')
    }
  }

  const handleShare = async () => {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this story on Storify',
          url: url
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    }
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={onClose}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
            Loading social features...
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Story Social
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* Action Buttons */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant={isLiked ? "default" : "outline"}
              size="sm"
              onClick={handleLike}
              className="flex items-center space-x-2"
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likes}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{comments.length}</span>
            </Button>

            <Button
              variant={isBookmarked ? "default" : "outline"}
              size="sm"
              onClick={handleBookmark}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>

            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-200 dark:border-gray-700 pt-4"
              >
                {/* Add Comment */}
                {session && (
                  <form onSubmit={handleComment} className="mb-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Button type="submit" size="sm" disabled={!newComment.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                )}

                {/* Comments List */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {comments.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                      No comments yet. Be the first to comment!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex space-x-3"
                      >
                        <div className="flex-shrink-0">
                          {comment.user.image ? (
                            <Image
                              src={comment.user.image}
                              alt={comment.user.name}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {comment.user.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">
                            {comment.content}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
