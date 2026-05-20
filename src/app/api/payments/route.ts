import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/payments — Process a payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, clientId, amount, method, cardLast4 } = body

    if (!bookingId || !clientId || !amount) {
      return NextResponse.json(
        { error: 'bookingId, clientId, and amount are required' },
        { status: 400 }
      )
    }

    // Note: This is a mock payment implementation. In production, use Stripe/
    // Braintree and never accept raw card details on your server.
    if (method === 'card' && !cardLast4) {
      return NextResponse.json(
        { error: 'cardLast4 is required for card payments' },
        { status: 400 }
      )
    }

    // Verify booking exists
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Generate mock transaction ID
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    const transactionId = `TXN-${timestamp}-${random}`

    // Use the provided cardLast4 or null for non-card payments
    const storedCardLast4 = method === 'card' ? (cardLast4 || null) : null

    // Create payment record with "completed" status (mock)
    const payment = await db.payment.create({
      data: {
        bookingId,
        clientId,
        amount: parseFloat(amount),
        method: method || 'card',
        status: 'completed',
        cardLast4: storedCardLast4,
        transactionId,
      },
      include: {
        booking: {
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
        },
      },
    })

    // Update booking status to "accepted" when payment completes
    await db.booking.update({
      where: { id: bookingId },
      data: { status: 'accepted' },
    })

    // Update payment booking with the new status
    const updatedPayment = {
      ...payment,
      booking: {
        ...payment.booking,
        status: 'accepted',
      },
    }

    return NextResponse.json({ payment: updatedPayment }, { status: 201 })
  } catch (error) {
    console.error('[PAYMENTS_POST]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/payments?clientId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required' },
        { status: 400 }
      )
    }

    const payments = await db.payment.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      include: {
        booking: {
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
          },
        },
      },
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error('[PAYMENTS_GET]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/payments — Refund a payment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Payment id and status are required' },
        { status: 400 }
      )
    }

    if (status !== 'refunded') {
      return NextResponse.json(
        { error: 'Only refund status is supported via this endpoint' },
        { status: 400 }
      )
    }

    const existing = await db.payment.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Update payment status
    const payment = await db.payment.update({
      where: { id },
      data: { status: 'refunded' },
      include: {
        booking: {
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
        },
      },
    })

    // Update corresponding booking status to "cancelled"
    await db.booking.update({
      where: { id: existing.bookingId },
      data: { status: 'cancelled' },
    })

    // Update payment booking with the new status
    const updatedPayment = {
      ...payment,
      booking: {
        ...payment.booking,
        status: 'cancelled',
      },
    }

    return NextResponse.json({ payment: updatedPayment })
  } catch (error) {
    console.error('[PAYMENTS_PUT]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
