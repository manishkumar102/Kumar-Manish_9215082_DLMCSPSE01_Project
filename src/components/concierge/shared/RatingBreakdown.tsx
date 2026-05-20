'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface RatingBreakdownProps {
  averageRating: number;
  totalReviews: number;
  distribution: { stars: number; count: number }[]; // 5 entries for 5,4,3,2,1 stars
}

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                         */
/* -------------------------------------------------------------------------- */

const barVariants = {
  hidden: { width: 0 },
  visible: (percent: number) => ({
    width: `${percent}%`,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.1,
    },
  }),
};

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/* -------------------------------------------------------------------------- */
/*  RatingBreakdown                                                            */
/* -------------------------------------------------------------------------- */

export function RatingBreakdown({
  averageRating,
  totalReviews,
  distribution,
}: RatingBreakdownProps) {
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  // Ensure we always have 5 rows (5-star down to 1-star)
  const rows: { stars: number; count: number; percent: number }[] = [5, 4, 3, 2, 1].map(
    (star) => {
      const found = distribution.find((d) => d.stars === star);
      const count = found?.count ?? 0;
      return {
        stars: star,
        count,
        percent: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0,
      };
    },
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="luxury-card overflow-hidden rounded-xl"
    >
      {/* Header with gradient accent */}
      <div className="border-b border-gold/12 bg-gradient-to-r from-gold/5 to-transparent px-6 py-4">
        <h3 className="font-serif text-lg font-semibold text-white">
          Customer Reviews
        </h3>
      </div>

      <div className="flex flex-col gap-8 p-6 md:flex-row md:items-start md:gap-10">
        {/* ── Left: Average Rating ── */}
        <motion.div
          custom={0}
          variants={fadeIn}
          className="flex flex-col items-center justify-center gap-2 md:min-w-[140px]"
        >
          {/* Large average number */}
          <span className="font-serif text-6xl font-bold leading-none text-gold-gradient">
            {averageRating.toFixed(1)}
          </span>

          {/* Star row */}
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-5 ${
                  i < Math.round(averageRating)
                    ? 'fill-gold text-gold'
                    : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          {/* Total review count */}
          <p className="text-sm text-muted-foreground">
            Based on{' '}
            <span className="font-semibold text-white">{totalReviews.toLocaleString()}</span>{' '}
            {totalReviews === 1 ? 'review' : 'reviews'}
          </p>
        </motion.div>

        {/* ── Right: Distribution Bars ── */}
        <div className="flex-1 space-y-3">
          {rows.map((row, idx) => (
            <motion.div
              key={row.stars}
              custom={idx + 1}
              variants={fadeIn}
              className="flex items-center gap-3"
            >
              {/* Star count label */}
              <div className="flex w-14 shrink-0 items-center gap-1.5">
                <span className="text-sm font-medium text-white">{row.stars}</span>
                <Star className="size-3.5 fill-gold text-gold" />
              </div>

              {/* Bar */}
              <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-surface">
                <motion.div
                  custom={row.percent}
                  variants={barVariants}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background:
                      'linear-gradient(90deg, #A08040 0%, #C9A96E 40%, #E8D5A3 100%)',
                  }}
                />
              </div>

              {/* Percentage label */}
              <span className="w-12 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">
                {row.percent}%
              </span>

              {/* Count label (hidden on small screens) */}
              <span className="hidden w-16 shrink-0 text-right text-xs tabular-nums text-muted-foreground/60 sm:inline-block">
                ({row.count.toLocaleString()})
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
