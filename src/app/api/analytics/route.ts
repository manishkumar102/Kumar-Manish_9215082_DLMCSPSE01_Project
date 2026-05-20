import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/analytics — aggregate dashboard stats
export async function GET() {
  try {
    // ── Basic counts ──
    const [
      totalUsers,
      totalProviders,
      totalBookings,
      allBookings,
      allServices,
      recentBookings,
    ] = await Promise.all([
      db.user.count({ where: { role: 'client' } }),
      db.user.count({ where: { role: 'provider' } }),
      db.booking.count(),
      db.booking.findMany({ select: { status: true, totalPrice: true, createdAt: true } }),
      db.service.findMany({ where: { status: 'approved' }, select: { category: true } }),
      db.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { id: true, name: true, avatar: true } },
          provider: { select: { id: true, name: true, avatar: true } },
          service: { select: { id: true, title: true, category: true, price: true } },
        },
      }),
    ])

    // ── Total revenue (from completed bookings) ──
    const completedBookings = allBookings.filter((b) => b.status === 'completed')
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalPrice, 0)

    // ── Bookings by status ──
    const bookingsByStatus: Record<string, number> = {}
    for (const b of allBookings) {
      bookingsByStatus[b.status] = (bookingsByStatus[b.status] || 0) + 1
    }

    // ── Bookings by category ──
    // Since booking doesn't have category directly, join via service
    const bookingsWithService = await db.booking.findMany({
      include: {
        service: { select: { category: true } },
      },
    })

    const bookingsByCategory: Record<string, number> = {}
    for (const b of bookingsWithService) {
      if (!b.service) continue
      const cat = b.service.category
      bookingsByCategory[cat] = (bookingsByCategory[cat] || 0) + 1
    }

    // ── Top categories (by service count) ──
    const categoryCount: Record<string, number> = {}
    for (const s of allServices) {
      categoryCount[s.category] = (categoryCount[s.category] || 0) + 1
    }
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    // ── Revenue by month (last 6 months) ──
    const now = new Date()
    const revenueByMonth: { month: string; revenue: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1)
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1)

      const monthCompleted = allBookings.filter((b) => {
        const bDate = new Date(b.createdAt)
        return b.status === 'completed' && bDate >= monthStart && bDate < monthEnd
      })

      const revenue = monthCompleted.reduce((sum, b) => sum + b.totalPrice, 0)
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      revenueByMonth.push({ month: monthLabel, revenue })
    }

    // ── Average booking value ──
    const avgBookingValue = completedBookings.length > 0
      ? totalRevenue / completedBookings.length
      : 0

    // ── Top providers by revenue (efficient single query) ──
    const completedWithProvider = await db.booking.findMany({
      where: { status: 'completed' },
      include: { provider: { select: { id: true, name: true } } },
    })
    const providerRevenueMap: Record<string, { name: string; revenue: number; bookings: number }> = {}
    for (const b of completedWithProvider) {
      const pid = b.providerId
      if (!providerRevenueMap[pid]) {
        providerRevenueMap[pid] = { name: b.provider.name, revenue: 0, bookings: 0 }
      }
      providerRevenueMap[pid].revenue += b.totalPrice
      providerRevenueMap[pid].bookings += 1
    }
    const topProviders = Object.values(providerRevenueMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // ── Bookings by month (all statuses) ──
    const bookingsByMonth: { month: string; bookings: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1)
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1)
      const monthBookings = allBookings.filter((b) => {
        const bDate = new Date(b.createdAt)
        return bDate >= monthStart && bDate < monthEnd
      })
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      bookingsByMonth.push({ month: monthLabel, bookings: monthBookings.length })
    }

    // ── Completion rate ──
    const completionRate = allBookings.length > 0
      ? Math.round((completedBookings.length / allBookings.length) * 100)
      : 0

    return NextResponse.json({
      totalUsers,
      totalProviders,
      totalBookings,
      totalRevenue,
      avgBookingValue: Math.round(avgBookingValue),
      completionRate,
      bookingsByStatus,
      bookingsByCategory,
      revenueByMonth,
      bookingsByMonth,
      topCategories,
      topProviders,
      recentBookings,
    })
  } catch (error) {
    console.error('[ANALYTICS_GET]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
