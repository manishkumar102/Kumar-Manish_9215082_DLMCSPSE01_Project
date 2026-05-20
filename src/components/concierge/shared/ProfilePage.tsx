'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, type User } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  FileText,
  Shield,
  Crown,
  Star,
  Package,
  MessageSquare,
  Save,
  AlertTriangle,
  Settings,
  Bell,
  Award,
  TrendingUp,
  Diamond,
} from 'lucide-react';
import { toast } from 'sonner';
import { EmailNotifications } from '@/components/concierge/shared/EmailNotifications';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const INTEREST_CATEGORIES = [
  { label: 'Fine Dining', key: 'fine-dining' },
  { label: 'Yacht & Charter', key: 'yacht-charter' },
  { label: 'Private Aviation', key: 'private-aviation' },
  { label: 'Luxury Transport', key: 'luxury-transport' },
  { label: 'Beauty & Wellness', key: 'beauty-wellness' },
  { label: 'Art & Culture', key: 'art-culture' },
  { label: 'Real Estate', key: 'real-estate' },
  { label: 'Personal Shopping', key: 'personal-shopping' },
  { label: 'Events & Entertainment', key: 'events-entertainment' },
  { label: 'Wine & Spirits', key: 'wine-spirits' },
  { label: 'Adventure & Sports', key: 'adventure-sports' },
  { label: 'Pets & Lifestyle', key: 'pets-lifestyle' },
] as const;

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
/*  Profile skeleton                                                           */
/* -------------------------------------------------------------------------- */

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 py-4">
        <Skeleton className="size-24 rounded-full bg-surface" />
        <div className="space-y-2 text-center">
          <Skeleton className="mx-auto h-6 w-40 rounded bg-surface" />
          <Skeleton className="mx-auto h-4 w-56 rounded bg-surface" />
        </div>
      </div>
      <Skeleton className="h-40 w-full rounded-xl bg-surface" />
      <Skeleton className="h-60 w-full rounded-xl bg-surface" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main ProfilePage                                                           */
/* -------------------------------------------------------------------------- */

