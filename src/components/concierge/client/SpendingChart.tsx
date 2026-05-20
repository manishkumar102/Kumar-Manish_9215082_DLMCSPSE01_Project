'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Booking } from '@/store/useAppStore';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Tag,
  CalendarCheck,
  ArrowUpRight,
  ArrowDownRight,
  Crown,
  Star,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface SpendingChartProps {
  bookings: Booking[];
}

interface MonthlyData {
  month: string;
  spending: number;
}

interface CategoryData {
  name: string;
  value: number;
  percent: number;
}

interface MonthlyCountData {
  month: string;
  bookings: number;
}

interface TopServiceData {
  title: string;
  category: string;
  bookings: number;
  total: number;
}

/* -------------------------------------------------------------------------- */
/*  Color palette                                                              */
/* -------------------------------------------------------------------------- */

const GOLD_COLORS = ['#C9A96E', '#E8D5A3', '#A08040'];
const CHART_COLORS = ['#C9A96E', '#4ADE80', '#60A5FA', '#F472B6', '#FACC15', '#E8D5A3', '#A08040', '#34D399', '#818CF8'];

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
/*  Custom Tooltip – Area chart                                                */
/* -------------------------------------------------------------------------- */

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gold/20 bg-card px-4 py-3 shadow-xl">
        <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
        <p className="font-serif text-sm font-bold text-gold">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Custom Tooltip – Pie chart                                                 */
/* -------------------------------------------------------------------------- */

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: CategoryData }>;
}) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="rounded-lg border border-gold/20 bg-card px-4 py-3 shadow-xl">
        <p className="font-serif text-sm font-semibold text-white">{d.name}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          ${d.value.toLocaleString()} · {d.percent.toFixed(1)}%
        </p>
      </div>
    );
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Custom Tooltip – Bar chart (booking frequency)                             */
/* -------------------------------------------------------------------------- */

function BarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gold/20 bg-card px-4 py-3 shadow-xl">
        <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
        <p className="font-serif text-sm font-bold text-gold">
          {payload[0].value} {payload[0].value === 1 ? 'booking' : 'bookings'}
        </p>
      </div>
    );
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Pie label renderer                                                         */
/* -------------------------------------------------------------------------- */

function renderPieLabel({
  name,
  percent,
}: {
  name: string;
  percent: number;
}) {
  return `${name} ${(percent * 100).toFixed(0)}%`;
}

/* -------------------------------------------------------------------------- */
/*  SpendingChart component                                                    */
/* -------------------------------------------------------------------------- */

