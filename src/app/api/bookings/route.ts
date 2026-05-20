import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

// GET /api/bookings?clientId=...&providerId=...&status=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const providerId = searchParams.get('providerId')
    const status = searchParams.get('status')

    const where: Prisma.BookingWhereInput = {}

    if (clientId) {
      where.clientId = clientId
    }
    if (providerId) {
      where.providerId = providerId
    }
    if (status) {
      where.status = status
    }

    const bookings = await db.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            category: true,
            price: true,
            images: true,
            location: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('[BOOKINGS_GET]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/bookings — create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, serviceId, providerId, date, time, guests, specialReq, totalPrice } = body

    if (!clientId || !serviceId || !providerId || !date || !time || totalPrice === undefined) {
      return NextResponse.json(
        { error: 'clientId, serviceId, providerId, date, time, and totalPrice are required' },
        { status: 400 }
      )
    }

    // Verify service and users exist
    const [service, client, provider] = await Promise.all([
      db.service.findUnique({ where: { id: serviceId } }),
      db.user.findUnique({ where: { id: clientId } }),
      db.user.findUnique({ where: { id: providerId } }),
    ])

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }
    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    const booking = await db.booking.create({
      data: {
        clientId,
        serviceId,
        providerId,
        date,
        time,
        guests: guests || 1,
        specialReq: specialReq || null,
        totalPrice: parseFloat(totalPrice),
        status: 'pending',
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            category: true,
            price: true,
            images: true,
            location: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    console.error('[BOOKINGS_POST]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/bookings — update booking status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Booking id and status are required' },
        { status: 400 }
      )
    }

    const validStatuses = ['pending', 'accepted', 'rejected', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const existing = await db.booking.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const booking = await db.booking.update({
      where: { id },
      data: { status },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            category: true,
            price: true,
            images: true,
            location: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ booking })
  } catch (error) {
    console.error('[BOOKINGS_PUT]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