export function ProfilePage() {
  const { user, setUser, setView } = useAppStore();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [businessDesc, setBusinessDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Notification settings — persisted via /api/emails
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [bookingNotifs, setBookingNotifs] = useState(true);
  const [promoNotifs, setPromoNotifs] = useState(false);
  const [prefsLoaded, setPrefsLoaded] = useState(false);

  // Danger zone
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  // User stats (for providers)
  const [userStats, setUserStats] = useState<{
    services: number;
    reviews: number;
  } | null>(null);

  /* ---------------------------------------------------------------------- */
  /*  Initialize form from user data                                           */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setEmail(user.email ?? '');
      setPhone(user.phone ?? '');
      setLocation(user.location ?? '');
      setBio(user.bio ?? '');
      setBusinessDesc(user.bio ?? '');

      // Parse interests
      if (user.interests) {
        try {
          const parsed = JSON.parse(user.interests);
          if (Array.isArray(parsed)) {
            setInterests(parsed);
          } else if (typeof parsed === 'string') {
            setInterests(parsed.split(',').map((s: string) => s.trim()));
          }
        } catch {
          // Fallback: comma-separated string
          if (user.interests.includes(',')) {
            setInterests(user.interests.split(',').map((s) => s.trim()));
          } else {
            setInterests([user.interests]);
          }
        }
      }

      setLoading(false);

      // Fetch email preferences from API
      fetch(`/api/emails?userId=${user.id}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data?.preferences) {
            setEmailNotifs(data.preferences.emailNotifications);
            setBookingNotifs(data.preferences.bookingUpdates);
            setPromoNotifs(data.preferences.promotionalEmails);
          }
          setPrefsLoaded(true);
        })
        .catch(() => setPrefsLoaded(true));

      // Fetch user stats for providers
      if (user.role === 'provider') {
        fetch(`/api/users?role=provider`)
          .then((res) => {
            if (res.ok) return res.json();
            return { users: [] };
          })
          .then((data) => {
            const found = (data.users ?? []).find((u: Record<string, unknown>) => u.id === user.id);
            if (found && found._count) {
              setUserStats({
                services: (found._count as Record<string, number>).services ?? 0,
                reviews: (found._count as Record<string, number>).clientReviews ?? 0,
              });
            }
          })
          .catch(() => {});
      }
    }
  }, [user]);

  /* ---------------------------------------------------------------------- */
  /*  Toggle interest                                                          */
  /* ---------------------------------------------------------------------- */

  const toggleInterest = useCallback((key: string) => {
    setInterests((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]
    );
  }, []);

  // Persist email preference toggles to the API
  const handleEmailPrefToggle = useCallback(
    async (key: 'emailNotifications' | 'bookingUpdates' | 'promotionalEmails', value: boolean) => {
      if (!user) return;
      switch (key) {
        case 'emailNotifications': setEmailNotifs(value); break;
        case 'bookingUpdates': setBookingNotifs(value); break;
        case 'promotionalEmails': setPromoNotifs(value); break;
      }
      try {
        await fetch('/api/emails', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, [key]: value }),
        });
      } catch {
        // silently fail — local state already updated
      }
    },
    [user],
  );

  /* ---------------------------------------------------------------------- */
  /*  Save profile                                                             */
  /* ---------------------------------------------------------------------- */

  const handleSave = useCallback(async () => {
    if (!user) return;

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        id: user.id,
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
        bio: user.role === 'provider' ? businessDesc.trim() : bio.trim(),
        interests: JSON.stringify(interests),
      };

      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedUser = data.user as User;
        setUser(updatedUser);
        toast.success('Profile updated successfully', {
          description: 'Your changes have been saved.',
        });
      } else {
        const data = await res.json();
        toast.error('Failed to update profile', {
          description: data.error ?? 'Something went wrong.',
        });
      }
    } catch {
      toast.error('Error', {
        description: 'Failed to save profile. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  }, [user, name, phone, location, bio, businessDesc, interests, setUser]);

  /* ---------------------------------------------------------------------- */
  /*  Deactivate account                                                       */
  /* ---------------------------------------------------------------------- */

  const handleDeactivate = useCallback(async () => {
    if (!user) return;

    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, suspended: true }),
      });

      if (res.ok) {
        toast.success('Account deactivated', {
          description: 'Your account has been deactivated.',
        });
        setUser(null);
        setView('landing');
      } else {
        toast.error('Failed to deactivate', {
          description: 'Something went wrong. Please try again.',
        });
      }
    } catch {
      toast.error('Error', {
        description: 'Failed to deactivate account.',
      });
    }

    setDeactivateOpen(false);
  }, [user, setUser, setView]);

  /* ---------------------------------------------------------------------- */
  /*  Not signed in                                                            */
  /* ---------------------------------------------------------------------- */

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gold/10">
            <UserIcon className="size-7 text-gold" />
          </div>
          <p className="text-muted-foreground">Please sign in to view your profile</p>
          <Button
            onClick={() => setView('login')}
            className="mt-4 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black"
          >
            Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <ProfileSkeleton />
      </div>
    );
  }

  const isProvider = user.role === 'provider';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="space-y-6"
      >
        {/* ======================== PROFILE HEADER ======================== */}
        <motion.div
          variants={fadeUp}
          custom={0}
          className="luxury-card relative overflow-hidden rounded-2xl p-6 sm:p-8"
        >
          {/* Background decoration */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-12 -top-12 size-48 rounded-full bg-gold/5 blur-3xl" />
            <div className="absolute -bottom-8 -left-8 size-32 rounded-full bg-gold/3 blur-2xl" />
            <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-br from-gold/[0.03] to-transparent" />
          </div>

          <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-6">
            {/* Large avatar */}
            <div className="relative">
              <Avatar className="size-24 border-2 border-gold/30 shadow-lg shadow-gold/10 sm:size-28">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-gold-dark via-gold to-gold-light text-3xl font-bold text-black sm:text-4xl">
                  {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
                </AvatarFallback>
              </Avatar>
              {user.verified && (
                <div className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-2 border-[#1A1A1A] bg-emerald-500">
                  <Shield className="size-4 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="font-serif text-2xl font-bold text-white sm:text-3xl">
                  {user.name}
                </h1>
                <Badge
                  variant="outline"
                  className="border-gold/30 bg-gold/5 text-[11px] uppercase tracking-wider text-gold"
                >
                  {user.role}
                </Badge>
                {user.verified && (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-[11px] text-emerald-400"
                  >
                    <Shield className="mr-1 size-3" />
                    Verified
                  </Badge>
                )}
                {user.premium && (
                  <Badge className="bg-gradient-to-r from-gold-dark to-gold text-[11px] font-semibold text-black border-0">
                    <Crown className="mr-1 size-3" />
                    Premium
                  </Badge>
                )}
              </div>

              <div className="mt-2 flex flex-col items-center gap-1 sm:items-start">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="size-3.5" />
                  <span>{user.email}</span>
                </div>
                {user.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="size-3.5" />
                    <span>{user.location}</span>
                  </div>
                )}
              </div>

              {/* Provider stats */}
              {isProvider && userStats && (
                <div className="mt-4 flex items-center justify-center gap-6 sm:justify-start">
                  <div className="flex items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-gold/10">
                      <Package className="size-4 text-gold" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{userStats.services}</p>
                      <p className="text-[11px] text-muted-foreground">Services</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-gold/10">
                      <Star className="size-4 text-gold" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{userStats.reviews}</p>
                      <p className="text-[11px] text-muted-foreground">Reviews</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ======================== PROFILE FORM ======================== */}
        <motion.div variants={fadeUp} custom={1}>
          <Card className="overflow-hidden border-gold/10 bg-[#111]">
            <CardHeader className="border-b border-gold/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gold/10">
                  <Settings className="size-5 text-gold" />
                </div>
                <div>
                  <CardTitle className="font-serif text-lg text-white">
                    Profile Information
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Update your personal details
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-muted-foreground">
                  Full Name
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="h-11 border-gold/15 bg-surface pl-10 text-sm text-white placeholder-muted-foreground focus-visible:ring-gold/30"
                  />
                </div>
              </div>

              {/* Email (disabled) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    value={email}
                    disabled
                    className="h-11 border-gold/15 bg-surface/50 pl-10 text-sm text-muted-foreground"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground/70">
                  Email cannot be changed. Contact support for assistance.
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="h-11 border-gold/15 bg-surface pl-10 text-sm text-white placeholder-muted-foreground focus-visible:ring-gold/30"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium text-muted-foreground">
                  Location
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="h-11 border-gold/15 bg-surface pl-10 text-sm text-white placeholder-muted-foreground focus-visible:ring-gold/30"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium text-muted-foreground">
                  {isProvider ? 'Business Description' : 'Bio'}
                </Label>
                <Textarea
                  id="bio"
                  value={isProvider ? businessDesc : bio}
                  onChange={(e) =>
                    isProvider ? setBusinessDesc(e.target.value) : setBio(e.target.value)
                  }
                  placeholder={
                    isProvider
                      ? 'Describe your luxury services and expertise...'
                      : 'Tell us about yourself...'
                  }
                  rows={4}
                  className="border-gold/15 bg-surface text-sm text-white placeholder-muted-foreground focus-visible:ring-gold/30 resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ======================== INTERESTS (clients only) ======================== */}
        {!isProvider && (
          <motion.div variants={fadeUp} custom={2}>
            <Card className="overflow-hidden border-gold/10 bg-[#111]">
              <CardHeader className="border-b border-gold/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gold/10">
                    <Diamond className="size-5 text-gold" />
                  </div>
                  <div>
                    <CardTitle className="font-serif text-lg text-white">
                      Preferences
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Select your interests for personalized recommendations
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  {INTEREST_CATEGORIES.map((cat) => {
                    const isChecked = interests.includes(cat.key);
                    return (
                      <label
                        key={cat.key}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                          isChecked
                            ? 'border-gold/30 bg-gold/5'
                            : 'border-gold/10 bg-surface hover:border-gold/20 hover:bg-surface-hover'
                        }`}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleInterest(cat.key)}
                          className="border-gold/30 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                        />
                        <span
                          className={`text-sm ${
                            isChecked ? 'font-medium text-gold' : 'text-white/80'
                          }`}
                        >
                          {cat.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ======================== NOTIFICATION SETTINGS ======================== */}
        <motion.div variants={fadeUp} custom={3}>
          <Card className="overflow-hidden border-gold/10 bg-[#111]">
            <CardHeader className="border-b border-gold/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gold/10">
                  <Bell className="size-5 text-gold" />
                </div>
                <div>
                  <CardTitle className="font-serif text-lg text-white">
                    Notification Settings
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Manage how you receive notifications
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 p-6">
              {/* Email notifications */}
              <div className="flex items-center justify-between rounded-xl px-2 py-3 transition-colors hover:bg-surface/50">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-surface">
                    <Mail className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">
                      Receive updates via email
                    </p>
                  </div>
                </div>
                <Switch
                  checked={emailNotifs}
                  onCheckedChange={(v) => handleEmailPrefToggle('emailNotifications', v)}
                  className="data-[state=checked]:bg-gold"
                />
              </div>

              <Separator className="bg-gold/10" />

              {/* Booking updates */}
              <div className="flex items-center justify-between rounded-xl px-2 py-3 transition-colors hover:bg-surface/50">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-surface">
                    <Package className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Booking Updates</p>
                    <p className="text-xs text-muted-foreground">
                      Get notified about booking status changes
                    </p>
                  </div>
                </div>
                <Switch
                  checked={bookingNotifs}
                  onCheckedChange={(v) => handleEmailPrefToggle('bookingUpdates', v)}
                  className="data-[state=checked]:bg-gold"
                />
              </div>

              <Separator className="bg-gold/10" />

              {/* Promotional emails */}
              <div className="flex items-center justify-between rounded-xl px-2 py-3 transition-colors hover:bg-surface/50">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-surface">
                    <TrendingUp className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Promotional Emails</p>
                    <p className="text-xs text-muted-foreground">
                      Receive special offers and new service alerts
                    </p>
                  </div>
                </div>
                <Switch
                  checked={promoNotifs}
                  onCheckedChange={(v) => handleEmailPrefToggle('promotionalEmails', v)}
                  className="data-[state=checked]:bg-gold"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ======================== EMAIL NOTIFICATIONS TAB ======================== */}
        {prefsLoaded && (
          <motion.div variants={fadeUp} custom={4}>
            <EmailNotifications />
          </motion.div>
        )}

        {/* ======================== SAVE BUTTON ======================== */}
        <motion.div variants={fadeUp} custom={5} className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-11 min-w-[180px] rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light px-6 text-sm font-semibold text-black shadow-lg shadow-gold/20 transition-all hover:shadow-gold/40 hover:brightness-110 disabled:opacity-50"
          >
            {saving ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="mr-2 size-4 rounded-full border-2 border-black/20 border-t-black"
                />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Save Changes
              </>
            )}
          </Button>
        </motion.div>

        {/* ======================== DANGER ZONE ======================== */}
        <motion.div variants={fadeUp} custom={6}>
          <Card className="overflow-hidden border-red-500/20 bg-[#111]">
            <CardHeader className="border-b border-red-500/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-red-500/10">
                  <AlertTriangle className="size-5 text-red-400" />
                </div>
                <div>
                  <CardTitle className="font-serif text-lg text-red-400">
                    Danger Zone
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Irreversible actions for your account
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white">Deactivate Account</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Your account will be suspended. This action can be reversed by contacting support.
                </p>
              </div>
              <Dialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="shrink-0 border-red-500/30 text-sm text-red-400 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <AlertTriangle className="mr-2 size-4" />
                    Deactivate
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-gold/10 bg-[#1A1A1A] sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-xl text-white">
                      Deactivate Account
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                      Are you sure you want to deactivate your account? You will no longer be able
                      to access your bookings, messages, or profile. This can be reversed by
                      contacting our support team.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex gap-3 pt-4 sm:justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setDeactivateOpen(false)}
                      className="border-gold/15 text-muted-foreground hover:text-white hover:border-gold/30"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeactivate}
                      className="bg-red-500 text-white hover:bg-red-600"
                    >
                      <AlertTriangle className="mr-2 size-4" />
                      Deactivate Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
