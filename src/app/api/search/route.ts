import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/search?q=...&limit=8
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const limit = Math.min(parseInt(searchParams.get('limit') || '8'), 20)
    if (q.length < 2 || q.length > 100) {
      return NextResponse.json({ suggestions: [] })
    }
    const services = await db.service.findMany({
      where: {
        status: 'approved',
        OR: [
          { title: { contains: q } },
          { category: { contains: q } },
          { location: { contains: q } },
          { description: { contains: q } },
        ],
      },
      select: { id: true, title: true, category: true, price: true, location: true, rating: true, images: true },
      take: limit,
    })
    const suggestions = services.map(s => ({
      id: s.id,
      title: s.title,
      category: s.category,
      price: s.price,
      location: s.location,
      rating: s.rating,
      image: s.images,
    }))
    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('[SEARCH_GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
