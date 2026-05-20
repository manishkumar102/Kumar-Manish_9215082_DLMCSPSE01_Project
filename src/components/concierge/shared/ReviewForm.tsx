'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

interface ReviewFormProps {
  bookingId: string;
  serviceId: string;
  providerId: string;
  clientId: string;
  serviceTitle: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Star labels                                                                */
/* -------------------------------------------------------------------------- */

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

/* -------------------------------------------------------------------------- */
/*  Review Form                                                                */
/* -------------------------------------------------------------------------- */

export function ReviewForm({
  bookingId,
  serviceId,
  providerId,
  clientId,
  serviceTitle,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const displayRating = hoverRating || rating;

  const handleSubmit = useCallback(async () => {
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          clientId,
          serviceId,
          providerId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      if (res.status === 409) {
        toast.error('You have already reviewed this booking');
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit review');
      }

      toast.success('Review submitted! Thank you for your feedback.');
      onSuccess?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }, [bookingId, clientId, serviceId, providerId, rating, comment, onSuccess]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="luxury-card overflow-hidden rounded-xl"
    >
      {/* Header */}
      <div className="border-b border-gold/12 bg-gradient-to-r from-gold/5 to-transparent px-6 py-4">
        <h3 className="font-serif text-lg font-semibold text-white">Leave a Review</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Share your experience with <span className="text-gold">{serviceTitle}</span>
        </p>
      </div>

      <div className="space-y-5 p-6">
        {/* Star Rating */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gold">
            Your Rating
          </label>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.button
                  key={i}
                  type="button"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onMouseEnter={() => setHoverRating(i + 1)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i + 1)}
                  className="transition-transform"
                  aria-label={`Rate ${i + 1} star${i > 0 ? 's' : ''}`}
                >
                  <Star
                    className={`size-8 transition-colors ${
                      i < displayRating
                        ? 'fill-gold text-gold'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </motion.button>
              ))}
            </div>
            {displayRating > 0 && (
              <motion.span
                key={displayRating}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm font-medium text-gold"
              >
                {STAR_LABELS[displayRating]}
              </motion.span>
            )}
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gold">
            Your Review <span className="normal-case tracking-normal text-muted-foreground">(optional)</span>
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us about your experience..."
            className="min-h-[100px] border-gold/15 bg-surface text-sm text-white placeholder:text-muted-foreground focus-visible:border-gold/40 focus-visible:ring-gold/20 resize-none"
            maxLength={1000}
          />
          <p className="text-right text-xs text-muted-foreground/60">
            {comment.length} / 1000
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="h-11 flex-1 rounded-lg bg-gradient-to-r from-gold-dark via-gold to-gold-light text-sm font-semibold text-black shadow-lg shadow-gold/20 transition-all hover:shadow-gold/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block size-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Submitting...
              </span>
            ) : (
              <>
                <Star className="mr-2 size-4 fill-black/30" />
                Submit Review
              </>
            )}
          </Button>
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={submitting}
              className="h-11 rounded-lg border-gold/20 px-6 text-sm text-gold hover:border-gold/40 hover:bg-gold/5 hover:text-gold"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
