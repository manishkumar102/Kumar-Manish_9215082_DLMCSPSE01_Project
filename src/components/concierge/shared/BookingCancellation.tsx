'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Booking } from '@/store/useAppStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  CalendarCheck,
  Clock,
  DollarSign,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Info,
  ChevronRight,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

interface BookingCancellationProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onCancelled?: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const CANCEL_REASONS = [
  { value: 'change_of_plans', label: 'Change of plans' },
  { value: 'found_alternative', label: 'Found alternative' },
  { value: 'schedule_conflict', label: 'Schedule conflict' },
  { value: 'personal_emergency', label: 'Personal emergency' },
  { value: 'other', label: 'Other' },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

type RefundTier = 'full' | 'half' | 'none';

function getRefundTier(dateStr: string, timeStr: string): RefundTier {
  try {
    const bookingDate = new Date(`${dateStr}T${timeStr}:00`);
    const now = new Date();
    const diffMs = bookingDate.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours > 48) return 'full';
    if (diffHours >= 24) return 'half';
    return 'none';
  } catch {
    return 'full';
  }
}

function computeRefundAmount(price: number, tier: RefundTier): number {
  if (tier === 'full') return price;
  if (tier === 'half') return Math.round(price * 0.5 * 100) / 100;
  return 0;
}

const REFUND_TIER_CONFIG: Record<
  RefundTier,
  { label: string; percent: string; color: string; iconColor: string; description: string }
> = {
  full: {
    label: 'Full Refund',
    percent: '100%',
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    iconColor: 'text-emerald-400',
    description: 'More than 48 hours before your booking — you qualify for a full refund.',
  },
  half: {
    label: 'Partial Refund',
    percent: '50%',
    color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    iconColor: 'text-yellow-400',
    description: 'Between 24–48 hours before your booking — a partial refund will be issued.',
  },
  none: {
    label: 'No Refund',
    percent: '0%',
    color: 'bg-red-500/15 text-red-400 border-red-500/30',
    iconColor: 'text-red-400',
    description: 'Less than 24 hours before your booking — unfortunately no refund is available.',
  },
};

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                         */
/* -------------------------------------------------------------------------- */

const fadeSlideIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.85 },
  animate: { opacity: 1, scale: 1, transition: { delay: 0.15, type: 'spring', stiffness: 200, damping: 18 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

/* -------------------------------------------------------------------------- */
/*  Success screen                                                             */
/* -------------------------------------------------------------------------- */

function CancellationSuccess({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2800);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-10 px-4"
      {...scaleIn}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
        className="mb-5 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-red-600/10 ring-2 ring-red-500/30"
      >
        <CheckCircle2 className="size-10 text-red-400" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="font-serif text-xl font-bold text-white"
      >
        Booking Cancelled
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-2 max-w-xs text-center text-sm text-muted-foreground"
      >
        Your cancellation has been processed. A confirmation has been sent to your email.
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-5"
      >
        <span className="inline-block size-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main BookingCancellation component                                         */
/* -------------------------------------------------------------------------- */

export function BookingCancellation({
  booking,
  open,
  onClose,
  onCancelled,
}: BookingCancellationProps) {
  const [step, setStep] = useState<'details' | 'confirm' | 'success'>('details');
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Reset state when dialog closes or booking changes
  useEffect(() => {
    if (!open) {
      setStep('details');
      setReason('');
      setComments('');
      setConfirmed(false);
      setCancelling(false);
    }
  }, [open]);

  // Derived refund info
  const refundTier = useMemo(
    () => (booking ? getRefundTier(booking.date, booking.time) : 'full'),
    [booking],
  );

  const refundConfig = REFUND_TIER_CONFIG[refundTier];
  const refundAmount = useMemo(
    () => (booking ? computeRefundAmount(booking.totalPrice, refundTier) : 0),
    [booking, refundTier],
  );

  /* ---- Handlers ---- */
  const handleProceed = useCallback(() => {
    setStep('confirm');
  }, []);

  const handleBack = useCallback(() => {
    setStep('details');
    setConfirmed(false);
  }, []);

  const handleConfirmCancel = useCallback(async () => {
    if (!booking) return;
    setCancelling(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: booking.id, status: 'cancelled' }),
      });

      if (res.ok) {
        setStep('success');
        toast.success('Booking cancelled successfully.');
        onCancelled?.();
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? 'Failed to cancel booking. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setCancelling(false);
    }
  }, [booking, onCancelled]);

  const handleSuccessDone = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!booking) return null;

  const canProceed = reason.trim().length > 0;

  /* ---- Step 1: Details (reason + comments) ---- */
  const renderDetailsStep = () => (
    <motion.div key="details" {...fadeSlideIn} className="space-y-5">
      {/* Booking summary card */}
      <div className="luxury-card rounded-xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="font-serif text-base font-semibold text-white truncate">
              {booking.service?.title ?? 'Service'}
            </h4>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarCheck className="size-3.5 shrink-0 text-gold/70" />
                <span className="text-white">{formatDate(booking.date)}</span>
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-3.5 shrink-0 text-gold/70" />
                <span className="text-white">{formatTime(booking.time)}</span>
              </span>
            </div>
            {booking.service?.location && (
              <p className="mt-1 text-xs text-muted-foreground">{booking.service.location}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="font-serif text-xl font-bold text-gold">
              ${booking.totalPrice.toLocaleString()}
            </p>
            <Badge
              variant="outline"
              className={`mt-1.5 border text-[10px] backdrop-blur-sm ${refundConfig.color}`}
            >
              {refundConfig.label}
            </Badge>
          </div>
        </div>
        <div className="gold-separator" />
        <div className="flex items-start gap-2.5 rounded-lg border border-gold/10 bg-surface/50 p-3">
          <ShieldCheck className={`mt-0.5 size-4 shrink-0 ${refundConfig.iconColor}`} />
          <div className="text-xs leading-relaxed text-muted-foreground">
            {refundConfig.description}
            {refundTier === 'full' && (
              <span className="mt-1 block font-medium text-emerald-400">
                Refund amount: ${refundAmount.toLocaleString()}
              </span>
            )}
            {refundTier === 'half' && (
              <span className="mt-1 block font-medium text-yellow-400">
                Refund amount: ${refundAmount.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Reason select */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-gold">
          Cancellation Reason
        </Label>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger className="w-full border-gold/15 bg-surface text-sm text-white focus:border-gold/40 focus:ring-gold/20">
            <SelectValue placeholder="Select a reason..." />
          </SelectTrigger>
          <SelectContent className="border-gold/15 bg-[#1A1A1A]">
            {CANCEL_REASONS.map((r) => (
              <SelectItem key={r.value} value={r.value} className="text-sm text-white focus:bg-gold/10 focus:text-gold">
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Comments textarea */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-gold">
          Additional Comments{' '}
          <span className="text-muted-foreground/60 normal-case font-normal">(optional)</span>
        </Label>
        <Textarea
          value={comments}
          onChange={(e) => setComments(e.target.value.slice(0, 500))}
          placeholder="Help us improve by sharing more details..."
          rows={3}
          className="w-full resize-none border-gold/15 bg-surface px-4 py-3 text-sm text-white placeholder:text-muted-foreground/50 focus-visible:border-gold/40 focus-visible:ring-gold/20"
        />
        <p className="text-right text-[11px] text-muted-foreground/60">{comments.length}/500</p>
      </div>

      {/* Actions */}
      <DialogFooter className="gap-2 pt-1">
        <Button
          variant="outline"
          onClick={onClose}
          className="border-gold/20 text-muted-foreground text-sm hover:text-white"
        >
          Keep Booking
        </Button>
        <Button
          onClick={handleProceed}
          disabled={!canProceed}
          className="bg-red-600 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
          <ChevronRight className="ml-1 size-4" />
        </Button>
      </DialogFooter>
    </motion.div>
  );

  /* ---- Step 2: Confirm ---- */
  const renderConfirmStep = () => (
    <motion.div key="confirm" {...fadeSlideIn} className="space-y-5">
      {/* Warning banner */}
      <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-400" />
        <div className="space-y-1.5">
          <h4 className="text-sm font-semibold text-red-400">This action cannot be undone</h4>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Once cancelled, you will not be able to restore this booking. A new booking will need
            to be created if you change your mind.
          </p>
        </div>
      </div>

      {/* Refund summary */}
      <div className="luxury-card rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Service</span>
          <span className="text-sm text-white truncate ml-4">{booking.service?.title ?? 'Service'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Date &amp; Time</span>
          <span className="text-sm text-white">
            {formatDate(booking.date)} at {formatTime(booking.time)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Original Price</span>
          <span className="text-sm font-medium text-foreground">
            ${booking.totalPrice.toLocaleString()}
          </span>
        </div>
        <div className="gold-separator" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Refund Amount</span>
          <span className="font-serif text-lg font-bold text-gold">
            ${refundAmount.toLocaleString()}
          </span>
        </div>
        <Badge
          variant="outline"
          className={`w-fit border text-[11px] ${refundConfig.color}`}
        >
          {refundConfig.label} ({refundConfig.percent})
        </Badge>
      </div>

      {/* Reason summary */}
      <div className="flex items-start gap-3 rounded-lg border border-gold/10 bg-surface/50 p-3 text-sm">
        <Info className="mt-0.5 size-4 shrink-0 text-gold/70" />
        <div>
          <span className="font-medium text-white">
            Reason:{' '}
            {CANCEL_REASONS.find((r) => r.value === reason)?.label ?? 'N/A'}
          </span>
          {comments.trim() && (
            <p className="mt-1 text-xs text-muted-foreground">&ldquo;{comments.trim()}&rdquo;</p>
          )}
        </div>
      </div>

      {/* Confirmation checkbox */}
      <div className="space-y-2">
        <div className="flex items-start gap-3 rounded-lg border border-gold/10 bg-surface/30 p-3">
          <Checkbox
            id="confirm-cancel"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked === true)}
            className="mt-0.5 border-gold/30 data-[state=checked]:bg-gold data-[state=checked]:border-gold data-[state=checked]:text-black"
          />
          <Label
            htmlFor="confirm-cancel"
            className="text-sm leading-relaxed text-muted-foreground cursor-pointer select-none"
          >
            I understand this action cannot be undone and I agree to the{' '}
            <span className="font-semibold text-white">{refundConfig.label}</span> policy.
          </Label>
        </div>
      </div>

      {/* Actions */}
      <DialogFooter className="gap-2 pt-1">
        <Button
          variant="outline"
          onClick={handleBack}
          className="border-gold/20 text-muted-foreground text-sm hover:text-white"
        >
          <RotateCcw className="mr-1.5 size-3.5" />
          Back
        </Button>
        <Button
          onClick={handleConfirmCancel}
          disabled={!confirmed || cancelling}
          className="bg-red-600 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {cancelling ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Cancelling...
            </span>
          ) : (
            <>
              <CheckCircle2 className="mr-1.5 size-4" />
              Confirm Cancellation
            </>
          )}
        </Button>
      </DialogFooter>
    </motion.div>
  );

  /* ---- Step 3: Success ---- */
  const renderSuccessStep = () => (
    <CancellationSuccess onDone={handleSuccessDone} />
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="border-gold/20 bg-[#111] p-0 sm:max-w-lg overflow-hidden">
        <AnimatePresence mode="wait">
          {step !== 'success' ? (
            <motion.div
              key="form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="border-b border-gold/12 bg-gradient-to-r from-red-500/5 to-transparent px-6 py-5">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 font-serif text-xl text-white">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-red-500/10">
                      <AlertTriangle className="size-5 text-red-400" />
                    </div>
                    Cancel Booking
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-sm text-muted-foreground">
                    Review the details and refund policy before cancelling your reservation.
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Step indicator */}
              <div className="px-6 pt-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      step === 'details'
                        ? 'bg-gold text-black'
                        : 'bg-gold/15 text-gold'
                    }`}
                  >
                    1
                  </div>
                  <div className={`h-0.5 flex-1 rounded-full transition-colors ${step === 'confirm' ? 'bg-gold/40' : 'bg-gold/15'}`} />
                  <div
                    className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      step === 'confirm'
                        ? 'bg-red-500 text-white'
                        : 'bg-gold/15 text-gold'
                    }`}
                  >
                    2
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span className={step === 'details' ? 'text-gold font-semibold' : ''}>Details</span>
                  <span className={step === 'confirm' ? 'text-red-400 font-semibold' : ''}>Confirm</span>
                </div>
              </div>

              {/* Form content */}
              <div className="px-6 py-4">
                <AnimatePresence mode="wait">
                  {step === 'details' && renderDetailsStep()}
                  {step === 'confirm' && renderConfirmStep()}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div key="success" {...fadeSlideIn}>
              {renderSuccessStep()}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
