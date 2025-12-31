import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    roomId: string
  }
}

// Get room information
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomId } = params

    // Get room data from database
    let roomData = null
    try {
      roomData = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
          story: {
            select: {
              id: true,
              title: true,
              content: true,
              createdAt: true,
              updatedAt: true
            }
          },
          _count: {
            select: {
              members: true
            }
          }
        }
      })
    } catch (error) {
      console.warn('Database query failed for room:', error)
    }

    return NextResponse.json({
      roomId,
      room: roomData,
      isActive: roomData?.isActive || false
    })

  } catch (error) {
    console.error('Get room error:', error)
    return NextResponse.json(
      { error: 'Failed to get room information' },
      { status: 500 }
    )
  }
}

// Update room (for room metadata, not real-time content)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomId } = params
    const body = await request.json()
    const { name, maxUsers, isActive } = body

    // Update room in database
    const updatedRoom = await prisma.room.update({
      where: { id: roomId },
      data: {
        ...(name && { name }),
        ...(maxUsers && { maxUsers }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        story: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    return NextResponse.json(updatedRoom)

  } catch (error) {
    console.error('Update room error:', error)
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    )
  }
}

// Delete room
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomId } = params

    // Delete room from database
    await prisma.room.delete({
      where: { id: roomId }
    })

    return NextResponse.json({ message: 'Room deleted successfully' })

  } catch (error) {
    console.error('Delete room error:', error)
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    )
  }
}
