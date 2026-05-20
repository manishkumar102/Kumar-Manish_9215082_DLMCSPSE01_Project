'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, type Service } from '@/store/useAppStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

/** Category-to-gradient map for placeholder images */
const CATEGORY_GRADIENTS: Record<string, string> = {
  'Fine Dining': 'from-amber-700/40 via-gold/30 to-rose-900/20',
  'Yacht & Charter': 'from-cyan-700/30 via-blue-900/30 to-gold-dark/20',
  'Private Aviation': 'from-slate-700/30 via-gold/20 to-sky-900/20',
  'Luxury Transport': 'from-zinc-700/30 via-gold/25 to-neutral-900/20',
  'Beauty & Wellness': 'from-pink-700/25 via-gold/20 to-rose-900/20',
  'Art & Culture': 'from-purple-700/25 via-gold/20 to-indigo-900/20',
  'Real Estate': 'from-stone-700/30 via-gold/25 to-amber-900/20',
  'Personal Shopping': 'from-fuchsia-700/20 via-gold/25 to-violet-900/20',
  'Events & Entertainment': 'from-red-700/20 via-gold/25 to-orange-900/20',
  'Wine & Spirits': 'from-red-900/30 via-gold/30 to-amber-800/20',
  'Adventure & Sports': 'from-emerald-700/25 via-gold/20 to-teal-900/20',
  'Pets & Lifestyle': 'from-lime-700/20 via-gold/20 to-green-900/20',
  'Private Security': 'from-gray-700/30 via-gold/15 to-zinc-900/20',
  'Concierge Medicine': 'from-teal-700/25 via-gold/20 to-cyan-900/20',
  'Photography & Film': 'from-violet-700/20 via-gold/25 to-fuchsia-900/20',
  'Luxury Fitness': 'from-green-700/25 via-gold/20 to-emerald-900/20',
};

/** Default gradient when category is not recognized */
const DEFAULT_GRADIENT = 'from-gold/20 via-amber-900/30 to-gold-dark/20';

/** Number of services to show */
const MAX_SERVICES = 6;

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                         */
/* -------------------------------------------------------------------------- */

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/* -------------------------------------------------------------------------- */
/*  Star Rating (inline)                                                       */
/* -------------------------------------------------------------------------- */

function MiniStarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3 ${
            i < Math.round(rating)
              ? 'fill-gold text-gold'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Recommendation Card                                                        */
/* -------------------------------------------------------------------------- */

function RecommendationCard({
  service,
  index,
  onClick,
}: {
  service: Service;
  index: number;
  onClick: (svc: Service) => void;
}) {
  const gradient =
    CATEGORY_GRADIENTS[service.category] ?? DEFAULT_GRADIENT;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      whileHover={{
        scale: 1.04,
        boxShadow: '0 16px 48px rgba(201, 169, 110, 0.15)',
      }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="luxury-card group relative w-64 shrink-0 cursor-pointer overflow-hidden rounded-xl sm:w-72"
      onClick={() => onClick(service)}
    >
      {/* Image / Gradient placeholder */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <div
          className={`size-full bg-gradient-to-br ${gradient} transition-transform duration-500 group-hover:scale-105`}
        />
        {/* Category badge */}
        <div className="absolute left-2.5 top-2.5">
          <Badge className="border-gold/30 bg-black/60 text-[10px] text-gold backdrop-blur-sm">
            {service.category}
          </Badge>
        </div>
        {/* Featured badge */}
        {service.featured && (
          <div className="absolute right-2.5 top-2.5">
            <Badge className="border-0 bg-gradient-to-r from-gold-dark to-gold px-2 py-0.5 text-[9px] font-bold text-black">
              <Sparkles className="mr-1 size-2.5" />
              FEATURED
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h4 className="font-serif text-sm font-semibold leading-snug text-white transition-colors duration-200 line-clamp-1 group-hover:text-gold">
          {service.title}
        </h4>

        {/* Rating */}
        <div className="mt-2">
          <MiniStarRating rating={service.rating} />
        </div>

        {/* Price */}
        <div className="mt-3 flex items-center justify-between">
          <span className="font-serif text-lg font-bold text-gold">
            ${service.price.toLocaleString()}
          </span>
          <div className="flex size-7 items-center justify-center rounded-full border border-gold/20 bg-gold/5 text-gold transition-all duration-300 group-hover:border-gold/40 group-hover:bg-gold/10">
            <ArrowRight className="size-3.5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Loading skeleton cards                                                     */
/* -------------------------------------------------------------------------- */

function RecommendationSkeleton() {
  return (
    <div
      className="w-64 shrink-0 overflow-hidden rounded-xl border border-gold/8 bg-gradient-to-b from-[#1A1A1A] to-[#141414] sm:w-72"
      aria-hidden="true"
    >
      <div className="aspect-[4/3] w-full skeleton-gold rounded-none" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-full skeleton-gold rounded" />
        <div className="h-3 w-20 skeleton-gold rounded" />
        <div className="h-5 w-24 skeleton-gold rounded" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ServiceRecommendations (exported)                                          */
/* -------------------------------------------------------------------------- */

export function ServiceRecommendations() {
  const recentlyViewed = useAppStore((s) => s.recentlyViewed);
  const selectedService = useAppStore((s) => s.selectedService);
  const setSelectedService = useAppStore((s) => s.setSelectedService);
  const setView = useAppStore((s) => s.setView);

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function fetchRecommendations() {
      setLoading(true);
      setError(false);

      try {
        // 1. Gather categories from selected service (directly available in store)
        const viewedCategories = new Set<string>();
        if (selectedService?.category) {
          viewedCategories.add(selectedService.category);
        }

        // 2. Fetch recently-viewed services to extract their categories
        if (recentlyViewed.length > 0) {
          try {
            // Fetch each recently viewed service individually to get its category
            const results = await Promise.allSettled(
              recentlyViewed.slice(0, 6).map((id) =>
                fetch(`/api/services?id=${id}`, { signal: controller.signal })
                  .then((r) => (r.ok ? r.json() : null))
                  .then((d) => d?.service as Service | undefined)
                  .catch(() => undefined),
              ),
            );
            for (const r of results) {
              if (r.status === 'fulfilled' && r.value?.category) {
                viewedCategories.add(r.value.category);
              }
            }
          } catch {
            // Non-critical — proceed without extra category hints
          }
        }

        // 3. Fetch featured services
        const params = new URLSearchParams({ sort: 'featured' });
        const res = await fetch(`/api/services?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok && !cancelled) {
          throw new Error('Failed to fetch');
        }

        const data = await res.json();
        let allFeatured: Service[] = data.services ?? [];

        // Exclude already-recently-viewed services
        const recentSet = new Set(recentlyViewed);
        allFeatured = allFeatured.filter((s) => !recentSet.has(s.id));

        // 4. Prioritize same categories as recently viewed
        let recommended: Service[];

        if (viewedCategories.size > 0) {
          const categoryMatches = allFeatured.filter((s) =>
            viewedCategories.has(s.category),
          );
          const others = allFeatured.filter(
            (s) => !viewedCategories.has(s.category),
          );
          recommended = [...categoryMatches, ...others].slice(0, MAX_SERVICES);
          setIsFallback(categoryMatches.length === 0);
        } else {
          recommended = allFeatured.slice(0, MAX_SERVICES);
          setIsFallback(true);
        }

        if (!cancelled) {
          setServices(recommended);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchRecommendations();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [recentlyViewed, selectedService]);

  const handleCardClick = useCallback(
    (svc: Service) => {
      setSelectedService(svc);
      setView('service-detail');
    },
    [setSelectedService, setView],
  );

  const handleViewAll = useCallback(() => {
    setView('services');
  }, [setView]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Error state ──
  if (error) return null;

  // ── No services after loading ──
  if (!loading && services.length === 0) return null;

  return (
    <section className="w-full">
      {/* Header */}
      <div className="mb-5 flex items-end justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-9 items-center justify-center rounded-lg ${
              isFallback ? 'bg-gold/10' : 'bg-gradient-to-br from-gold/20 to-gold-dark/20'
            }`}
          >
            {isFallback ? (
              <TrendingUp className="size-4 text-gold" />
            ) : (
              <Sparkles className="size-4 text-gold" />
            )}
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold text-white sm:text-2xl">
              {isFallback ? 'Popular Services' : 'Recommended For You'}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isFallback
                ? 'Trending experiences loved by our community'
                : 'Handpicked based on your browsing preferences'}
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={handleViewAll}
          className="hidden h-8 shrink-0 text-xs font-medium text-gold hover:bg-gold/5 hover:text-gold sm:inline-flex"
        >
          View All
          <ArrowRight className="ml-1 size-3.5" />
        </Button>
      </div>

      {/* Horizontal scroll container */}
      <motion.div
        ref={scrollRef}
        initial="hidden"
        animate="visible"
        className="scrollbar-custom -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:-mx-0 sm:px-0"
        style={
          {
            // Thin custom scrollbar
            scrollbarWidth: 'thin',
            scrollbarColor: '#333 transparent',
          } as React.CSSProperties
        }
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <RecommendationSkeleton key={i} />
            ))
          : services.map((svc, i) => (
              <RecommendationCard
                key={svc.id}
                service={svc}
                index={i}
                onClick={handleCardClick}
              />
            ))}
      </motion.div>

      {/* Mobile "View All" button */}
      <div className="mt-4 sm:hidden">
        <Button
          variant="outline"
          onClick={handleViewAll}
          className="h-10 w-full rounded-lg border-gold/20 text-sm font-medium text-gold hover:border-gold/40 hover:bg-gold/5 hover:text-gold"
        >
          View All Services
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </section>
  );
}
