'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Mail,
  Bell,
  CalendarCheck,
  XCircle,
  CreditCard,
  Star,
  Shield,
  UserPlus,
  KeyRound,
  CheckCircle,
  AlertCircle,
  Eye,
  Clock,
  Inbox,
} from 'lucide-react';
import { toast } from 'sonner';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface EmailLogEntry {
  id: string;
  type: string;
  subject: string;
  body: string;
  recipient: string;
  status: string;
  createdAt: string;
}

interface EmailPreferences {
  emailNotifications: boolean;
  bookingUpdates: boolean;
  promotionalEmails: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getEmailTypeIcon(type: string) {
  switch (type) {
    case 'booking_confirmed': return CalendarCheck;
    case 'booking_cancelled': return XCircle;
    case 'payment_received': return CreditCard;
    case 'review_received': return Star;
    case 'provider_verified': return Shield;
    case 'welcome': return UserPlus;
    case 'reset_password': return KeyRound;
    default: return Mail;
  }
}

function getEmailTypeColor(type: string) {
  switch (type) {
    case 'booking_confirmed': return 'text-emerald-400 bg-emerald-500/10';
    case 'booking_cancelled': return 'text-red-400 bg-red-500/10';
    case 'payment_received': return 'text-gold bg-gold/10';
    case 'review_received': return 'text-blue-400 bg-blue-500/10';
    case 'provider_verified': return 'text-emerald-400 bg-emerald-500/10';
    case 'welcome': return 'text-purple-400 bg-purple-500/10';
    case 'reset_password': return 'text-amber-400 bg-amber-500/10';
    default: return 'text-muted-foreground bg-surface';
  }
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

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

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function EmailNotifications() {
  const { user } = useAppStore();

  const [logs, setLogs] = useState<EmailLogEntry[]>([]);
  const [preferences, setPreferences] = useState<EmailPreferences>({
    emailNotifications: true,
    bookingUpdates: true,
    promotionalEmails: false,
  });
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Fetch email logs and preferences
  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/emails?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs ?? []);
        if (data.preferences) {
          setPreferences({
            emailNotifications: data.preferences.emailNotifications,
            bookingUpdates: data.preferences.bookingUpdates,
            promotionalEmails: data.preferences.promotionalEmails,
          });
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Toggle preference and persist
  const handleTogglePref = useCallback(
    async (key: keyof EmailPreferences, value: boolean) => {
      setPreferences((prev) => ({ ...prev, [key]: value }));
      if (!user) return;

      setSavingPrefs(true);
      try {
        const res = await fetch('/api/emails', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, [key]: value }),
        });
        if (res.ok) {
          toast.success('Preference updated', {
            description: 'Your email preference has been saved.',
          });
        } else {
          toast.error('Failed to update', {
            description: 'Could not save your preference.',
          });
        }
      } catch {
        toast.error('Error', { description: 'Failed to update preference.' });
      } finally {
        setSavingPrefs(false);
      }
    },
    [user],
  );

  // Render email log entry
  const renderLogEntry = (entry: EmailLogEntry, index: number) => {
    const Icon = getEmailTypeIcon(entry.type);
    const colorClass = getEmailTypeColor(entry.type);
    const isSent = entry.status === 'sent';
    const isSuppressed = entry.status === 'suppressed';

    return (
      <motion.div
        key={entry.id}
        variants={fadeUp}
        custom={index}
        className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface/50 transition-colors group"
      >
        {/* Icon */}
        <div className={`flex size-9 items-center justify-center rounded-lg shrink-0 mt-0.5 ${colorClass}`}>
          <Icon className="size-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-medium text-foreground truncate">{entry.subject}</p>
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 shrink-0 ${
                isSent
                  ? 'border-emerald-500/30 text-emerald-400'
                  : isSuppressed
                    ? 'border-amber-500/30 text-amber-400'
                    : 'border-red-500/30 text-red-400'
              }`}
            >
              {isSent ? (
                <><CheckCircle className="size-2.5 mr-0.5" /> Sent</>
              ) : isSuppressed ? (
                <><AlertCircle className="size-2.5 mr-0.5" /> Suppressed</>
              ) : (
                <><XCircle className="size-2.5 mr-0.5" /> Failed</>
              )}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground/70 truncate">{entry.body}</p>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground/50">
            <Clock className="size-3" />
            {formatRelativeTime(entry.createdAt)}
            <span className="text-muted-foreground/30">•</span>
            <Mail className="size-3" />
            {entry.recipient}
          </div>
        </div>
      </motion.div>
    );
  };

  if (!user) return null;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-6"
    >
      {/* ======================== EMAIL PREFERENCES ======================== */}
      <motion.div variants={fadeUp} custom={0}>
        <Card className="overflow-hidden border-gold/10 bg-[#111]">
          <CardHeader className="border-b border-gold/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gold/10">
                <Mail className="size-5 text-gold" />
              </div>
              <div>
                <CardTitle className="font-serif text-lg text-white">
                  Email Preferences
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Manage how you receive notifications
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 p-6">
            {/* Email notifications master toggle */}
            <div className="flex items-center justify-between rounded-xl px-2 py-3 transition-colors hover:bg-surface/50">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-surface">
                  <Bell className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive updates via email</p>
                </div>
              </div>
              <Switch
                checked={preferences.emailNotifications}
                onCheckedChange={(v) => handleTogglePref('emailNotifications', v)}
                disabled={savingPrefs}
                className="data-[state=checked]:bg-gold"
              />
            </div>

            <Separator className="bg-gold/10" />

            {/* Booking updates */}
            <div className="flex items-center justify-between rounded-xl px-2 py-3 transition-colors hover:bg-surface/50">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-surface">
                  <CalendarCheck className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Booking Updates</p>
                  <p className="text-xs text-muted-foreground">Get notified about booking status changes</p>
                </div>
              </div>
              <Switch
                checked={preferences.bookingUpdates}
                onCheckedChange={(v) => handleTogglePref('bookingUpdates', v)}
                disabled={savingPrefs}
                className="data-[state=checked]:bg-gold"
              />
            </div>

            <Separator className="bg-gold/10" />

            {/* Promotional emails */}
            <div className="flex items-center justify-between rounded-xl px-2 py-3 transition-colors hover:bg-surface/50">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-surface">
                  <Eye className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Promotional Emails</p>
                  <p className="text-xs text-muted-foreground">Receive special offers and new service alerts</p>
                </div>
              </div>
              <Switch
                checked={preferences.promotionalEmails}
                onCheckedChange={(v) => handleTogglePref('promotionalEmails', v)}
                disabled={savingPrefs}
                className="data-[state=checked]:bg-gold"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ======================== EMAIL HISTORY ======================== */}
      <motion.div variants={fadeUp} custom={1}>
        <Card className="overflow-hidden border-gold/10 bg-[#111]">
          <CardHeader className="border-b border-gold/10 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gold/10">
                  <Inbox className="size-5 text-gold" />
                </div>
                <div>
                  <CardTitle className="font-serif text-lg text-white">
                    Notification History
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    View your email history and manage preferences
                  </CardDescription>
                </div>
              </div>
              {logs.length > 0 && (
                <Badge variant="outline" className="border-gold/20 text-gold text-xs">
                  {logs.length}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="size-9 rounded-lg bg-surface" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 rounded bg-surface" />
                      <Skeleton className="h-3 w-1/2 rounded bg-surface" />
                    </div>
                  </div>
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-gold/5">
                  <Mail className="size-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No email notifications yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Email notifications will appear here when they are sent.</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-1 custom-scrollbar">
                {logs.map((entry, i) => renderLogEntry(entry, i))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