export function SpendingChart({ bookings }: SpendingChartProps) {
  /* ---- Filter to past / completed bookings ---- */
  const pastBookings = useMemo(
    () => bookings.filter((b) => b.status === 'completed'),
    [bookings],
  );

  /* ---- Monthly spending aggregation ---- */
  const chartData: MonthlyData[] = useMemo(() => {
    const monthMap = new Map<string, number>();

    pastBookings.forEach((b) => {
      try {
        const d = new Date(b.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        });
        monthMap.set(label, (monthMap.get(label) ?? 0) + b.totalPrice);
      } catch {
        // skip invalid dates
      }
    });

    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, spending]) => ({ month, spending: Math.round(spending) }));
  }, [pastBookings]);

  /* ---- Category breakdown (pie) ---- */
  const categoryData: CategoryData[] = useMemo(() => {
    const catMap = new Map<string, number>();
    pastBookings.forEach((b) => {
      const cat = b.service?.category ?? 'Other';
      catMap.set(cat, (catMap.get(cat) ?? 0) + b.totalPrice);
    });
    const total = Array.from(catMap.values()).reduce((a, b) => a + b, 0);
    return Array.from(catMap.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
        percent: total > 0 ? (value / total) * 100 : 0,
      }));
  }, [pastBookings]);

  /* ---- Booking frequency (monthly counts) ---- */
  const bookingFrequency: MonthlyCountData[] = useMemo(() => {
    const monthMap = new Map<string, number>();
    pastBookings.forEach((b) => {
      try {
        const d = new Date(b.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        });
        monthMap.set(label, (monthMap.get(label) ?? 0) + 1);
      } catch {
        // skip
      }
    });
    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, bookings]) => ({ month, bookings }));
  }, [pastBookings]);

  /* ---- Top services ---- */
  const topServices: TopServiceData[] = useMemo(() => {
    const serviceMap = new Map<string, { title: string; category: string; bookings: number; total: number }>();
    pastBookings.forEach((b) => {
      const key = b.serviceId;
      const existing = serviceMap.get(key);
      const title = b.service?.title ?? 'Unknown Service';
      const category = b.service?.category ?? 'Other';
      if (existing) {
        existing.bookings += 1;
        existing.total += b.totalPrice;
      } else {
        serviceMap.set(key, { title, category, bookings: 1, total: b.totalPrice });
      }
    });
    return Array.from(serviceMap.values())
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 3);
  }, [pastBookings]);

  /* ---- Computed stats ---- */
  const totalSpent = useMemo(
    () => pastBookings.reduce((sum, b) => sum + b.totalPrice, 0),
    [pastBookings],
  );

  const averageBooking = useMemo(() => {
    if (pastBookings.length === 0) return 0;
    return totalSpent / pastBookings.length;
  }, [pastBookings, totalSpent]);

  const totalBookings = pastBookings.length;

  const highestSingleBooking = useMemo(
    () => (pastBookings.length > 0 ? Math.max(...pastBookings.map((b) => b.totalPrice)) : 0),
    [pastBookings],
  );

  const mostBookedCategory = useMemo(() => {
    const freq = new Map<string, number>();
    pastBookings.forEach((b) => {
      const cat = b.service?.category ?? 'Other';
      freq.set(cat, (freq.get(cat) ?? 0) + 1);
    });

    if (freq.size === 0) return '—';

    let top = '—';
    let topCount = 0;
    freq.forEach((count, category) => {
      if (count > topCount) {
        topCount = count;
        top = category;
      }
    });
    return top;
  }, [pastBookings]);

  /* ---- Month-over-month comparison ---- */
  const momChange = useMemo(() => {
    if (chartData.length < 2) return null;
    const last = chartData[chartData.length - 1].spending;
    const prev = chartData[chartData.length - 2].spending;
    if (prev === 0) return last > 0 ? 100 : null;
    return ((last - prev) / prev) * 100;
  }, [chartData]);

  /* ---- Stat cards data ---- */
  const statCards = [
    {
      label: 'Total Spent',
      value: `$${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: 'text-gold',
      gradient: 'from-gold/10 to-gold/5',
    },
    {
      label: 'Average Booking',
      value: `$${averageBooking.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      color: 'text-emerald-400',
      gradient: 'from-emerald-500/10 to-emerald-500/5',
    },
    {
      label: 'Most Booked Category',
      value: mostBookedCategory,
      icon: Tag,
      color: 'text-amber-400',
      gradient: 'from-amber-500/10 to-amber-500/5',
    },
    {
      label: 'Total Bookings',
      value: totalBookings.toLocaleString(),
      icon: CalendarCheck,
      color: 'text-sky-400',
      gradient: 'from-sky-500/10 to-sky-500/5',
    },
    {
      label: 'Highest Single Booking',
      value: `$${highestSingleBooking.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: Crown,
      color: 'text-purple-400',
      gradient: 'from-purple-500/10 to-purple-500/5',
    },
  ];

  /* ---- Empty state ---- */
  if (pastBookings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="luxury-card flex flex-col items-center justify-center gap-4 rounded-xl px-6 py-20 text-center"
      >
        <div className="flex size-20 items-center justify-center rounded-full bg-gold/10">
          <DollarSign className="size-9 text-gold/60" />
        </div>
        <h3 className="font-serif text-xl font-semibold text-white">
          No spending data yet
        </h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Your completed booking spending will appear here as a beautiful chart.
          Book a service to get started.
        </p>
      </motion.div>
    );
  }

  /* ---- Render ---- */
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-6"
    >
      {/* ---- Chart area (spending over time) ---- */}
      <motion.div
        custom={0}
        variants={fadeUp}
        className="luxury-card overflow-hidden rounded-xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gold/10 px-5 py-4">
          <div>
            <h3 className="font-serif text-lg font-semibold text-white">
              Spending Overview
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Monthly spending across all completed bookings
            </p>
          </div>
          {momChange !== null && (
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                momChange >= 0
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400'
              }`}
            >
              {momChange >= 0 ? (
                <ArrowUpRight className="size-3.5" />
              ) : (
                <ArrowDownRight className="size-3.5" />
              )}
              {momChange >= 0 ? '+' : ''}
              {momChange.toFixed(1)}%
              <span className="font-normal text-muted-foreground">vs last month</span>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6">
          <div className="h-64 w-full sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#C9A96E" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(201, 169, 110, 0.1)"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8A8A8A', fontSize: 12 }}
                  dy={8}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8A8A8A', fontSize: 12 }}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `$${v}`
                  }
                  dx={-4}
                />

                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{
                    stroke: 'rgba(201, 169, 110, 0.2)',
                    strokeWidth: 1,
                    strokeDasharray: '4 4',
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="spending"
                  stroke="#C9A96E"
                  strokeWidth={2.5}
                  fill="url(#goldGradient)"
                  dot={{ r: 0 }}
                  activeDot={{
                    r: 5,
                    fill: '#C9A96E',
                    stroke: '#0A0A0A',
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* ---- 5 Stat cards ---- */}
      <motion.div
        variants={stagger}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4"
      >
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              custom={i + 1}
              variants={fadeUp}
              className="luxury-card flex items-center gap-3 rounded-xl p-3 sm:gap-4 sm:p-4 md:p-5"
            >
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br sm:size-11 ${card.gradient}`}
              >
                <Icon className={`size-4 sm:size-5 ${card.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
                  {card.label}
                </p>
                <p
                  className={`mt-0.5 truncate font-serif text-base font-bold sm:text-lg md:text-xl ${
                    card.label === 'Most Booked Category' ? 'text-white' : card.color
                  }`}
                >
                  {card.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ---- Two-column: Category Breakdown + Booking Frequency ---- */}
      <motion.div
        variants={stagger}
        className="grid grid-cols-1 gap-6 md:grid-cols-2"
      >
        {/* Category Breakdown – Pie Chart */}
        <motion.div
          custom={7}
          variants={fadeUp}
          className="luxury-card overflow-hidden rounded-xl"
        >
          <div className="border-b border-gold/10 px-5 py-4">
            <h3 className="font-serif text-base font-semibold text-white">
              Spending by Category
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Distribution of your total spending
            </p>
          </div>

          <div className="p-4 sm:p-6">
            {categoryData.length > 0 ? (
              <>
                <div className="h-56 w-full sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        label={renderPieLabel}
                        labelLine={false}
                      >
                        {categoryData.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                            strokeWidth={0}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                  {categoryData.map((cat, i) => (
                    <div key={cat.name} className="flex items-center gap-1.5 text-xs">
                      <span
                        className="inline-block size-2.5 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <span className="text-muted-foreground">{cat.name}</span>
                      <span className="font-medium text-white">
                        ${cat.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-56 flex-col items-center justify-center text-center">
                <Tag className="mb-2 size-8 text-gold/40" />
                <p className="text-sm text-muted-foreground">No category data available</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Booking Frequency – Bar Chart */}
        <motion.div
          custom={8}
          variants={fadeUp}
          className="luxury-card overflow-hidden rounded-xl"
        >
          <div className="border-b border-gold/10 px-5 py-4">
            <h3 className="font-serif text-base font-semibold text-white">
              Booking Frequency
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Number of bookings per month
            </p>
          </div>

          <div className="p-4 sm:p-6">
            {bookingFrequency.length > 0 ? (
              <div className="h-56 w-full sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={bookingFrequency}
                    margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(201, 169, 110, 0.08)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#8A8A8A', fontSize: 11 }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#8A8A8A', fontSize: 11 }}
                      allowDecimals={false}
                      dx={-4}
                    />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(201, 169, 110, 0.06)' }} />
                    <Bar
                      dataKey="bookings"
                      fill="#C9A96E"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-56 flex-col items-center justify-center text-center">
                <CalendarCheck className="mb-2 size-8 text-gold/40" />
                <p className="text-sm text-muted-foreground">No booking frequency data</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* ---- Top Services ---- */}
      {topServices.length > 0 && (
        <motion.div
          custom={9}
          variants={fadeUp}
          className="luxury-card overflow-hidden rounded-xl"
        >
          <div className="border-b border-gold/10 px-5 py-4">
            <h3 className="font-serif text-base font-semibold text-white">
              Top Services
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Your most-booked services by frequency
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3 sm:gap-5 sm:p-6">
            {topServices.map((svc, i) => (
              <motion.div
                key={svc.title}
                custom={10 + i}
                variants={fadeUp}
                className={`relative overflow-hidden rounded-lg border border-gold/10 bg-gradient-to-br from-gold/5 to-transparent p-4 sm:p-5`}
              >
                {/* Rank badge */}
                <div className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full bg-gold/10 font-serif text-xs font-bold text-gold">
                  {i + 1}
                </div>

                <div className="mb-3 flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-gold/10">
                    <Star className="size-4 text-gold" />
                  </div>
                  <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold">
                    {svc.category}
                  </span>
                </div>

                <h4 className="mb-3 font-serif text-sm font-semibold text-white leading-tight pr-8">
                  {svc.title}
                </h4>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Bookings
                    </p>
                    <p className="font-serif text-lg font-bold text-gold">
                      {svc.bookings}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Total Spent
                    </p>
                    <p className="font-serif text-lg font-bold text-white">
                      ${svc.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
