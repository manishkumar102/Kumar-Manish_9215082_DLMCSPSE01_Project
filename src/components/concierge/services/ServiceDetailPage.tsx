'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type Service, type Review } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ServiceShareDialog } from '@/components/concierge/shared/ServiceShareDialog';
import {
  Star,
  MapPin,
  Clock,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Calendar,
  Users,
  MessageSquare,
  CheckCircle2,
  LogIn,
  Search,
  Heart,
  Share2,
  Sparkles,
  History,
  Eye,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const TIME_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
] as const;

const PLACEHOLDER_GRADIENTS = [
  'from-gold/20 via-amber-900/30 to-gold-dark/20',
  'from-amber-800/30 via-gold-dark/20 to-stone-900/30',
  'from-stone-800/30 via-gold/20 to-amber-900/20',
  'from-gold-dark/20 via-amber-900/20 to-gold/20',
  'from-amber-900/20 via-stone-800/30 to-gold-dark/20',
];

/* -------------------------------------------------------------------------- */
/*  Highlight Keywords                                                        */
/* -------------------------------------------------------------------------- */

const HIGHLIGHT_KEYWORDS: { pattern: RegExp; label: string; icon?: string }[] = [
  { pattern: /\bMichelin\b/i, label: 'Michelin' },
  { pattern: /\bPrivate\b/i, label: 'Private' },
  { pattern: /\bVIP\b/i, label: 'VIP' },
  { pattern: /\bExclusive\b/i, label: 'Exclusive' },
  { pattern: /\bLuxur(?:y|ious)\b/i, label: 'Luxury' },
  { pattern: /\bPremium\b/i, label: 'Premium' },
  { pattern: /\bFive[- ]?Star\b/i, label: '5-Star' },
  { pattern: /\b5[- ]?Star\b/i, label: '5-Star' },
  { pattern: /\bAward[- ]?Winning\b/i, label: 'Award-Winning' },
  { pattern: /\bBespoke\b/i, label: 'Bespoke' },
  { pattern: /\bPersonal(?:ized)?\b/i, label: 'Personalized' },
  { pattern: /\bCelebrity\b/i, label: 'Celebrity' },
  { pattern: /\bGourmet\b/i, label: 'Gourmet' },
  { pattern: /\bOrganic\b/i, label: 'Organic' },
  { pattern: /\bArtisan(?:al)?\b/i, label: 'Artisanal' },
  { pattern: /\bCurated\b/i, label: 'Curated' },
  { pattern: /\bHolistic\b/i, label: 'Holistic' },
  { pattern: /\bSignature\b/i, label: 'Signature' },
  { pattern: /\bComplimentar(?:y)?\b/i, label: 'Complimentary' },
  { pattern: /\bPanoramic\b/i, label: 'Panoramic' },
  { pattern: /\bOcean[- ]?(?:front|view|side)\b/i, label: 'Ocean View' },
  { pattern: /\bRooftop\b/i, label: 'Rooftop' },
];

function extractHighlights(description: string): string[] {
  const seen = new Set<string>();
  const highlights: string[] = [];
  for (const kw of HIGHLIGHT_KEYWORDS) {
    if (kw.pattern.test(description) && !seen.has(kw.label)) {
      seen.add(kw.label);
      highlights.push(kw.label);
    }
  }
  return highlights;
}

/* -------------------------------------------------------------------------- */
/*  Animation helpers                                                         */
/* -------------------------------------------------------------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

/* -------------------------------------------------------------------------- */
/*  Image helpers                                                             */
/* -------------------------------------------------------------------------- */

function parseImages(images?: string): string[] {
  if (!images) return [];
  try {
    const arr = JSON.parse(images);
    if (Array.isArray(arr)) {
      return arr.filter((item): item is string => typeof item === 'string');
    }
  } catch {
    if (typeof images === 'string' && images.startsWith('http')) {
      return [images];
    }
  }
  return [];
}

