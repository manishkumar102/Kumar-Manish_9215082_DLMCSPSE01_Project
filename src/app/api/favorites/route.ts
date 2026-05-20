import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/favorites?userId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }
    const favorites = await db.favorite.findMany({
      where: { userId },
      include: {
        service: {
          select: { id: true, title: true, description: true, category: true, price: true, duration: true, images: true, location: true, rating: true, reviewCount: true, featured: true, status: true, provider: { select: { id: true, name: true, avatar: true, verified: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ favorites })
  } catch (error) {
    console.error('[FAVORITES_GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/favorites — add or remove favorite
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, serviceId, action } = body // action: 'add' or 'remove'
    if (!userId || !serviceId || !action) {
      return NextResponse.json({ error: 'userId, serviceId, and action are required' }, { status: 400 })
    }
    if (action === 'add') {
      const favorite = await db.favorite.upsert({
        where: { userId_serviceId: { userId, serviceId } },
        create: { userId, serviceId },
        update: {},
      })
      return NextResponse.json({ favorite, action: 'added' })
    } else {
      await db.favorite.deleteMany({ where: { userId, serviceId } })
      return NextResponse.json({ action: 'removed' })
    }
  } catch (error) {
    console.error('[FAVORITES_POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
