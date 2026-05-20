'use client';

import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Shared skeleton helper                                                     */
/* -------------------------------------------------------------------------- */

interface SkeletonBlockProps {
  className?: string;
}

function SkeletonBlock({ className }: SkeletonBlockProps) {
  return (
    <div
      className={cn(
        'rounded-md skeleton-gold',
        className,
      )}
      aria-hidden="true"
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  ServiceCardSkeleton                                                        */
/* -------------------------------------------------------------------------- */

export function ServiceCardSkeleton() {
  return (
    <div
      className="luxury-card overflow-hidden rounded-xl"
      role="status"
      aria-label="Loading service card"
    >
      {/* Image area */}
      <SkeletonBlock className="aspect-[4/3] w-full rounded-none" />

      {/* Content area */}
      <div className="space-y-3 p-5">
        {/* Category + Featured badge row */}
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-5 w-24" />
          <SkeletonBlock className="h-5 w-16" />
        </div>

        {/* Title */}
        <SkeletonBlock className="h-5 w-full" />

        {/* Description */}
        <SkeletonBlock className="h-4 w-3/4" />

        {/* Location row */}
        <SkeletonBlock className="h-4 w-1/2" />

        {/* Rating row */}
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-3 w-14" />
        </div>

        {/* Provider row */}
        <div className="flex items-center gap-2 border-t border-gold/10 pt-3">
          <SkeletonBlock className="size-7 shrink-0 rounded-full" />
          <SkeletonBlock className="h-4 w-24" />
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between pt-1">
          <SkeletonBlock className="h-6 w-20" />
          <SkeletonBlock className="size-8 shrink-0 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ServiceGridSkeleton                                                        */
/* -------------------------------------------------------------------------- */

interface ServiceGridSkeletonProps {
  count?: number;
}

export function ServiceGridSkeleton({ count = 6 }: ServiceGridSkeletonProps) {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
      role="status"
      aria-label="Loading services grid"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ServiceCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  DashboardSkeleton                                                          */
/* -------------------------------------------------------------------------- */

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading dashboard">
      {/* ── Page header ── */}
      <div className="space-y-2">
        <SkeletonBlock className="h-4 w-32" />
        <SkeletonBlock className="h-8 w-56" />
        <SkeletonBlock className="h-4 w-48" />
      </div>

      {/* ── Stat cards row ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="luxury-card overflow-hidden rounded-xl">
            <div className="flex items-center gap-4 p-5">
              <SkeletonBlock className="size-10 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-3 w-20" />
                <SkeletonBlock className="h-6 w-16" />
              </div>
              <SkeletonBlock className="h-8 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Table area ── */}
      <div className="luxury-card overflow-hidden rounded-xl">
        {/* Table header */}
        <div className="flex items-center justify-between border-b border-gold/10 px-6 py-4">
          <SkeletonBlock className="h-5 w-36" />
          <SkeletonBlock className="h-8 w-24 rounded-lg" />
        </div>

        {/* Table rows */}
        <div className="divide-y divide-gold/8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <SkeletonBlock className="size-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <SkeletonBlock className="h-4 w-40" />
                <SkeletonBlock className="h-3 w-24" />
              </div>
              <SkeletonBlock className="h-5 w-20 rounded-full" />
              <SkeletonBlock className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  DetailSkeleton                                                             */
/* -------------------------------------------------------------------------- */

export function DetailSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-8 lg:grid-cols-3"
      role="status"
      aria-label="Loading detail page"
    >
      {/* ── Left: Image + Content (2/3) ── */}
      <div className="space-y-6 lg:col-span-2">
        {/* Back button */}
        <SkeletonBlock className="h-4 w-32" />

        {/* Main image area */}
        <SkeletonBlock className="aspect-[16/9] w-full rounded-xl" />

        {/* Thumbnail row */}
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="size-16 shrink-0 rounded-lg" />
          ))}
        </div>

        {/* Badges */}
        <div className="flex gap-2">
          <SkeletonBlock className="h-6 w-24 rounded-full" />
          <SkeletonBlock className="h-6 w-16 rounded-full" />
          <SkeletonBlock className="h-6 w-20 rounded-full" />
        </div>

        {/* Title */}
        <SkeletonBlock className="h-10 w-3/4" />

        {/* Description lines */}
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-5/6" />
          <SkeletonBlock className="h-4 w-2/3" />
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-gold/10 p-4">
              <SkeletonBlock className="h-3 w-16" />
              <SkeletonBlock className="h-5 w-24" />
            </div>
          ))}
        </div>

        {/* Reviews section header */}
        <SkeletonBlock className="h-6 w-28" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-gold/10 p-5">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="size-10 rounded-full" />
                <div className="space-y-1.5">
                  <SkeletonBlock className="h-4 w-28" />
                  <SkeletonBlock className="h-3 w-16" />
                </div>
              </div>
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Sidebar (1/3) ── */}
      <div className="space-y-6">
        {/* Booking card */}
        <div className="luxury-card overflow-hidden rounded-xl">
          <div className="space-y-1 border-b border-gold/10 px-6 py-4">
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="h-3 w-52" />
          </div>

          <div className="space-y-4 p-6">
            {/* Price */}
            <SkeletonBlock className="h-8 w-32" />
            <SkeletonBlock className="h-3 w-20" />

            {/* Form fields */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <SkeletonBlock className="h-3 w-20" />
                <SkeletonBlock className="h-10 w-full rounded-lg" />
              </div>
            ))}

            {/* Time slot grid */}
            <SkeletonBlock className="h-3 w-12" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-9 rounded-lg" />
              ))}
            </div>

            {/* Submit button */}
            <SkeletonBlock className="h-12 w-full rounded-lg" />
          </div>
        </div>

        {/* Provider card */}
        <div className="luxury-card overflow-hidden rounded-xl p-5">
          <div className="flex items-center gap-4">
            <SkeletonBlock className="size-14 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-3 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
