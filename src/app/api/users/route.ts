import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/users?role=client
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    const where: Record<string, unknown> = {}
    if (role) {
      where.role = role
    }

    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatar: true,
        location: true,
        bio: true,
        interests: true,
        verified: true,
        premium: true,
        suspended: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            services: true,
            clientBookings: true,
            providerBookings: true,
            clientReviews: true,
          },
        },
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('[USERS_GET]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/users — update user by id
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, email, phone, avatar, location, bio, interests, verified, premium, suspended } = body

    if (!id) {
      return NextResponse.json({ error: 'User id is required' }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name
    if (email !== undefined) data.email = email
    if (phone !== undefined) data.phone = phone
    if (avatar !== undefined) data.avatar = avatar
    if (location !== undefined) data.location = location
    if (bio !== undefined) data.bio = bio
    if (interests !== undefined) data.interests = interests
    if (verified !== undefined) data.verified = verified
    if (premium !== undefined) data.premium = premium
    if (suspended !== undefined) data.suspended = suspended

    const user = await db.user.update({
      where: { id },
      data,
    })

    const { password: _, ...safeUser } = user
    return NextResponse.json({ user: safeUser })
  } catch (error: unknown) {
    console.error('[USERS_PUT]', error)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/users — delete user by id
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'User id is required' }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await db.user.delete({ where: { id } })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('[USERS_DELETE]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
