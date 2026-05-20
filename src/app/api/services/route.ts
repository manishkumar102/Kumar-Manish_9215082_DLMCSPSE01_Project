import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

// GET /api/services?category=...&search=...&minPrice=...&maxPrice=...&sort=...&location=...&featured=true
// GET /api/services?id=... (single service by ID)
// GET /api/services?providerId=... (services by provider)
// GET /api/services?allStatuses=true (admin: show all statuses)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sort = searchParams.get('sort') || 'createdAt'
    const location = searchParams.get('location')
    const featured = searchParams.get('featured')
    const id = searchParams.get('id')
    const providerId = searchParams.get('providerId')
    const allStatuses = searchParams.get('allStatuses')

    // Single service fetch by ID
    if (id) {
      const service = await db.service.findUnique({
        where: { id },
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              avatar: true,
              verified: true,
              location: true,
            },
          },
        },
      })
      if (!service) {
        return NextResponse.json({ error: 'Service not found' }, { status: 404 })
      }
      return NextResponse.json({ service })
    }

    const where: Prisma.ServiceWhereInput = {}

    // Only filter by approved status unless explicitly requested otherwise
    if (allStatuses !== 'true') {
      where.status = 'approved'
    }

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    if (providerId) {
      where.providerId = providerId
    }

    if (minPrice) {
      where.price = { ...(where.price as Prisma.FloatFilter | undefined), gte: parseFloat(minPrice) }
    }

    if (maxPrice) {
      where.price = { ...(where.price as Prisma.FloatFilter | undefined), lte: parseFloat(maxPrice) }
    }

    if (location) {
      where.location = { contains: location }
    }

    if (featured === 'true') {
      where.featured = true
    }

    // Determine sort order
    let orderBy: Prisma.ServiceOrderByWithRelationInput
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' }
        break
      case 'price_desc':
        orderBy = { price: 'desc' }
        break
      case 'rating':
        orderBy = { rating: 'desc' }
        break
      case 'reviews':
        orderBy = { reviewCount: 'desc' }
        break
      case 'createdAt':
      default:
        orderBy = { createdAt: 'desc' }
        break
    }

    const services = await db.service.findMany({
      where,
      orderBy,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            avatar: true,
            verified: true,
            location: true,
          },
        },
      },
    })

    return NextResponse.json({ services })
  } catch (error) {
    console.error('[SERVICES_GET]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/services — create a new service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { providerId, title, description, category, price, duration, location, images } = body

    if (!providerId || !title || !description || !category || price === undefined || !duration || !location) {
      return NextResponse.json(
        { error: 'providerId, title, description, category, price, duration, and location are required' },
        { status: 400 }
      )
    }

    if (title.length < 3 || title.length > 200) {
      return NextResponse.json(
        { error: 'Service title must be between 3 and 200 characters' },
        { status: 400 }
      )
    }

    if (description.length < 10 || description.length > 5000) {
      return NextResponse.json(
        { error: 'Description must be between 10 and 5000 characters' },
        { status: 400 }
      )
    }

    if (price < 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      )
    }

    const provider = await db.user.findUnique({ where: { id: providerId } })
    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    const service = await db.service.create({
      data: {
        providerId,
        title,
        description,
        category,
        price: parseFloat(price),
        duration,
        location,
        images: typeof images === 'string' ? images : images ? JSON.stringify(images) : null,
        status: 'pending', // needs admin approval
      },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            avatar: true,
            verified: true,
            location: true,
          },
        },
      },
    })

    return NextResponse.json({ service }, { status: 201 })
  } catch (error) {
    console.error('[SERVICES_POST]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/services — update a service
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, title, description, category, price, duration, location, images, featured } = body

    if (!id) {
      return NextResponse.json({ error: 'Service id is required' }, { status: 400 })
    }

    const existing = await db.service.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Build update data
    const data: Record<string, unknown> = {}
    if (status !== undefined) {
      const validStatuses = ['pending', 'approved', 'rejected']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        )
      }
      data.status = status
    }
    if (title !== undefined) data.title = title
    if (description !== undefined) data.description = description
    if (category !== undefined) data.category = category
    if (price !== undefined) data.price = parseFloat(price)
    if (duration !== undefined) data.duration = duration
    if (location !== undefined) data.location = location
    if (images !== undefined) {
      data.images = typeof images === 'string' ? images : images ? JSON.stringify(images) : null
    }
    if (featured !== undefined) data.featured = featured

    const service = await db.service.update({
      where: { id },
      data,
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            avatar: true,
            verified: true,
            location: true,
          },
        },
      },
    })

    return NextResponse.json({ service })
  } catch (error) {
    console.error('[SERVICES_PUT]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/services?id=...
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Service id is required' }, { status: 400 })
    }

    const existing = await db.service.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Delete associated reviews first (cascade)
    await db.review.deleteMany({ where: { serviceId: id } })
    await db.service.delete({ where: { id } })

    return NextResponse.json({ message: 'Service deleted successfully' })
  } catch (error) {
    console.error('[SERVICES_DELETE]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
