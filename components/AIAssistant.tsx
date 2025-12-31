'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Send,
  X,
  Lightbulb,
  FileText,
  Wand2,
  MessageSquare
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface AIAssistantProps {
  storyContent: string
  onSuggestion: (suggestion: string) => void
  onClose: () => void
}

type AIMode = 'suggest' | 'continue' | 'summarize' | 'improve'

export function AIAssistant({ storyContent, onSuggestion, onClose }: AIAssistantProps) {
  const [mode, setMode] = useState<AIMode>('suggest')
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState('')
  const [showQuickActions, setShowQuickActions] = useState(true)

  const handleSubmit = async () => {
    if (!prompt.trim() && mode === 'suggest') return

    setIsLoading(true)
    setResponse('')

    try {
      const response = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          content: storyContent,
          prompt: prompt.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResponse(data.suggestion)
      } else {
        toast.error('Failed to get AI assistance')
      }
    } catch (error) {
      console.error('AI request error:', error)
      toast.error('Failed to get AI assistance')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseSuggestion = () => {
    if (response) {
      onSuggestion(response)
      setResponse('')
      setPrompt('')
    }
  }

  const getModeIcon = (modeType: AIMode) => {
    switch (modeType) {
      case 'suggest': return <Lightbulb className="w-4 h-4" />
      case 'continue': return <Wand2 className="w-4 h-4" />
      case 'summarize': return <FileText className="w-4 h-4" />
      case 'improve': return <Sparkles className="w-4 h-4" />
    }
  }

  const getModeDescription = (modeType: AIMode) => {
    switch (modeType) {
      case 'suggest': return 'Get creative writing suggestions'
      case 'continue': return 'Continue your story from here'
      case 'summarize': return 'Create a summary of your story'
      case 'improve': return 'Improve and refine your writing'
    }
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 min-h-0">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Scrollable Content Area */}
      <div 
        className="flex-1 overflow-y-auto overflow-x-hidden ai-assistant-scrollable min-h-0"
        style={{ 
          maxHeight: '100%',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Quick Actions */}
        {showQuickActions && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Quick Actions</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuickActions(false)}
                className="text-xs"
              >
                Hide
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMode('suggest')
                  setPrompt('Make this scene more engaging')
                  setShowQuickActions(false)
                }}
                className="p-2 text-left bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                <div className="text-xs font-medium text-blue-700 dark:text-blue-300">Make More Engaging</div>
              </button>
              <button
                onClick={() => {
                  setMode('improve')
                  setPrompt('')
                  setShowQuickActions(false)
                }}
                className="p-2 text-left bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
              >
                <div className="text-xs font-medium text-green-700 dark:text-green-300">Improve Writing</div>
              </button>
              <button
                onClick={() => {
                  setMode('continue')
                  setPrompt('')
                  setShowQuickActions(false)
                }}
                className="p-2 text-left bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
              >
                <div className="text-xs font-medium text-purple-700 dark:text-purple-300">Continue Story</div>
              </button>
              <button
                onClick={() => {
                  setMode('summarize')
                  setPrompt('')
                  setShowQuickActions(false)
                }}
                className="p-2 text-left bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
              >
                <div className="text-xs font-medium text-orange-700 dark:text-orange-300">Create Summary</div>
              </button>
            </div>
          </div>
        )}

        {/* Mode Selection */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-2">
            {!showQuickActions && (
              <button
                onClick={() => setShowQuickActions(true)}
                className="col-span-2 p-2 text-center bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <div className="text-xs font-medium text-gray-600 dark:text-gray-300">Show Quick Actions</div>
              </button>
            )}
            {(['suggest', 'continue', 'summarize', 'improve'] as AIMode[]).map((modeType) => (
              <button
                key={modeType}
                onClick={() => setMode(modeType)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  mode === modeType
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {getModeIcon(modeType)}
                  <span className="font-medium text-sm capitalize">{modeType}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {getModeDescription(modeType)}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          {mode === 'suggest' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What would you like help with?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Suggest a plot twist, describe the character's appearance, etc."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isLoading || (mode === 'suggest' && !prompt.trim())}
            className="w-full mt-3"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Generate {mode === 'suggest' ? 'Suggestion' : mode === 'continue' ? 'Continuation' : mode === 'summarize' ? 'Summary' : 'Improvement'}
              </>
            )}
          </Button>
        </div>

        {/* Response */}
        <div className="p-4">
          <AnimatePresence>
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    AI Suggestion
                  </span>
                </div>

                <div className="text-sm text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                  {response}
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handleUseSuggestion}
                    className="flex-1"
                  >
                    Use This Suggestion
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setResponse('')}
                  >
                    Dismiss
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