/* -------------------------------------------------------------------------- */
/*  Star Rating                                                               */
/* -------------------------------------------------------------------------- */

function StarRating({ rating, showValue = true }: { rating: number; showValue?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-4 ${i < Math.round(rating) ? 'fill-gold text-gold' : 'text-muted-foreground/40'}`}
        />
      ))}
      {showValue && (
        <span className="ml-1.5 text-sm font-medium text-muted-foreground">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Image Gallery                                                             */
/* -------------------------------------------------------------------------- */

function ImageGallery({ images }: { images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-gradient-to-br from-gold/15 via-amber-900/20 to-gold-dark/15">
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-gold/10">
              <Star className="size-7 text-gold/40" />
            </div>
            <p className="text-sm text-muted-foreground">No images available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="group/img relative aspect-[16/9] w-full overflow-hidden rounded-xl cursor-zoom-in">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIndex}
            src={images[activeIndex]}
            alt={`Service image ${activeIndex + 1}`}
            className="size-full object-cover transition-transform duration-500 ease-out group-hover/img:scale-110"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>

        {/* Zoom indicator */}
        <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white/70 backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover/img:opacity-100">
          <Eye className="size-3" />
          Hover to zoom
        </div>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 flex size-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:bg-black/70"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 flex size-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:bg-black/70"
              aria-label="Next image"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        {/* Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                i === activeIndex
                  ? 'border-gold ring-1 ring-gold/30'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${i + 1}`}
                className="size-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Provider Card                                                             */
/* -------------------------------------------------------------------------- */

function ProviderCard({ service }: { service: Service }) {
  const setSelectedService = useAppStore((s) => s.setSelectedService);
  const setView = useAppStore((s) => s.setView);

  const provider = service.provider;

  if (!provider) return null;

  return (
    <div className="luxury-card flex items-center gap-4 rounded-xl p-5">
      <div className="relative">
        <Avatar className="size-14 border-2 border-gold/30">
          <AvatarImage src={provider.avatar} alt={provider.name} />
          <AvatarFallback className="bg-gradient-to-br from-gold-dark to-gold text-lg font-bold text-black">
            {provider.name?.charAt(0) ?? 'P'}
          </AvatarFallback>
        </Avatar>
        {provider.verified && (
          <div className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full border-2 border-[#141414] bg-gold">
            <ShieldCheck className="size-3 text-black" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="truncate text-sm font-semibold text-white">{provider.name}</h4>
          {provider.verified && (
            <Badge className="border-0 bg-gold/10 px-1.5 py-0 text-[10px] text-gold">
              Verified
            </Badge>
          )}
        </div>
        {provider.location && (
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            <span className="truncate">{provider.location}</span>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setSelectedService(service);
          setView('profile');
        }}
        className="h-9 shrink-0 rounded-lg border-gold/20 px-4 text-xs font-medium text-gold hover:border-gold/40 hover:bg-gold/5 hover:text-gold"
      >
        View Profile
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Reviews Section                                                           */
/* -------------------------------------------------------------------------- */

function ReviewsSection({ serviceId }: { serviceId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?serviceId=${serviceId}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setReviews(data.reviews ?? []);
        }
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchReviews();
    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="font-serif text-xl font-semibold text-white">Reviews</h3>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-gold/10 bg-surface p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            </div>
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="font-serif text-xl font-semibold text-white">Reviews</h3>
        <div className="flex flex-col items-center rounded-xl border border-gold/10 bg-surface py-12 text-center">
          <MessageSquare className="mb-3 size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No reviews yet for this service.</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Be the first to share your experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl font-semibold text-white">
          Reviews ({reviews.length})
        </h3>
      </div>

      <div className="space-y-3 max-h-[96] overflow-y-auto pr-1">
        <AnimatePresence>
          {reviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: idx * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-xl border border-gold/10 bg-surface p-5 transition-all duration-300 hover:border-gold/20 hover:shadow-lg hover:shadow-gold/5"
            >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="size-10 border border-gold/15">
                  <AvatarImage src={review.client?.avatar} alt={review.client?.name} />
                  <AvatarFallback className="bg-gold/10 text-xs font-bold text-gold">
                    {review.client?.name?.charAt(0) ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {review.client?.name ?? 'Anonymous'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <StarRating rating={review.rating} showValue={false} />
            </div>

            {review.comment && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{review.comment}&rdquo;
              </p>
            )}
          </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Booking Form                                                              */
/* -------------------------------------------------------------------------- */

function BookingForm({ service }: { service: Service }) {
  const { user, bookingForm, setBookingForm, resetBookingForm, setPaymentDialogOpen, setPendingPaymentBooking } =
    useAppStore();

  const totalPrice = service.price * bookingForm.guests;
  const platformFee = Math.round(totalPrice * 0.15 * 100) / 100;
  const totalWithFee = totalPrice + platformFee;

  const handleGuestsChange = useCallback(
    (delta: number) => {
      const newVal = Math.min(20, Math.max(1, bookingForm.guests + delta));
      setBookingForm({ guests: newVal });
    },
    [bookingForm.guests, setBookingForm]
  );

  const handleSubmit = useCallback(() => {
    if (!user) return;
    if (!bookingForm.date || !bookingForm.time) {
      toast.error('Please select a date and time for your booking.');
      return;
    }

    // Set the pending payment booking data and open payment dialog
    setPendingPaymentBooking({
      serviceId: service.id,
      providerId: service.providerId,
      date: bookingForm.date,
      time: bookingForm.time,
      guests: bookingForm.guests,
      specialReq: bookingForm.specialReq || '',
      totalPrice,
      serviceTitle: service.title,
    });
    setPaymentDialogOpen(true);
  }, [user, service, bookingForm, totalPrice, setPaymentDialogOpen, setPendingPaymentBooking]);

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="luxury-card overflow-hidden rounded-xl">
      {/* Header */}
      <div className="border-b border-gold/12 bg-gradient-to-r from-gold/5 to-transparent px-6 py-4">
        <h3 className="font-serif text-lg font-semibold text-white">Book This Experience</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Secure your luxury service reservation
        </p>
      </div>

      <div className="space-y-5 p-6">
        {/* Date */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
            <Calendar className="size-3.5" />
            Select Date
          </label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gold/50" />
            <Input
              type="date"
              min={today}
              value={bookingForm.date}
              onChange={(e) => setBookingForm({ date: e.target.value })}
              className="h-11 border-gold/15 bg-surface pl-10 pr-4 text-sm text-white focus-visible:border-gold/40 focus-visible:ring-gold/20 [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Time Slots */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
            <Clock className="size-3.5" />
            Time
          </label>
          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                onClick={() => setBookingForm({ time: slot })}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200 ${
                  bookingForm.time === slot
                    ? 'border-gold bg-gold/15 text-gold shadow-sm shadow-gold/10'
                    : 'border-gold/10 bg-surface text-muted-foreground hover:border-gold/25 hover:text-white'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
            <Users className="size-3.5" />
            Guests
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleGuestsChange(-1)}
              disabled={bookingForm.guests <= 1}
              className="flex size-9 items-center justify-center rounded-lg border border-gold/15 bg-surface text-gold transition-colors hover:border-gold/30 hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>
            <span className="min-w-[3rem] text-center font-serif text-xl font-bold text-white">
              {bookingForm.guests}
            </span>
            <button
              onClick={() => handleGuestsChange(1)}
              disabled={bookingForm.guests >= 20}
              className="flex size-9 items-center justify-center rounded-lg border border-gold/15 bg-surface text-gold transition-colors hover:border-gold/30 hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="size-4" />
            </button>
            <span className="text-xs text-muted-foreground">Max 20 guests</span>
          </div>
        </div>

        {/* Special Requests */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gold">
            Special Requests
          </label>
          <Textarea
            placeholder="Any special requests or preferences? Let the provider know..."
            value={bookingForm.specialReq}
            onChange={(e) => setBookingForm({ specialReq: e.target.value })}
            className="min-h-[80px] border-gold/15 bg-surface text-sm text-white placeholder:text-muted-foreground focus-visible:border-gold/40 focus-visible:ring-gold/20 resize-none"
          />
        </div>

        <Separator className="bg-gold/10" />

        {/* Price Breakdown */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">${totalPrice.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Platform Fee (15%)</span>
            <span className="font-medium text-foreground">
              ${platformFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="font-semibold text-white">Total</span>
            <div className="text-right">
              <span className="font-serif text-2xl font-bold text-gold">
                ${totalWithFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <p className="text-[10px] text-muted-foreground">
                ${service.price.toLocaleString()} x {bookingForm.guests} guest{bookingForm.guests !== 1 ? 's' : ''} + fee
              </p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!bookingForm.date || !bookingForm.time}
          className="h-12 w-full rounded-lg bg-gradient-to-r from-gold-dark via-gold to-gold-light text-sm font-semibold text-black shadow-lg shadow-gold/20 transition-all hover:shadow-gold/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
        >
          <CheckCircle2 className="mr-2 size-4" />
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Not Logged In CTA                                                         */
/* -------------------------------------------------------------------------- */

function NotLoggedInCTA() {
  const setView = useAppStore((s) => s.setView);

  return (
    <div className="luxury-card overflow-hidden rounded-xl text-center">
      <div className="border-b border-gold/12 bg-gradient-to-r from-gold/5 to-transparent px-6 py-4">
        <h3 className="font-serif text-lg font-semibold text-white">Book This Experience</h3>
      </div>
      <div className="flex flex-col items-center gap-4 p-8">
        <div className="flex size-16 items-center justify-center rounded-full bg-gold/10">
          <LogIn className="size-7 text-gold/70" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">Sign in to book this service</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create an account to access exclusive luxury experiences.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setView('login')}
            className="h-10 rounded-lg bg-gradient-to-r from-gold-dark to-gold px-6 text-sm font-semibold text-black hover:brightness-110"
          >
            Sign In
          </Button>
          <Button
            variant="outline"
            onClick={() => setView('register')}
            className="h-10 rounded-lg border-gold/20 px-6 text-sm font-medium text-gold hover:border-gold/40 hover:bg-gold/5 hover:text-gold"
          >
            Register
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Similar Services                                                          */
/* -------------------------------------------------------------------------- */

function getFirstImage(svc: Service): string | null {
  if (!svc.images) return null;
  try {
    const arr = JSON.parse(svc.images);
    if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string') return arr[0];
  } catch {
    if (typeof svc.images === 'string' && svc.images.startsWith('http')) return svc.images;
  }
  return null;
}

const SIMILAR_PLACEHOLDERS = [
  'from-gold/20 via-amber-900/30 to-gold-dark/20',
  'from-amber-800/30 via-gold-dark/20 to-stone-900/30',
  'from-stone-800/30 via-gold/20 to-amber-900/20',
];

function SimilarServices({
  currentServiceId,
  category,
  providerId,
  onServiceClick,
}: {
  currentServiceId: string;
  category: string;
  providerId: string;
  onServiceClick: (svc: Service) => void;
}) {
  const [similarServices, setSimilarServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchSimilar() {
      try {
        // Fetch services in the same category, excluding current one
        const res = await fetch(`/api/services?category=${encodeURIComponent(category)}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          const filtered = (data.services ?? [])
            .filter((s: Service) => s.id !== currentServiceId)
            .slice(0, 4);
          setSimilarServices(filtered);
        }
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchSimilar();
    return () => { cancelled = true; };
  }, [currentServiceId, category, providerId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="font-serif text-xl font-semibold text-white">Similar Services</h3>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="luxury-card overflow-hidden rounded-xl">
              <div className="aspect-[4/3] animate-shimmer bg-muted" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-3/4 animate-shimmer rounded bg-muted" />
                <div className="h-3 w-1/2 animate-shimmer rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (similarServices.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl font-semibold text-white">Similar Services</h3>
        <Button
          variant="ghost"
          onClick={() => {
            useAppStore.getState().setSelectedCategory(category);
            useAppStore.getState().setView('services');
          }}
          className="h-8 text-xs text-gold hover:text-gold hover:bg-gold/5"
        >
          View All
          <ArrowRight className="ml-1 size-3" />
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {similarServices.map((svc, i) => {
          const imgUrl = getFirstImage(svc);
          return (
            <motion.div
              key={svc.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(201, 169, 110, 0.1)' }}
              className="luxury-card group cursor-pointer overflow-hidden rounded-xl"
              onClick={() => onServiceClick(svc)}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={svc.title}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className={`size-full bg-gradient-to-br ${SIMILAR_PLACEHOLDERS[i % SIMILAR_PLACEHOLDERS.length]}`}
                  />
                )}
                <div className="absolute left-2 top-2">
                  <Badge className="border-gold/30 bg-black/60 text-[10px] text-gold backdrop-blur-sm">
                    {svc.category}
                  </Badge>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-serif text-sm font-semibold text-white group-hover:text-gold transition-colors duration-200 line-clamp-1">
                  {svc.title}
                </h4>
                <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3 shrink-0 text-gold/60" />
                  <span className="truncate">{svc.location}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-serif text-base font-bold text-gold">
                    ${svc.price.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="size-3 fill-gold text-gold" />
                    <span className="text-xs text-muted-foreground">{svc.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Service Detail Page (exported)                                            */
/* -------------------------------------------------------------------------- */

export function ServiceDetailPage() {
  const { selectedService, selectedServiceId, user, setView, setSelectedService } = useAppStore();
  const favoriteIds = useAppStore((s) => s.favoriteIds);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const recentlyViewed = useAppStore((s) => s.recentlyViewed);
  const addRecentlyViewed = useAppStore((s) => s.addRecentlyViewed);
  const [fetchedService, setFetchedService] = useState<Service | null>(null);
  const lastFetchedIdRef = useRef<string | null>(null);
  const [recentlyViewedServices, setRecentlyViewedServices] = useState<Service[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const serviceId = selectedServiceId || selectedService?.id;

  // Fetch from API when we have an ID but no data yet
  useEffect(() => {
    if (!serviceId) return;

    // If we already have data for this service (from store or previous fetch), skip
    if (lastFetchedIdRef.current === serviceId) return;

    let cancelled = false;
    lastFetchedIdRef.current = serviceId;

    fetch(`/api/services?id=${serviceId}`)
      .then((res) => {
        if (res.ok && !cancelled) return res.json();
        throw new Error('Not found');
      })
      .then((data) => {
        if (!cancelled && data.service) {
          setFetchedService(data.service);
          setSelectedService(data.service);
        }
      })
      .catch(() => {
        // Service not found — will show fallback UI
      });

    return () => {
      cancelled = true;
    };
  }, [serviceId, setSelectedService]);

  // Track recently viewed and fetch recently viewed services
  useEffect(() => {
    const service = fetchedService || selectedService;
    if (!service) return;
    addRecentlyViewed(service.id);
  }, [fetchedService, selectedService, addRecentlyViewed]);

  useEffect(() => {
    const ids = recentlyViewed;

    let cancelled = false;
    async function fetchRecentlyViewed() {
      if (ids.length <= 1) {
        if (!cancelled) setRecentlyViewedServices([]);
        return;
      }

      try {
        const idsParam = ids.join(',');
        const res = await fetch(`/api/services?ids=${idsParam}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          const services: Service[] = data.services ?? [];
          // Preserve the order from recentlyViewed, excluding the current service
          const ordered = ids
            .filter(id => id !== (fetchedService?.id || selectedService?.id))
            .map(id => services.find(s => s.id === id))
            .filter((s): s is Service => !!s);
          setRecentlyViewedServices(ordered);
        }
      } catch {
        // Silently fail
      }
    }

    fetchRecentlyViewed();
    return () => { cancelled = true; };
  }, [recentlyViewed, fetchedService?.id, selectedService?.id]);

  // Loading: show spinner only when we have an ID but no data at all
  const loadingService = !!serviceId && !fetchedService && !selectedService;
  const service = fetchedService || selectedService;
  const handleSimilarServiceClick = useCallback(
    (svc: Service) => {
      setSelectedService(svc);
      setFetchedService(svc);
      lastFetchedIdRef.current = svc.id;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [setSelectedService],
  );

  const images = parseImages(service?.images);

  const handleBack = useCallback(() => {
    setSelectedService(null);
    setFetchedService(null);
    lastFetchedIdRef.current = null;
    setView('services');
  }, [setSelectedService, setView]);

  // Loading state while fetching
  if (loadingService) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <span className="inline-block size-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          <p className="mt-4 text-sm text-muted-foreground">Loading service details...</p>
        </div>
      </div>
    );
  }

  // No service selected — redirect
  if (!service) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gold/10">
            <Search className="size-7 text-gold/50" />
          </div>
          <p className="text-lg font-medium text-white">No service found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The service you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button
            variant="outline"
            onClick={() => setView('services')}
            className="mt-6 border-gold/20 text-sm text-gold hover:border-gold/40 hover:bg-gold/5 hover:text-gold"
          >
            <ArrowLeft className="mr-2 size-4" />
            Browse All Services
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Decorative top line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-gold"
        >
          <ArrowLeft className="size-4" />
          Back to Services
        </motion.button>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Column: Images + Info + Reviews */}
          <div className="min-w-0 flex-1 space-y-8">
            {/* Image Gallery */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <ImageGallery images={images} />
            </motion.div>

            {/* Service Info */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-4">
              <div className="flex flex-wrap items-start gap-3">
                <Badge className="border-gold/30 bg-gold/10 px-3 py-1 text-xs text-gold">
                  {service.category}
                </Badge>
                {service.featured && (
                  <Badge className="border-0 bg-gradient-to-r from-gold-dark to-gold px-3 py-1 text-xs font-bold text-black">
                    Featured
                  </Badge>
                )}
                <Badge variant="outline" className="border-gold/15 text-xs text-muted-foreground">
                  <Clock className="mr-1 size-3" />
                  {service.duration}
                </Badge>
              </div>

              <div className="flex items-start justify-between gap-4">
                <h1 className="font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
                  {service.title}
                </h1>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Share Button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShareDialogOpen(true)}
                    className="flex size-12 items-center justify-center rounded-full border border-gold/20 bg-gold/5 transition-all hover:border-gold/40 hover:bg-gold/10"
                    aria-label="Share this service"
                  >
                    <Share2 className="size-5 text-gold/60 transition-colors hover:text-gold" />
                  </motion.button>
                  {/* Favorite Button */}
                  <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={() => {
                      if (!user) {
                        toast.error('Please sign in to save favorites');
                        useAppStore.getState().setView('login');
                        return;
                      }
                      const isFav = favoriteIds.includes(service.id);
                      toggleFavorite(service.id);
                      fetch('/api/favorites', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.id, serviceId: service.id, action: isFav ? 'remove' : 'add' }),
                      });
                    }}
                    className="flex size-12 items-center justify-center rounded-full border border-gold/20 bg-gold/5 transition-all hover:border-gold/40 hover:bg-gold/10"
                    aria-label={favoriteIds.includes(service.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`size-6 transition-colors ${favoriteIds.includes(service.id) ? 'fill-red-500 text-red-500' : 'text-gold/60 hover:text-gold'}`} />
                  </motion.button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-gold/60" />
                  <span>{service.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <StarRating rating={service.rating} />
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({service.reviewCount} {service.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 pt-2">
                <span className="font-serif text-3xl font-bold text-gold">
                  ${service.price.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">per session</span>
              </div>

              <Separator className="bg-gold/10" />

              {/* Description */}
              <div>
                <h3 className="mb-3 font-serif text-lg font-semibold text-white">About This Experience</h3>

                {/* Highlight Badges */}
                {(() => {
                  const highlights = extractHighlights(service.description);
                  if (highlights.length === 0) return null;
                  return (
                    <div className="mb-4 flex flex-wrap gap-2">
                      <Sparkles className="mt-0.5 size-4 shrink-0 text-gold/60" />
                      {highlights.map((hl) => (
                        <span
                          key={hl}
                          className="inline-flex items-center rounded-full border border-gold/25 bg-gradient-to-r from-gold/10 to-gold/5 px-3 py-1 text-xs font-medium text-gold shadow-sm shadow-gold/5"
                        >
                          {hl}
                        </span>
                      ))}
                    </div>
                  );
                })()}

                <div className="prose prose-sm prose-invert max-w-none">
                  {service.description.split('\n').map((paragraph, i) => (
                    <p
                      key={i}
                      className="text-sm leading-relaxed text-muted-foreground"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Provider Card */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <ProviderCard service={service} />
            </motion.div>

            {/* Reviews */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <ReviewsSection serviceId={service.id} />
            </motion.div>

            {/* Similar Services */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <SimilarServices
                currentServiceId={service.id}
                category={service.category}
                providerId={service.providerId}
                onServiceClick={handleSimilarServiceClick}
              />
            </motion.div>
          </div>

          {/* Right Column: Booking Form (sticky on desktop) */}
          <div className="w-full shrink-0 lg:w-[380px]">
            <div className="sticky top-24">
              <motion.div variants={fadeUp} initial="hidden" animate="visible">
                {user && user.role === 'client' ? (
                  <BookingForm service={service} />
                ) : user && user.role === 'provider' && user.id === service.providerId ? (
                  <div className="luxury-card overflow-hidden rounded-xl text-center p-8">
                    <CheckCircle2 className="mx-auto mb-3 size-10 text-gold" />
                    <p className="text-sm font-medium text-white">This is your service</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Manage this service from your provider dashboard.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setView('provider-services')}
                      className="mt-4 h-9 border-gold/20 text-xs text-gold hover:border-gold/40 hover:bg-gold/5 hover:text-gold"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                ) : (
                  <NotLoggedInCTA />
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Recently Viewed Section */}
        {recentlyViewedServices.length > 0 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-12 space-y-5"
          >
            <Separator className="bg-gold/10" />
            <div className="flex items-center gap-3">
              <History className="size-5 text-gold/60" />
              <h3 className="font-serif text-xl font-semibold text-white">Recently Viewed</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin">
              {recentlyViewedServices.map((svc) => {
                const imgUrl = getFirstImage(svc);
                return (
                  <motion.div
                    key={svc.id}
                    whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(201, 169, 110, 0.1)' }}
                    className="group/lite w-44 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-gold/10 bg-surface transition-all duration-200 hover:border-gold/25"
                    onClick={() => handleSimilarServiceClick(svc)}
                  >
                    <div className="relative aspect-[3/2] overflow-hidden">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={svc.title}
                          className="size-full object-cover transition-transform duration-400 group-hover/lite:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="size-full bg-gradient-to-br from-gold/15 via-amber-900/20 to-gold-dark/15" />
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="text-xs font-semibold text-white group-hover/lite:text-gold transition-colors line-clamp-1">
                        {svc.title}
                      </h4>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="font-serif text-sm font-bold text-gold">
                          ${svc.price.toLocaleString()}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <Star className="size-2.5 fill-gold text-gold" />
                          <span className="text-[10px] text-muted-foreground">{svc.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Share Dialog */}
        <ServiceShareDialog
          service={service}
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
        />
      </div>
    </div>
  );
}
