import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/receipt?bookingId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'bookingId is required' },
        { status: 400 },
      );
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            category: true,
            price: true,
            duration: true,
            location: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            businessName: true,
          },
        },
        payment: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 },
      );
    }

    if (booking.status !== 'completed') {
      return NextResponse.json(
        { error: 'Receipt is only available for completed bookings' },
        { status: 404 },
      );
    }

    // Generate receipt number: CX-2025-XXXXX from booking id
    const numericHash = booking.id
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const receiptNumber = `CX-2025-${String(numericHash % 100000).padStart(5, '0')}`;

    // Price breakdown
    const subtotal = booking.totalPrice;
    const platformFee = Math.round(subtotal * 0.15 * 100) / 100;
    const total = Math.round((subtotal + platformFee) * 100) / 100;

    const receipt = {
      receiptNumber,
      issueDate: new Date().toISOString(),
      bookingDate: booking.date,
      bookingTime: booking.time,
      createdAt: booking.createdAt,
      service: {
        title: booking.service?.title ?? 'Service',
        category: booking.service?.category ?? 'N/A',
        duration: booking.service?.duration ?? 'N/A',
      },
      guests: booking.guests,
      client: {
        name: booking.client?.name ?? 'Unknown',
        email: booking.client?.email ?? '',
      },
      provider: {
        name: booking.provider?.name ?? 'Unknown',
        businessName: booking.provider?.businessName ?? null,
      },
      pricing: {
        subtotal,
        platformFee,
        platformFeeRate: 0.15,
        total,
        currency: 'USD',
      },
      payment: {
        method: booking.payment?.method ?? 'card',
        cardLast4: booking.payment?.cardLast4 ?? null,
        transactionId: booking.payment?.transactionId ?? null,
        status: booking.payment?.status ?? 'completed',
        amount: booking.payment?.amount ?? total,
      },
    };

    return NextResponse.json({ receipt });
  } catch (error) {
    console.error('[RECEIPT_GET]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
