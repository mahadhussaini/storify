import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createVersionSchema = z.object({
  description: z.string().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has access to the story
    const story = await prisma.story.findUnique({
      where: { id: params.id },
      select: {
        authorId: true,
        room: {
          include: { members: true }
        }
      }
    })

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    const isAuthor = story.authorId === (session.user as any).id
    const isCollaborator = story.room?.members.some((m: any) => m.userId === (session.user as any).id)

    if (!isAuthor && !isCollaborator) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const versions = await prisma.storyVersion.findMany({
      where: { storyId: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      },
      orderBy: {
        version: 'desc'
      }
    })

    return NextResponse.json({ versions })
  } catch (error) {
    console.error('Error fetching versions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { description } = createVersionSchema.parse(body)

    // Check if user has access to the story
    const story = await prisma.story.findUnique({
      where: { id: params.id },
      select: {
        authorId: true,
        content: true,
        room: {
          include: { members: true }
        }
      }
    })

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    const isAuthor = story.authorId === (session.user as any).id
    const isCollaborator = story.room?.members.some((m: any) => m.userId === (session.user as any).id)

    if (!isAuthor && !isCollaborator) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get the latest version number
    const latestVersion = await prisma.storyVersion.findFirst({
      where: { storyId: params.id },
      orderBy: { version: 'desc' },
      select: { version: true }
    })

    const newVersionNumber = (latestVersion?.version || 0) + 1

    const version = await prisma.storyVersion.create({
      data: {
        storyId: params.id,
        content: story.content,
        version: newVersionNumber,
        authorId: (session.user as any).id,
        createdAt: description ? new Date() : undefined, // Use current time if description provided
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

    return NextResponse.json({ version }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating version:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
