'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type Booking } from '@/store/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Loader2,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOffset(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const STORAGE_KEY_PREFIX = 'conciergex-availability-';

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
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function AvailabilityCalendar() {
  const { user } = useAppStore();

  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ---- Fetch bookings for the provider ---- */
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);

    async function fetchBookings() {
      try {
        const res = await fetch(`/api/bookings?providerId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings ?? []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [user?.id]);

  /* ---- Derive booked date keys from bookings ---- */
  useEffect(() => {
    const keys = new Set<string>();
    bookings.forEach((b) => {
      if (b.date && (b.status === 'accepted' || b.status === 'pending' || b.status === 'completed')) {
        keys.add(b.date);
      }
    });
    setBookedDates(keys);
  }, [bookings]);

  /* ---- Load saved availability from localStorage ---- */
  useEffect(() => {
    if (!user?.id) return;
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${user.id}`);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          available: string[];
          blocked: string[];
        };
        setAvailableDates(new Set(parsed.available ?? []));
        setBlockedDates(new Set(parsed.blocked ?? []));
      }
    } catch {
      // silently fail
    }
  }, [user?.id]);

  /* ---- Calendar calculations ---- */
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOffset = getFirstDayOffset(year, month);
  const todayKey = toDateKey(new Date());

  /* ---- Navigate months ---- */
  const goToPrevMonth = useCallback(() => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentMonth(new Date());
  }, []);

  /* ---- Toggle date state ---- */
  const handleDayClick = useCallback(
    (dayKey: string) => {
      // Cannot modify booked dates
      if (bookedDates.has(dayKey)) return;

      setAvailableDates((prev) => {
        const next = new Set(prev);
        if (next.has(dayKey)) {
          next.delete(dayKey);
          return next;
        }
        return next;
      });

      setBlockedDates((prev) => {
        const next = new Set(prev);
        if (next.has(dayKey)) {
          next.delete(dayKey);
          return next;
        }
        // If not in available, add to blocked; if available, do nothing (already removed above)
        // Cycle: nothing → available → blocked → nothing
        return next;
      });
    },
    [bookedDates]
  );

  // We need a smarter toggle: first click = available (green), second click = blocked (red), third click = clear
  // Actually, re-reading spec: "click on dates to toggle them as available or blocked"
  // Let's do: click once → mark available (green), click again → mark blocked (red), click again → clear
  const handleDayClickCycling = useCallback(
    (dayKey: string) => {
      if (bookedDates.has(dayKey)) return;

      const isAvailable = availableDates.has(dayKey);
      const isBlocked = blockedDates.has(dayKey);

      if (isAvailable) {
        // Available → Blocked
        setAvailableDates((prev) => {
          const next = new Set(prev);
          next.delete(dayKey);
          return next;
        });
        setBlockedDates((prev) => {
          const next = new Set(prev);
          next.add(dayKey);
          return next;
        });
      } else if (isBlocked) {
        // Blocked → Clear
        setBlockedDates((prev) => {
          const next = new Set(prev);
          next.delete(dayKey);
          return next;
        });
      } else {
        // Clear → Available
        setAvailableDates((prev) => {
          const next = new Set(prev);
          next.add(dayKey);
          return next;
        });
      }
    },
    [availableDates, blockedDates, bookedDates]
  );

  /* ---- Save to localStorage ---- */
  const handleSave = useCallback(async () => {
    if (!user?.id) return;
    setSaving(true);

    try {
      // Simulate a short delay for UX
      await new Promise((resolve) => setTimeout(resolve, 600));

      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}${user.id}`,
        JSON.stringify({
          available: Array.from(availableDates),
          blocked: Array.from(blockedDates),
        })
      );

      toast.success('Availability saved successfully', {
        description: `${availableDates.size} available and ${blockedDates.size} blocked days saved.`,
      });
    } catch {
      toast.error('Failed to save availability');
    } finally {
      setSaving(false);
    }
  }, [user?.id, availableDates, blockedDates]);

  /* ---- Stats ---- */
  const stats = useMemo(() => {
    // Filter available/blocked for current month view
    let available = 0;
    let blocked = 0;
    let booked = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const key = toDateKey(new Date(year, month, d));
      if (bookedDates.has(key)) {
        booked++;
      } else if (availableDates.has(key)) {
        available++;
      } else if (blockedDates.has(key)) {
        blocked++;
      }
    }

    return { available, blocked, booked };
  }, [availableDates, blockedDates, bookedDates, year, month, daysInMonth]);

  /* ---- Build calendar grid days ---- */
  const calendarDays = useMemo(() => {
    const days: { day: number; key: string; isCurrentMonth: boolean }[] = [];

    // Previous month trailing days
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevDaysInMonth = getDaysInMonth(prevYear, prevMonth);

    for (let i = firstDayOffset - 1; i >= 0; i--) {
      const day = prevDaysInMonth - i;
      const key = toDateKey(new Date(prevYear, prevMonth, day));
      days.push({ day, key, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const key = toDateKey(new Date(year, month, d));
      days.push({ day: d, key, isCurrentMonth: true });
    }

    // Next month leading days to fill the grid
    const remaining = 42 - days.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    for (let d = 1; d <= remaining; d++) {
      const key = toDateKey(new Date(nextYear, nextMonth, d));
      days.push({ day: d, key, isCurrentMonth: false });
    }

    return days;
  }, [year, month, daysInMonth, firstDayOffset]);

  /* ---- Determine day cell styling ---- */
  function getDayCellStyle(key: string, isCurrentMonth: boolean): string {
    if (!isCurrentMonth) return 'text-muted-foreground/30';

    const isAvailable = availableDates.has(key);
    const isBlocked = blockedDates.has(key);
    const isBooked = bookedDates.has(key);
    const isToday = key === todayKey;

    const base = 'relative cursor-pointer transition-all duration-200 hover:scale-105 rounded-lg';

    if (isBooked) {
      return `${base} bg-amber-500/15 border border-amber-500/30 text-amber-300`;
    }
    if (isAvailable) {
      return `${base} bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25`;
    }
    if (isBlocked) {
      return `${base} bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25`;
    }
    if (isToday) {
      return `${base} border border-gold/40 text-gold hover:bg-gold/10`;
    }

    return `${base} border border-transparent text-white/80 hover:bg-surface-hover hover:border-gold/20`;
  }

  /* ---- Skeleton loader ---- */
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-[420px] rounded-xl" />
      </div>
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
      {/* ---- Header ---- */}
      <motion.div variants={fadeUp} custom={0}>
        <div className="flex items-center gap-3 mb-1">
          <div className="h-px w-6 bg-gold/50" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            Schedule
          </span>
        </div>
        <h2 className="font-serif text-3xl font-bold text-white">
          <span className="text-gold-gradient">Availability</span> Calendar
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your schedule — click dates to toggle availability
        </p>
      </motion.div>

      {/* ---- Stats Cards ---- */}
      <motion.div
        variants={fadeUp}
        custom={1}
        className="grid gap-4 sm:grid-cols-3"
      >
        {[
          {
            label: 'Available',
            value: stats.available,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            icon: CheckCircle2,
          },
          {
            label: 'Blocked',
            value: stats.blocked,
            color: 'text-red-400',
            bg: 'bg-red-500/10',
            border: 'border-red-500/20',
            icon: XCircle,
          },
          {
            label: 'Booked',
            value: stats.booked,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            icon: Clock,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="luxury-card overflow-hidden border-0 bg-gradient-to-br from-[#1A1A1A] to-[#141414]"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className={`mt-2 font-serif text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                      <span className="ml-1 text-sm font-normal text-muted-foreground">
                        {stat.value === 1 ? 'day' : 'days'}
                      </span>
                    </p>
                  </div>
                  <div className={`flex size-10 items-center justify-center rounded-lg ${stat.bg}`}>
                    <Icon className={`size-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* ---- Calendar Card ---- */}
      <motion.div variants={fadeUp} custom={2}>
        <Card className="luxury-card overflow-hidden border-0 bg-gradient-to-br from-[#1A1A1A] to-[#141414]">
          {/* Calendar Header — Month Navigation */}
          <div className="flex items-center justify-between border-b border-gold/10 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gold/10">
                <CalendarDays className="size-5 text-gold" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-white">
                {MONTH_NAMES[month]} {year}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                className="h-8 px-3 text-xs text-gold hover:bg-gold/10 hover:text-gold-light"
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevMonth}
                className="h-8 w-8 text-muted-foreground hover:bg-gold/10 hover:text-gold"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNextMonth}
                className="h-8 w-8 text-muted-foreground hover:bg-gold/10 hover:text-gold"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          <CardContent className="p-6">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAY_HEADERS.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              <AnimatePresence mode="popLayout">
                {calendarDays.map(({ day, key, isCurrentMonth }) => {
                  const isAvailable = availableDates.has(key);
                  const isBlocked = blockedDates.has(key);
                  const isBooked = bookedDates.has(key);
                  const isToday = key === todayKey;

                  return (
                    <motion.button
                      key={key}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.15 }}
                      disabled={!isCurrentMonth || isBooked}
                      onClick={() => handleDayClickCycling(key)}
                      className={`flex h-10 sm:h-11 items-center justify-center text-sm font-medium ${getDayCellStyle(key, isCurrentMonth)} ${!isCurrentMonth || isBooked ? 'cursor-default' : ''}`}
                      title={
                        isBooked
                          ? 'Booked — cannot modify'
                          : isAvailable
                            ? 'Available — click to block'
                            : isBlocked
                              ? 'Blocked — click to clear'
                              : 'Click to mark available'
                      }
                    >
                      {day}
                      {/* Today indicator dot */}
                      {isToday && (
                        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-gold" />
                      )}
                      {/* Available indicator */}
                      {isAvailable && (
                        <span className="absolute top-1 right-1 size-1.5 rounded-full bg-emerald-400" />
                      )}
                      {/* Blocked indicator */}
                      {isBlocked && (
                        <span className="absolute top-1 right-1 size-1.5 rounded-full bg-red-400" />
                      )}
                      {/* Booked indicator */}
                      {isBooked && (
                        <span className="absolute top-1 right-1 size-1.5 rounded-full bg-amber-400" />
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Legend */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-gold/10 pt-4">
              {[
                { color: 'bg-emerald-500', label: 'Available' },
                { color: 'bg-red-500', label: 'Blocked' },
                { color: 'bg-amber-500', label: 'Booked' },
                { color: 'bg-gold', label: 'Today' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className={`size-2.5 rounded-sm ${color}`} />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Click a date to cycle: <span className="text-emerald-400">available</span>
                {' → '}
                <span className="text-red-400">blocked</span>
                {' → '}
                <span className="text-white/60">clear</span>
              </p>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="h-10 rounded-lg bg-gradient-to-r from-gold-dark via-gold to-gold-light text-sm font-semibold text-black shadow-lg shadow-gold/20 transition-all hover:shadow-gold/40 hover:brightness-110 disabled:opacity-50"
              >
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="mr-1.5 size-4" />
                    Save Availability
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
