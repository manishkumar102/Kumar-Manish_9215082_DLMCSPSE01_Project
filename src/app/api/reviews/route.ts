import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

// GET /api/reviews?serviceId=...&providerId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('serviceId')
    const providerId = searchParams.get('providerId')

    const where: Prisma.ReviewWhereInput = {}

    if (serviceId) {
      where.serviceId = serviceId
    }
    if (providerId) {
      where.providerId = providerId
    }

    const reviews = await db.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('[REVIEWS_GET]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/reviews — create a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, clientId, serviceId, providerId, rating, comment } = body

    if (!bookingId || !clientId || !serviceId || !providerId || !rating) {
      return NextResponse.json(
        { error: 'bookingId, clientId, serviceId, providerId, and rating are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    if (comment && comment.length > 1000) {
      return NextResponse.json(
        { error: 'Comment must be 1000 characters or less' },
        { status: 400 }
      )
    }

    // Verify the booking exists
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
    })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check for duplicate review on same booking
    const existingReview = await db.review.findUnique({
      where: { bookingId },
    })
    if (existingReview) {
      return NextResponse.json(
        { error: 'Review already exists for this booking' },
        { status: 409 }
      )
    }

    // Create review and update service rating in a transaction
    const review = await db.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          bookingId,
          clientId,
          serviceId,
          providerId,
          rating,
          comment: comment || null,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          service: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      })

      // Recalculate service average rating
      const allReviews = await tx.review.findMany({
        where: { serviceId },
        select: { rating: true },
      })

      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0)
      const avgRating = allReviews.length > 0 ? totalRating / allReviews.length : 0

      await tx.service.update({
        where: { id: serviceId },
        data: {
          rating: Math.round(avgRating * 10) / 10,
          reviewCount: allReviews.length,
        },
      })

      return newReview
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('[REVIEWS_POST]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
