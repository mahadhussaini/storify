'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Sword,
  Heart,
  Zap,
  Users,
  Ghost,
  Sparkles,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface StoryTemplate {
  id: string
  name: string
  description: string
  genre: string
  icon: React.ComponentType<any>
  content: string
}

const templates: StoryTemplate[] = [
  {
    id: 'fantasy',
    name: 'Fantasy Adventure',
    description: 'Embark on a magical journey through enchanted realms',
    genre: 'Fantasy',
    icon: Sword,
    content: `# The Forgotten Kingdom

In the mist-shrouded mountains of Eldoria, where ancient magic still whispered through the winds, a young ${'{hero_name}'} discovered a hidden path that would change everything...

## Chapter 1: The Mysterious Map

The old tavern was filled with the usual crowd of merchants and travelers, their voices a dull roar against the wooden walls. ${'{hero_name}'} sat in the corner, nursing a tankard of ale, when the stranger approached.

"You look like someone who seeks adventure," the hooded figure said, sliding a crumpled parchment across the table.

The map showed lands that shouldn't exist, marked with symbols that seemed to pulse with their own inner light...

## Chapter 2: The Journey Begins

The path wound through dense forests where trees whispered secrets to those who listened. Strange creatures watched from the shadows, their eyes glowing like embers in the night...

`
  },
  {
    id: 'romance',
    name: 'Love Story',
    description: 'A tale of hearts entwined and destinies fulfilled',
    genre: 'Romance',
    icon: Heart,
    content: `# ${'{title}'}

## Chapter 1: An Unexpected Meeting

The rain fell in sheets outside the small bookstore on Elm Street. Inside, ${'{character1}'} was lost in the pages of an old novel when the bell above the door jingled.

He looked up to see her standing there, shaking rain from her umbrella, her eyes meeting his across the crowded shelves...

## Chapter 2: Growing Closer

Their conversations flowed as naturally as the river that ran through town. They discovered shared dreams, hidden fears, and the quiet understanding that comes when two souls recognize each other...

## Chapter 3: The First Kiss

The autumn leaves crunched under their feet as they walked along the riverbank. The setting sun painted the sky in hues of orange and pink, mirroring the warmth growing in their hearts...

`
  },
  {
    id: 'scifi',
    name: 'Sci-Fi Thriller',
    description: 'Navigate the stars and uncover cosmic conspiracies',
    genre: 'Science Fiction',
    icon: Zap,
    content: `# Starship ${'{ship_name}'}

## Log Entry 001 - Captain ${'{captain_name}'}

Stardate: ${new Date().toISOString().split('T')[0].replace(/-/g, '')}

We've been adrift in the void for 47 solar cycles. The crew grows restless, questioning our mission. But I know the truth - somewhere out there, beyond the galactic rim, lies the key to humanity's salvation...

## Incident Report Alpha

At 0300 hours, sensors detected an anomalous energy signature emanating from Sector 7-Gamma. Initial scans show quantum fluctuations unlike anything in our database.

"Captain, it's beautiful," whispered Dr. ${'{scientist_name}'}, her eyes reflecting the swirling colors on the main viewscreen.

But beauty can be deceptive. As we drew closer, alarms blared throughout the ship...

## The Discovery

The artifact hovered in space, a perfect sphere of unknown material. It pulsed with an inner light that seemed to whisper secrets to those who gazed upon it...

`
  },
  {
    id: 'mystery',
    name: 'Mystery Thriller',
    description: 'Unravel clues and solve the perfect crime',
    genre: 'Mystery',
    icon: Ghost,
    content: `# The ${'{location}'} Enigma

## Chapter 1: The Disappearance

Detective ${'{detective_name}'} stared at the empty chair where Mrs. Harrington had sat just moments ago. The room was exactly as she'd left it - teacup still warm, newspaper folded neatly on the side table.

But Mrs. Harrington was gone. Vanished without a trace.

## The Investigation Begins

The local police had written it off as a missing persons case, but ${'{detective_name}'} knew better. There were too many inconsistencies:

- The front door was locked from the inside
- No signs of struggle
- The family dog didn't bark
- A single white rose lay on the doorstep

## Clues and Suspicions

As ${'{detective_name}'} delved deeper, the case grew more complex. Each witness had a different story, each clue led to more questions...

The Harrington mansion held secrets that went back generations. And someone was willing to kill to keep them buried...

`
  },
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start with a completely clean slate',
    genre: 'General',
    icon: BookOpen,
    content: `# ${'{title}'}

## Chapter 1

[Your story begins here...]

`
  }
]

interface StoryTemplatesProps {
  onSelectTemplate: (content: string) => void
  onClose: () => void
}

export function StoryTemplates({ onSelectTemplate, onClose }: StoryTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const handleTemplateSelect = (template: StoryTemplate) => {
    let content = template.content

    // Replace placeholders with user input or defaults
    if (template.id !== 'blank') {
      const heroName = prompt('Enter your hero/character name:', 'Alex') || 'Alex'
      const title = prompt('Enter your story title:', template.name) || template.name

      content = content
        .replace(/\{hero_name\}/g, heroName)
        .replace(/\{title\}/g, title)
        .replace(/\{character1\}/g, heroName)
        .replace(/\{captain_name\}/g, heroName)
        .replace(/\{scientist_name\}/g, 'Elena')
        .replace(/\{detective_name\}/g, heroName)
        .replace(/\{ship_name\}/g, 'Aurora')
        .replace(/\{location\}/g, 'Victorian')
    }

    onSelectTemplate(content)
    onClose()
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
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Choose a Story Template
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Get started with a pre-built template or begin with a blank canvas
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <template.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {template.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {template.genre}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {template.description}
                </p>

                <div className="text-xs text-gray-500 dark:text-gray-500 line-clamp-3">
                  {template.content.split('\n').slice(0, 3).join('\n')}...
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
