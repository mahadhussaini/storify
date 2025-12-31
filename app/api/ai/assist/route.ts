import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { withOpenAI, OpenAIConfigurationError } from '@/lib/openai'
import { z } from 'zod'

const assistSchema = z.object({
  mode: z.enum(['suggest', 'continue', 'summarize', 'improve']),
  content: z.string(),
  prompt: z.string().optional(),
})


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { mode, content, prompt } = assistSchema.parse(body)

    let systemPrompt = ''
    let userPrompt = ''

    switch (mode) {
      case 'suggest':
        systemPrompt = `You are a creative writing assistant. Help the user with their story by providing thoughtful, creative suggestions based on their specific request. Keep your response focused and actionable.`
        userPrompt = `Story content: "${content}"\n\nRequest: ${prompt}`
        break

      case 'continue':
        systemPrompt = `You are a creative writing assistant. Continue the user's story in a natural, engaging way. Match the writing style, tone, and voice of the existing content. Keep the continuation to 2-3 paragraphs.`
        userPrompt = `Continue this story:\n\n${content}`
        break

      case 'summarize':
        systemPrompt = `You are a writing assistant. Provide a concise but comprehensive summary of the story. Capture the main plot points, characters, and themes.`
        userPrompt = `Summarize this story:\n\n${content}`
        break

      case 'improve':
        systemPrompt = `You are an expert writing editor. Review the content and provide improved versions that enhance clarity, engagement, and writing quality. Focus on grammar, style, pacing, and creative elements.`
        userPrompt = `Review and improve this writing:\n\n${content}`
        break
    }

    const completion = await withOpenAI(async (openai) => {
      return await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      })
    })

    const suggestion = completion.choices[0]?.message?.content?.trim()

    if (!suggestion) {
      return NextResponse.json(
        { error: 'Failed to generate suggestion' },
        { status: 500 }
      )
    }

    return NextResponse.json({ suggestion })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof OpenAIConfigurationError) {
      return NextResponse.json(
        { error: 'AI features are not configured' },
        { status: 503 }
      )
    }

    console.error('AI assist error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
