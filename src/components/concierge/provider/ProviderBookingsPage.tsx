'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type Booking, type Service } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Check,
  X,
  Eye,
  Star,
  CalendarCheck,
  AlertCircle,
  ChevronRight,
  Send,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const STATUS_FILTERS = ['all', 'pending', 'accepted', 'completed', 'rejected', 'cancelled'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                         */
/* -------------------------------------------------------------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.05 } },
};

/* -------------------------------------------------------------------------- */
/*  Status badge helper                                                        */
/* -------------------------------------------------------------------------- */

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { className: string; icon: React.ReactNode }> = {
    pending: {
      className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
      icon: <Clock className="size-3" />,
    },
    accepted: {
      className: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      icon: <Check className="size-3" />,
    },
    completed: {
      className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      icon: <CalendarCheck className="size-3" />,
    },
    rejected: {
      className: 'bg-red-500/15 text-red-400 border-red-500/30',
      icon: <X className="size-3" />,
    },
    cancelled: {
      className: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
      icon: <X className="size-3" />,
    },
  };

  const { className, icon } = config[status] ?? {
    className: 'bg-muted text-muted-foreground border-border',
    icon: <AlertCircle className="size-3" />,
  };

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1 text-[11px] capitalize font-medium ${className}`}
    >
      {icon}
      {status}
    </Badge>
  );
}

/* -------------------------------------------------------------------------- */
/*  Booking Action Dialog (Accept/Reject with optional message)                */
/* -------------------------------------------------------------------------- */

function BookingActionDialog({
  open,
  onOpenChange,
  booking,
  action,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  action: 'accepted' | 'rejected';
  onConfirm: () => void;
}) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isReject = action === 'rejected';

  const handleSubmit = async () => {
    if (!booking) return;
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = { id: booking.id, status: action };
      if (message.trim()) {
        body.message = message.trim();
      }
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(
          action === 'accepted'
            ? 'Booking accepted successfully!'
            : 'Booking rejected.',
        );
        onConfirm();
        onOpenChange(false);
      } else {
        const data = await res.json();
        toast.error(data.error ?? 'Failed to update booking');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* Reset message on open/close */
  useEffect(() => {
    if (!open) setMessage('');
  }, [open]);

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-gold/15 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white font-serif text-lg">
            {isReject ? 'Reject Booking' : 'Accept Booking'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {isReject
              ? `Reject the booking request from ${booking.client?.name ?? 'the client'} for "${booking.service?.title ?? 'this service'}"?`
              : `Confirm the booking request from ${booking.client?.name ?? 'the client'} for "${booking.service?.title ?? 'this service'}"?`}
          </DialogDescription>
        </DialogHeader>

        {/* Booking summary */}
        <div className="rounded-lg border border-gold/10 bg-surface/50 p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="size-3.5 text-gold/70" />
            <span className="text-white">{booking.date}</span>
            <span className="text-muted-foreground">at</span>
            <span className="text-white">{booking.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="size-3.5 text-gold/70" />
            <span className="text-white">{booking.guests} guests</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="size-3.5 text-gold/70" />
            <span className="font-serif font-semibold text-gold">${booking.totalPrice.toLocaleString()}</span>
          </div>
          {booking.specialReq && (
            <div className="mt-2 text-xs text-muted-foreground italic">
              &quot;{booking.specialReq}&quot;
            </div>
          )}
        </div>

        {/* Optional message */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Message to client (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 500))}
            placeholder={
              isReject
                ? 'Let the client know why you are declining...'
                : 'Add a welcome message or special instructions...'
            }
            rows={3}
            className="w-full rounded-lg border border-gold/15 bg-surface px-4 py-3 text-sm text-white placeholder:text-muted-foreground/50 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20 resize-none"
          />
          <p className="text-right text-[11px] text-muted-foreground">
            {message.length}/500
          </p>
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="border-gold/20 text-muted-foreground text-sm hover:text-white">
              Back
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className={`text-sm font-semibold ${
              isReject
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black hover:brightness-110'
            }`}
          >
            {submitting ? (
              <span className="inline-block size-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : isReject ? (
              <>
                <X className="mr-1.5 size-4" />
                Reject Booking
              </>
            ) : (
              <>
                <Check className="mr-1.5 size-4" />
                Accept Booking
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Component                                                             */
/* -------------------------------------------------------------------------- */

export function ProviderBookingsPage() {
  const { user, setView, setSelectedBooking } = useAppStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Dialog state
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionDialogBooking, setActionDialogBooking] = useState<Booking | null>(null);
  const [actionDialogType, setActionDialogType] = useState<'accepted' | 'rejected'>('accepted');

  /* ---- Fetch bookings ---- */
  const fetchBookings = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?providerId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /* ---- Filtered bookings ---- */
  const filtered = useMemo(() => {
    if (statusFilter === 'all') return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  /* ---- Status counts ---- */
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: bookings.length };
    STATUS_FILTERS.forEach((sf) => {
      if (sf !== 'all') {
        c[sf] = bookings.filter((b) => b.status === sf).length;
      }
    });
    return c;
  }, [bookings]);

  /* ---- Open action dialog ---- */
  const openActionDialog = useCallback((booking: Booking, action: 'accepted' | 'rejected') => {
    setActionDialogBooking(booking);
    setActionDialogType(action);
    setActionDialogOpen(true);
  }, []);

  /* ---- Action handler (for non-dialog actions like Mark Complete) ---- */
  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setActionLoading(bookingId);
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status: newStatus }),
      });

      if (res.ok) {
        toast.success(
          newStatus === 'accepted'
            ? 'Booking accepted!'
            : newStatus === 'rejected'
            ? 'Booking rejected'
            : newStatus === 'completed'
            ? 'Booking marked as complete'
            : 'Booking updated'
        );
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );
      } else {
        const data = await res.json();
        toast.error(data.error ?? 'Failed to update booking');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="mb-2 h-5 w-24" />
        <Skeleton className="mb-6 h-10 w-64" />
        <div className="mb-6 flex gap-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-lg" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ---- Header ---- */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="mb-8"
      >
        <motion.div variants={fadeUp} custom={0}>
          <button
            onClick={() => setView('provider-dashboard')}
            className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors"
          >
            <ArrowLeft className="size-3" />
            Back to Dashboard
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-px w-6 bg-gold/50" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                  Provider
                </span>
              </div>
              <h1 className="font-serif text-3xl font-bold text-white sm:text-4xl">
                Booking <span className="text-gold-gradient">Management</span>
              </h1>
              <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="inline-flex size-2 rounded-full bg-yellow-400" />
                  <strong className="text-yellow-400">{counts.pending}</strong> Pending
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-flex size-2 rounded-full bg-blue-400" />
                  <strong className="text-blue-400">{counts.accepted}</strong> Accepted
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-flex size-2 rounded-full bg-emerald-400" />
                  <strong className="text-emerald-400">{counts.completed}</strong> Completed
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ---- Status Filter Tabs ---- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none"
      >
        {STATUS_FILTERS.map((sf) => (
          <button
            key={sf}
            onClick={() => setStatusFilter(sf)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              statusFilter === sf
                ? 'bg-gold/15 text-gold border border-gold/30'
                : 'bg-surface text-muted-foreground border border-transparent hover:bg-surface-hover hover:text-foreground'
            }`}
          >
            <span className="capitalize">{sf}</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                statusFilter === sf
                  ? 'bg-gold/20 text-gold'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {counts[sf] ?? 0}
            </span>
          </button>
        ))}
      </motion.div>

      {/* ---- Booking Cards ---- */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="space-y-4"
      >
        {filtered.length === 0 ? (
          <motion.div variants={fadeUp} custom={0} className="py-16 text-center">
            <Calendar className="mx-auto mb-4 size-10 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              {statusFilter === 'all'
                ? 'No bookings received yet.'
                : `No ${statusFilter} bookings.`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {statusFilter === 'all'
                ? 'Bookings will appear here when clients book your services.'
                : 'Try selecting a different status filter.'}
            </p>
          </motion.div>
        ) : (
          filtered.map((booking, i) => {
            const isActionLoading = actionLoading === booking.id;
            return (
              <motion.div
                key={booking.id}
                variants={fadeUp}
                custom={i}
                className="luxury-card overflow-hidden rounded-xl"
              >
                <CardContent className="p-0">
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    {/* Left: Client info + booking details */}
                    <div className="flex items-start gap-4 min-w-0">
                      {/* Client avatar */}
                      <Avatar className="size-11 shrink-0 border border-gold/20">
                        <AvatarImage
                          src={booking.client?.avatar}
                          alt={booking.client?.name}
                        />
                        <AvatarFallback className="bg-gold/10 text-sm font-bold text-gold">
                          {booking.client?.name?.charAt(0)?.toUpperCase() ?? 'C'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        {/* Service title */}
                        <h3 className="font-serif text-base font-semibold text-white truncate">
                          {booking.service?.title ?? 'Service'}
                        </h3>

                        {/* Client name */}
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {booking.client?.name ?? 'Unknown Client'}
                          {booking.client?.email && (
                            <span className="text-xs text-muted-foreground/60 ml-1.5">
                              &middot; {booking.client.email}
                            </span>
                          )}
                        </p>

                        {/* Details row */}
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {booking.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {booking.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="size-3" />
                            {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="size-3" />
                            <span className="font-medium text-gold">
                              ${booking.totalPrice?.toLocaleString()}
                            </span>
                          </span>
                        </div>

                        {booking.specialReq && (
                          <p className="mt-2 text-xs text-muted-foreground italic">
                            &quot;{booking.specialReq}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Status + Actions */}
                    <div className="flex flex-col items-end gap-3 shrink-0 sm:ml-4">
                      <StatusBadge status={booking.status} />

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => openActionDialog(booking, 'accepted')}
                              disabled={isActionLoading}
                              className="h-8 rounded-lg bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-700 border-0"
                            >
                              <Check className="mr-1 size-3" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openActionDialog(booking, 'rejected')}
                              disabled={isActionLoading}
                              className="h-8 rounded-lg bg-red-600 px-4 text-xs font-semibold text-white hover:bg-red-700 border-0"
                            >
                              <X className="mr-1 size-3" />
                              Reject
                            </Button>
                          </>
                        )}

                        {booking.status === 'accepted' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(booking.id, 'completed')}
                            disabled={isActionLoading}
                            className="h-8 rounded-lg bg-gradient-to-r from-gold-dark via-gold to-gold-light px-4 text-xs font-semibold text-black hover:brightness-110"
                          >
                            {isActionLoading ? (
                              <span className="inline-block size-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                              <>
                                <CalendarCheck className="mr-1 size-3" />
                                Mark Complete
                              </>
                            )}
                          </Button>
                        )}

                        {booking.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setView('booking-detail');
                            }}
                            className="h-8 px-3 text-xs text-gold hover:text-gold-light hover:bg-gold/10"
                          >
                            <Star className="mr-1 size-3" />
                            View Review
                            <ChevronRight className="ml-1 size-3" />
                          </Button>
                        )}

                        {(booking.status === 'rejected' ||
                          booking.status === 'cancelled') && (
                          <span className="text-[11px] text-muted-foreground px-2">
                            No further actions
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* ---- Action Dialog (Accept/Reject with message) ---- */}
      <BookingActionDialog
        open={actionDialogOpen}
        onOpenChange={setActionDialogOpen}
        booking={actionDialogBooking}
        action={actionDialogType}
        onConfirm={fetchBookings}
      />
    </div>
  );
}
