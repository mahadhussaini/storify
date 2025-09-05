'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Clock,
  FileText,
  TrendingUp,
  Target,
  Calendar,
  X,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface AnalyticsData {
  wordCount: number
  characterCount: number
  paragraphCount: number
  averageWordsPerParagraph: number
  readingTime: number
  writingSessions: number
  lastEdited: string
  dailyWordCount: Array<{ date: string; words: number }>
  mostUsedWords: Array<{ word: string; count: number }>
}

interface StoryAnalyticsProps {
  storyId: string
  storyContent: string
  onClose: () => void
}

export function StoryAnalytics({ storyId, storyContent, onClose }: StoryAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const calculateAnalytics = useCallback(() => {
    const words = storyContent.trim().split(/\s+/).filter(word => word.length > 0)
    const characters = storyContent.length
    const paragraphs = storyContent.split('\n\n').filter(p => p.trim().length > 0)
    const sentences = storyContent.split(/[.!?]+/).filter(s => s.trim().length > 0)

    // Calculate reading time (average 200-250 words per minute)
    const readingTime = Math.ceil(words.length / 225)

    // Most used words (excluding common words)
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can'])
    const wordFreq: { [key: string]: number } = {}

    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '')
      if (cleanWord.length > 2 && !commonWords.has(cleanWord)) {
        wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1
      }
    })

    const mostUsedWords = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }))

    setAnalytics({
      wordCount: words.length,
      characterCount: characters,
      paragraphCount: paragraphs.length,
      averageWordsPerParagraph: paragraphs.length > 0 ? Math.round(words.length / paragraphs.length) : 0,
      readingTime,
      writingSessions: 1, // This would come from the database
      lastEdited: new Date().toISOString(),
      dailyWordCount: [], // This would come from the database
      mostUsedWords
    })

    setIsLoading(false)
  }, [storyContent])

  useEffect(() => {
    calculateAnalytics()
  }, [calculateAnalytics])

  const exportAnalytics = () => {
    if (!analytics) return

    const data = {
      storyId,
      timestamp: new Date().toISOString(),
      ...analytics
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `story-analytics-${storyId}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading || !analytics) {
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
            Analyzing your story...
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
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Story Analytics
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Insights into your writing progress and patterns
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={exportAnalytics}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white"
            >
              <FileText className="w-8 h-8 mb-2 opacity-80" />
              <div className="text-2xl font-bold">{analytics.wordCount.toLocaleString()}</div>
              <div className="text-sm opacity-80">Words</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white"
            >
              <Clock className="w-8 h-8 mb-2 opacity-80" />
              <div className="text-2xl font-bold">{analytics.readingTime}</div>
              <div className="text-sm opacity-80">Min Read</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white"
            >
              <Target className="w-8 h-8 mb-2 opacity-80" />
              <div className="text-2xl font-bold">{analytics.paragraphCount}</div>
              <div className="text-sm opacity-80">Paragraphs</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white"
            >
              <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
              <div className="text-2xl font-bold">{analytics.averageWordsPerParagraph}</div>
              <div className="text-sm opacity-80">Avg Words/Para</div>
            </motion.div>
          </div>

          {/* Most Used Words */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Most Used Words
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {analytics.mostUsedWords.map((item, index) => (
                <motion.div
                  key={item.word}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center"
                >
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {item.word}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {item.count} times
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Writing Goals */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Writing Goals
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {Math.max(0, 50000 - analytics.wordCount).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Words to Novel
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(analytics.wordCount / 1000 * 10) / 10}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Novel Progress
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {Math.round(analytics.wordCount / analytics.writingSessions)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Avg Session Words
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
