'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type Service } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Star,
  MapPin,
  Clock,
  Search,
  SlidersHorizontal,
  X,
  ArrowLeft,
  Sparkles,
  Heart,
  GitCompareArrows,
  Check,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

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
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'reviews', label: 'Most Reviews' },
] as const;

const PLACEHOLDER_GRADIENTS = [
  'from-gold/20 via-amber-900/30 to-gold-dark/20',
  'from-amber-800/30 via-gold-dark/20 to-stone-900/30',
  'from-stone-800/30 via-gold/20 to-amber-900/20',
  'from-gold-dark/20 via-amber-900/20 to-gold/20',
  'from-amber-900/20 via-stone-800/30 to-gold-dark/20',
  'from-gold/15 via-gold-dark/25 to-amber-800/20',
];

/* -------------------------------------------------------------------------- */
/*  Animation helpers                                                         */
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
/*  Star Rating                                                               */
/* -------------------------------------------------------------------------- */

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const iconSize = size === 'sm' ? 'size-3.5' : 'size-4';
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${iconSize} ${i < Math.round(rating) ? 'fill-gold text-gold' : 'text-muted-foreground/40'}`}
        />
      ))}
      <span className={`ml-1 font-medium text-muted-foreground ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Image helper                                                              */
/* -------------------------------------------------------------------------- */

