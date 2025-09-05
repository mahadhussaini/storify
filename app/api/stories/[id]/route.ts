import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateStorySchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  content: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
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

    const story = await prisma.story.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        room: {
          include: {
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
            }
          }
        }
      }
    })

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    // Check if user has access to this story
    const isAuthor = story.authorId === (session.user as any).id
    const isCollaborator = story.room?.members.some((m: any) => m.userId === (session.user as any).id)

    if (!story.isPublic && !isAuthor && !isCollaborator) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ story })
  } catch (error) {
    console.error('Error fetching story:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const updateData = updateStorySchema.parse(body)

    // Check if story exists and user has permission
    const existingStory = await prisma.story.findUnique({
      where: { id: params.id },
      select: { authorId: true, room: { include: { members: true } } }
    })

    if (!existingStory) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    const isAuthor = existingStory.authorId === (session.user as any).id
    const isCollaborator = existingStory.room?.members.some((m: any) => m.userId === (session.user as any).id)

    if (!isAuthor && !isCollaborator) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const updatedStory = await prisma.story.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json({ story: updatedStory })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating story:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if story exists and user is the author
    const existingStory = await prisma.story.findUnique({
      where: { id: params.id },
      select: { authorId: true }
    })

    if (!existingStory) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    if (existingStory.authorId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    await prisma.story.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Story deleted successfully' })
  } catch (error) {
    console.error('Error deleting story:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
