import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/verifications?status=pending
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true, verificationStatus: true, businessName: true,
          businessLicense: true, businessAddress: true, idDocument: true,
          verificationNote: true, submittedAt: true, verifiedAt: true, verified: true,
        },
      })
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
      return NextResponse.json({ user })
    }

    const where: Record<string, unknown> = {}
    if (status) where.verificationStatus = status
    else where.verificationStatus = { in: ['pending', 'approved', 'rejected'] }

    const users = await db.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, role: true, avatar: true,
        verificationStatus: true, businessName: true, businessLicense: true,
        businessAddress: true, idDocument: true, verificationNote: true,
        submittedAt: true, verifiedAt: true, verified: true,
        _count: { select: { services: true } },
      },
      orderBy: { submittedAt: 'desc' },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('[VERIFICATIONS_GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/verifications — provider submits verification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, businessName, businessLicense, businessAddress, idDocument } = body

    if (!userId || !businessName || !businessLicense || !idDocument) {
      return NextResponse.json(
        { error: 'userId, businessName, businessLicense, and idDocument are required' },
        { status: 400 },
      )
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const updated = await db.user.update({
      where: { id: userId },
      data: {
        verificationStatus: 'pending',
        businessName,
        businessLicense,
        businessAddress: businessAddress || null,
        idDocument,
        submittedAt: new Date(),
        verificationNote: null,
      },
    })

    // Create notification for admin
    const admins = await db.user.findMany({ where: { role: 'admin' } })
    for (const admin of admins) {
      await db.notification.create({
        data: {
          userId: admin.id,
          type: 'system',
          title: 'New Verification Request',
          message: `${user.name} has submitted a verification request.`,
          actionUrl: 'admin-disputes',
        },
      })
    }

    const { password: _, ...safeUser } = updated
    return NextResponse.json({ user: safeUser })
  } catch (error) {
    console.error('[VERIFICATIONS_POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/verifications — admin reviews verification
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, status, note } = body

    if (!userId || !status) {
      return NextResponse.json({ error: 'userId and status are required' }, { status: 400 })
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Status must be approved or rejected' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const updated = await db.user.update({
      where: { id: userId },
      data: {
        verificationStatus: status,
        verified: status === 'approved',
        verificationNote: note || null,
        verifiedAt: status === 'approved' ? new Date() : null,
      },
    })

    // Notify provider
    await db.notification.create({
      data: {
        userId,
        type: 'system',
        title: status === 'approved' ? 'Verification Approved' : 'Verification Rejected',
        message: status === 'approved'
          ? 'Your account has been verified. You can now offer services on the platform.'
          : `Your verification was rejected. Reason: ${note || 'Not specified'}`,
      },
    })

    const { password: _, ...safeUser } = updated
    return NextResponse.json({ user: safeUser })
  } catch (error) {
    console.error('[VERIFICATIONS_PUT]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
