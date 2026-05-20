'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type Booking, type Service } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { SpendingChart } from '@/components/concierge/client/SpendingChart';
import { BookingCancellation } from '@/components/concierge/shared/BookingCancellation';
import { BookingReceipt } from '@/components/concierge/shared/BookingReceipt';
import { ActivityFeed } from '@/components/concierge/shared/ActivityFeed';
import {
  CalendarCheck,
  DollarSign,
  MessageSquare,
  Heart,
  Compass,
  User,
  ChevronRight,
  Clock,
  MapPin,
  Star,
  Users,
  XCircle,
  CheckCircle2,
  PenLine,
  TrendingUp,
  Receipt,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Props & helpers                                                           */
/* -------------------------------------------------------------------------- */

interface ClientDashboardProps {
  activeTab?: string;
}

const TAB_MAP: Record<string, string> = {
  upcoming: 'upcoming',
  history: 'history',
  favorites: 'favorites',
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:   { label: 'Pending',   className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  accepted:  { label: 'Confirmed', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  completed: { label: 'Completed', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  rejected:  { label: 'Rejected',  className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  cancelled: { label: 'Cancelled', className: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30' },
};

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
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
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
/*  Animation variants                                                        */
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
/*  Skeleton loader                                                           */
/* -------------------------------------------------------------------------- */

function BookingCardSkeleton() {
  return (
    <div className="luxury-card overflow-hidden rounded-xl">
      <div className="flex flex-col sm:flex-row">
        <Skeleton className="h-48 w-full sm:h-auto sm:w-56 shrink-0 rounded-none" />
        <div className="flex flex-1 flex-col gap-3 p-5">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-32" />
          <div className="mt-auto flex items-center justify-between pt-3">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Interactive Star Rating                                                    */
/* -------------------------------------------------------------------------- */

function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'size-6',
}: {
  value: number;
  onChange?: (val: number) => void;
  readonly?: boolean;
  size?: string;
}) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < display;
        return (
          <motion.button
            key={i}
            type="button"
            disabled={readonly}
            whileHover={!readonly ? { scale: 1.15 } : undefined}
            whileTap={!readonly ? { scale: 0.9 } : undefined}
            onMouseEnter={() => !readonly && setHovered(i + 1)}
            onMouseLeave={() => !readonly && setHovered(0)}
            onClick={() => onChange?.(i + 1)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer'} focus:outline-none`}
          >
            <Star
              className={`${size} transition-colors duration-150 ${
                filled
                  ? 'fill-gold text-gold'
                  : 'text-muted-foreground/30'
              }`}
            />
          </motion.button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Review Dialog                                                              */
/* -------------------------------------------------------------------------- */

function ReviewDialog({
  open,
  onOpenChange,
  booking,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onSubmit: (bookingId: string) => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  const handleSubmit = async () => {
    if (!booking || rating === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          clientId: booking.clientId,
          serviceId: booking.serviceId,
          providerId: booking.providerId,
          rating,
          comment: comment.trim(),
        }),
      });
      if (res.ok) {
        toast.success('Review submitted! Thank you for your feedback.');
        onSubmit(booking.id);
        onOpenChange(false);
      } else if (res.status === 409) {
        toast.error('You have already reviewed this booking.');
        onOpenChange(false);
      } else {
        const data = await res.json();
        toast.error(data.error ?? 'Failed to submit review.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* Reset state when dialog opens/closes */
  useEffect(() => {
    if (!open) {
      setRating(0);
      setComment('');
    }
  }, [open]);

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-gold/15 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white font-serif text-lg">Write a Review</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Share your experience for{' '}
            <span className="text-white font-medium">
              {booking.service?.title ?? 'this service'}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Star rating */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your Rating
            </label>
            <div className="flex items-center gap-3">
              <StarRating value={rating} onChange={setRating} size="size-8" />
              {rating > 0 && (
                <motion.span
                  key={rating}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm font-medium text-gold"
                >
                  {RATING_LABELS[rating]}
                </motion.span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 1000))}
              placeholder="Tell us about your experience..."
              rows={4}
              className="w-full rounded-lg border border-gold/15 bg-surface px-4 py-3 text-sm text-white placeholder:text-muted-foreground/50 focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20 resize-none"
            />
            <p className="text-right text-[11px] text-muted-foreground">
              {comment.length}/1000
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="border-gold/20 text-muted-foreground text-sm hover:text-white">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-sm font-semibold text-black hover:brightness-110"
          >
            {submitting ? (
              <span className="inline-block size-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="mr-1.5 size-4" />
                Submit Review
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Booking card                                                              */
/* -------------------------------------------------------------------------- */

function BookingCard({
  booking,
  index,
  onViewDetails,
  reviewedIds,
  onWriteReview,
  onCancelBooking,
}: {
  booking: Booking;
  index: number;
  onViewDetails: () => void;
  reviewedIds: Set<string>;
  onWriteReview: (booking: Booking) => void;
  onCancelBooking: (booking: Booking) => void;
  onDownloadReceipt: (booking: Booking) => void;
}) {
  const imgUrl = getFirstImage(booking);
  const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
  const isReviewed = reviewedIds.has(booking.id);
  const canReview = booking.status === 'completed' && !isReviewed;
  const canCancel = booking.status === 'pending' || booking.status === 'accepted';
  const canReceipt = booking.status === 'completed';

  const placeholders = [
    'from-gold/20 via-amber-900/30 to-gold-dark/20',
    'from-amber-800/30 via-gold-dark/20 to-stone-900/30',
    'from-stone-800/30 via-gold/20 to-amber-900/20',
  ];

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      className="luxury-card group cursor-pointer overflow-hidden rounded-xl"
      onClick={onViewDetails}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative h-48 w-full shrink-0 overflow-hidden sm:h-auto sm:w-56">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={booking.service?.title ?? 'Service'}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className={`size-full bg-gradient-to-br ${placeholders[index % placeholders.length]}`} />
          )}
          <div className="absolute left-3 top-3">
            <Badge variant="outline" className={`border text-[11px] backdrop-blur-sm ${status.className}`}>
              {status.label}
            </Badge>
          </div>
          {/* Reviewed badge overlay */}
          {isReviewed && (
            <div className="absolute right-3 top-3">
              <Badge className="bg-gold/90 text-black border-gold text-[10px] font-semibold px-2 py-0.5 gap-1">
                <CheckCircle2 className="size-3" />
                Reviewed
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2.5 p-5">
          <h3 className="font-serif text-lg font-semibold leading-snug text-white">
            {booking.service?.title ?? 'Service'}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarCheck className="size-3.5 shrink-0 text-gold/70" />
              {formatDate(booking.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5 shrink-0 text-gold/70" />
              {formatTime(booking.time)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5 shrink-0 text-gold/70" />
              {booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}
            </span>
          </div>

          {booking.service?.location && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3.5 shrink-0 text-gold/70" />
              {booking.service.location}
            </span>
          )}

          {/* Provider */}
          {booking.provider && (
            <div className="mt-1 flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-full bg-gold/10 text-[10px] font-bold text-gold">
                {booking.provider.name?.charAt(0)?.toUpperCase()}
              </div>
              <span className="text-xs text-muted-foreground">{booking.provider.name}</span>
            </div>
          )}

          {/* Price + CTA */}
          <div className="mt-auto flex items-center justify-between pt-3">
            <span className="font-serif text-xl font-bold text-gold">
              ${booking.totalPrice.toLocaleString()}
            </span>
            <div className="flex items-center gap-2">
              {/* Write Review button for completed bookings */}
              {canReview && (
                <Button
                  size="sm"
                  className="h-9 rounded-lg bg-gold/15 border border-gold/30 px-3 text-xs font-semibold text-gold hover:bg-gold/25"
                  onClick={(e) => { e.stopPropagation(); onWriteReview(booking); }}
                >
                  <PenLine className="mr-1 size-3" />
                  Write Review
                </Button>
              )}
              {/* Download Receipt button for completed */}
              {canReceipt && (
                <Button
                  size="sm"
                  className="h-9 rounded-lg bg-gold/10 border border-gold/25 px-3 text-xs font-semibold text-gold hover:bg-gold/20"
                  onClick={(e) => { e.stopPropagation(); onDownloadReceipt(booking); }}
                >
                  <Receipt className="mr-1 size-3" />
                  Receipt
                </Button>
              )}
              {/* Cancel Booking button for pending/accepted */}
              {canCancel && (
                <Button
                  size="sm"
                  className="h-9 rounded-lg bg-red-600/15 border border-red-500/30 px-3 text-xs font-semibold text-red-400 hover:bg-red-600/25"
                  onClick={(e) => { e.stopPropagation(); onCancelBooking(booking); }}
                >
                  <XCircle className="mr-1 size-3" />
                  Cancel
                </Button>
              )}
              <Button
                size="sm"
                className="h-9 rounded-lg bg-gradient-to-r from-gold-dark to-gold px-4 text-xs font-semibold text-black hover:brightness-110"
                onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
              >
                View Details
                <ChevronRight className="ml-1 size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stats cards                                                               */
/* -------------------------------------------------------------------------- */

function StatsCards({
  upcomingCount,
  totalSpent,
  reviewsCount,
  favoritesCount,
}: {
  upcomingCount: number;
  totalSpent: number;
  reviewsCount: number;
  favoritesCount: number;
}) {
  const cards = [
    {
      label: 'Upcoming Bookings',
      value: upcomingCount,
      icon: CalendarCheck,
      gradient: 'from-emerald-500/10 to-emerald-500/5',
      iconColor: 'text-emerald-400',
    },
    {
      label: 'Total Spent',
      value: `$${totalSpent.toLocaleString()}`,
      icon: DollarSign,
      gradient: 'from-gold/10 to-gold/5',
      iconColor: 'text-gold',
    },
    {
      label: 'Reviews Given',
      value: reviewsCount,
      icon: MessageSquare,
      gradient: 'from-blue-500/10 to-blue-500/5',
      iconColor: 'text-blue-400',
    },
    {
      label: 'Favorite Services',
      value: favoritesCount,
      icon: Heart,
      gradient: 'from-pink-500/10 to-pink-500/5',
      iconColor: 'text-pink-400',
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            custom={i}
            variants={fadeUp}
            className="luxury-card flex items-center gap-4 rounded-xl p-4 lg:p-5"
          >
            <div className={`flex size-11 items-center justify-center rounded-lg bg-gradient-to-br ${card.gradient}`}>
              <Icon className={`size-5 ${card.iconColor}`} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{card.label}</p>
              <p className="font-serif text-xl font-bold text-white lg:text-2xl">{card.value}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main ClientDashboard                                                      */
/* -------------------------------------------------------------------------- */

export function ClientDashboard({ activeTab: rawTab }: ClientDashboardProps) {
  const defaultTab = TAB_MAP[rawTab ?? ''] ?? 'upcoming';
  const [tab, setTab] = useState(defaultTab);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [favoriteServices, setFavoriteServices] = useState<Service[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  // Review dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);

  // Receipt dialog state
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);

  const { user, setSelectedService, setSelectedBooking, setView, setFavoriteIds } = useAppStore();

  /* ---- Fetch favorites ---- */
  const fetchFavorites = useCallback(async () => {
    if (!user) return;
    setFavoritesLoading(true);
    try {
      const res = await fetch(`/api/favorites?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        const favs = data.favorites ?? [];
        setFavoriteServices(favs.map((f: { service: Service }) => f.service));
        setFavoriteIds(favs.map((f: { serviceId: string }) => f.serviceId));
      }
    } catch {
      // Silently fail
    } finally {
      setFavoritesLoading(false);
    }
  }, [user, setFavoriteIds]);

  /* ---- Fetch bookings ---- */
  const fetchBookings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [pendingRes, upcomingRes, pastRes, reviewsRes] = await Promise.all([
        fetch(`/api/bookings?clientId=${user.id}&status=pending`),
        fetch(`/api/bookings?clientId=${user.id}&status=accepted`),
        fetch(`/api/bookings?clientId=${user.id}&status=completed`),
        fetch(`/api/reviews?clientId=${user.id}`),
      ]);

      if (pendingRes.ok) {
        const data = await pendingRes.json();
        setPendingBookings(data.bookings ?? []);
      }
      if (upcomingRes.ok) {
        const data = await upcomingRes.json();
        setUpcomingBookings(data.bookings ?? []);
      }
      if (pastRes.ok) {
        const data = await pastRes.json();
        setPastBookings(data.bookings ?? []);
      }
      if (reviewsRes.ok) {
        const data = await reviewsRes.json();
        const reviews = data.reviews ?? [];
        setReviewsCount(reviews.length);
        // Track which bookings have been reviewed
        setReviewedIds(new Set(reviews.map((r: { bookingId: string }) => r.bookingId)));
      }
    } catch {
      // Silently fail — empty states shown
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Combine pending + accepted for the "upcoming" tab
  const allUpcoming = useMemo(
    () => [...pendingBookings, ...upcomingBookings],
    [pendingBookings, upcomingBookings],
  );

  /* ---- Computed stats ---- */
  const totalSpent = useMemo(
    () => pastBookings.reduce((sum, b) => sum + b.totalPrice, 0),
    [pastBookings],
  );

  /* ---- Handlers ---- */
  const handleViewBooking = useCallback(
    (booking: Booking) => {
      setSelectedBooking(booking);
      setView('booking-detail');
    },
    [setSelectedBooking, setView],
  );

  const handleBrowseServices = useCallback(() => {
    setView('services');
  }, [setView]);

  const handleViewProfile = useCallback(() => {
    setView('profile');
  }, [setView]);

  const handleWriteReview = useCallback((booking: Booking) => {
    setReviewBooking(booking);
    setReviewDialogOpen(true);
  }, []);

  const handleReviewSubmitted = useCallback((bookingId: string) => {
    setReviewedIds((prev) => new Set(prev).add(bookingId));
    setReviewsCount((prev) => prev + 1);
  }, []);

  const handleCancelBooking = useCallback((booking: Booking) => {
    setCancelBooking(booking);
    setCancelDialogOpen(true);
  }, []);

  const handleDownloadReceipt = useCallback((booking: Booking) => {
    setReceiptBooking(booking);
    setReceiptDialogOpen(true);
  }, []);

  const handleCancelled = useCallback(() => {
    if (!cancelBooking) return;
    setPendingBookings((prev) => prev.filter((b) => b.id !== cancelBooking.id));
    setUpcomingBookings((prev) => prev.filter((b) => b.id !== cancelBooking.id));
  }, [cancelBooking]);

  /* ---- Tab change sync ---- */
  useEffect(() => {
    const mapped = TAB_MAP[rawTab ?? ''];
    if (mapped) setTab(mapped);
  }, [rawTab]);

  /* ---- Fetch favorites when tab switches to favorites ---- */
  useEffect(() => {
    if (tab === 'favorites') fetchFavorites();
  }, [tab, fetchFavorites]);

  /* ---- Guard ---- */
  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  /* ---- Render tab content ---- */
  const renderTabContent = () => {
    /* ---- FAVORITES ---- */
    if (tab === 'favorites') {
      if (favoritesLoading) {
        return (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        );
      }

      if (favoriteServices.length === 0) {
        return (
          <motion.div
            key="favorites"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center gap-4 py-20 text-center"
          >
            <div className="flex size-20 items-center justify-center rounded-full bg-gold/10">
              <Heart className="size-9 text-gold/60" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-white">No favorites yet</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Start exploring our curated luxury services and save your favorites for later.
            </p>
            <Button
              onClick={handleBrowseServices}
              className="mt-2 h-11 rounded-lg bg-gradient-to-r from-gold-dark via-gold to-gold-light px-6 text-sm font-semibold text-black hover:brightness-110"
            >
              <Compass className="mr-2 size-4" />
              Browse Services
            </Button>
          </motion.div>
        );
      }

      return (
        <motion.div
          key="favorites"
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {favoriteServices.map((service, i) => {
            const imgs = service.images;
            let imgUrl: string | null = null;
            if (imgs) {
              try {
                const arr = JSON.parse(imgs);
                if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string') imgUrl = arr[0];
              } catch {
                if (typeof imgs === 'string' && imgs.startsWith('http')) imgUrl = imgs;
              }
            }

            return (
              <motion.div
                key={service.id}
                custom={i}
                variants={fadeUp}
                className="luxury-card group cursor-pointer overflow-hidden rounded-xl"
                onClick={() => {
                  setSelectedService(service);
                  setView('service-detail');
                }}
              >
                <div className="relative h-40 overflow-hidden">
                  {imgUrl ? (
                    <img src={imgUrl} alt={service.title} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="size-full bg-gradient-to-br from-gold/20 via-amber-900/30 to-gold-dark/20" />
                  )}
                  <div className="absolute right-3 top-3">
                    <Badge variant="outline" className="border-gold/30 bg-gold/10 text-gold text-[10px]">
                      {service.category}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-serif text-sm font-semibold text-white truncate">{service.title}</h4>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="size-3 shrink-0 text-gold/70" />
                    <span className="truncate">{service.location}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-serif text-lg font-bold text-gold">${service.price.toLocaleString()}</span>
                    <div className="flex items-center gap-1">
                      <Star className="size-3.5 fill-gold text-gold" />
                      <span className="text-xs text-muted-foreground">{service.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      );
    }

    /* ---- UPCOMING ---- */
    if (tab === 'upcoming') {
      if (loading) {
        return (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <BookingCardSkeleton key={i} />
            ))}
          </div>
        );
      }

      if (allUpcoming.length === 0) {
        return (
          <motion.div
            key="upcoming-empty"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 py-16 text-center"
          >
            <div className="flex size-20 items-center justify-center rounded-full bg-gold/10">
              <CalendarCheck className="size-9 text-gold/60" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-white">No upcoming bookings</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              You don&apos;t have any confirmed bookings yet. Browse our luxury services and book your first experience.
            </p>
          </motion.div>
        );
      }

      return (
        <motion.div
          key="upcoming"
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="space-y-4"
        >
          {allUpcoming.map((booking, i) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              index={i}
              onViewDetails={() => handleViewBooking(booking)}
              reviewedIds={reviewedIds}
              onWriteReview={handleWriteReview}
              onCancelBooking={handleCancelBooking}
              onDownloadReceipt={handleDownloadReceipt}
            />
          ))}
        </motion.div>
      );
    }

    /* ---- HISTORY (Past) ---- */
    if (tab === 'history') {
      if (loading) {
        return (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <BookingCardSkeleton key={i} />
            ))}
          </div>
        );
      }

      return (
        <div className="space-y-8">
          {/* Spending Analytics */}
          <SpendingChart bookings={pastBookings} />

          {pastBookings.length === 0 ? (
            <motion.div
              key="history-empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4 py-16 text-center"
            >
              <div className="flex size-20 items-center justify-center rounded-full bg-gold/10">
                <Clock className="size-9 text-gold/60" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-white">No past bookings</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Your completed bookings will appear here. Book a service to get started.
              </p>
            </motion.div>
          ) : (
            <>
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <TrendingUp className="size-5 text-gold" />
              <h3 className="font-serif text-xl font-semibold text-white">Booking History</h3>
              <Badge variant="outline" className="border-gold/20 bg-gold/5 text-gold text-xs">
                {pastBookings.length} booking{pastBookings.length !== 1 ? 's' : ''}
              </Badge>
            </motion.div>
            <div className="gold-separator mb-6" />

            <motion.div
              key="history"
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="space-y-4"
            >
              {pastBookings.map((booking, i) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  index={i}
                  onViewDetails={() => handleViewBooking(booking)}
                  reviewedIds={reviewedIds}
                  onWriteReview={handleWriteReview}
                  onCancelBooking={handleCancelBooking}
                  onDownloadReceipt={handleDownloadReceipt}
                />
              ))}
            </motion.div>
            </>
          )}
        </div>
      );
    }

    return null;
  };

  /* ---- Main render ---- */
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <div className="mb-2 flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">
            Client Dashboard
          </span>
          <span className="h-px flex-1 bg-gradient-to-l from-gold/30 to-transparent" />
        </div>
        <h1 className="text-center font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Welcome back,{' '}
          <span className="text-gold-gradient">{user.name}</span>
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Manage your bookings, explore favorites, and review past experiences.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="mb-10">
        <StatsCards
          upcomingCount={allUpcoming.length}
          totalSpent={totalSpent}
          reviewsCount={reviewsCount}
          favoritesCount={favoriteServices.length}
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="mb-10 flex flex-wrap gap-3"
      >
        <Button
          onClick={handleBrowseServices}
          className="h-11 rounded-lg bg-gradient-to-r from-gold-dark via-gold to-gold-light px-6 text-sm font-semibold text-black hover:brightness-110"
        >
          <Compass className="mr-2 size-4" />
          Browse Services
        </Button>
        <Button
          variant="outline"
          onClick={handleViewProfile}
          className="h-11 rounded-lg border-gold/30 px-6 text-sm font-semibold text-gold hover:border-gold/60 hover:bg-gold/5 hover:text-gold"
        >
          <User className="mr-2 size-4" />
          View Profile
        </Button>
      </motion.div>

      {/* Tabs & Content + Activity Sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <TabsList className="mb-6 w-full justify-start rounded-lg bg-surface p-1">
            <TabsTrigger
              value="upcoming"
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-gold/15 data-[state=active]:text-gold"
            >
              <CalendarCheck className="size-4" />
              Upcoming
              {!loading && allUpcoming.length > 0 && (
                <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-gold/20 text-[10px] font-bold text-gold">
                  {allUpcoming.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-gold/15 data-[state=active]:text-gold"
            >
              <Star className="size-4" />
              Past Bookings
              {!loading && pastBookings.length > 0 && (
                <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-gold/20 text-[10px] font-bold text-gold">
                  {pastBookings.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-gold/15 data-[state=active]:text-gold"
            >
              <Heart className="size-4" />
              Favorites
            </TabsTrigger>
          </TabsList>
        </motion.div>

        <AnimatePresence mode="wait">
          {renderTabContent()}
        </AnimatePresence>
      </Tabs>

      {/* Activity Feed Sidebar */}
      <motion.aside
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="hidden lg:block"
      >
        <div className="sticky top-24">
          <ActivityFeed userId={user.id} role="client" limit={5} />
        </div>
      </motion.aside>
      </div>

      {/* Review Dialog */}
      <ReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        booking={reviewBooking}
        onSubmit={handleReviewSubmitted}
      />

      {/* Booking Cancellation Dialog */}
      <BookingCancellation
        booking={cancelBooking}
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onCancelled={handleCancelled}
      />

      {/* Booking Receipt Dialog */}
      <BookingReceipt
        booking={receiptBooking}
        open={receiptDialogOpen}
        onClose={() => setReceiptDialogOpen(false)}
      />
    </div>
  );
}
