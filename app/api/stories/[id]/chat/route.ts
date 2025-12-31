import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const messages = await prisma.chatMessage.findMany({
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
        createdAt: 'asc'
      },
      take: 100 // Limit to last 100 messages
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching chat messages:', error)
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
    const { content } = body

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 })
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

    // Create chat message
    const message = await prisma.chatMessage.create({
      data: {
        content: content.trim(),
        storyId: params.id,
        authorId: (session.user as any).id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    return NextResponse.json({ 
      message: {
        id: message.id,
        content: message.content,
        author: message.author,
        timestamp: message.createdAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Error creating chat message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}