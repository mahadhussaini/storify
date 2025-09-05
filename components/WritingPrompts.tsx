'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Lightbulb,
  Sparkles,
  RefreshCw,
  Copy,
  X,
  Wand2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface WritingPromptsProps {
  onSelectPrompt: (prompt: string) => void
  onClose: () => void
}

const curatedPrompts = [
  "Write about a character who discovers they can hear other people's thoughts, but only when they're lying.",
  "Describe a world where emotions are currency. What happens when someone goes bankrupt?",
  "A detective investigates a murder where the victim appears to have died twice.",
  "Write about two people who meet for the first time every day, but neither remembers the previous encounters.",
  "A librarian discovers a book that writes itself, predicting the future of its readers.",
  "Describe a city where buildings grow like plants, and architects are gardeners.",
  "Write about a musician who can play songs that make listeners relive their happiest memories.",
  "A scientist creates an AI that becomes obsessed with human emotions it can't feel.",
  "Describe a restaurant where the menu changes based on the diner's mood.",
  "Write about a photographer who can capture not just images, but also the sounds and smells of moments."
]

export function WritingPrompts({ onSelectPrompt, onClose }: WritingPromptsProps) {
  const [aiPrompts, setAiPrompts] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const generateAIPrompts = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 5 })
      })

      if (response.ok) {
        const data = await response.json()
        setAiPrompts(data.prompts)
      } else {
        toast.error('Failed to generate prompts')
      }
    } catch (error) {
      console.error('AI prompt generation error:', error)
      toast.error('Failed to generate prompts')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt)
    toast.success('Prompt copied to clipboard!')
  }

  const allPrompts = [...curatedPrompts, ...aiPrompts]

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
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Writing Prompts
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Spark your creativity with curated and AI-generated prompts
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Lightbulb className="w-4 h-4" />
                <span>{allPrompts.length} prompts available</span>
              </div>
            </div>

            <Button
              onClick={generateAIPrompts}
              disabled={isGenerating}
              variant="outline"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Generate AI Prompts
            </Button>
          </div>

          <div className="space-y-4">
            {allPrompts.map((prompt, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white mb-3">
                      {prompt}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {index < curatedPrompts.length ? 'Curated' : 'AI Generated'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyPrompt(prompt)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectPrompt(prompt)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Wand2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {allPrompts.length === 0 && (
            <div className="text-center py-12">
              <Lightbulb className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No prompts yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Generate AI prompts or use the curated collection
              </p>
              <Button onClick={generateAIPrompts} disabled={isGenerating}>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Your First Prompts
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
