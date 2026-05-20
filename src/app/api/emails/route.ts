import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ---------------------------------------------------------------------------
// Valid email notification types
// ---------------------------------------------------------------------------
const VALID_EMAIL_TYPES = [
  'booking_confirmed',
  'booking_cancelled',
  'payment_received',
  'review_received',
  'provider_verified',
  'welcome',
  'reset_password',
] as const;

// ---------------------------------------------------------------------------
// GET /api/emails?userId=...
// Returns the email notification log for a user (most recent first)
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 },
      );
    }

    const emailLogs = await db.emailLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Also fetch user's email preferences
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        emailNotifications: true,
        bookingUpdates: true,
        promotionalEmails: true,
      },
    });

    return NextResponse.json({
      logs: emailLogs,
      preferences: user ?? {
        emailNotifications: true,
        bookingUpdates: true,
        promotionalEmails: true,
      },
    });
  } catch (error) {
    console.error('GET /api/emails error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email logs' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/emails
// Send a mock email notification (logs it, no actual email is sent)
// Body: { userId, type, subject, body, recipientEmail }
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, subject, body: emailBody, recipientEmail } = body;

    if (!userId || !type || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'userId, type, subject, and body are required' },
        { status: 400 },
      );
    }

    if (!VALID_EMAIL_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid email type. Must be one of: ${VALID_EMAIL_TYPES.join(', ')}` },
        { status: 400 },
      );
    }

    // Check if user has email notifications enabled
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        emailNotifications: true,
        bookingUpdates: true,
        promotionalEmails: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    // Check specific preference
    const isBookingRelated = type === 'booking_confirmed' || type === 'booking_cancelled';
    if (
      !user.emailNotifications ||
      (isBookingRelated && !user.bookingUpdates) ||
      (type === 'welcome' && !user.emailNotifications)
    ) {
      // Still log, but mark as suppressed
      const log = await db.emailLog.create({
        data: {
          userId,
          type,
          subject,
          body: emailBody,
          recipient: recipientEmail || user.email,
          status: 'suppressed',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Email suppressed due to user preferences',
        log,
      });
    }

    // Log the email (mock send)
    const log = await db.emailLog.create({
      data: {
        userId,
        type,
        subject,
        body: emailBody,
        recipient: recipientEmail || user.email,
        status: 'sent',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email notification logged successfully (mock sent)',
      log,
    });
  } catch (error) {
    console.error('POST /api/emails error:', error);
    return NextResponse.json(
      { error: 'Failed to send email notification' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PUT /api/emails
// Update email preferences
// Body: { userId, emailNotifications, bookingUpdates, promotionalEmails }
// ---------------------------------------------------------------------------
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, emailNotifications, bookingUpdates, promotionalEmails } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 },
      );
    }

    // Build update payload with only provided fields
    const updateData: Record<string, boolean> = {};
    if (typeof emailNotifications === 'boolean') {
      updateData.emailNotifications = emailNotifications;
    }
    if (typeof bookingUpdates === 'boolean') {
      updateData.bookingUpdates = bookingUpdates;
    }
    if (typeof promotionalEmails === 'boolean') {
      updateData.promotionalEmails = promotionalEmails;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'At least one preference field is required' },
        { status: 400 },
      );
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        emailNotifications: true,
        bookingUpdates: true,
        promotionalEmails: true,
      },
    });

    return NextResponse.json({
      success: true,
      preferences: updatedUser,
    });
  } catch (error) {
    console.error('PUT /api/emails error:', error);
    return NextResponse.json(
      { error: 'Failed to update email preferences' },
      { status: 500 },
    );
  }
}
