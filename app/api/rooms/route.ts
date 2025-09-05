import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { randomBytes } from 'crypto'

const createRoomSchema = z.object({
  storyId: z.string(),
  name: z.string().min(1, 'Room name is required'),
  maxUsers: z.number().min(2).max(50).default(10),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { storyId, name, maxUsers } = createRoomSchema.parse(body)

    // Check if story exists and user is the author
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { authorId: true, room: true }
    })

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    if (story.authorId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Only the story author can create rooms' }, { status: 403 })
    }

    if (story.room) {
      return NextResponse.json({ error: 'Room already exists for this story' }, { status: 400 })
    }

    // Generate a unique room code
    const roomCode = randomBytes(3).toString('hex').toUpperCase()

    const room = await prisma.room.create({
      data: {
        name,
        maxUsers,
        storyId,
      }
    })

    // Add the creator as the first member
    await prisma.roomMember.create({
      data: {
        userId: (session.user as any).id,
        roomId: room.id,
        role: 'owner'
      }
    })

    return NextResponse.json({
      room: {
        ...room,
        code: roomCode,
        members: 1
      }
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
