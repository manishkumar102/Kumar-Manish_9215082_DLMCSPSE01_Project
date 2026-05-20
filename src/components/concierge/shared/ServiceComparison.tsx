'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type Service } from '@/store/useAppStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  GitCompareArrows,
  X,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Tag,
  User,
  Loader2,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface CompareServiceData extends Service {
  providerName: string;
}

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                         */
/* -------------------------------------------------------------------------- */

const barVariants = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
  exit: {
    y: 100,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* -------------------------------------------------------------------------- */
/*  Comparison row helper                                                      */
/* -------------------------------------------------------------------------- */

function CompareRow({
  index,
  label,
  icon: Icon,
  values,
}: {
  index: number;
  label: string;
  icon: typeof Star;
  values: React.ReactNode[];
}) {
  return (
    <motion.tr
      custom={index}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
      className="border-b border-gold/10 transition-colors last:border-b-0 hover:bg-gold/[0.03]"
    >
      <td className="py-3.5 px-4 text-sm font-medium text-gold whitespace-nowrap">
        <span className="inline-flex items-center gap-2">
          <Icon className="size-3.5 shrink-0" />
          {label}
        </span>
      </td>
      {values.map((val, colIdx) => (
        <td
          key={colIdx}
          className="py-3.5 px-4 text-sm text-center text-foreground/90"
        >
          {val}
        </td>
      ))}
    </motion.tr>
  );
}

/* -------------------------------------------------------------------------- */
/*  Star rating display                                                        */
/* -------------------------------------------------------------------------- */

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center justify-center gap-1">
      <Star className="size-3.5 fill-gold text-gold" />
      <span className="font-medium text-white">{rating.toFixed(1)}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main ServiceComparison component                                           */
/* -------------------------------------------------------------------------- */

export function ServiceComparison() {
  const { compareIds, clearCompare } = useAppStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [services, setServices] = useState<CompareServiceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showBar = compareIds.length >= 2;

  /* Fetch service details when dialog opens */
  const fetchServices = useCallback(async () => {
    if (compareIds.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        compareIds.map(async (id) => {
          const res = await fetch(`/api/services?id=${encodeURIComponent(id)}`);
          if (!res.ok) throw new Error(`Service ${id} not found`);
          const data = await res.json();
          const svc: Service = data.service;
          return {
            ...svc,
            providerName: svc.provider?.name ?? 'Unknown Provider',
          } as CompareServiceData;
        })
      );

      setServices(results);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load services for comparison.'
      );
    } finally {
      setLoading(false);
    }
  }, [compareIds]);

  /* Open dialog and fetch */
  const handleOpenDialog = useCallback(() => {
    setDialogOpen(true);
  }, []);

  useEffect(() => {
    if (dialogOpen) {
      fetchServices();
    } else {
      setServices([]);
      setError(null);
    }
  }, [dialogOpen, fetchServices]);

  /* Handle clear all comparisons */
  const handleClear = useCallback(() => {
    clearCompare();
    setDialogOpen(false);
    setServices([]);
    setError(null);
  }, [clearCompare]);

  /* Close dialog only */
  const handleClose = useCallback(
    (open: boolean) => {
      setDialogOpen(open);
    },
    []
  );

  /* Column count for padding empty cells (max 3 columns) */
  const columns = Math.max(compareIds.length, 2);
  const emptyCols = Math.max(0, 3 - columns);

  return (
    <>
      {/* ---- Floating Comparison Bar ---- */}
      <AnimatePresence>
        {showBar && (
          <motion.div
            variants={barVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center px-4 pb-4 pointer-events-none"
          >
            <div className="pointer-events-auto flex items-center gap-4 rounded-2xl border border-gold/20 bg-[#111]/95 px-6 py-3.5 shadow-xl shadow-black/40 backdrop-blur-xl">
              <div className="flex items-center gap-2.5">
                <GitCompareArrows className="size-4 text-gold" />
                <span className="text-sm font-medium text-foreground">
                  <span className="text-gold font-semibold">{compareIds.length}</span>
                  {' '}service{compareIds.length !== 1 ? 's' : ''} selected
                </span>
              </div>

              <Button
                onClick={handleOpenDialog}
                className="rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light px-5 text-sm font-semibold text-black shadow-lg shadow-gold/20 transition-all hover:shadow-gold/40 hover:brightness-110"
              >
                Compare
              </Button>

              <button
                onClick={clearCompare}
                aria-label="Clear comparison"
                className="ml-1 flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Comparison Dialog ---- */}
      <Dialog open={dialogOpen} onOpenChange={handleClose}>
        <DialogContent className="border-gold/20 bg-[#111] sm:max-w-4xl overflow-hidden">
          {/* Header */}
          <div className="border-b border-gold/12 bg-gradient-to-r from-gold/5 to-transparent px-6 py-5">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 font-serif text-xl text-white">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gold/10">
                  <GitCompareArrows className="size-5 text-gold" />
                </div>
                Service Comparison
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                Compare details side-by-side to find the perfect luxury experience
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16"
                >
                  <Loader2 className="mb-4 size-8 animate-spin text-gold" />
                  <p className="text-sm text-muted-foreground">Loading service details…</p>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16"
                >
                  <p className="text-sm text-destructive">{error}</p>
                  <Button
                    variant="outline"
                    onClick={fetchServices}
                    className="mt-4 border-gold/20 text-gold hover:bg-gold/10"
                  >
                    Try Again
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="table"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px]">
                      <thead>
                        <tr className="border-b border-gold/15">
                          <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-gold/70">
                            Attribute
                          </th>
                          {services.map((svc) => (
                            <th
                              key={svc.id}
                              className="py-3 px-4 text-center text-sm font-semibold text-white"
                            >
                              <span className="line-clamp-2 max-w-[160px]">
                                {svc.title}
                              </span>
                            </th>
                          ))}
                          {/* Empty columns to maintain up to 3-column layout */}
                          {Array.from({ length: emptyCols }).map((_, i) => (
                            <th key={`empty-${i}`} />
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <CompareRow
                          index={0}
                          label="Provider"
                          icon={User}
                          values={services.map((s) => s.providerName)}
                        />
                        <CompareRow
                          index={1}
                          label="Price"
                          icon={DollarSign}
                          values={services.map((s) => (
                            <span key={s.id} className="font-serif font-bold text-gold">
                              ${s.price.toLocaleString()}
                            </span>
                          ))}
                        />
                        <CompareRow
                          index={2}
                          label="Duration"
                          icon={Clock}
                          values={services.map((s) => s.duration)}
                        />
                        <CompareRow
                          index={3}
                          label="Location"
                          icon={MapPin}
                          values={services.map((s) => s.location)}
                        />
                        <CompareRow
                          index={4}
                          label="Rating"
                          icon={Star}
                          values={services.map((s) => (
                            <RatingStars key={s.id} rating={s.rating} />
                          ))}
                        />
                        <CompareRow
                          index={5}
                          label="Category"
                          icon={Tag}
                          values={services.map((s) => (
                            <span key={s.id} className="inline-block rounded-full bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
                              {s.category}
                            </span>
                          ))}
                        />
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="border-t border-gold/12 px-6 py-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {services.length} of 3 slots used
            </p>
            <Button
              onClick={handleClear}
              variant="outline"
              className="border-gold/20 text-gold hover:bg-gold/10 hover:text-gold"
            >
              <X className="mr-1.5 size-3.5" />
              Clear Comparison
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
