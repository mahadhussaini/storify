import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const restoreVersionSchema = z.object({
  versionId: z.string(),
  description: z.string().optional(),
})

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
    const { versionId, description } = restoreVersionSchema.parse(body)

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

    // Get the version to restore
    const versionToRestore = await prisma.storyVersion.findUnique({
      where: { id: versionId },
      select: { content: true, storyId: true }
    })

    if (!versionToRestore || versionToRestore.storyId !== params.id) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 })
    }

    // Update the story content
    const updatedStory = await prisma.story.update({
      where: { id: params.id },
      data: {
        content: versionToRestore.content,
        updatedAt: new Date()
      }
    })

    // Create a new version entry for the restore
    const latestVersion = await prisma.storyVersion.findFirst({
      where: { storyId: params.id },
      orderBy: { version: 'desc' },
      select: { version: true }
    })

    await prisma.storyVersion.create({
      data: {
        storyId: params.id,
        content: versionToRestore.content,
        version: (latestVersion?.version || 0) + 1,
        authorId: (session.user as any).id,
      }
    })

    return NextResponse.json({
      story: updatedStory,
      message: 'Version restored successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error restoring version:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
