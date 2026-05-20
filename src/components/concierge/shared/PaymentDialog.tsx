'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  CreditCard,
  Lock,
  CheckCircle2,
  Loader2,
  Wallet,
  Building2,
  ShieldCheck,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Payment methods                                                            */
/* -------------------------------------------------------------------------- */

type PaymentMethod = 'card' | 'bank_transfer' | 'wallet';

const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  icon: typeof CreditCard;
  description: string;
}[] = [
  {
    id: 'card',
    label: 'Credit Card',
    icon: CreditCard,
    description: 'Visa, Mastercard, Amex',
  },
  {
    id: 'bank_transfer',
    label: 'Bank Transfer',
    icon: Building2,
    description: 'Direct wire transfer',
  },
  {
    id: 'wallet',
    label: 'Digital Wallet',
    icon: Wallet,
    description: 'Apple Pay, Google Pay',
  },
];

/* -------------------------------------------------------------------------- */
/*  Success animation component                                                */
/* -------------------------------------------------------------------------- */

function PaymentSuccess({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 2500);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex flex-col items-center justify-center py-12"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
        className="mb-6 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 ring-2 ring-emerald-500/30"
      >
        <CheckCircle2 className="size-10 text-emerald-400" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="font-serif text-xl font-bold text-white"
      >
        Payment Successful!
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-2 text-sm text-muted-foreground"
      >
        Your luxury experience is confirmed
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-4"
      >
        <span className="inline-block size-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main PaymentDialog                                                         */
/* -------------------------------------------------------------------------- */

export function PaymentDialog() {
  const {
    paymentDialogOpen,
    setPaymentDialogOpen,
    pendingPaymentBooking,
    setPendingPaymentBooking,
    user,
    setSelectedBooking,
    setView,
    resetBookingForm,
  } = useAppStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!paymentDialogOpen) {
      setPaymentMethod('card');
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
      setPaymentSuccess(false);
      setProcessing(false);
    }
  }, [paymentDialogOpen]);

  // Format card number with spaces
  const formatCardNumber = useCallback((value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  }, []);

  // Format expiry MM/YY
  const formatExpiry = useCallback((value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  }, []);

  const handleCardNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCardNumber(formatCardNumber(e.target.value));
    },
    [formatCardNumber]
  );

  const handleExpiryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCardExpiry(formatExpiry(e.target.value));
    },
    [formatExpiry]
  );

  const handleCvcChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4));
  }, []);

  const handleSuccess = useCallback(() => {
    setPaymentDialogOpen(false);
    setPendingPaymentBooking(null);
    resetBookingForm();
    setView('booking-detail');
  }, [setPaymentDialogOpen, setPendingPaymentBooking, resetBookingForm, setView]);

  const handlePayNow = useCallback(async () => {
    if (!user || !pendingPaymentBooking) return;

    // Validate card fields for card payment
    if (paymentMethod === 'card') {
      const cleanCardNumber = cardNumber.replace(/\s/g, '');
      if (cleanCardNumber.length < 16) {
        toast.error('Please enter a valid card number');
        return;
      }
      if (cardExpiry.length < 5) {
        toast.error('Please enter a valid expiry date');
        return;
      }
      if (cardCvc.length < 3) {
        toast.error('Please enter a valid CVC');
        return;
      }
    }

    setProcessing(true);

    try {
      // First, create the booking
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: user.id,
          serviceId: pendingPaymentBooking.serviceId,
          providerId: pendingPaymentBooking.providerId,
          date: pendingPaymentBooking.date,
          time: pendingPaymentBooking.time,
          guests: pendingPaymentBooking.guests,
          specialReq: pendingPaymentBooking.specialReq || undefined,
          totalPrice: pendingPaymentBooking.totalPrice,
        }),
      });

      if (!bookingRes.ok) {
        const data = await bookingRes.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create booking');
      }

      const bookingData = await bookingRes.json();
      const booking = bookingData.booking;

      // Simulate processing delay for mock payment
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Process payment
      const platformFee = Math.round(pendingPaymentBooking.totalPrice * 0.15 * 100) / 100;
      const totalWithFee = pendingPaymentBooking.totalPrice + platformFee;

      const paymentRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          clientId: user.id,
          amount: totalWithFee,
          method: paymentMethod,
          cardLast4: paymentMethod === 'card' ? cardNumber.replace(/\s/g, '').slice(-4) : undefined,
        }),
      });

      if (!paymentRes.ok) {
        const data = await paymentRes.json().catch(() => ({}));
        throw new Error(data.error || 'Payment processing failed');
      }

      // Show success animation
      setPaymentSuccess(true);

      // Set the booking data with accepted status
      setSelectedBooking({ ...booking, status: 'accepted' });
      toast.success('Payment confirmed! Your luxury experience awaits.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  }, [
    user,
    pendingPaymentBooking,
    paymentMethod,
    cardNumber,
    cardExpiry,
    cardCvc,
    setSelectedBooking,
    setView,
  ]);

  const subtotal = pendingPaymentBooking?.totalPrice ?? 0;
  const platformFee = Math.round(subtotal * 0.15 * 100) / 100;
  const total = subtotal + platformFee;

  const isFormValid =
    pendingPaymentBooking &&
    (paymentMethod !== 'card' ||
      (cardNumber.replace(/\s/g, '').length >= 16 &&
        cardExpiry.length >= 5 &&
        cardCvc.length >= 3));

  return (
    <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
      <DialogContent className="border-gold/20 bg-[#111] p-0 sm:max-w-lg overflow-hidden">
        <AnimatePresence mode="wait">
          {paymentSuccess ? (
            <PaymentSuccess onDone={handleSuccess} />
          ) : (
            <motion.div
              key="payment-form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="border-b border-gold/12 bg-gradient-to-r from-gold/5 to-transparent px-6 py-5">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 font-serif text-xl text-white">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gold/10">
                      <Lock className="size-5 text-gold" />
                    </div>
                    Secure Payment
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-sm text-muted-foreground">
                    Complete your payment to confirm the booking
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Payment Method Selector */}
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gold">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PAYMENT_METHODS.map((method) => {
                      const MethodIcon = method.icon;
                      const isSelected = paymentMethod === method.id;
                      return (
                        <motion.button
                          key={method.id}
                          type="button"
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setPaymentMethod(method.id)}
                          className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all duration-200 ${
                            isSelected
                              ? 'border-gold bg-gold/10 text-gold ring-1 ring-gold/30'
                              : 'border-gold/10 bg-surface text-muted-foreground hover:border-gold/25 hover:text-white'
                          }`}
                        >
                          <MethodIcon className="size-5" />
                          <span className="text-[11px] font-medium leading-tight text-center">
                            {method.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Card Fields — only for card method */}
                {paymentMethod === 'card' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    {/* Card Number */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
                        <CreditCard className="size-3.5" />
                        Card Number
                      </label>
                      <div className="relative">
                        <Input
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="XXXX XXXX XXXX XXXX"
                          maxLength={19}
                          className="h-11 border-gold/15 bg-surface pl-4 pr-14 text-sm tracking-wider text-white placeholder:text-muted-foreground/50 focus-visible:border-gold/40 focus-visible:ring-gold/20"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <Badge variant="outline" className="h-5 border-gold/20 px-1.5 text-[9px] text-gold/60">
                            VISA
                          </Badge>
                          <Badge variant="outline" className="h-5 border-gold/20 px-1.5 text-[9px] text-gold/60">
                            MC
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Expiry + CVC Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gold">
                          Expiry
                        </label>
                        <Input
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="h-11 border-gold/15 bg-surface px-4 text-sm tracking-wider text-white placeholder:text-muted-foreground/50 focus-visible:border-gold/40 focus-visible:ring-gold/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-gold">
                          CVC
                        </label>
                        <div className="relative">
                          <Input
                            value={cardCvc}
                            onChange={handleCvcChange}
                            placeholder="123"
                            type="password"
                            maxLength={4}
                            className="h-11 border-gold/15 bg-surface px-4 pr-10 text-sm text-white placeholder:text-muted-foreground/50 focus-visible:border-gold/40 focus-visible:ring-gold/20"
                          />
                          <Lock className="absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/40" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Bank Transfer Info */}
                {paymentMethod === 'bank_transfer' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl border border-gold/15 bg-surface p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Building2 className="mt-0.5 size-5 shrink-0 text-gold" />
                      <div className="space-y-1 text-sm">
                        <p className="font-medium text-white">Bank Transfer Details</p>
                        <p className="text-muted-foreground">
                          Bank: ConciergeX International
                        </p>
                        <p className="text-muted-foreground">
                          Account: CH93-0076-2011-6238-5295-7
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                          Funds will be verified within 24 hours
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Wallet Info */}
                {paymentMethod === 'wallet' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-xl border border-gold/15 bg-surface p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Wallet className="mt-0.5 size-5 shrink-0 text-gold" />
                      <div className="space-y-1 text-sm">
                        <p className="font-medium text-white">Digital Wallet</p>
                        <p className="text-muted-foreground">
                          Apple Pay, Google Pay, or Samsung Pay will be used.
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                          A popup will appear to confirm the payment
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <Separator className="bg-gold/10" />

                {/* Order Summary */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gold">
                    Order Summary
                  </label>
                  <div className="rounded-xl border border-gold/15 bg-surface p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service</span>
                      <span className="font-medium text-white">
                        {pendingPaymentBooking?.serviceTitle ?? '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium text-white">
                        {pendingPaymentBooking?.date ?? '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-medium text-white">
                        {pendingPaymentBooking?.time ?? '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Guests</span>
                      <span className="font-medium text-white">
                        {pendingPaymentBooking?.guests ?? 1}
                      </span>
                    </div>
                    <Separator className="bg-gold/8" />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium text-foreground">
                        ${subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform Fee (15%)</span>
                      <span className="font-medium text-foreground">
                        ${platformFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <Separator className="bg-gold/8" />
                    <div className="flex justify-between pt-1">
                      <span className="font-semibold text-white">Total</span>
                      <span className="font-serif text-xl font-bold text-gold">
                        ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security badge */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
                  <ShieldCheck className="size-3.5" />
                  <span>Secured with 256-bit SSL encryption</span>
                </div>

                {/* Pay Now Button */}
                <Button
                  onClick={handlePayNow}
                  disabled={processing || !isFormValid}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-sm font-semibold text-black shadow-lg shadow-gold/20 transition-all hover:shadow-gold/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
                >
                  {processing ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Processing Payment...
                    </span>
                  ) : (
                    <>
                      <Lock className="mr-2 size-4" />
                      Pay ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
