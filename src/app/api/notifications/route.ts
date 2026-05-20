import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/notifications?userId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }
    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('[NOTIFICATIONS_GET]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/notifications — create notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, title, message, actionUrl } = body
    if (!userId || !title || !message) {
      return NextResponse.json({ error: 'userId, title, and message are required' }, { status: 400 })
    }
    const notification = await db.notification.create({
      data: { userId, type: type || 'system', title, message, actionUrl: actionUrl || null },
    })
    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error('[NOTIFICATIONS_POST]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/notifications — mark as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, markAll, userId } = body
    if (markAll && userId) {
      await db.notification.updateMany({ where: { userId, read: false }, data: { read: true } })
      return NextResponse.json({ success: true })
    }
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }
    await db.notification.update({ where: { id }, data: { read: true } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[NOTIFICATIONS_PUT]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
