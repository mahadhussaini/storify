import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const joinRoomSchema = z.object({
  roomCode: z.string().min(1, 'Room code is required'),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { roomCode } = joinRoomSchema.parse(body)

    // For now, we'll use the room ID as the code
    // In a real implementation, you'd have a separate room code field
    const room = await prisma.room.findUnique({
      where: { id: roomCode },
      include: {
        story: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              }
            }
          }
        },
        _count: {
          select: { members: true }
        }
      }
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (!room.isActive) {
      return NextResponse.json({ error: 'Room is no longer active' }, { status: 400 })
    }

    if (room._count.members >= room.maxUsers) {
      return NextResponse.json({ error: 'Room is full' }, { status: 400 })
    }

    // Check if user is already a member
    const existingMember = room.members.find((m: any) => m.userId === (session.user as any)?.id)
    if (existingMember) {
      return NextResponse.json({
        room,
        story: room.story,
        message: 'Already a member of this room'
      })
    }

    // Add user to room
    await prisma.roomMember.create({
      data: {
        userId: (session.user as any).id,
        roomId: room.id,
        role: 'member'
      }
    })

    // Fetch updated room data
    const updatedRoom = await prisma.room.findUnique({
      where: { id: roomCode },
      include: {
        story: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              }
            }
          }
        },
        _count: {
          select: { members: true }
        }
      }
    })

    return NextResponse.json({
      room: updatedRoom,
      story: updatedRoom?.story,
      message: 'Successfully joined the room'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error joining room:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
