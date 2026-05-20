'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Booking } from '@/store/useAppStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Diamond,
  Download,
  CalendarCheck,
  Clock,
  Users,
  CreditCard,
  Building2,
  Mail,
  Loader2,
  X,
  FileText,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface ReceiptData {
  receiptNumber: string;
  issueDate: string;
  bookingDate: string;
  bookingTime: string;
  createdAt: string;
  service: {
    title: string;
    category: string;
    duration: string;
  };
  guests: number;
  client: {
    name: string;
    email: string;
  };
  provider: {
    name: string;
    businessName: string | null;
  };
  pricing: {
    subtotal: number;
    platformFee: number;
    platformFeeRate: number;
    total: number;
    currency: string;
  };
  payment: {
    method: string;
    cardLast4: string | null;
    transactionId: string | null;
    status: string;
    amount: number;
  };
}

interface BookingReceiptProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

function formatCurrency(amount: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                         */
/* -------------------------------------------------------------------------- */

const fadeSlideIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

/* -------------------------------------------------------------------------- */
/*  Receipt Skeleton                                                           */
/* -------------------------------------------------------------------------- */

function ReceiptSkeleton() {
  return (
    <div className="space-y-5 p-2">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 py-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-52" />
        <Skeleton className="h-3 w-36" />
      </div>
      <div className="gold-separator" />
      {/* Service details */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="gold-separator" />
      {/* Price breakdown */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
      <div className="gold-separator" />
      {/* Payment info */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Print-Only Styles (injected once)                                          */
/* -------------------------------------------------------------------------- */

function PrintStyles() {
  return (
    <style jsx global>{`
      @media print {
        body * {
          visibility: hidden;
        }
        .receipt-print-area,
        .receipt-print-area * {
          visibility: visible;
        }
        .receipt-print-area {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: #ffffff !important;
          color: #1a1a1a !important;
          padding: 2rem !important;
        }
        .receipt-print-area .print-hide {
          display: none !important;
        }
        .receipt-print-area .text-gold-gradient {
          background: linear-gradient(135deg, #C9A96E, #E8D5A3, #C9A96E) !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          background-clip: text !important;
        }
        .receipt-print-area .gold-separator {
          border-top: 1px solid #C9A96E !important;
        }
        .receipt-print-area .luxury-card {
          border: 1px solid #e5e5e5 !important;
          background: #f9f9f9 !important;
        }
        .receipt-print-area .text-white,
        .receipt-print-area .text-foreground {
          color: #1a1a1a !important;
        }
        .receipt-print-area .text-muted-foreground {
          color: #666666 !important;
        }
        .receipt-print-area .text-gold {
          color: #A08040 !important;
        }
        .receipt-print-area .bg-gold\\/10 {
          background-color: rgba(201, 169, 110, 0.1) !important;
        }
        .receipt-print-area .border-gold\\/15 {
          border-color: rgba(201, 169, 110, 0.3) !important;
        }
        .receipt-print-area .border-gold\\/30 {
          border-color: rgba(201, 169, 110, 0.4) !important;
        }
        .receipt-print-area .font-serif {
          font-family: Georgia, 'Times New Roman', serif !important;
        }
      }
    `}</style>
  );
}

/* -------------------------------------------------------------------------- */
/*  Receipt Content (also used for print)                                      */
/* -------------------------------------------------------------------------- */

function ReceiptContent({ receipt }: { receipt: ReceiptData }) {
  return (
    <div className="receipt-print-area space-y-0">
      {/* Branding Header */}
      <div className="flex flex-col items-center gap-2 py-6">
        <div className="flex items-center gap-2">
          <Diamond className="size-5 text-gold" />
          <h2 className="font-serif text-2xl font-bold tracking-wider text-gold-gradient">
            CONCIERGEX
          </h2>
          <Diamond className="size-5 text-gold" />
        </div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Luxury Services Marketplace
        </p>
      </div>

      <div className="gold-separator" />

      {/* Receipt Number & Date */}
      <div className="flex flex-col items-center gap-1 py-4">
        <p className="text-xs text-muted-foreground">
          Receipt #{receipt.receiptNumber}
        </p>
        <p className="text-[11px] text-muted-foreground">
          Issued {new Date(receipt.issueDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>

      <div className="gold-separator" />

      {/* Service Details */}
      <div className="space-y-3 py-5">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gold">
          Service Details
        </h3>
        <h4 className="font-serif text-xl font-bold text-white">
          {receipt.service.title}
        </h4>
        <div className="grid gap-2.5 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="flex size-7 items-center justify-center rounded-md bg-gold/10">
              <FileText className="size-3.5 text-gold" />
            </span>
            <span className="text-muted-foreground">Category:</span>
            <span className="font-medium text-foreground">{receipt.service.category}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex size-7 items-center justify-center rounded-md bg-gold/10">
              <CalendarCheck className="size-3.5 text-gold" />
            </span>
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium text-foreground">{formatDate(receipt.bookingDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex size-7 items-center justify-center rounded-md bg-gold/10">
              <Clock className="size-3.5 text-gold" />
            </span>
            <span className="text-muted-foreground">Time:</span>
            <span className="font-medium text-foreground">{formatTime(receipt.bookingTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex size-7 items-center justify-center rounded-md bg-gold/10">
              <Users className="size-3.5 text-gold" />
            </span>
            <span className="text-muted-foreground">Guests:</span>
            <span className="font-medium text-foreground">
              {receipt.guests} {receipt.guests === 1 ? 'guest' : 'guests'}
            </span>
          </div>
        </div>
      </div>

      <div className="gold-separator" />

      {/* Price Breakdown */}
      <div className="space-y-3 py-5">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gold">
          Price Breakdown
        </h3>
        <div className="luxury-card overflow-hidden rounded-lg border border-gold/15">
          <div className="space-y-0">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-sm font-medium text-foreground">
                ${formatCurrency(receipt.pricing.subtotal)}
              </span>
            </div>
            <Separator className="bg-gold/8" />
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">
                Platform Fee ({(receipt.pricing.platformFeeRate * 100).toFixed(0)}%)
              </span>
              <span className="text-sm font-medium text-foreground">
                ${formatCurrency(receipt.pricing.platformFee)}
              </span>
            </div>
            <div className="bg-gradient-to-r from-gold/8 via-gold/5 to-gold/8">
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="text-sm font-semibold text-white">Total</span>
                <span className="font-serif text-lg font-bold text-gold">
                  ${formatCurrency(receipt.pricing.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="gold-separator" />

      {/* Payment Method */}
      <div className="space-y-3 py-5">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gold">
          Payment Method
        </h3>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gold/10">
            <CreditCard className="size-4 text-gold" />
          </span>
          <div>
            <p className="font-medium text-foreground">
              {receipt.payment.method === 'card'
                ? `Card ending in •••• ${receipt.payment.cardLast4 ?? '0000'}`
                : receipt.payment.method === 'bank_transfer'
                  ? 'Bank Transfer'
                  : 'Digital Wallet'}
            </p>
            <p className="text-xs text-muted-foreground">
              Status:{' '}
              <span className={receipt.payment.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}>
                {receipt.payment.status === 'completed' ? 'Paid' : receipt.payment.status}
              </span>
            </p>
          </div>
        </div>
        {receipt.payment.transactionId && (
          <p className="text-xs text-muted-foreground">
            Transaction ID:{' '}
            <span className="font-mono">{receipt.payment.transactionId}</span>
          </p>
        )}
      </div>

      <div className="gold-separator" />

      {/* Provider & Client Info */}
      <div className="grid gap-5 py-5 sm:grid-cols-2">
        {/* Provider */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gold">
            Service Provider
          </h3>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-full bg-gold/10 text-sm font-bold text-gold">
              {receipt.provider.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {receipt.provider.name}
              </p>
              {receipt.provider.businessName && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="size-3" />
                  {receipt.provider.businessName}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Client */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gold">
            Client
          </h3>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-full bg-gold/10 text-sm font-bold text-gold">
              {receipt.client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {receipt.client.name}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="size-3" />
                {receipt.client.email}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="gold-separator" />

      {/* Footer */}
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <p className="font-serif text-sm text-gold">
          Thank you for choosing ConciergeX
        </p>
        <p className="text-[11px] text-muted-foreground">
          For support, contact{' '}
          <span className="text-gold">support@conciergex.com</span>
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground/60">
          This receipt was generated automatically and is valid without a signature.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main BookingReceipt                                                        */
/* -------------------------------------------------------------------------- */

export function BookingReceipt({ booking, open, onClose }: BookingReceiptProps) {
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch receipt data when dialog opens
  useEffect(() => {
    if (!open || !booking) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setReceipt(null);

    async function fetchReceipt() {
      try {
        const res = await fetch(`/api/receipt?bookingId=${booking.id}`);
        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          setReceipt(data.receipt);
        } else {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? 'Failed to load receipt.');
        }
      } catch {
        if (!cancelled) {
          setError('Network error. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchReceipt();
    return () => {
      cancelled = true;
    };
  }, [open, booking]);

  // Handle print
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <>
      <PrintStyles />
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="border-gold/20 bg-[#0E0E0E] sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 font-serif text-xl text-white">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gold/10">
                <FileText className="size-5 text-gold" />
              </div>
              Booking Receipt
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Your receipt for this completed booking.
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" {...fadeSlideIn}>
                <ReceiptSkeleton />
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3 py-10 text-center"
              >
                <div className="flex size-14 items-center justify-center rounded-full bg-red-500/10">
                  <X className="size-6 text-red-400" />
                </div>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="border-gold/20 text-muted-foreground hover:text-white"
                >
                  Close
                </Button>
              </motion.div>
            ) : receipt ? (
              <motion.div key="receipt" {...fadeSlideIn}>
                <ReceiptContent receipt={receipt} />
              </motion.div>
            ) : null}
          </AnimatePresence>

          <DialogFooter className="gap-2 print-hide pt-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="border-gold/20 text-muted-foreground text-sm hover:text-white"
              >
                Close
              </Button>
            </DialogClose>
            <Button
              onClick={handlePrint}
              disabled={loading || !receipt}
              className="gap-2 rounded-lg bg-gradient-to-r from-gold-dark via-gold to-gold-light text-sm font-semibold text-black hover:brightness-110"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
