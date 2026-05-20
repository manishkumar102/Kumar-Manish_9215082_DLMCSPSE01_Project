'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CalendarCheck,
  Star,
  Bell,
  MessageSquare,
  ChevronDown,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface ActivityFeedProps {
  userId: string;
  role: 'client' | 'provider';
  limit?: number;
}

interface UnifiedActivity {
  id: string;
  type: 'booking' | 'review' | 'notification' | 'message';
  title: string;
  description?: string;
  timestamp: string;
  status?: string;
  statusBadge?: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  metadata?: {
    serviceTitle?: string;
    providerName?: string;
    clientName?: string;
    amount?: number;
    rating?: number;
  };
}

/* -------------------------------------------------------------------------- */
/*  Relative time helper                                                       */
/* -------------------------------------------------------------------------- */

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Recently';

  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  if (diffWeek < 4) return `${diffWeek} week${diffWeek !== 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* -------------------------------------------------------------------------- */
/*  Activity icon config                                                       */
/* -------------------------------------------------------------------------- */

const ACTIVITY_ICONS: Record<
  UnifiedActivity['type'],
  { icon: typeof CalendarCheck; color: string; bg: string }
> = {
  booking: { icon: CalendarCheck, color: 'text-gold', bg: 'bg-gold/15' },
  review: { icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/15' },
  notification: { icon: Bell, color: 'text-gold-light', bg: 'bg-gold-light/10' },
  message: { icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
};

/* -------------------------------------------------------------------------- */
/*  Status badge config                                                        */
/* -------------------------------------------------------------------------- */

const STATUS_BADGE_MAP: Record<string, string> = {
  confirmed: 'status-badge-confirmed',
  accepted: 'status-badge-confirmed',
  pending: 'status-badge-pending',
  cancelled: 'status-badge-cancelled',
  completed: 'status-badge-completed',
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_BADGE_MAP[status];
  if (!cls) return null;
  return <span className={cls}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                        */
/* -------------------------------------------------------------------------- */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

// @ts-expect-error -- framer-motion filter property type mismatch
const itemVariants = {
  hidden: { opacity: 0, x: -16, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    x: 16,
    filter: 'blur(4px)',
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

/* -------------------------------------------------------------------------- */
/*  Skeleton loader                                                           */
/* -------------------------------------------------------------------------- */

function FeedSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {/* Dot + line */}
          <div className="flex flex-col items-center">
            <div className="skeleton-gold size-[10px] rounded-full shrink-0" />
            {i < 4 && <div className="skeleton-gold w-[2px] flex-1 my-1 min-h-[48px]" />}
          </div>
          {/* Content */}
          <div className="flex-1 pb-5 space-y-2">
            <div className="flex items-center gap-2">
              <div className="skeleton-gold size-7 rounded-lg shrink-0" />
              <div className="skeleton-gold h-4 w-3/5 rounded" />
            </div>
            <div className="skeleton-gold h-3 w-4/5 rounded pl-9" />
            <div className="skeleton-gold h-3 w-20 rounded pl-9" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Empty state                                                               */
/* -------------------------------------------------------------------------- */

function EmptyFeedState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center gap-3 py-12 text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-gold/10 empty-icon-bounce">
        <Activity className="size-6 text-gold/50" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">No activity yet</p>
        <p className="mt-1 text-xs text-muted-foreground/60">
          Your recent activity will appear here
        </p>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Single timeline item                                                       */
/* -------------------------------------------------------------------------- */

interface TimelineItemProps {
  activity: UnifiedActivity;
  index: number;
  isLast: boolean;
}

function TimelineItem({ activity, index, isLast }: TimelineItemProps) {
  const iconConfig = ACTIVITY_ICONS[activity.type];
  const IconComponent = iconConfig.icon;

  return (
    <motion.div
      custom={index}
      variants={itemVariants}
      className="group flex gap-4"
    >
      {/* Timeline track */}
      <div className="flex flex-col items-center">
        <div className="timeline-dot" style={{ animationDelay: `${index * 70}ms` }} />
        {!isLast && <div className="timeline-line flex-1 my-1 min-h-[12px]" />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-5 min-w-0">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${iconConfig.bg}`}
          >
            <IconComponent className={`size-[14px] ${iconConfig.color}`} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-snug text-white truncate">
              {activity.title}
            </p>
            {activity.description && (
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {activity.description}
              </p>
            )}

            {/* Bottom row: time + status */}
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                <Clock className="size-3" />
                {getRelativeTime(activity.timestamp)}
              </span>
              {activity.statusBadge && (
                <StatusBadge status={activity.statusBadge} />
              )}
              {activity.type === 'review' && activity.metadata?.rating && (
                <span className="flex items-center gap-0.5 text-[11px] text-amber-400">
                  <Star className="size-3 fill-amber-400 text-amber-400" />
                  {activity.metadata.rating}
                </span>
              )}
              {activity.type === 'booking' && activity.metadata?.amount != null && (
                <span className="text-[11px] font-medium text-gold">
                  ${activity.metadata.amount.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ActivityFeed component                                                     */
/* -------------------------------------------------------------------------- */

export function ActivityFeed({ userId, role, limit: initialLimit = 5 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<UnifiedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(initialLimit);
  const [hasMore, setHasMore] = useState(false);

  /* ---- Fetch and merge activities ---- */
  const fetchActivities = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const allActivities: UnifiedActivity[] = [];

      // 1) Bookings
      const bookingParam = role === 'client' ? `clientId=${userId}` : `providerId=${userId}`;
      const [bookingsRes, notificationsRes, reviewsRes] = await Promise.all([
        fetch(`/api/bookings?${bookingParam}`),
        fetch(`/api/notifications?userId=${userId}`),
        role === 'client' ? fetch(`/api/reviews?clientId=${userId}`) : Promise.resolve({ ok: false }),
      ]);

      // Parse bookings
      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        const bookings = data.bookings ?? [];
        for (const b of bookings) {
          const serviceTitle = b.service?.title ?? 'a service';
          const actionMap: Record<string, string> = {
            pending: 'Requested booking for',
            accepted: 'Booking confirmed for',
            completed: 'Completed booking for',
            rejected: 'Booking declined for',
            cancelled: 'Cancelled booking for',
          };
          const action = actionMap[b.status] ?? 'Booked';
          const who =
            role === 'client'
              ? (b.provider?.name ? ` with ${b.provider.name}` : '')
              : (b.client?.name ? ` by ${b.client.name}` : '');

          const badgeMap: Record<string, UnifiedActivity['statusBadge']> = {
            accepted: 'confirmed',
            completed: 'completed',
            pending: 'pending',
            cancelled: 'cancelled',
            rejected: 'cancelled',
          };

          allActivities.push({
            id: `booking-${b.id}`,
            type: 'booking',
            title: `${action} '${serviceTitle}'${who}`,
            description: b.date ? `Scheduled for ${b.date}` : undefined,
            timestamp: b.createdAt,
            status: b.status,
            statusBadge: badgeMap[b.status],
            metadata: {
              serviceTitle,
              providerName: b.provider?.name,
              clientName: b.client?.name,
              amount: b.totalPrice,
            },
          });
        }
      }

      // Parse notifications
      if (notificationsRes.ok) {
        const data = await notificationsRes.json();
        const notifications = data.notifications ?? [];
        for (const n of notifications) {
          const typeMap: Record<string, UnifiedActivity['type']> = {
            booking: 'booking',
            message: 'message',
            review: 'review',
            system: 'notification',
          };
          allActivities.push({
            id: `notif-${n.id}`,
            type: typeMap[n.type] ?? 'notification',
            title: n.title,
            description: n.message,
            timestamp: n.createdAt,
          });
        }
      }

      // Parse reviews (client only)
      if (reviewsRes && (reviewsRes as Response).ok) {
        const data = await (reviewsRes as Response).json();
        const reviews = data.reviews ?? [];
        for (const r of reviews) {
          const stars = r.rating ?? 0;
          allActivities.push({
            id: `review-${r.id}`,
            type: 'review',
            title: `Left a ${stars}-star review`,
            description: r.comment || undefined,
            timestamp: r.createdAt,
            metadata: {
              rating: stars,
            },
          });
        }
      }

      // Sort by date (most recent first)
      allActivities.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Deduplicate by id
      const seen = new Set<string>();
      const deduped = allActivities.filter((a) => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      });

      setActivities(deduped);
      setHasMore(deduped.length > initialLimit);
    } catch {
      // Silently fail — empty state is shown
    } finally {
      setLoading(false);
    }
  }, [userId, role, initialLimit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  /* ---- Visible slice ---- */
  const visibleActivities = useMemo(
    () => activities.slice(0, visibleCount),
    [activities, visibleCount],
  );

  /* ---- Handlers ---- */
  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => {
      const next = prev + initialLimit;
      if (next >= activities.length) setHasMore(false);
      return next;
    });
  }, [activities.length, initialLimit]);

  /* ---- Render ---- */
  return (
    <div className="luxury-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gold/10 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gold/10">
            <Activity className="size-4 text-gold" />
          </div>
          <div>
            <h3 className="text-sm font-serif font-semibold text-white">Activity Feed</h3>
            <p className="text-[11px] text-muted-foreground">
              {loading ? 'Loading...' : `${activities.length} activit${activities.length !== 1 ? 'ies' : 'y'}`}
            </p>
          </div>
        </div>
        {!loading && activities.length > 0 && (
          <Badge variant="outline" className="border-gold/20 bg-gold/5 text-gold text-[10px] px-2 py-0.5">
            Live
          </Badge>
        )}
      </div>

      {/* Feed body */}
      <div className="px-5 py-4 max-h-[480px] overflow-y-auto">
        {loading ? (
          <FeedSkeleton />
        ) : activities.length === 0 ? (
          <EmptyFeedState />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`feed-${visibleCount}`}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={containerVariants}
            >
              {visibleActivities.map((activity, i) => (
                <TimelineItem
                  key={activity.id}
                  activity={activity}
                  index={i}
                  isLast={i === visibleActivities.length - 1 && !hasMore}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Load More */}
      {hasMore && !loading && (
        <div className="border-t border-gold/10 px-5 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLoadMore}
            className="w-full text-xs font-medium text-gold hover:text-gold-light hover:bg-gold/10 gap-1.5"
          >
            <ChevronDown className="size-3.5" />
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
