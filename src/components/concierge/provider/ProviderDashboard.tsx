'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, type Booking, type Service } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  CalendarCheck,
  DollarSign,
  Star,
  Briefcase,
  Plus,
  List,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Users,
  Shield,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ActivityFeed } from '@/components/concierge/shared/ActivityFeed';

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                         */
/* -------------------------------------------------------------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface ProviderBooking extends Booking {
  service?: Service & { location?: string };
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function ProviderDashboard({ activeTab = 'overview' }: { activeTab?: string }) {
  const { user, setView } = useAppStore();
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(activeTab);

  /* ---- Data fetching ---- */
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);

    async function fetchDashboard() {
      try {
        const [bookingRes, serviceRes] = await Promise.all([
          fetch(`/api/bookings?providerId=${user.id}`),
          fetch(`/api/services?providerId=${user.id}&allStatuses=true`),
        ]);

        if (bookingRes.ok) {
          const data = await bookingRes.json();
          setBookings(data.bookings ?? []);
        }
        if (serviceRes.ok) {
          const data = await serviceRes.json();
          setServices(data.services ?? []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [user?.id]);

  /* ---- Sync tab from prop ---- */
  useEffect(() => {
    setTab(activeTab);
  }, [activeTab]);

  /* ---- Computed stats ---- */
  const stats = useMemo(() => {
    const completedBookings = bookings.filter(
      (b) => b.status === 'completed' || b.status === 'accepted'
    );
    const totalRevenue = completedBookings.reduce(
      (sum, b) => sum + (b.totalPrice ?? 0),
      0
    );
    const platformFees = totalRevenue * 0.15;
    const netEarnings = totalRevenue - platformFees;

    const allRatings = services.map((s) => s.rating);
    const avgRating =
      allRatings.length > 0
        ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
        : 0;

    const activeServices = services.filter((s) => s.status === 'approved').length;
    const pendingCount = bookings.filter((b) => b.status === 'pending').length;

    return {
      totalBookings: bookings.length,
      totalRevenue,
      platformFees,
      netEarnings,
      avgRating,
      activeServices,
      pendingCount,
    };
  }, [bookings, services]);

  /* ---- Revenue chart data (last 6 months mock) ---- */
  const chartData = useMemo(() => {
    const completed = bookings.filter((b) => b.status === 'completed');
    const months: { month: string; revenue: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const monthRevenue = completed
        .filter((b) => {
          const bd = new Date(b.date);
          return bd.getMonth() === d.getMonth() && bd.getFullYear() === d.getFullYear();
        })
        .reduce((sum, b) => sum + (b.totalPrice ?? 0), 0);

      // Only show actual revenue data
      months.push({
        month: label,
        revenue: monthRevenue,
      });
    }
    return months;
  }, [bookings]);

  /* ---- Recent bookings (sorted) ---- */
  const recentBookings = useMemo(
    () =>
      [...bookings]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [bookings]
  );

  /* ---- Recent transactions (completed bookings) ---- */
  const recentTransactions = useMemo(
    () =>
      bookings
        .filter((b) => b.status === 'completed')
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [bookings]
  );

  /* ---- Status badge helper ---- */
  function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
      pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
      accepted: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
      cancelled: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
    };
    return (
      <Badge
        variant="outline"
        className={`text-[11px] capitalize ${map[status] ?? 'bg-muted text-muted-foreground border-border'}`}
      >
        {status}
      </Badge>
    );
  }

  /* ---- Tooltip for chart ---- */
  function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gold/20 bg-card px-3 py-2 shadow-xl">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-sm font-bold text-gold">
            ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  }

  /* ---- Skeleton loader ---- */
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="mb-8 h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="mt-8 space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  /* ---- Render ---- */
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ---- Header ---- */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="mb-8"
      >
        <motion.div variants={fadeUp} custom={0} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-px w-6 bg-gold/50" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                Provider
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-white sm:text-4xl">
              <span className="text-gold-gradient">Dashboard</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back, {user?.name ?? 'Provider'}
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => setView('provider-services')}
              className="h-10 rounded-lg border border-gold/30 bg-transparent text-sm font-medium text-gold hover:bg-gold/10 hover:border-gold/50"
            >
              <Plus className="mr-1.5 size-4" />
              Add New Service
            </Button>
            <Button
              onClick={() => setView('provider-bookings')}
              className="h-10 rounded-lg bg-gradient-to-r from-gold-dark via-gold to-gold-light text-sm font-semibold text-black hover:brightness-110"
            >
              <List className="mr-1.5 size-4" />
              View All Bookings
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* ---- Stats Cards ---- */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          {
            label: 'Total Bookings',
            value: stats.totalBookings,
            icon: CalendarCheck,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
          },
          {
            label: 'Total Revenue',
            value: `$${stats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Average Rating',
            value: stats.avgRating.toFixed(1),
            icon: Star,
            color: 'text-gold',
            bg: 'bg-gold/10',
          },
          {
            label: 'Active Services',
            value: stats.activeServices,
            icon: Briefcase,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} variants={fadeUp} custom={i + 1}>
              <Card className="luxury-card overflow-hidden border-0 bg-gradient-to-br from-[#1A1A1A] to-[#141414]">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className={`mt-2 font-serif text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`flex size-10 items-center justify-center rounded-lg ${stat.bg}`}
                    >
                      <Icon className={`size-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ---- Tabs ---- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8"
      >
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="bg-surface border border-border h-11 rounded-lg p-1">
            <TabsTrigger
              value="overview"
              className="rounded-md data-[state=active]:bg-gold/15 data-[state=active]:text-gold text-sm text-muted-foreground"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="earnings"
              className="rounded-md data-[state=active]:bg-gold/15 data-[state=active]:text-gold text-sm text-muted-foreground"
            >
              Earnings
            </TabsTrigger>
            <TabsTrigger
              value="verification"
              className="rounded-md data-[state=active]:bg-gold/15 data-[state=active]:text-gold text-sm text-muted-foreground"
            >
              Verification
            </TabsTrigger>
          </TabsList>

          {/* ============ OVERVIEW TAB ============ */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            {/* Pending alert */}
            {stats.pendingCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-5 py-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-yellow-500/15">
                    <Clock className="size-4 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-400">
                      {stats.pendingCount} Pending{' '}
                      {stats.pendingCount === 1 ? 'Booking' : 'Bookings'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Review and respond to new booking requests
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setView('provider-bookings')}
                  variant="ghost"
                  className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                >
                  Manage
                  <ArrowUpRight className="ml-1 size-4" />
                </Button>
              </motion.div>
            )}

            {/* Two-column layout: Recent bookings + Activity feed */}
            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              {/* Recent bookings list */}
              <Card className="luxury-card border-0 bg-gradient-to-br from-[#1A1A1A] to-[#141414]">
                <div className="flex items-center justify-between border-b border-gold/10 px-5 py-4">
                  <h3 className="font-serif text-lg font-semibold text-white">
                    Recent Bookings
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setView('provider-bookings')}
                    className="text-xs text-gold hover:text-gold-light hover:bg-gold/10"
                  >
                    View All
                  </Button>
                </div>
                <div className="divide-y divide-border/50">
                  {recentBookings.length === 0 ? (
                    <div className="px-5 py-12 text-center">
                      <CalendarCheck className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">
                        No bookings yet. They&apos;ll appear here once clients book your
                        services.
                      </p>
                    </div>
                  ) : (
                    recentBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-surface-hover/50"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex size-9 items-center justify-center rounded-lg bg-gold/10 shrink-0">
                            <CalendarCheck className="size-4 text-gold" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {booking.service?.title ?? 'Service'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {booking.client?.name ?? 'Client'} &middot;{' '}
                              {booking.date}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-semibold text-gold">
                            ${booking.totalPrice?.toLocaleString()}
                          </span>
                          <StatusBadge status={booking.status} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Activity Feed */}
              <div className="hidden lg:block">
                <ActivityFeed userId={user?.id ?? ''} role="provider" limit={6} />
              </div>
            </div>
          </TabsContent>

          {/* ============ EARNINGS TAB ============ */}
          <TabsContent value="earnings" className="mt-6 space-y-6">
            {/* Revenue breakdown cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="luxury-card border-0 bg-gradient-to-br from-[#1A1A1A] to-[#141414]">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="size-4 text-emerald-400" />
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Monthly Revenue
                    </p>
                  </div>
                  <p className="font-serif text-2xl font-bold text-emerald-400">
                    $
                    {chartData.length > 0
                      ? chartData[chartData.length - 1].revenue.toLocaleString()
                      : '0'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    This month&apos;s earnings
                  </p>
                </CardContent>
              </Card>

              <Card className="luxury-card border-0 bg-gradient-to-br from-[#1A1A1A] to-[#141414]">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="size-4 text-gold" />
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Total Earnings
                    </p>
                  </div>
                  <p className="font-serif text-2xl font-bold text-gold">
                    ${stats.totalRevenue.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Lifetime earnings
                  </p>
                </CardContent>
              </Card>

              <Card className="luxury-card border-0 bg-gradient-to-br from-[#1A1A1A] to-[#141414]">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="size-4 text-red-400" />
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Platform Fees
                    </p>
                  </div>
                  <p className="font-serif text-2xl font-bold text-red-400">
                    ${Math.round(stats.platformFees).toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    15% commission
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue bar chart */}
            <Card className="luxury-card border-0 bg-gradient-to-br from-[#1A1A1A] to-[#141414]">
              <div className="border-b border-gold/10 px-5 py-4">
                <h3 className="font-serif text-lg font-semibold text-white">
                  Revenue Overview
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Monthly revenue for the last 6 months
                </p>
              </div>
              <CardContent className="p-5">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barCategoryGap="25%">
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#8A8A8A', fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#8A8A8A', fontSize: 12 }}
                        tickFormatter={(v: number) => `$${v >= 1000 ? `${v / 1000}k` : v}`}
                      />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(201,169,110,0.06)' }} />
                      <Bar
                        dataKey="revenue"
                        fill="url(#goldGradient)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={48}
                      />
                      <defs>
                        <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#E8D5A3" />
                          <stop offset="100%" stopColor="#C9A96E" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent transactions */}
            <Card className="luxury-card border-0 bg-gradient-to-br from-[#1A1A1A] to-[#141414]">
              <div className="border-b border-gold/10 px-5 py-4">
                <h3 className="font-serif text-lg font-semibold text-white">
                  Recent Transactions
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Completed bookings that generated revenue
                </p>
              </div>
              <div className="divide-y divide-border/50">
                {recentTransactions.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <DollarSign className="mx-auto mb-3 size-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      No completed transactions yet.
                    </p>
                  </div>
                ) : (
                  recentTransactions.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-surface-hover/50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 shrink-0">
                          <DollarSign className="size-4 text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {booking.service?.title ?? 'Service'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="size-3" />
                            <span>{booking.client?.name ?? 'Client'}</span>
                            <span>&middot;</span>
                            <span>{booking.date}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-emerald-400">
                          +${booking.totalPrice?.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Net: ${(booking.totalPrice * 0.85).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {/* ============ VERIFICATION TAB ============ */}
          <TabsContent value="verification" className="mt-6 space-y-6">
            {(() => {
              const vs = user?.verificationStatus ?? 'none';
              if (vs === 'approved') {
                return (
                  <Card className="luxury-card border-0 bg-gradient-to-br from-[#1A1A1A] to-[#141414]">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 shrink-0">
                          <ShieldCheck className="size-6 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-lg font-semibold text-white">Verified Provider</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Your business <span className="text-gold font-medium">{user?.businessName}</span> is verified.
                          </p>
                          {user?.verifiedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Verified on {new Date(user.verifiedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25">Approved</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              if (vs === 'pending') {
                return (
                  <Card className="luxury-card border-0 bg-gradient-to-br from-[#1A1A1A] to-[#141414]">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-amber-500/10 shrink-0">
                          <Clock className="size-6 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-lg font-semibold text-white">Under Review</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Your verification for <span className="text-gold font-medium">{user?.businessName}</span> is being reviewed.
                          </p>
                          {user?.submittedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Submitted: {new Date(user.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                        <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/25">Pending</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              }
              if (vs === 'rejected') {
                return (
                  <div className="space-y-4">
                    <Card className="luxury-card border-0 bg-gradient-to-br from-[#1A1A1A] to-[#141414]">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex size-12 items-center justify-center rounded-xl bg-red-500/10 shrink-0">
                            <AlertTriangle className="size-6 text-red-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-serif text-lg font-semibold text-white">Verification Rejected</h3>
                            {user?.verificationNote && (
                              <p className="text-sm text-muted-foreground mt-1">Reason: {user.verificationNote}</p>
                            )}
                          </div>
                          <Badge className="bg-red-500/15 text-red-400 border-red-500/25">Rejected</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    <Button
                      onClick={() => setView('provider-verification')}
                      className="bg-gradient-to-r from-gold-dark to-gold text-black font-semibold hover:brightness-110"
                    >
                      <CheckCircle2 className="size-4 mr-2" />
                      Re-apply for Verification
                    </Button>
                  </div>
                );
              }
              return (
                <Card className="luxury-card border-0 bg-gradient-to-br from-[#1A1A1A] to-[#141414]">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-gold/10 shrink-0">
                        <Shield className="size-6 text-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-lg font-semibold text-white">Get Verified</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Verified providers gain trust, visibility, and access to premium features.
                        </p>
                      </div>
                      <Badge className="bg-zinc-500/15 text-zinc-400 border-zinc-500/25">Not Verified</Badge>
                    </div>
                    <Button
                      onClick={() => setView('provider-verification')}
                      className="mt-4 bg-gradient-to-r from-gold-dark to-gold text-black font-semibold hover:brightness-110 w-full"
                    >
                      Start Verification Process
                    </Button>
                  </CardContent>
                </Card>
              );
            })()}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
