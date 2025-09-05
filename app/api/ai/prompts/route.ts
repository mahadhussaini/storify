import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { count = 5 } = body

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI features are not configured' },
        { status: 503 }
      )
    }

    const prompt = `Generate ${count} creative writing prompts for fiction stories. Each prompt should be:
1. Engaging and thought-provoking
2. Between 15-25 words long
3. Suitable for various genres (fantasy, sci-fi, contemporary, etc.)
4. Include an interesting twist or unique element

Return only the prompts as a JSON array of strings, no additional text or formatting.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.8,
    })

    const response = completion.choices[0]?.message?.content?.trim()

    if (!response) {
      return NextResponse.json(
        { error: 'Failed to generate prompts' },
        { status: 500 }
      )
    }

    // Parse the JSON response
    let prompts: string[]
    try {
      prompts = JSON.parse(response)
    } catch (error) {
      // If JSON parsing fails, try to extract prompts from text
      prompts = response.split('\n').filter(line => line.trim().length > 10)
    }

    return NextResponse.json({ prompts })
  } catch (error) {
    console.error('AI prompts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
