'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type Service } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Star,
  MapPin,
  Search,
  X,
  Users,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  SlidersHorizontal,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface ProviderInfo {
  id: string;
  name: string;
  avatar: string | null;
  verified: boolean;
  location: string | null;
  categories: string[];
  avgRating: number;
  totalReviews: number;
  serviceCount: number;
  latestServiceDate: string;
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const ITEMS_PER_PAGE = 8;

const CATEGORIES = [
  'Fine Dining',
  'Yacht & Charter',
  'Private Aviation',
  'Luxury Transport',
  'Beauty & Wellness',
  'Art & Culture',
  'Real Estate',
  'Personal Shopping',
  'Events & Entertainment',
  'Wine & Spirits',
  'Adventure & Sports',
  'Pets & Lifestyle',
  'Private Security',
  'Concierge Medicine',
  'Photography & Film',
  'Luxury Fitness',
] as const;

const SORT_OPTIONS = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'reviews', label: 'Most Reviews' },
  { value: 'recent', label: 'Most Recent' },
] as const;

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                         */
/* -------------------------------------------------------------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

/* -------------------------------------------------------------------------- */
/*  Star Rating                                                                */
/* -------------------------------------------------------------------------- */

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${
            i < Math.round(rating) ? 'fill-gold text-gold' : 'text-muted-foreground/40'
          }`}
        />
      ))}
      <span className="ml-1 text-xs font-medium text-muted-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Skeleton Card                                                              */
/* -------------------------------------------------------------------------- */

function SkeletonCard() {
  return (
    <div className="luxury-card overflow-hidden rounded-xl">
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32 rounded bg-muted" />
            <Skeleton className="h-3 w-24 rounded bg-muted" />
          </div>
        </div>
        <Skeleton className="h-4 w-full rounded bg-muted" />
        <Skeleton className="h-3 w-3/4 rounded bg-muted" />
        <div className="flex items-center justify-between pt-2 border-t border-gold/10">
          <Skeleton className="h-5 w-20 rounded bg-muted" />
          <Skeleton className="h-9 w-28 rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Empty State                                                                */
/* -------------------------------------------------------------------------- */

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-gold/10">
        <Users className="size-8 text-gold/50" />
      </div>
      <h3 className="font-serif text-2xl font-semibold text-white">
        No Providers Found
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        We couldn&apos;t find any providers matching your current filters. Try broadening your search
        criteria or explore a different category.
      </p>
      <Button
        onClick={onClear}
        className="mt-6 h-10 rounded-lg bg-gradient-to-r from-gold-dark to-gold px-6 text-sm font-semibold text-black hover:brightness-110"
      >
        Clear All Filters
      </Button>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Provider Card                                                              */
/* -------------------------------------------------------------------------- */

function ProviderCard({
  provider,
  index,
  onViewServices,
}: {
  provider: ProviderInfo;
  index: number;
  onViewServices: (providerId: string) => void;
}) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      whileHover={{
        y: -4,
        boxShadow: '0 12px 40px rgba(201, 169, 110, 0.12)',
      }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="luxury-card-elevated group overflow-hidden rounded-xl"
    >
      <div className="p-6">
        {/* Header: Avatar + Name + Verification */}
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <Avatar className="size-16 border-2 border-gold/25 transition-all duration-300 group-hover:border-gold/50">
              {provider.avatar ? (
                <AvatarImage
                  src={provider.avatar}
                  alt={provider.name}
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="bg-gradient-to-br from-gold/20 to-gold-dark/20 text-gold text-lg font-bold">
                {provider.name?.charAt(0)?.toUpperCase() ?? 'P'}
              </AvatarFallback>
            </Avatar>
            {provider.verified && (
              <div className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[#141414]">
                <CheckCircle2 className="size-4 text-emerald-400" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif text-lg font-semibold text-white group-hover:text-gold transition-colors duration-300 truncate">
                {provider.name}
              </h3>
              {provider.verified && (
                <Badge className="badge-verified text-[10px] px-1.5 py-0 border-0 font-medium gap-1">
                  <CheckCircle2 className="size-3" />
                  Verified
                </Badge>
              )}
            </div>
            {provider.location && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0 text-gold/60" />
                <span className="truncate">{provider.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rating & Reviews */}
        <div className="mt-4 flex items-center gap-3">
          <StarRating rating={provider.avgRating} />
          <span className="text-xs text-muted-foreground">
            ({provider.totalReviews} {provider.totalReviews === 1 ? 'review' : 'reviews'})
          </span>
        </div>

        {/* Category Specialties */}
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gold/70">
            Specialties
          </p>
          <div className="flex flex-wrap gap-1.5">
            {provider.categories.slice(0, 3).map((cat) => (
              <Badge
                key={cat}
                variant="outline"
                className="border-gold/15 bg-gold/5 text-[10px] text-gold hover:bg-gold/10 transition-colors"
              >
                {cat}
              </Badge>
            ))}
            {provider.categories.length > 3 && (
              <Badge
                variant="outline"
                className="border-muted-foreground/20 bg-muted/30 text-[10px] text-muted-foreground"
              >
                +{provider.categories.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Service count */}
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Briefcase className="size-3 shrink-0 text-gold/50" />
          <span>
            {provider.serviceCount} {provider.serviceCount === 1 ? 'service' : 'services'} offered
          </span>
        </div>

        {/* Divider + CTA */}
        <div className="mt-4 flex items-center justify-between border-t border-gold/10 pt-4">
          <div />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => onViewServices(provider.id)}
              className="h-9 rounded-lg bg-gradient-to-r from-gold-dark to-gold px-4 text-xs font-semibold text-black hover:brightness-110 transition-all"
            >
              View Services
              <ArrowRight className="ml-1.5 size-3.5" />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ProviderDirectory (exported)                                               */
/* -------------------------------------------------------------------------- */

export function ProviderDirectory() {
  const { setView } = useAppStore();

  // Local filter state (independent of global store to avoid interfering with services page)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Data state
  const [allProviders, setAllProviders] = useState<ProviderInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Available categories from data
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    allProviders.forEach((p) => p.categories.forEach((c) => cats.add(c)));
    return Array.from(cats).sort();
  }, [allProviders]);

  // Filtered & sorted providers
  const filteredProviders = useMemo(() => {
    let result = [...allProviders];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.location && p.location.toLowerCase().includes(q)) ||
          p.categories.some((c) => c.toLowerCase().includes(q)),
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.categories.includes(selectedCategory));
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.avgRating - a.avgRating || b.totalReviews - a.totalReviews);
        break;
      case 'reviews':
        result.sort((a, b) => b.totalReviews - a.totalReviews || b.avgRating - a.avgRating);
        break;
      case 'recent':
        result.sort(
          (a, b) =>
            new Date(b.latestServiceDate).getTime() - new Date(a.latestServiceDate).getTime(),
        );
        break;
    }

    return result;
  }, [allProviders, searchQuery, selectedCategory, sortBy]);

  const displayedProviders = filteredProviders.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProviders.length;

  const hasActiveFilters = useMemo(() => {
    return searchQuery !== '' || selectedCategory !== 'all' || sortBy !== 'rating';
  }, [searchQuery, selectedCategory, sortBy]);

  // Fetch services and aggregate providers
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function fetchProviders() {
      setLoading(true);
      try {
        // Fetch all approved services to extract unique providers
        const res = await fetch('/api/services', {
          signal: controller.signal,
        });
        if (res.ok && !cancelled) {
          const data = await res.json();
          const services: Service[] = data.services ?? [];

          // Group services by provider
          const providerMap = new Map<string, ProviderInfo>();

          for (const svc of services) {
            const pid = svc.providerId;
            const existing = providerMap.get(pid);

            if (existing) {
              // Update aggregate data
              if (svc.rating > 0) {
                // Running average
                const prevTotal = existing.avgRating * existing.totalReviews;
                const newTotal = prevTotal + svc.rating * svc.reviewCount;
                const newCount = existing.totalReviews + svc.reviewCount;
                existing.avgRating = newTotal / newCount;
                existing.totalReviews = newCount;
              }
              existing.serviceCount += 1;
              if (!existing.categories.includes(svc.category)) {
                existing.categories.push(svc.category);
              }
              if (svc.createdAt && svc.createdAt > existing.latestServiceDate) {
                existing.latestServiceDate = svc.createdAt;
              }
            } else {
              providerMap.set(pid, {
                id: pid,
                name: svc.provider?.name ?? 'Unknown Provider',
                avatar: svc.provider?.avatar ?? null,
                verified: svc.provider?.verified ?? false,
                location: svc.provider?.location ?? null,
                categories: svc.category ? [svc.category] : [],
                avgRating: svc.rating || 0,
                totalReviews: svc.reviewCount || 0,
                serviceCount: 1,
                latestServiceDate: svc.createdAt ?? '',
              });
            }
          }

          setAllProviders(Array.from(providerMap.values()));
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        // Silently fail
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProviders();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery, selectedCategory, sortBy]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('rating');
  }, []);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredProviders.length));
  }, [filteredProviders.length]);

  const handleViewServices = useCallback(
    (providerId: string) => {
      // Navigate to services page and show only this provider's services
      // We use setSearchQuery to trigger filtering, but actually we'll set
      // the global state to navigate to services filtered by this provider
      setSearchQuery('');
      setSelectedCategory('all');
      setSortBy('featured');
      // Store the provider ID in searchQuery as a special filter
      // The services page will need to handle provider filtering
      // For now, navigate to services and the user can search
      setView('services');
      // We can use a special marker in searchQuery
      useAppStore.getState().setSearchQuery(`provider:${providerId}`);
    },
    [setView],
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Decorative top line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-6 bg-gold/50" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold">
              Our Professionals
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Provider Directory
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block size-3 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                Discovering our exclusive providers...
              </span>
            ) : (
              <>
                <span className="text-white font-medium">{allProviders.length}</span> verified
                professional{allProviders.length !== 1 ? 's' : ''} offering premium luxury services
              </>
            )}
          </p>
        </motion.div>

        {/* Search & Sort Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          {/* Search Input */}
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, location, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 border-gold/15 bg-surface pl-10 pr-10 text-sm text-white placeholder:text-muted-foreground focus-visible:border-gold/40 focus-visible:ring-gold/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="size-4 text-muted-foreground hidden sm:block" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-11 w-full border-gold/15 bg-surface text-sm text-white focus:border-gold/40 focus:ring-gold/20 sm:w-48 transition-all">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="border-gold/15 bg-popover">
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Category Filter Chips */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-gold-dark to-gold text-black shadow-lg shadow-gold/20'
                  : 'border border-gold/15 bg-surface text-muted-foreground hover:border-gold/30 hover:text-white'
              }`}
            >
              All Categories
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-gold-dark to-gold text-black shadow-lg shadow-gold/20'
                    : 'border border-gold/15 bg-surface text-muted-foreground hover:border-gold/30 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Active Filters */}
        <AnimatePresence>
          {hasActiveFilters && !loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 flex flex-wrap items-center gap-2"
            >
              {selectedCategory !== 'all' && (
                <Badge
                  variant="outline"
                  className="cursor-pointer border-gold/20 bg-gold/5 text-xs text-gold hover:bg-gold/10 transition-colors gap-1 pr-1.5"
                  onClick={() => setSelectedCategory('all')}
                >
                  {selectedCategory}
                  <X className="size-3" />
                </Badge>
              )}
              {searchQuery && (
                <Badge
                  variant="outline"
                  className="cursor-pointer border-gold/20 bg-gold/5 text-xs text-gold hover:bg-gold/10 transition-colors gap-1 pr-1.5"
                  onClick={() => setSearchQuery('')}
                >
                  &ldquo;{searchQuery}&rdquo;
                  <X className="size-3" />
                </Badge>
              )}
              {sortBy !== 'rating' && (
                <Badge
                  variant="outline"
                  className="cursor-pointer border-gold/20 bg-gold/5 text-xs text-gold hover:bg-gold/10 transition-colors gap-1 pr-1.5"
                  onClick={() => setSortBy('rating')}
                >
                  {SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? sortBy}
                  <X className="size-3" />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 text-xs text-muted-foreground hover:text-white"
              >
                Clear all
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Provider Grid */}
        {loading ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredProviders.length === 0 ? (
          <EmptyState onClear={clearFilters} />
        ) : (
          <>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
            >
              {displayedProviders.map((provider, i) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  index={i}
                  onViewServices={handleViewServices}
                />
              ))}
            </motion.div>

            {/* Results count */}
            {!hasMore && filteredProviders.length > ITEMS_PER_PAGE && (
              <p className="mt-8 text-center text-xs text-muted-foreground">
                Showing all {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''}
              </p>
            )}

            {/* Load More Button */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-10 flex flex-col items-center gap-3"
              >
                <p className="text-xs text-muted-foreground">
                  Showing {displayedProviders.length} of {filteredProviders.length} provider
                  {filteredProviders.length !== 1 ? 's' : ''}
                </p>
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  className="h-11 rounded-lg border-gold/25 px-8 text-sm font-medium text-gold hover:border-gold/50 hover:bg-gold/5 hover:text-gold transition-all"
                >
                  Load More
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