function getFirstImage(service: Service): string | null {
  if (!service.images) return null;
  try {
    const arr = JSON.parse(service.images);
    if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string') {
      return arr[0];
    }
  } catch {
    if (typeof service.images === 'string' && service.images.startsWith('http')) {
      return service.images;
    }
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Skeleton Card                                                             */
/* -------------------------------------------------------------------------- */

function SkeletonCard() {
  return (
    <div className="luxury-card overflow-hidden rounded-xl">
      <div className="aspect-[4/3] w-full animate-shimmer bg-muted" />
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div className="h-5 w-24 animate-shimmer rounded bg-muted" />
          <div className="h-5 w-16 animate-shimmer rounded bg-muted" />
        </div>
        <div className="h-5 w-full animate-shimmer rounded bg-muted" />
        <div className="h-4 w-3/4 animate-shimmer rounded bg-muted" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 w-20 animate-shimmer rounded bg-muted" />
          <div className="h-4 w-16 animate-shimmer rounded bg-muted" />
        </div>
        <div className="flex items-center gap-2 border-t border-gold/10 pt-3">
          <div className="size-6 animate-shimmer rounded-full bg-muted" />
          <div className="h-4 w-24 animate-shimmer rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Filter Sidebar (shared between desktop & mobile sheet)                     */
/* -------------------------------------------------------------------------- */

interface FilterPanelProps {
  searchQuery: string;
  selectedCategory: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  selectedLocation: string;
  onSearchChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
  onSortChange: (v: string) => void;
  onLocationChange: (v: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

function FilterPanel({
  searchQuery,
  selectedCategory,
  minPrice,
  maxPrice,
  sortBy,
  selectedLocation,
  onSearchChange,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onSortChange,
  onLocationChange,
  onClearFilters,
  hasActiveFilters,
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-gold">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 border-gold/15 bg-surface pl-9 text-sm text-white placeholder:text-muted-foreground focus-visible:border-gold/40 focus-visible:ring-gold/20"
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-gold">
          Category
        </label>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="h-10 w-full border-gold/15 bg-surface text-sm text-white focus:border-gold/40 focus:ring-gold/20">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="border-gold/15 bg-popover">
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-gold">
          Price Range
        </label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            min={0}
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="h-10 border-gold/15 bg-surface text-sm text-white placeholder:text-muted-foreground focus-visible:border-gold/40 focus-visible:ring-gold/20"
          />
          <span className="text-muted-foreground">&ndash;</span>
          <Input
            type="number"
            placeholder="Max"
            min={0}
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="h-10 border-gold/15 bg-surface text-sm text-white placeholder:text-muted-foreground focus-visible:border-gold/40 focus-visible:ring-gold/20"
          />
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-gold">
          Sort By
        </label>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-10 w-full border-gold/15 bg-surface text-sm text-white focus:border-gold/40 focus:ring-gold/20">
            <SelectValue placeholder="Featured" />
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

      {/* Location */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-gold">
          Location
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="City or region..."
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className="h-10 border-gold/15 bg-surface pl-9 text-sm text-white placeholder:text-muted-foreground focus-visible:border-gold/40 focus-visible:ring-gold/20"
          />
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="h-10 w-full border-gold/20 text-sm text-gold hover:border-gold/40 hover:bg-gold/5 hover:text-gold"
        >
          <X className="mr-2 size-4" />
          Clear All Filters
        </Button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Service Card                                                              */
/* -------------------------------------------------------------------------- */

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const setSelectedService = useAppStore((s) => s.setSelectedService);
  const setView = useAppStore((s) => s.setView);
  const favoriteIds = useAppStore((s) => s.favoriteIds);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const compareIds = useAppStore((s) => s.compareIds);
  const toggleCompare = useAppStore((s) => s.toggleCompare);

  const imgUrl = getFirstImage(service);
  const isFavorited = favoriteIds.includes(service.id);
  const isComparing = compareIds.includes(service.id);

  const handleClick = useCallback(() => {
    setSelectedService(service);
    setView('service-detail');
  }, [service, setSelectedService, setView]);

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const user = useAppStore.getState().user;
      if (!user) {
        toast.error('Please sign in to save favorites');
        useAppStore.getState().setView('login');
        return;
      }
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites ❤️');
      toggleFavorite(service.id);
      fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, serviceId: service.id, action: isFavorited ? 'remove' : 'add' }),
      });
    },
    [service.id, isFavorited, toggleFavorite],
  );

  const handleCompareClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isComparing && compareIds.length >= 3) {
        toast.info('You can compare up to 3 services');
        return;
      }
      if (!isComparing) {
        toast.success('Added to comparison');
      }
      toggleCompare(service.id);
    },
    [service.id, isComparing, compareIds.length, toggleCompare],
  );

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      whileHover={{ y: -6, boxShadow: '0 16px 48px rgba(201, 169, 110, 0.12)' }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="luxury-card group cursor-pointer overflow-hidden rounded-xl"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={service.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className={`size-full bg-gradient-to-br ${PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length]}`}
          />
        )}

        {/* Heart/Favorite Button - TOP RIGHT */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 z-10 flex size-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-colors hover:bg-black/60"
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`size-5 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'text-white/80 hover:text-white'}`} />
        </motion.button>

        {/* Compare Checkbox - TOP LEFT (below badges) */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={handleCompareClick}
          className={`absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm transition-all duration-200 ${
            isComparing
              ? 'border border-gold bg-gold/20 text-gold'
              : 'border border-white/20 bg-black/40 text-white/70 hover:border-gold/40 hover:text-white'
          }`}
          aria-label={isComparing ? 'Remove from comparison' : 'Add to comparison'}
        >
          {isComparing ? <Check className="size-3" /> : <GitCompareArrows className="size-3" />}
          Compare
        </motion.button>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          <Badge className="border-gold/30 bg-black/60 text-[11px] text-gold backdrop-blur-sm">
            {service.category}
          </Badge>
          {service.featured && (
            <Badge className="border-0 bg-gradient-to-r from-gold-dark to-gold text-[10px] font-bold text-black">
              <Sparkles className="mr-1 size-3" />
              FEATURED
            </Badge>
          )}
        </div>

        {/* Duration overlay */}
        <div className="absolute bottom-3 right-3">
          <Badge variant="secondary" className="border-0 bg-black/60 text-[11px] text-white backdrop-blur-sm">
            <Clock className="mr-1 size-3" />
            {service.duration}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-serif text-lg font-semibold leading-snug text-white group-hover:text-gold transition-colors duration-300">
          {service.title}
        </h3>

        {/* Description */}
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {service.description}
        </p>

        {/* Location */}
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0 text-gold/60" />
          <span className="truncate">{service.location}</span>
        </div>

        {/* Rating */}
        <div className="mt-2.5">
          <StarRating rating={service.rating} />
          <span className="ml-2 text-xs text-muted-foreground">
            ({service.reviewCount} {service.reviewCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>

        {/* Provider */}
        {service.provider && (
          <div className="mt-3 flex items-center gap-2 border-t border-gold/10 pt-3">
            <div className="flex size-7 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
              <span className="text-xs font-bold text-gold">
                {service.provider.name?.charAt(0) ?? 'P'}
              </span>
            </div>
            <span className="truncate text-xs font-medium text-muted-foreground">
              by {service.provider.name}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="font-serif text-xl font-bold text-gold">
              ${service.price.toLocaleString()}
            </span>
            <span className="ml-1 text-xs text-muted-foreground">/ session</span>
          </div>
          <motion.div
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.9 }}
            className="flex size-8 items-center justify-center rounded-full border border-gold/20 bg-gold/5 text-gold transition-all duration-300 group-hover:border-gold/40 group-hover:bg-gold/10"
          >
            <ArrowLeft className="size-4 rotate-180" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Empty State                                                               */
/* -------------------------------------------------------------------------- */

function EmptyState({ onClear }: { onClear: () => void }) {
  const setSelectedCategory = useAppStore((s) => s.setSelectedCategory);
  const setSortBy = useAppStore((s) => s.setSortBy);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const setSelectedLocation = useAppStore((s) => s.setSelectedLocation);
  const setPriceRange = useAppStore((s) => s.setPriceRange);

  const handleCategoryClick = useCallback(
    (cat: string) => {
      setSelectedCategory(cat);
      setSortBy('featured');
      setSearchQuery('');
      setSelectedLocation('');
      setPriceRange([0, 50000]);
    },
    [setSelectedCategory, setSortBy, setSearchQuery, setSelectedLocation, setPriceRange],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-gold/10">
        <Search className="size-8 text-gold/50" />
      </div>
      <h3 className="font-serif text-2xl font-semibold text-white">
        No Services Found
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        We couldn&apos;t find any services matching your current filters. Try broadening your search
        criteria or explore a different category.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
        <Button
          onClick={onClear}
          className="h-10 rounded-lg bg-gradient-to-r from-gold-dark to-gold px-6 text-sm font-semibold text-black hover:brightness-110"
        >
          Clear All Filters
        </Button>
      </div>
      <p className="mt-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Or browse by category
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {['Fine Dining', 'Yacht & Charter', 'Wine & Spirits', 'Adventure & Sports', 'Beauty & Wellness'].map((cat) => (
          <Badge
            key={cat}
            variant="outline"
            onClick={() => handleCategoryClick(cat)}
            className="cursor-pointer border-gold/20 text-xs text-gold hover:border-gold/40 hover:bg-gold/5 transition-colors"
          >
            {cat}
          </Badge>
        ))}
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Service Listing Page (exported)                                           */
/* -------------------------------------------------------------------------- */

export function ServiceListingPage() {
  const {
    searchQuery,
    selectedCategory,
    priceRange,
    sortBy,
    selectedLocation,
    setSearchQuery,
    setSelectedCategory,
    setPriceRange,
    setSortBy,
    setSelectedLocation,
  } = useAppStore();

  const compareIds = useAppStore((s) => s.compareIds);
  const toggleCompare = useAppStore((s) => s.toggleCompare);
  const clearCompare = useAppStore((s) => s.clearCompare);

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [compareServicesData, setCompareServicesData] = useState<Service[]>([]);
  const [compareLoading, setCompareLoading] = useState(false);

  // Local state for price inputs (string for controlled inputs)
  const [minPriceStr, setMinPriceStr] = useState('');
  const [maxPriceStr, setMaxPriceStr] = useState('');

  // Sync price range from store to local state on mount
  useEffect(() => {
    setMinPriceStr(priceRange[0] === 0 ? '' : String(priceRange[0]));
    setMaxPriceStr(priceRange[1] === 50000 ? '' : String(priceRange[1]));
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery !== '' ||
      selectedCategory !== 'all' ||
      minPriceStr !== '' ||
      maxPriceStr !== '' ||
      sortBy !== 'featured' ||
      selectedLocation !== ''
    );
  }, [searchQuery, selectedCategory, minPriceStr, maxPriceStr, sortBy, selectedLocation]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange([0, 50000]);
    setSortBy('featured');
    setSelectedLocation('');
    setMinPriceStr('');
    setMaxPriceStr('');
  }, [setSearchQuery, setSelectedCategory, setPriceRange, setSortBy, setSelectedLocation]);

  const handleMinPriceChange = useCallback(
    (v: string) => {
      setMinPriceStr(v);
      const num = v === '' ? 0 : parseFloat(v);
      if (!isNaN(num)) {
        setPriceRange([num, priceRange[1]]);
      }
    },
    [priceRange, setPriceRange]
  );

  const handleMaxPriceChange = useCallback(
    (v: string) => {
      setMaxPriceStr(v);
      const num = v === '' ? 50000 : parseFloat(v);
      if (!isNaN(num)) {
        setPriceRange([priceRange[0], num]);
      }
    },
    [priceRange, setPriceRange]
  );

  // Fetch services
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function fetchServices() {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        if (selectedCategory && selectedCategory !== 'all') {
          params.set('category', selectedCategory);
        }
        if (searchQuery) {
          params.set('search', searchQuery);
        }
        if (priceRange[0] > 0) {
          params.set('minPrice', String(priceRange[0]));
        }
        if (priceRange[1] < 50000) {
          params.set('maxPrice', String(priceRange[1]));
        }
        if (sortBy && sortBy !== 'featured') {
          params.set('sort', sortBy);
        } else {
          params.set('sort', 'createdAt');
        }
        if (selectedLocation) {
          params.set('location', selectedLocation);
        }

        const res = await fetch(`/api/services?${params.toString()}`, {
          signal: controller.signal,
        });
        if (res.ok && !cancelled) {
          const data = await res.json();
          setServices(data.services ?? []);
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

    // Debounce search and location
    const timer = setTimeout(fetchServices, 300);
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [selectedCategory, searchQuery, priceRange, sortBy, selectedLocation]);

  const filterPanelProps: FilterPanelProps = {
    searchQuery,
    selectedCategory,
    minPrice: minPriceStr,
    maxPrice: maxPriceStr,
    sortBy,
    selectedLocation,
    onSearchChange: setSearchQuery,
    onCategoryChange: setSelectedCategory,
    onMinPriceChange: handleMinPriceChange,
    onMaxPriceChange: handleMaxPriceChange,
    onSortChange: setSortBy,
    onLocationChange: setSelectedLocation,
    onClearFilters: clearFilters,
    hasActiveFilters,
  };

  const handleRemoveCompare = useCallback(
    (id: string) => {
      toggleCompare(id);
      setCompareServicesData((prev) => prev.filter((s) => s.id !== id));
      if (compareIds.length <= 2) {
        setCompareDialogOpen(false);
      }
    },
    [toggleCompare, compareIds.length],
  );

  const handleCompareNow = useCallback(async () => {
    if (compareIds.length < 1) return;
    setCompareLoading(true);
    try {
      const results = await Promise.all(
        compareIds.map(async (id) => {
          const res = await fetch(`/api/services?id=${id}`);
          if (!res.ok) return null;
          const data = await res.json();
          return data.service as Service;
        }),
      );
      const valid = results.filter((s): s is Service => s !== null);
      setCompareServicesData(valid);
      setCompareDialogOpen(true);
    } catch {
      toast.error('Failed to load services for comparison');
    } finally {
      setCompareLoading(false);
    }
  }, [compareIds]);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Decorative top line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Floating Compare Bar */}
      <AnimatePresence>
        {compareIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 border-t border-gold/20 bg-[#0D0D0D]/95 px-6 py-3.5 shadow-[0_-8px_32px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-gold/10">
                  <GitCompareArrows className="size-4 text-gold" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white">
                    {compareIds.length}/3 services selected
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Choose up to 3 to compare side by side
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => clearCompare()}
                  variant="ghost"
                  className="h-9 rounded-lg border border-gold/15 px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-gold/30 hover:bg-gold/5 hover:text-white"
                >
                  <X className="mr-1.5 size-3.5" />
                  Clear
                </Button>
                <Button
                  onClick={handleCompareNow}
                  disabled={compareIds.length < 2 || compareLoading}
                  className="h-9 rounded-lg bg-gradient-to-r from-gold-dark to-gold px-5 text-xs font-semibold text-black hover:brightness-110 disabled:opacity-50"
                >
                  {compareLoading ? (
                    <span className="inline-block size-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      Compare Now
                      <ArrowLeft className="ml-1.5 size-3.5 rotate-180" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Dialog */}
      <ComparisonDialog
        open={compareDialogOpen}
        onOpenChange={setCompareDialogOpen}
        services={compareServicesData}
        loading={compareLoading}
        onRemove={handleRemoveCompare}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-6 bg-gold/50" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold">
                Marketplace
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Luxury Services
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block size-3 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                  Discovering exclusive experiences...
                </span>
              ) : (
                <>
                  <span className="text-white font-medium">{services.length}</span> premium service
                  {services.length !== 1 ? 's' : ''} available
                </>
              )}
            </p>
          </div>

          {/* Mobile filter toggle */}
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="h-10 border-gold/20 text-sm text-gold hover:border-gold/40 hover:bg-gold/5 lg:hidden"
              >
                <SlidersHorizontal className="mr-2 size-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 flex size-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-black">
                    !
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full border-gold/15 bg-[#111] p-6 sm:max-w-sm">
              <SheetHeader>
                <SheetTitle className="font-serif text-lg text-white">
                  Filters & Sort
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 max-h-[calc(100vh-120px)] overflow-y-auto">
                <FilterPanel {...filterPanelProps} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active filters bar */}
        <AnimatePresence>
          {hasActiveFilters && !loading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 flex flex-wrap items-center gap-2"
            >
              {selectedCategory !== 'all' && (
                <FilterChip
                  label={selectedCategory}
                  onRemove={() => setSelectedCategory('all')}
                />
              )}
              {searchQuery && (
                <FilterChip
                  label={`"${searchQuery}"`}
                  onRemove={() => setSearchQuery('')}
                />
              )}
              {(minPriceStr || maxPriceStr) && (
                <FilterChip
                  label={`$${minPriceStr || '0'} – $${maxPriceStr || '50k'}`}
                  onRemove={() => {
                    setMinPriceStr('');
                    setMaxPriceStr('');
                    setPriceRange([0, 50000]);
                  }}
                />
              )}
              {selectedLocation && (
                <FilterChip
                  label={selectedLocation}
                  onRemove={() => setSelectedLocation('')}
                />
              )}
              {sortBy !== 'featured' && (
                <FilterChip
                  label={SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? sortBy}
                  onRemove={() => setSortBy('featured')}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content: Sidebar + Grid */}
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24 rounded-xl border border-gold/12 bg-gradient-to-b from-[#1A1A1A] to-[#141414] p-6">
              <h2 className="mb-6 flex items-center gap-2 font-serif text-sm font-semibold text-white">
                <SlidersHorizontal className="size-4 text-gold" />
                Filters & Sort
              </h2>
              <FilterPanel {...filterPanelProps} />
            </div>
          </aside>

          {/* Service Grid */}
          <div className="min-w-0 flex-1">
            {loading ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : services.length === 0 ? (
              <EmptyState onClear={clearFilters} />
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
              >
                {services.map((service, i) => (
                  <ServiceCard key={service.id} service={service} index={i} />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Comparison Row                                                            */
/* -------------------------------------------------------------------------- */

function ComparisonRow({
  label,
  cols,
  children,
}: {
  label: string;
  cols: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gold">
        {label}
      </div>
      <div
        className="grid gap-4 rounded-lg border border-gold/10 bg-surface/50 p-3"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Comparison Dialog                                                         */
/* -------------------------------------------------------------------------- */

function ComparisonDialog({
  open,
  onOpenChange,
  services,
  loading,
  onRemove,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: Service[];
  loading: boolean;
  onRemove: (id: string) => void;
}) {
  const clearCompare = useAppStore((s) => s.clearCompare);
  const setSelectedService = useAppStore((s) => s.setSelectedService);
  const setView = useAppStore((s) => s.setView);

  const cols = services.length;

  const handleViewService = useCallback(
    (svc: Service) => {
      setSelectedService(svc);
      setView('service-detail');
      onOpenChange(false);
    },
    [setSelectedService, setView, onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto border-gold/20 bg-[#111]">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-white">
            Compare Services
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Side-by-side comparison of {services.length} service{services.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="mb-3 inline-block size-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading service details…</p>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Column Headers with images */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
              {services.map((svc) => {
                const img = getFirstImage(svc);
                return (
                  <div key={svc.id} className="space-y-3 text-center">
                    <div
                      className="relative mx-auto aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-lg border border-gold/15 transition-all hover:border-gold/40 hover:shadow-lg hover:shadow-gold/5"
                      onClick={() => handleViewService(svc)}
                    >
                      {img ? (
                        <img src={img} alt={svc.title} className="size-full object-cover" />
                      ) : (
                        <div className="size-full bg-gradient-to-br from-gold/15 to-gold-dark/15" />
                      )}
                    </div>
                    <h4 className="font-serif text-sm font-semibold leading-tight text-white">
                      {svc.title}
                    </h4>
                    <button
                      onClick={() => onRemove(svc.id)}
                      className="inline-flex items-center gap-1 text-xs text-red-400 transition-colors hover:text-red-300"
                    >
                      <Trash2 className="size-3" />
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="h-px bg-gold/15" />

            {/* Title row */}
            <ComparisonRow label="Title" cols={cols}>
              {services.map((svc) => (
                <div key={svc.id} className="text-center">
                  <p className="text-sm font-semibold leading-tight text-white">{svc.title}</p>
                </div>
              ))}
            </ComparisonRow>

            {/* Category row */}
            <ComparisonRow label="Category" cols={cols}>
              {services.map((svc) => (
                <div key={svc.id} className="text-center">
                  <Badge className="border-gold/25 bg-gold/10 text-[11px] text-gold">
                    {svc.category}
                  </Badge>
                </div>
              ))}
            </ComparisonRow>

            {/* Price row */}
            <ComparisonRow label="Price" cols={cols}>
              {services.map((svc) => (
                <div key={svc.id} className="text-center">
                  <span className="font-serif text-lg font-bold text-gold">
                    ${svc.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground"> / session</span>
                </div>
              ))}
            </ComparisonRow>

            {/* Duration row */}
            <ComparisonRow label="Duration" cols={cols}>
              {services.map((svc) => (
                <div key={svc.id} className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="size-3.5 text-gold/60" />
                  {svc.duration}
                </div>
              ))}
            </ComparisonRow>

            {/* Location row */}
            <ComparisonRow label="Location" cols={cols}>
              {services.map((svc) => (
                <div key={svc.id} className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5 text-gold/60" />
                  <span className="truncate">{svc.location}</span>
                </div>
              ))}
            </ComparisonRow>

            {/* Rating row */}
            <ComparisonRow label="Rating" cols={cols}>
              {services.map((svc) => (
                <div key={svc.id} className="flex flex-col items-center gap-1">
                  <StarRating rating={svc.rating} size="md" />
                  <span className="text-xs text-muted-foreground">
                    ({svc.reviewCount} {svc.reviewCount === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              ))}
            </ComparisonRow>

            {/* Provider row */}
            <ComparisonRow label="Provider" cols={cols}>
              {services.map((svc) => (
                <div key={svc.id} className="flex items-center justify-center gap-2">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
                    <span className="text-xs font-bold text-gold">
                      {svc.provider?.name?.charAt(0) ?? 'P'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {svc.provider?.name ?? 'Unknown'}
                    </p>
                    {svc.provider?.verified && (
                      <span className="text-[10px] text-gold">Verified</span>
                    )}
                  </div>
                </div>
              ))}
            </ComparisonRow>

            {/* Description row */}
            <ComparisonRow label="Description" cols={cols}>
              {services.map((svc) => (
                <div key={svc.id} className="text-xs leading-relaxed text-muted-foreground">
                  <p className="line-clamp-4">{svc.description}</p>
                </div>
              ))}
            </ComparisonRow>

            {/* Clear All button */}
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  clearCompare();
                  onOpenChange(false);
                }}
                className="w-full border-gold/20 text-sm text-gold hover:border-gold/40 hover:bg-gold/5 hover:text-gold"
              >
                <Trash2 className="mr-2 size-4" />
                Clear All
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Filter Chip                                                               */
/* -------------------------------------------------------------------------- */

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/5 px-3 py-1"
    >
      <span className="text-xs font-medium text-gold">{label}</span>
      <button
        onClick={onRemove}
        className="flex size-4 items-center justify-center rounded-full text-gold/60 transition-colors hover:bg-gold/20 hover:text-gold"
      >
        <X className="size-3" />
      </button>
    </motion.div>
  );
}
