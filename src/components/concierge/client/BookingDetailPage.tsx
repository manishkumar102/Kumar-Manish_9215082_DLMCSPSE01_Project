'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type Booking } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  CalendarCheck,
  Clock,
  Users,
  MessageSquare,
  MapPin,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Send,
  RotateCcw,
  CreditCard,
  Receipt,
} from 'lucide-react';
import { toast } from 'sonner';
import { BookingReceipt } from '@/components/concierge/shared/BookingReceipt';

/* -------------------------------------------------------------------------- */
/*  Status helpers                                                            */
/* -------------------------------------------------------------------------- */

const STATUS_CONFIG: Record<string, {
  label: string;
  banner: string;
  icon: typeof CheckCircle2;
  iconColor: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  badgeClass: string;
}> = {
  pending: {
    label: 'Pending Confirmation',
    banner: 'bg-gradient-to-r from-yellow-900/30 via-yellow-800/20 to-yellow-900/30',
    icon: AlertCircle,
    iconColor: 'text-yellow-400',
    textColor: 'text-yellow-300',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    badgeClass: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  },
  accepted: {
    label: 'Confirmed',
    banner: 'bg-gradient-to-r from-emerald-900/30 via-emerald-800/20 to-emerald-900/30',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
    textColor: 'text-emerald-300',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  completed: {
    label: 'Completed',
    banner: 'bg-gradient-to-r from-blue-900/30 via-blue-800/20 to-blue-900/30',
    icon: CheckCircle2,
    iconColor: 'text-blue-400',
    textColor: 'text-blue-300',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
  rejected: {
    label: 'Rejected',
    banner: 'bg-gradient-to-r from-red-900/30 via-red-800/20 to-red-900/30',
    icon: XCircle,
    iconColor: 'text-red-400',
    textColor: 'text-red-300',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
  cancelled: {
    label: 'Cancelled',
    banner: 'bg-gradient-to-r from-zinc-900/30 via-zinc-800/20 to-zinc-900/30',
    icon: XCircle,
    iconColor: 'text-zinc-400',
    textColor: 'text-zinc-300',
    bgColor: 'bg-zinc-500/10',
    borderColor: 'border-zinc-500/30',
    badgeClass: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
  },
};

const TIMELINE_STEPS = ['Booked', 'Accepted', 'In Progress', 'Completed'];

function getTimelineIndex(status: string): number {
  switch (status) {
    case 'pending':   return 0;
    case 'accepted':  return 1;
    case 'in-progress': return 2;
    case 'completed': return 3;
    default:          return 0;
  }
}

/* -------------------------------------------------------------------------- */
/*  Formatting helpers                                                        */
/* -------------------------------------------------------------------------- */

function getFirstImage(booking: Booking): string | null {
  const imgs = booking.service?.images;
  if (!imgs) return null;
  try {
    const arr = JSON.parse(imgs);
    if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string') return arr[0];
  } catch {
    if (typeof imgs === 'string' && imgs.startsWith('http')) return imgs;
  }
  return null;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr: string): string {
  try {
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
  } catch {
    return timeStr;
  }
}

/* -------------------------------------------------------------------------- */
/*  Interactive star rating                                                   */
/* -------------------------------------------------------------------------- */

function InteractiveStars({
  rating,
  onRate,
  readonly = false,
  size = 'md',
}: {
  rating: number;
  onRate?: (v: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [hovered, setHovered] = useState(0);
  const sizeClass = size === 'lg' ? 'size-7' : size === 'md' ? 'size-5' : 'size-3.5';
  const display = hovered || rating;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const val = i + 1;
        const isFilled = val <= display;
        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onClick={() => onRate?.(val)}
            onMouseEnter={() => !readonly && setHovered(val)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
            aria-label={`Rate ${val} star${val > 1 ? 's' : ''}`}
          >
            <Star
              className={`${sizeClass} ${isFilled ? 'fill-gold text-gold' : 'text-muted-foreground/30'}`}
            />
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Detail skeleton                                                           */
/* -------------------------------------------------------------------------- */

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-32 rounded-lg" />
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main BookingDetailPage                                                    */
/* -------------------------------------------------------------------------- */

export function BookingDetailPage() {
  const { selectedBooking, user, setView, setSelectedBooking, setSelectedChatUser, goBack } = useAppStore();

  /* Local state */
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [hasReview, setHasReview] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{
    id: string;
    amount: number;
    method: string;
    status: string;
    cardLast4: string | null;
    transactionId: string | null;
    currency: string;
    createdAt: string;
  } | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [refunding, setRefunding] = useState(false);

  // Receipt dialog state
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);

  /* ---- Fetch review status ---- */
  useEffect(() => {
    if (!selectedBooking) return;
    let cancelled = false;

    async function checkReview() {
      try {
        const res = await fetch(`/api/reviews?serviceId=${selectedBooking.serviceId}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          const existing = data.reviews?.find(
            (r: { bookingId: string; clientId: string }) =>
              r.bookingId === selectedBooking.id && r.clientId === selectedBooking.id,
          );
          setHasReview(!!existing);
        }
      } catch {
        // Silently fail
      }
    }

    checkReview();
    return () => { cancelled = true; };
  }, [selectedBooking]);

  /* ---- Fetch payment info ---- */
  useEffect(() => {
    if (!selectedBooking || !user) return;
    let cancelled = false;

    async function fetchPayment() {
      setPaymentLoading(true);
      try {
        const res = await fetch(`/api/payments?clientId=${user.id}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          const payments = data.payments ?? [];
          const match = payments.find(
            (p: { bookingId: string }) => p.bookingId === selectedBooking!.id,
          );
          if (match) {
            setPaymentInfo({
              id: match.id,
              amount: match.amount,
              method: match.method,
              status: match.status,
              cardLast4: match.cardLast4,
              transactionId: match.transactionId,
              currency: match.currency,
              createdAt: match.createdAt,
            });
          }
        }
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setPaymentLoading(false);
      }
    }

    fetchPayment();
    return () => { cancelled = true; };
  }, [selectedBooking, user]);

  /* ---- Handlers (before early return to satisfy rules-of-hooks) ---- */
  const handleCancelBooking = useCallback(async () => {
    if (!selectedBooking) return;
    setCancelling(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedBooking.id, status: 'cancelled' }),
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedBooking(data.booking);
      }
    } catch {
      // Silently fail
    } finally {
      setCancelling(false);
    }
  }, [selectedBooking, setSelectedBooking]);

  const handleRefundPayment = useCallback(async () => {
    if (!paymentInfo) return;
    setRefunding(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: paymentInfo.id, status: 'refunded' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.payment) {
          setPaymentInfo(data.payment);
          setSelectedBooking(data.payment.booking);
        }
        toast.success('Refund processed successfully');
      }
    } catch {
      toast.error('Failed to process refund');
    } finally {
      setRefunding(false);
    }
  }, [paymentInfo, setSelectedBooking]);

  const handleSubmitReview = useCallback(async () => {
    if (!selectedBooking || !user || reviewRating === 0 || !selectedBooking.service) return;
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          clientId: user.id,
          serviceId: selectedBooking.serviceId,
          providerId: selectedBooking.providerId,
          rating: reviewRating,
          comment: reviewComment.trim() || undefined,
        }),
      });
      if (res.ok) {
        setHasReview(true);
        setReviewDialogOpen(false);
        setReviewRating(0);
        setReviewComment('');
      }
    } catch {
      // Silently fail
    } finally {
      setSubmittingReview(false);
    }
  }, [reviewRating, reviewComment, selectedBooking, user, setSelectedBooking]);

  const handleBookAgain = useCallback(() => {
    if (selectedBooking?.service) {
      setSelectedServiceFromStore(selectedBooking.service);
      setView('service-detail');
    }
  }, [selectedBooking, setView]);

  const handleGoBack = useCallback(() => {
    goBack();
  }, [goBack]);

  /* ---- Guard ---- */
  if (!selectedBooking || !user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <DetailSkeleton />
      </div>
    );
  }

  const booking = selectedBooking;
  const statusConf = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = statusConf.icon;
  const timelineIndex = getTimelineIndex(booking.status);
  const imgUrl = getFirstImage(booking);

  /* ---- Payment summary ---- */
  const subtotal = booking.totalPrice;
  const platformFee = Math.round(subtotal * 0.15 * 100) / 100;
  const total = subtotal + platformFee;

  /* ---- Render ---- */
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back button */}
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="mb-6 -ml-2 gap-2 text-muted-foreground hover:text-gold"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </motion.div>

      {/* Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div
          className={`flex items-center gap-4 rounded-xl border p-5 ${statusConf.banner} ${statusConf.borderColor}`}
        >
          <div className={`flex size-12 items-center justify-center rounded-full ${statusConf.bgColor}`}>
            <StatusIcon className={`size-6 ${statusConf.iconColor}`} />
          </div>
          <div>
            <h2 className={`font-serif text-xl font-bold ${statusConf.textColor}`}>
              {statusConf.label}
            </h2>
            <p className="text-sm text-muted-foreground">
              Booking #{booking.id.slice(0, 8).toUpperCase()}
              {' \u00B7 '}
              Created {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Content grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-3">
          {/* Service Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="luxury-card overflow-hidden rounded-xl"
          >
            <div className="relative aspect-video w-full overflow-hidden">
              {imgUrl ? (
                <img
                  src={imgUrl}
                  alt={booking.service?.title ?? 'Service'}
                  className="size-full object-cover"
                />
              ) : (
                <div className="size-full bg-gradient-to-br from-gold/20 via-amber-900/30 to-gold-dark/20" />
              )}
              <div className="absolute left-3 top-3">
                <Badge variant="outline" className={`border backdrop-blur-sm text-[11px] ${statusConf.badgeClass}`}>
                  {statusConf.label}
                </Badge>
              </div>
            </div>
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">
                    {booking.service?.title ?? 'Service'}
                  </h3>
                  {booking.service?.category && (
                    <Badge variant="outline" className="mt-2 border-gold/20 text-[10px] text-gold/80">
                      {booking.service.category}
                    </Badge>
                  )}
                </div>
                <span className="shrink-0 font-serif text-2xl font-bold text-gold">
                  ${booking.totalPrice.toLocaleString()}
                </span>
              </div>
              {booking.service?.location && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4 text-gold/70" />
                  {booking.service.location}
                </div>
              )}
              {booking.provider && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex size-7 items-center justify-center rounded-full bg-gold/10 text-xs font-bold text-gold">
                    {booking.provider.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Provided by <span className="font-medium text-foreground">{booking.provider.name}</span>
                  </span>
                </div>
              )}
            </CardContent>
          </motion.div>

          {/* Booking Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="luxury-card rounded-xl p-5"
          >
            <h4 className="mb-4 font-serif text-lg font-semibold text-white">Booking Details</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem icon={CalendarCheck} label="Date" value={formatDate(booking.date)} />
              <DetailItem icon={Clock} label="Time" value={formatTime(booking.time)} />
              <DetailItem icon={Users} label="Guests" value={`${booking.guests} ${booking.guests === 1 ? 'guest' : 'guests'}`} />
              <DetailItem
                icon={MessageSquare}
                label="Special Requests"
                value={booking.specialReq || 'None'}
              />
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="luxury-card rounded-xl p-5"
          >
            <h4 className="mb-6 font-serif text-lg font-semibold text-white">Booking Timeline</h4>
            <div className="relative flex items-center justify-between">
              {/* Connector line */}
              <div className="absolute left-0 right-0 top-4 h-0.5 bg-muted" />
              <div
                className="absolute left-0 top-4 h-0.5 bg-gradient-to-r from-gold to-gold/50 transition-all duration-700"
                style={{ width: `${(timelineIndex / (TIMELINE_STEPS.length - 1)) * 100}%` }}
              />

              {TIMELINE_STEPS.map((step, i) => {
                const isCompleted = i <= timelineIndex;
                const isCurrent = i === timelineIndex;
                return (
                  <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                    <div
                      className={`flex size-8 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                        isCompleted
                          ? 'border-gold bg-gold text-black'
                          : 'border-muted bg-background text-muted-foreground'
                      } ${isCurrent ? 'ring-4 ring-gold/20' : ''}`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="size-4" />
                      ) : (
                        <span className="text-[10px] font-bold">{i + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-center text-[10px] sm:text-xs font-medium ${
                        isCompleted ? 'text-gold' : 'text-muted-foreground'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Provider Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="luxury-card rounded-xl p-5"
          >
            <h4 className="mb-4 font-serif text-lg font-semibold text-white">Service Provider</h4>
            {booking.provider ? (
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-full border-2 border-gold/30 bg-gold/10 text-lg font-bold text-gold">
                  {booking.provider.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{booking.provider.name}</span>
                    {booking.provider.verified && (
                      <ShieldCheck className="size-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{booking.provider.email}</p>
                  {booking.service && (
                    <div className="mt-1">
                      <InteractiveStars rating={booking.service.rating} readonly size="sm" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Provider information unavailable</p>
            )}
          </motion.div>

          {/* Payment Summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="luxury-card rounded-xl p-5"
          >
            <h4 className="mb-4 font-serif text-lg font-semibold text-white">Payment Summary</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Platform Fee (15%)</span>
                <span className="font-medium text-foreground">${platformFee.toLocaleString()}</span>
              </div>
              <Separator className="bg-gold/15" />
              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-white">Total</span>
                <span className="font-serif text-xl font-bold text-gold">
                  ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Payment Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.4 }}
            className="luxury-card rounded-xl p-5"
          >
            <h4 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold text-white">
              <Receipt className="size-5 text-gold" />
              Payment Details
            </h4>
            {paymentLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
              </div>
            ) : paymentInfo ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    className={
                      paymentInfo.status === 'completed'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : paymentInfo.status === 'refunded'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-gold/15 text-gold border-gold/30'
                    }
                  >
                    {paymentInfo.status === 'completed'
                      ? 'Paid'
                      : paymentInfo.status === 'refunded'
                        ? 'Refunded'
                        : paymentInfo.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <CreditCard className="size-3.5 text-gold/70" />
                    {paymentInfo.method === 'card'
                      ? `Card ${paymentInfo.cardLast4 ? `•••• ${paymentInfo.cardLast4}` : ''}`
                      : paymentInfo.method === 'bank_transfer'
                        ? 'Bank Transfer'
                        : 'Digital Wallet'}
                  </span>
                </div>
                {paymentInfo.transactionId && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {paymentInfo.transactionId.slice(0, 20)}...
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount Paid</span>
                  <span className="font-serif text-lg font-bold text-gold">
                    ${paymentInfo.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-muted-foreground">
                    {new Date(paymentInfo.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No payment information available for this booking.</p>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="space-y-3"
          >
            {/* Cancel — pending only */}
            {booking.status === 'pending' && (
              <Button
                variant="outline"
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="w-full rounded-lg border-red-500/30 text-red-400 hover:border-red-500/60 hover:bg-red-500/10 hover:text-red-400"
              >
                {cancelling ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 size-4" />
                )}
                Cancel Booking
              </Button>
            )}

            {/* Refund — admin only on completed bookings with payment */}
            {user.role === 'admin' && paymentInfo && paymentInfo.status === 'completed' && booking.status !== 'cancelled' && booking.status !== 'refunded' && (
              <Button
                variant="outline"
                onClick={handleRefundPayment}
                disabled={refunding}
                className="w-full rounded-lg border-amber-500/30 text-amber-400 hover:border-amber-500/60 hover:bg-amber-500/10 hover:text-amber-400"
              >
                {refunding ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <RotateCcw className="mr-2 size-4" />
                )}
                Refund Payment
              </Button>
            )}

            {/* Leave Review — completed and no review */}
            {booking.status === 'completed' && !hasReview && (
              <Button
                onClick={() => setReviewDialogOpen(true)}
                className="w-full rounded-lg bg-gradient-to-r from-gold-dark via-gold to-gold-light font-semibold text-black hover:brightness-110"
              >
                <Star className="mr-2 size-4" />
                Leave Review
              </Button>
            )}

            {/* Book Again — completed */}
            {booking.status === 'completed' && (
              <Button
                variant="outline"
                onClick={handleBookAgain}
                className="w-full rounded-lg border-gold/30 text-gold hover:border-gold/60 hover:bg-gold/5 hover:text-gold"
              >
                <RotateCcw className="mr-2 size-4" />
                Book Again
              </Button>
            )}

            {/* Download Receipt — completed */}
            {booking.status === 'completed' && (
              <Button
                variant="outline"
                onClick={() => setReceiptDialogOpen(true)}
                className="w-full rounded-lg border-gold/30 text-gold hover:border-gold/60 hover:bg-gold/5 hover:text-gold"
              >
                <Receipt className="mr-2 size-4" />
                Download Receipt
              </Button>
            )}

            {/* Message Provider */}
            {booking.provider && (booking.status === 'accepted' || booking.status === 'completed') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedChatUser(booking.provider!);
                  setView('chat');
                }}
                className="w-full rounded-lg border-gold/30 text-gold hover:border-gold/60 hover:bg-gold/5 hover:text-gold"
              >
                <Send className="mr-2 size-4" />
                Message Provider
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      {/* ---- Review Dialog ---- */}
      <Dialog open={reviewDialogOpen} onOpenChange={(open) => { setReviewDialogOpen(open); if (!open) { setReviewRating(0); setReviewComment(''); } }}>
        <DialogContent className="border-gold/20 bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-white">
              <span className="text-gold-gradient">Rate Your Experience</span>
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Share your feedback for &ldquo;{booking.service?.title ?? 'this service'}&rdquo;
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Star rating */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Your Rating</Label>
              <div className="flex items-center gap-1">
                <InteractiveStars
                  rating={reviewRating}
                  onRate={setReviewRating}
                  size="lg"
                />
                {reviewRating > 0 && (
                  <span className="ml-2 text-sm font-medium text-gold">
                    {reviewRating} {reviewRating === 1 ? 'star' : 'stars'}
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Your Review</Label>
              <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Tell us about your experience... (optional)"
                rows={4}
                className="min-h-0 resize-none border-gold/15 bg-surface placeholder:text-muted-foreground/60 focus-visible:ring-gold/50"
              />
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => { setReviewDialogOpen(false); setReviewRating(0); setReviewComment(''); }}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={reviewRating === 0 || submittingReview}
              className="rounded-lg bg-gradient-to-r from-gold-dark via-gold to-gold-light font-semibold text-black hover:brightness-110"
            >
              {submittingReview ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Send className="mr-2 size-4" />
              )}
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Receipt Dialog ---- */}
      <BookingReceipt
        booking={selectedBooking}
        open={receiptDialogOpen}
        onClose={() => setReceiptDialogOpen(false)}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Supporting components                                                     */
/* -------------------------------------------------------------------------- */

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-surface p-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-gold/10">
        <Icon className="size-4 text-gold" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-foreground break-words">{value}</p>
      </div>
    </div>
  );
}

/* We need a small helper to avoid an unused import lint error — call the store setter directly */
function setSelectedServiceFromStore(service: NonNullable<Booking['service']>) {
  // We import the service shape from the booking but the store expects a full Service.
  // Map the subset to what the store expects.
  useAppStore.getState().setSelectedService({
    id: service.id,
    providerId: (service as { providerId?: string }).providerId ?? '',
    title: service.title,
    description: service.description ?? '',
    category: service.category,
    price: service.price,
    duration: service.duration ?? '',
    images: service.images,
    location: service.location,
    rating: service.rating ?? 0,
    reviewCount: service.reviewCount ?? 0,
    featured: false,
    status: 'active',
  });
}
