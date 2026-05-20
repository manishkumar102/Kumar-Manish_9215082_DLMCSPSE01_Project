import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

// GET /api/messages?senderId=...&receiverId=...&bookingId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const senderId = searchParams.get('senderId')
    const receiverId = searchParams.get('receiverId')
    const bookingId = searchParams.get('bookingId')

    const where: Prisma.MessageWhereInput = {}

    if (senderId) {
      where.senderId = senderId
    }
    if (receiverId) {
      where.receiverId = receiverId
    }
    if (bookingId) {
      where.bookingId = bookingId
    }

    const messages = await db.message.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        booking: {
          select: {
            id: true,
            date: true,
            status: true,
            service: {
              select: { title: true },
            },
          },
        },
      },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('[MESSAGES_GET]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/messages — create a new message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { senderId, receiverId, bookingId, content } = body

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: 'senderId, receiverId, and content are required' },
        { status: 400 }
      )
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Message content must be 2000 characters or less' },
        { status: 400 }
      )
    }

    const [sender, receiver] = await Promise.all([
      db.user.findUnique({ where: { id: senderId } }),
      db.user.findUnique({ where: { id: receiverId } }),
    ])

    if (!sender) {
      return NextResponse.json({ error: 'Sender not found' }, { status: 404 })
    }
    if (!receiver) {
      return NextResponse.json({ error: 'Receiver not found' }, { status: 404 })
    }

    if (bookingId) {
      const booking = await db.booking.findUnique({ where: { id: bookingId } })
      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      }
    }

    const message = await db.message.create({
      data: {
        senderId,
        receiverId,
        bookingId: bookingId || null,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        booking: {
          select: {
            id: true,
            date: true,
            status: true,
            service: {
              select: { title: true },
            },
          },
        },
      },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('[MESSAGES_POST]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/messages — mark messages as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'ids array is required' },
        { status: 400 }
      )
    }

    const result = await db.message.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        read: true,
      },
    })

    return NextResponse.json({
      message: `${result.count} messages marked as read`,
      count: result.count,
    })
  } catch (error) {
    console.error('[MESSAGES_PUT]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
