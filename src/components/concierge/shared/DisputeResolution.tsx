'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Booking } from '@/store/useAppStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  Upload,
  FileText,
  Loader2,
  Send,
  X,
  ShieldAlert,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const DISPUTE_REASONS = [
  { value: 'not_as_described', label: 'Service not as described' },
  { value: 'last_minute_cancel', label: 'Provider cancelled last minute' },
  { value: 'quality_issues', label: 'Quality issues' },
  { value: 'safety_concerns', label: 'Safety concerns' },
  { value: 'other', label: 'Other' },
];

const RESOLUTION_OPTIONS = [
  { value: 'full_refund', label: 'Full refund' },
  { value: 'partial_refund', label: 'Partial refund' },
  { value: 'reschedule', label: 'Reschedule' },
  { value: 'other', label: 'Other' },
];

/* -------------------------------------------------------------------------- */
/*  DisputeDialog                                                              */
/* -------------------------------------------------------------------------- */

interface DisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
}

export function DisputeDialog({ open, onOpenChange, booking }: DisputeDialogProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [resolution, setResolution] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [mockFiles, setMockFiles] = useState<string[]>([]);

  /* ---- Reset form when dialog opens/closes ---- */
  useEffect(() => {
    if (!open) {
      setReason('');
      setDescription('');
      setResolution('');
      setSubmitted(false);
      setSubmitting(false);
      setDragOver(false);
      setMockFiles([]);
    }
  }, [open]);

  /* ---- Mock file drop ---- */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    // Mock — just show the filenames
    const files = Array.from(e.dataTransfer.files);
    const names = files.map((f) => f.name);
    setMockFiles((prev) => [...prev, ...names].slice(0, 5));
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        const names = Array.from(files).map((f) => f.name);
        setMockFiles((prev) => [...prev, ...names].slice(0, 5));
      }
      // Reset input so re-selecting same file works
      e.target.value = '';
    },
    []
  );

  const removeMockFile = useCallback((index: number) => {
    setMockFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /* ---- Submit dispute ---- */
  const handleSubmit = useCallback(async () => {
    if (!booking || !reason) {
      toast.error('Please select a dispute reason');
      return;
    }

    if (!description.trim()) {
      toast.error('Please provide a description of the issue');
      return;
    }

    if (!resolution) {
      toast.error('Please select your desired resolution');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: booking.id,
          status: 'disputed',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit dispute');
      }

      setSubmitted(true);
      toast.success('Dispute submitted successfully', {
        description: 'Our team will review your case within 48 hours.',
      });
    } catch {
      toast.error('Failed to submit dispute. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [booking, reason, description, resolution]);

  const isFormValid = reason && description.trim() && resolution && !submitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-gold/20 bg-[#111] p-0 sm:max-w-lg overflow-hidden">
        <AnimatePresence mode="wait">
          {submitted ? (
            /* ---- Success State ---- */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-12 px-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                className="mb-6 flex size-20 items-center justify-center rounded-full bg-gold/10 ring-2 ring-gold/30"
              >
                <AlertTriangle className="size-10 text-gold" />
              </motion.div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="font-serif text-xl font-bold text-white"
              >
                Dispute Filed
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-2 text-sm text-center text-muted-foreground max-w-xs"
              >
                Your dispute for booking #{booking?.id?.slice(-6)} has been
                submitted. Our team will review it within 48 hours.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-6"
              >
                <Button
                  onClick={() => onOpenChange(false)}
                  className="h-10 rounded-lg bg-gold/10 border border-gold/30 text-sm font-medium text-gold hover:bg-gold/20"
                >
                  Close
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            /* ---- Form State ---- */
            <motion.div
              key="form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="border-b border-gold/12 bg-gradient-to-r from-gold/5 to-transparent px-6 py-5">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 font-serif text-xl text-white">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-red-500/10">
                      <ShieldAlert className="size-5 text-red-400" />
                    </div>
                    File a Dispute
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-sm text-muted-foreground">
                    Describe the issue with your booking and we&apos;ll help resolve it
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="p-6 space-y-5">
                {/* Booking Info */}
                {booking && (
                  <div className="rounded-xl border border-gold/15 bg-surface p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service</span>
                      <span className="font-medium text-white truncate ml-4 max-w-[200px]">
                        {booking.service?.title ?? 'Unknown Service'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium text-white">{booking.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-semibold text-gold">
                        ${booking.totalPrice?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Booking ID</span>
                      <span className="font-mono text-xs text-muted-foreground">
                        #{booking.id?.slice(-8)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Dispute Reason */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
                    <AlertTriangle className="size-3.5" />
                    Dispute Reason <span className="text-red-400">*</span>
                  </label>
                  <Select value={reason} onValueChange={setReason}>
                    <SelectTrigger className="h-11 w-full border-gold/15 bg-surface text-sm text-white focus-visible:border-gold/40 focus-visible:ring-gold/20">
                      <SelectValue placeholder="Select a reason..." />
                    </SelectTrigger>
                    <SelectContent className="border-gold/20 bg-[#1A1A1A]">
                      {DISPUTE_REASONS.map((r) => (
                        <SelectItem
                          key={r.value}
                          value={r.value}
                          className="text-sm text-white focus:bg-gold/10 focus:text-gold"
                        >
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
                    <FileText className="size-3.5" />
                    Description <span className="text-red-400">*</span>
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please describe the issue in detail..."
                    rows={4}
                    className="min-h-[100px] resize-none border-gold/15 bg-surface text-sm text-white placeholder:text-muted-foreground/50 focus-visible:border-gold/40 focus-visible:ring-gold/20"
                  />
                  <p className="text-[11px] text-muted-foreground/60">
                    Be as specific as possible to help us resolve this quickly
                  </p>
                </div>

                {/* Evidence Upload (Mock) */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
                    <Upload className="size-3.5" />
                    Evidence Upload
                  </label>
                  <motion.div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-colors cursor-pointer ${
                      dragOver
                        ? 'border-gold bg-gold/5'
                        : 'border-gold/15 bg-surface hover:border-gold/30 hover:bg-surface-hover'
                    }`}
                    onClick={() => {
                      document.getElementById('dispute-file-input')?.click();
                    }}
                  >
                    <input
                      id="dispute-file-input"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileInput}
                    />
                    <div
                      className={`flex size-12 items-center justify-center rounded-xl transition-colors ${
                        dragOver ? 'bg-gold/20' : 'bg-gold/10'
                      }`}
                    >
                      <Upload
                        className={`size-5 transition-colors ${
                          dragOver ? 'text-gold-light' : 'text-gold'
                        }`}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-white">
                        {dragOver ? 'Drop files here' : 'Drag & drop or click to upload'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Photos, screenshots, or documents (mock upload)
                      </p>
                    </div>
                  </motion.div>

                  {/* Mock file list */}
                  <AnimatePresence>
                    {mockFiles.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        {mockFiles.map((name, i) => (
                          <motion.div
                            key={`${name}-${i}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="flex items-center justify-between rounded-lg border border-gold/10 bg-surface px-3 py-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="size-3.5 shrink-0 text-gold" />
                              <span className="text-xs text-white truncate">
                                {name}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeMockFile(i);
                              }}
                              className="shrink-0 text-muted-foreground hover:text-red-400 transition-colors"
                            >
                              <X className="size-3.5" />
                            </button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Separator className="bg-gold/10" />

                {/* Desired Resolution */}
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gold">
                    Desired Resolution <span className="text-red-400">*</span>
                  </label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger className="h-11 w-full border-gold/15 bg-surface text-sm text-white focus-visible:border-gold/40 focus-visible:ring-gold/20">
                      <SelectValue placeholder="Select desired resolution..." />
                    </SelectTrigger>
                    <SelectContent className="border-gold/20 bg-[#1A1A1A]">
                      {RESOLUTION_OPTIONS.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="text-sm text-white focus:bg-gold/10 focus:text-gold"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit */}
                <Button
                  onClick={handleSubmit}
                  disabled={!isFormValid}
                  className="h-12 w-full rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition-all hover:shadow-red-500/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Submitting Dispute...
                    </span>
                  ) : (
                    <>
                      <Send className="mr-2 size-4" />
                      Submit Dispute
                    </>
                  )}
                </Button>

                {/* Disclaimer */}
                <p className="text-center text-[11px] text-muted-foreground/50">
                  By submitting, you agree to our dispute resolution process. False claims
                  may result in account restrictions.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  DisputeStatusBadge                                                         */
/* -------------------------------------------------------------------------- */

interface DisputeStatusBadgeProps {
  status: string;
}

export function DisputeStatusBadge({ status }: DisputeStatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();

  const config: Record<string, { className: string; icon: typeof AlertTriangle }> = {
    pending: {
      className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
      icon: AlertTriangle,
    },
    under_review: {
      className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
      icon: AlertTriangle,
    },
    resolved: {
      className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      icon: () => null,
    },
    rejected: {
      className: 'bg-red-500/15 text-red-400 border-red-500/30',
      icon: () => null,
    },
    disputed: {
      className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      icon: AlertTriangle,
    },
  };

  const entry = config[normalizedStatus];

  if (!entry) {
    return (
      <Badge
        variant="outline"
        className="text-[11px] capitalize bg-muted text-muted-foreground border-border"
      >
        {status}
      </Badge>
    );
  }

  const Icon = entry.icon;

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-1.5 text-[11px] capitalize px-2.5 py-0.5 ${entry.className}`}
    >
      {Icon && <Icon className="size-3" />}
      {status}
    </Badge>
  );
}
