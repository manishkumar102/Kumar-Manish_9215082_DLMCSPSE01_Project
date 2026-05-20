'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type Booking } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Wallet,
  Clock,
  DollarSign,
  ArrowDownToLine,
  CheckCircle2,
  Building2,
  Landmark,
  Hash,
  CalendarDays,
  FileText,
  ChevronDown,
} from 'lucide-react';

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

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const PLATFORM_FEE_RATE = 0.15;
const PAYOUT_MINIMUM = 50;

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/* -------------------------------------------------------------------------- */
/*  ProviderPayout component                                                   */
/* -------------------------------------------------------------------------- */

export function ProviderPayout() {
  const { user } = useAppStore();
  const [completedBookings, setCompletedBookings] = useState<Booking[]>([]);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Withdraw dialog state
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  // Transaction history pagination
  const [showAll, setShowAll] = useState(false);
  const DISPLAY_LIMIT = 10;

  /* ---- Fetch bookings ---- */
  const fetchBookings = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const [completedRes, pendingRes] = await Promise.all([
        fetch(`/api/bookings?providerId=${user.id}&status=completed`),
        fetch(`/api/bookings?providerId=${user.id}&status=accepted`),
      ]);

      if (completedRes.ok) {
        const data = await completedRes.json();
        setCompletedBookings(data.bookings ?? []);
      }
      if (pendingRes.ok) {
        const data = await pendingRes.json();
        setPendingBookings(data.bookings ?? []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /* ---- Computed financial stats ---- */
  const financials = useMemo(() => {
    const completedTotal = completedBookings.reduce(
      (sum, b) => sum + b.totalPrice,
      0,
    );
    const availableBalance = completedTotal * (1 - PLATFORM_FEE_RATE);
    const pendingTotal = pendingBookings.reduce(
      (sum, b) => sum + b.totalPrice,
      0 );
    const totalEarnings = availableBalance + pendingTotal;

    return {
      availableBalance: Math.round(availableBalance * 100) / 100,
      pendingTotal: Math.round(pendingTotal * 100) / 100,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      completedTotal,
      canWithdraw: availableBalance >= PAYOUT_MINIMUM,
    };
  }, [completedBookings, pendingBookings]);

  /* ---- Sorted transaction history ---- */
  const transactionHistory = useMemo(
    () =>
      [...completedBookings].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [completedBookings],
  );

  const displayedTransactions = showAll
    ? transactionHistory
    : transactionHistory.slice(0, DISPLAY_LIMIT);

  /* ---- Withdraw handler ---- */
  const handleWithdraw = useCallback(async () => {
    const amount = parseFloat(withdrawAmount);

    if (!amount || amount <= 0) {
      toast.error('Please enter a valid withdrawal amount.');
      return;
    }
    if (amount > financials.availableBalance) {
      toast.error('Amount exceeds your available balance.');
      return;
    }
    if (amount < PAYOUT_MINIMUM) {
      toast.error(`Minimum withdrawal is ${formatCurrency(PAYOUT_MINIMUM)}.`);
      return;
    }
    if (!bankName.trim() || !routingNumber.trim() || !accountNumber.trim()) {
      toast.error('Please fill in all bank account details.');
      return;
    }

    setWithdrawing(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1800));

    setWithdrawing(false);
    setWithdrawDialogOpen(false);
    setWithdrawAmount('');
    setBankName('');
    setRoutingNumber('');
    setAccountNumber('');

    toast.success(
      `Withdrawal of ${formatCurrency(amount)} has been initiated. Funds will arrive in 1-3 business days.`,
    );
  }, [
    withdrawAmount,
    financials.availableBalance,
    bankName,
    routingNumber,
    accountNumber,
  ]);

  /* ---- Quick-fill max amount ---- */
  const handleMaxAmount = useCallback(() => {
    setWithdrawAmount(financials.availableBalance.toFixed(2));
  }, [financials.availableBalance]);

  /* ---- Reset dialog fields on open ---- */
  useEffect(() => {
    if (!withdrawDialogOpen) {
      setWithdrawAmount('');
      setBankName('');
      setRoutingNumber('');
      setAccountNumber('');
    }
  }, [withdrawDialogOpen]);

  /* ---- Guard ---- */
  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">
          Please sign in to view your earnings.
        </p>
      </div>
    );
  }

  /* ---- Skeleton ---- */
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  /* ---- Render ---- */
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="mb-2 flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold">
            Payouts & Earnings
          </span>
          <span className="h-px flex-1 bg-gradient-to-l from-gold/30 to-transparent" />
        </div>
        <h1 className="text-center font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
          <span className="text-gold-gradient">Your Earnings</span>
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Track your revenue, manage withdrawals, and view transaction history.
        </p>
      </motion.div>

      {/* ---- Financial overview cards ---- */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="mb-8 grid gap-4 sm:grid-cols-3"
      >
        {/* Available Balance */}
        <motion.div custom={0} variants={fadeUp}>
          <Card className="luxury-card overflow-hidden border-0 bg-gradient-to-br from-[#1A1A1A] to-[#141414]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Available Balance
                  </p>
                  <p className="mt-2 font-serif text-2xl font-bold text-emerald-400">
                    {formatCurrency(financials.availableBalance)}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    After 15% platform fee
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Wallet className="size-5 text-emerald-400" />
                </div>
              </div>

              {financials.canWithdraw && (
                <Button
                  onClick={() => setWithdrawDialogOpen(true)}
                  className="mt-4 w-full rounded-lg bg-gradient-to-r from-gold-dark via-gold to-gold-light text-sm font-semibold text-black hover:brightness-110"
                >
                  <ArrowDownToLine className="mr-1.5 size-4" />
                  Withdraw Funds
                </Button>
              )}
              {!financials.canWithdraw && completedBookings.length > 0 && (
                <p className="mt-4 rounded-lg bg-surface px-3 py-2 text-center text-xs text-muted-foreground">
                  Minimum {formatCurrency(PAYOUT_MINIMUM)} required to withdraw
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Balance */}
        <motion.div custom={1} variants={fadeUp}>
          <Card className="luxury-card overflow-hidden border-0 bg-gradient-to-br from-[#1A1A1A] to-[#141414]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Pending Balance
                  </p>
                  <p className="mt-2 font-serif text-2xl font-bold text-amber-400">
                    {formatCurrency(financials.pendingTotal)}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {pendingBookings.length} upcoming{' '}
                    {pendingBookings.length === 1 ? 'booking' : 'bookings'}
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                  <Clock className="size-5 text-amber-400" />
                </div>
              </div>

              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width:
                      financials.totalEarnings > 0
                        ? `${(financials.pendingTotal / financials.totalEarnings) * 100}%`
                        : '0%',
                  }}
                  transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-500/60 to-amber-400/80"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Earnings */}
        <motion.div custom={2} variants={fadeUp}>
          <Card className="luxury-card overflow-hidden border-0 bg-gradient-to-br from-[#1A1A1A] to-[#141414]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Total Earnings
                  </p>
                  <p className="mt-2 font-serif text-2xl font-bold text-gold">
                    {formatCurrency(financials.totalEarnings)}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {completedBookings.length} completed{' '}
                    {completedBookings.length === 1 ? 'booking' : 'bookings'}
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-gold/10">
                  <DollarSign className="size-5 text-gold" />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg bg-surface px-3 py-2">
                <span className="text-[11px] text-muted-foreground">
                  Platform fees (15%)
                </span>
                <span className="text-xs font-medium text-red-400">
                  -{formatCurrency(financials.completedTotal * PLATFORM_FEE_RATE)}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ---- Transaction History ---- */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.div custom={3} variants={fadeUp}>
          <Card className="luxury-card overflow-hidden border-0 bg-gradient-to-br from-[#1A1A1A] to-[#141414]">
            <div className="flex flex-col gap-3 border-b border-gold/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold text-white">
                  Transaction History
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Completed bookings that generated earnings
                </p>
              </div>
              {completedBookings.length > 0 && (
                <Badge
                  variant="outline"
                  className="w-fit border-gold/20 bg-gold/5 text-xs text-gold"
                >
                  {completedBookings.length}{' '}
                  {completedBookings.length === 1 ? 'transaction' : 'transactions'}
                </Badge>
              )}
            </div>

            <div className="divide-y divide-border/50">
              <AnimatePresence mode="wait">
                {displayedTransactions.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-5 py-16 text-center"
                  >
                    <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-gold/10">
                      <FileText className="size-7 text-gold/60" />
                    </div>
                    <p className="text-sm font-medium text-white">
                      No completed transactions yet
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Once you complete bookings, your earnings will appear here.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="transactions" {...fadeIn}>
                    {/* Table header */}
                    <div className="hidden px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:grid sm:grid-cols-[1fr_1fr_120px_100px]">
                      <span>Service</span>
                      <span>Date</span>
                      <span className="text-right">Amount</span>
                      <span className="text-right">Status</span>
                    </div>

                    {/* Transaction rows */}
                    {displayedTransactions.map((booking, index) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.03 * index,
                          duration: 0.3,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="grid grid-cols-1 gap-2 px-5 py-3.5 transition-colors hover:bg-surface-hover/50 sm:grid-cols-[1fr_1fr_120px_100px] sm:items-center sm:gap-0"
                      >
                        {/* Service name */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gold/10">
                            <FileText className="size-3.5 text-gold" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">
                              {booking.service?.title ?? 'Service'}
                            </p>
                            <p className="truncate text-xs text-muted-foreground sm:hidden">
                              {formatDate(booking.date)}
                            </p>
                          </div>
                        </div>

                        {/* Date - hidden on mobile */}
                        <span className="hidden text-sm text-muted-foreground sm:block">
                          {formatDate(booking.date)}
                        </span>

                        {/* Amount */}
                        <div className="text-right sm:text-right">
                          <p className="text-sm font-semibold text-emerald-400">
                            +{formatCurrency(booking.totalPrice * (1 - PLATFORM_FEE_RATE))}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Gross: {formatCurrency(booking.totalPrice)}
                          </p>
                        </div>

                        {/* Status */}
                        <div className="flex justify-end sm:justify-end">
                          <Badge className="bg-emerald-500/15 text-[11px] text-emerald-400 border-emerald-500/25">
                            <CheckCircle2 className="mr-1 size-3" />
                            Paid
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Show more / less toggle */}
            {transactionHistory.length > DISPLAY_LIMIT && (
              <div className="border-t border-gold/10 px-5 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAll((prev) => !prev)}
                  className="mx-auto flex w-full items-center justify-center gap-1.5 text-xs text-gold hover:bg-gold/5 hover:text-gold-light"
                >
                  {showAll ? 'Show Less' : `Show All ${transactionHistory.length} Transactions`}
                  <ChevronDown
                    className={`size-3.5 transition-transform duration-300 ${
                      showAll ? 'rotate-180' : ''
                    }`}
                  />
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>

      {/* ---- Withdraw Dialog ---- */}
      <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
        <DialogContent className="bg-card border-gold/15 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg text-white">
              Withdraw Funds
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Transfer your earnings to your bank account. Available balance:{' '}
              <span className="font-semibold text-emerald-400">
                {formatCurrency(financials.availableBalance)}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Amount */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Withdrawal Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  min={PAYOUT_MINIMUM}
                  max={financials.availableBalance}
                  step="0.01"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="h-11 border-gold/15 bg-surface pl-9 text-white placeholder:text-muted-foreground/40 focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleMaxAmount}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2 text-[11px] font-medium text-gold hover:bg-gold/10 hover:text-gold-light"
                >
                  MAX
                </Button>
              </div>
              {parseFloat(withdrawAmount) > 0 && (
                <p className="text-xs text-muted-foreground">
                  You&apos;ll receive{' '}
                  <span className="font-medium text-emerald-400">
                    {formatCurrency(parseFloat(withdrawAmount))}
                  </span>{' '}
                  (net — platform fee already deducted)
                </p>
              )}
            </div>

            {/* Bank info section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Landmark className="size-4 text-gold/70" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Bank Account Details
                </span>
              </div>

              <div className="space-y-3 rounded-lg border border-gold/10 bg-surface/50 p-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Bank Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      type="text"
                      placeholder="e.g. Chase, Wells Fargo"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="h-10 border-gold/15 bg-background pl-9 text-sm text-white placeholder:text-muted-foreground/40 focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Routing Number
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      type="text"
                      placeholder="9-digit routing number"
                      maxLength={9}
                      value={routingNumber}
                      onChange={(e) =>
                        setRoutingNumber(e.target.value.replace(/\D/g, '').slice(0, 9))
                      }
                      className="h-10 border-gold/15 bg-background pl-9 text-sm text-white placeholder:text-muted-foreground/40 focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Account Number
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      type="text"
                      placeholder="Account number"
                      maxLength={17}
                      value={accountNumber}
                      onChange={(e) =>
                        setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 17))
                      }
                      className="h-10 border-gold/15 bg-background pl-9 text-sm text-white placeholder:text-muted-foreground/40 focus:border-gold/40 focus:ring-1 focus:ring-gold/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="border-gold/20 text-sm text-muted-foreground hover:text-white"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleWithdraw}
              disabled={withdrawing || !withdrawAmount || !bankName || !routingNumber || !accountNumber}
              className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-sm font-semibold text-black hover:brightness-110"
            >
              {withdrawing ? (
                <>
                  <span className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-1.5 size-4" />
                  Confirm Withdrawal
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
