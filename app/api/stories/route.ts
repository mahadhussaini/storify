import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createStorySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'

    let where = {}
    if (filter === 'my-stories') {
      where = { authorId: (session.user as any).id }
    } else if (filter === 'collaborative') {
      where = {
        AND: [
          {
            room: {
              isNot: null
            }
          },
          {
            room: {
              members: {
                some: {
                  userId: (session.user as any).id
                }
              }
            }
          }
        ]
      }
    }

    const stories = await prisma.story.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        room: {
          include: {
            members: true,
            _count: {
              select: { members: true }
            }
          }
        },
        _count: {
          select: {
            versions: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({ stories })
  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, isPublic } = createStorySchema.parse(body)

    const story = await prisma.story.create({
      data: {
        title,
        description,
        isPublic,
        authorId: (session.user as any).id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    })

    // Create initial version
    await prisma.storyVersion.create({
      data: {
        storyId: story.id,
        content: '',
        version: 1,
        authorId: (session.user as any).id,
        createdAt: story.createdAt,
      }
    })

    return NextResponse.json({ story }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating story:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
