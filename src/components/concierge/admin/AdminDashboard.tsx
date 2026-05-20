'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type User, type Service, type Booking } from '@/store/useAppStore';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

import { Textarea } from '@/components/ui/textarea';
import { IntegrationsPage } from '@/components/concierge/admin/IntegrationsPage';

import {
  Users, Briefcase, CalendarCheck, DollarSign, Search, Shield,
  Star, TrendingUp, Eye, Ban, Crown, CheckCircle2, XCircle,
  AlertTriangle, BarChart3, Activity, ArrowUpRight, ArrowDownRight,
  ChevronRight, LayoutDashboard, ShoppingBag, Gavel, PieChartIcon,
  ShieldCheck, Plug, Loader2, FileText, Clock, MapPin,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface TopProvider {
  name: string;
  revenue: number;
  bookings: number;
}

interface AnalyticsData {
  totalUsers: number;
  totalProviders: number;
  totalBookings: number;
  totalRevenue: number;
  avgBookingValue: number;
  completionRate: number;
  bookingsByStatus: Record<string, number>;
  bookingsByCategory: Record<string, number>;
  revenueByMonth: { month: string; revenue: number }[];
  bookingsByMonth: { month: string; bookings: number }[];
  topCategories: { name: string; count: number }[];
  topProviders: TopProvider[];
  recentBookings: Booking[];
}

interface AdminUser extends User {
  suspended?: boolean;
  _count?: {
    services: number;
    clientBookings: number;
    providerBookings: number;
    clientReviews: number;
  };
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const CHART_COLORS = ['#C9A96E', '#E8D5A3', '#4ADE80', '#60A5FA', '#F472B6', '#A78BFA', '#FB923C'];

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:    { label: 'Pending',    className: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  accepted:   { label: 'Accepted',   className: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  rejected:   { label: 'Rejected',   className: 'bg-red-500/15 text-red-400 border-red-500/25' },
  completed:  { label: 'Completed',  className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  cancelled:  { label: 'Cancelled',  className: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25' },
  approved:   { label: 'Approved',   className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
};

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                         */
/* -------------------------------------------------------------------------- */

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, className: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25' };
  return (
    <Badge variant="outline" className={cfg.className}>
      {cfg.label}
    </Badge>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stat Card                                                                  */
/* -------------------------------------------------------------------------- */

function StatCard({
  icon: Icon, label, value, sub, trend,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down';
}) {
  return (
    <Card className="luxury-card gap-4 p-5">
      <div className="flex items-start justify-between">
        <div className="flex size-10 items-center justify-center rounded-lg bg-gold/10">
          <Icon className="size-5 text-gold" />
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
            trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {trend === 'up' ? '12%' : '3%'}
          </div>
        )}
      </div>
      <div>
        <p className="font-serif text-2xl font-bold text-white">{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
        {sub && <p className="mt-1 text-[11px] text-gold/70">{sub}</p>}
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Quick Action Card                                                          */
/* -------------------------------------------------------------------------- */

function QuickActionCard({
  icon: Icon, title, description, onClick,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="luxury-card group flex items-center gap-4 rounded-xl p-5 text-left transition-all"
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-gold/10 transition-colors group-hover:bg-gold/20">
        <Icon className="size-5 text-gold" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-gold" />
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Loading skeleton helper                                                    */
/* -------------------------------------------------------------------------- */

function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-8 flex-1 bg-muted rounded" />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ========================================================================== */
/*  DASHBOARD TAB                                                              */
/* ========================================================================== */

function DashboardTab({
  analytics, loading,
  onGoToUsers, onGoToServices,
}: {
  analytics: AnalyticsData | null;
  loading: boolean;
  onGoToUsers: () => void;
  onGoToServices: () => void;
}) {
  if (loading && !analytics) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Users,        label: 'Total Clients',   value: analytics.totalUsers.toLocaleString(),     sub: 'Registered clients',   trend: 'up' as const },
          { icon: Briefcase,    label: 'Total Providers',  value: analytics.totalProviders.toLocaleString(), sub: 'Active providers',     trend: 'up' as const },
          { icon: CalendarCheck,label: 'Total Bookings',   value: analytics.totalBookings.toLocaleString(),  sub: 'All-time bookings',    trend: 'up' as const },
          { icon: DollarSign,   label: 'Total Revenue',    value: formatCurrency(analytics.totalRevenue),    sub: 'From completed orders', trend: 'up' as const },
        ].map((stat, i) => (
          <motion.div key={stat.label} variants={fadeUp} custom={i}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} custom={4}>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Actions
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <QuickActionCard
            icon={Users}
            title="Manage Users"
            description="View, verify, and manage all platform users"
            onClick={onGoToUsers}
          />
          <QuickActionCard
            icon={ShoppingBag}
            title="Moderate Services"
            description="Review, approve, or reject service listings"
            onClick={onGoToServices}
          />
        </div>
      </motion.div>

      {/* Recent Bookings */}
      <motion.div variants={fadeUp} custom={5}>
        <Card className="luxury-card overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-serif text-lg text-white">Recent Bookings</CardTitle>
                <CardDescription className="text-xs">Latest 5 bookings across the platform</CardDescription>
              </div>
              <Badge variant="outline" className="border-gold/30 bg-gold/5 text-gold text-xs">
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gold/10 hover:bg-transparent">
                  <TableHead className="text-xs text-muted-foreground">ID</TableHead>
                  <TableHead className="text-xs text-muted-foreground">Client</TableHead>
                  <TableHead className="text-xs text-muted-foreground">Provider</TableHead>
                  <TableHead className="text-xs text-muted-foreground hidden md:table-cell">Service</TableHead>
                  <TableHead className="text-xs text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs text-muted-foreground text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.recentBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      No recent bookings
                    </TableCell>
                  </TableRow>
                ) : (
                  analytics.recentBookings.map((b) => (
                    <TableRow key={b.id} className="border-gold/5">
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {b.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="text-xs text-white">{b.client?.name ?? '—'}</TableCell>
                      <TableCell className="text-xs text-white">{b.provider?.name ?? '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden md:table-cell max-w-[160px] truncate">
                        {b.service?.title ?? '—'}
                      </TableCell>
                      <TableCell><StatusBadge status={b.status} /></TableCell>
                      <TableCell className="text-xs font-semibold text-gold text-right">
                        ${b.totalPrice.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

/* ========================================================================== */
/*  USERS TAB                                                                  */
/* ========================================================================== */

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    user: AdminUser | null;
    action: 'suspend' | 'unsuspend' | 'verify' | 'premium' | 'revoke_premium';
  }>({ open: false, user: null, action: 'suspend' });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/users');
        if (res.ok && !cancelled) {
          const data = await res.json();
          setUsers(data.users ?? []);
        }
      } catch { /* silent */ }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleUserAction = useCallback(async (user: AdminUser, field: string, value: unknown) => {
    setActionLoading(user.id);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, [field]: value }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, [field]: value } : u)),
        );
      }
    } catch { /* silent */ }
    setActionLoading(null);
    setConfirmDialog({ open: false, user: null, action: 'suspend' });
  }, []);

  const filtered = useMemo(() => {
    let list = users;
    if (roleFilter !== 'all') {
      list = list.filter((u) => u.role === roleFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      );
    }
    return list;
  }, [users, roleFilter, search]);

  const roleCounts = useMemo(() => ({
    all: users.length,
    client: users.filter((u) => u.role === 'client').length,
    provider: users.filter((u) => u.role === 'provider').length,
    admin: users.filter((u) => u.role === 'admin').length,
  }), [users]);

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9 border-gold/15 bg-surface text-sm placeholder:text-muted-foreground/60 focus-visible:border-gold/40"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'client', 'provider', 'admin'] as const).map((role) => (
            <Button
              key={role}
              size="sm"
              variant={roleFilter === role ? 'default' : 'outline'}
              onClick={() => setRoleFilter(role)}
              className={
                roleFilter === role
                  ? 'bg-gradient-to-r from-gold-dark to-gold text-black text-xs h-8'
                  : 'border-gold/20 text-muted-foreground text-xs h-8 hover:text-white hover:border-gold/40'
              }
            >
              {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1) + 's'}
              <span className="ml-1.5 rounded-full bg-black/20 px-1.5 py-0.5 text-[10px] font-bold">
                {roleCounts[role]}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="luxury-card overflow-hidden">
        <CardContent className="p-0">
          <div className="max-h-[520px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="border-gold/10 hover:bg-transparent">
                  <TableHead className="text-xs text-muted-foreground">User</TableHead>
                  <TableHead className="text-xs text-muted-foreground hidden lg:table-cell">Email</TableHead>
                  <TableHead className="text-xs text-muted-foreground">Role</TableHead>
                  <TableHead className="text-xs text-muted-foreground hidden md:table-cell">Location</TableHead>
                  <TableHead className="text-xs text-muted-foreground">Verified</TableHead>
                  <TableHead className="text-xs text-muted-foreground hidden sm:table-cell">Premium</TableHead>
                  <TableHead className="text-xs text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8}><TableSkeleton rows={6} cols={8} /></TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                      <Users className="mx-auto mb-2 size-8 text-muted-foreground/30" />
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((user) => (
                    <TableRow key={user.id} className="border-gold/5">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-xs font-bold text-gold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user.name}</p>
                            <p className="text-[11px] text-muted-foreground lg:hidden truncate">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground truncate max-w-[200px]">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase tracking-wider ${
                            user.role === 'admin'
                              ? 'border-gold/30 bg-gold/10 text-gold'
                              : user.role === 'provider'
                                ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
                                : 'border-zinc-500/25 bg-zinc-500/10 text-zinc-400'
                          }`}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {user.location ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={user.verified ?? false}
                          disabled={actionLoading === user.id}
                          onCheckedChange={(checked) =>
                            setConfirmDialog({ open: true, user, action: checked ? 'verify' : 'verify' })
                          }
                          className="data-[state=checked]:bg-gold"
                        />
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Switch
                          checked={user.premium ?? false}
                          disabled={actionLoading === user.id}
                          onCheckedChange={(checked) =>
                            setConfirmDialog({
                              open: true, user,
                              action: checked ? 'premium' : 'revoke_premium',
                            })
                          }
                          className="data-[state=checked]:bg-gold"
                        />
                      </TableCell>
                      <TableCell>
                        {user.suspended ? (
                          <Badge variant="outline" className="border-red-500/25 bg-red-500/10 text-red-400 text-[10px]">
                            Suspended
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-emerald-500/25 bg-emerald-500/10 text-emerald-400 text-[10px]">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={actionLoading === user.id}
                          onClick={() =>
                            setConfirmDialog({
                              open: true, user,
                              action: user.suspended ? 'unsuspend' : 'suspend',
                            })
                          }
                          className={`h-8 text-xs ${
                            user.suspended
                              ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                              : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                          }`}
                        >
                          {user.suspended ? (
                            <><CheckCircle2 className="size-3.5 mr-1" />Activate</>
                          ) : (
                            <><Ban className="size-3.5 mr-1" />Suspend</>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {!loading && filtered.length > 0 && (
            <div className="border-t border-gold/10 px-4 py-3 text-xs text-muted-foreground">
              Showing {filtered.length} of {users.length} users
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent className="bg-card border-gold/15 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-serif text-lg">Confirm Action</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {confirmDialog.action === 'suspend' && `Suspend ${confirmDialog.user?.name}? They will lose access to the platform.`}
              {confirmDialog.action === 'unsuspend' && `Reactivate ${confirmDialog.user?.name}? They will regain full access.`}
              {confirmDialog.action === 'verify' && `Toggle verified status for ${confirmDialog.user?.name}?`}
              {confirmDialog.action === 'premium' && `Grant premium status to ${confirmDialog.user?.name}?`}
              {confirmDialog.action === 'revoke_premium' && `Revoke premium status from ${confirmDialog.user?.name}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-gold/20 text-muted-foreground text-sm hover:text-white">
                Cancel
              </Button>
            </DialogClose>
            <Button
              className={`text-sm font-semibold ${
                confirmDialog.action === 'suspend' || confirmDialog.action === 'revoke_premium'
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : 'bg-gradient-to-r from-gold-dark to-gold text-black'
              }`}
              onClick={() => {
                if (!confirmDialog.user) return;
                const u = confirmDialog.user;
                switch (confirmDialog.action) {
                  case 'suspend':     handleUserAction(u, 'suspended', true); break;
                  case 'unsuspend':   handleUserAction(u, 'suspended', false); break;
                  case 'verify':      handleUserAction(u, 'verified', !u.verified); break;
                  case 'premium':     handleUserAction(u, 'premium', true); break;
                  case 'revoke_premium': handleUserAction(u, 'premium', false); break;
                }
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

/* ========================================================================== */
/*  SERVICES TAB                                                               */
/* ========================================================================== */

function ServicesTab() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/services?allStatuses=true');
        if (res.ok && !cancelled) {
          const data = await res.json();
          setServices(data.services ?? []);
        }
      } catch { /* silent */ }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let list = services;
    if (statusFilter !== 'all') {
      list = list.filter((s) => s.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) => s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q),
      );
    }
    return list;
  }, [services, statusFilter, search]);

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9 border-gold/15 bg-surface text-sm placeholder:text-muted-foreground/60 focus-visible:border-gold/40"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status)}
              className={
                statusFilter === status
                  ? 'bg-gradient-to-r from-gold-dark to-gold text-black text-xs h-8'
                  : 'border-gold/20 text-muted-foreground text-xs h-8 hover:text-white hover:border-gold/40'
              }
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Service Cards Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 bg-muted rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingBag className="mb-3 size-12 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">No services found</p>
          <p className="mt-1 text-xs text-muted-foreground/60">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((svc, i) => (
            <motion.div
              key={svc.id}
              variants={fadeUp}
              custom={i}
              className="luxury-card flex flex-col gap-4 rounded-xl p-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className="font-serif text-sm font-semibold text-white leading-snug truncate">{svc.title}</h4>
                  <p className="mt-1 text-xs text-muted-foreground capitalize">{svc.category.replace(/-/g, ' ')}</p>
                </div>
                <StatusBadge status={svc.status} />
              </div>

              {/* Provider */}
              {svc.provider && (
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-full bg-gold/10 text-[10px] font-bold text-gold">
                    {svc.provider.name.charAt(0)}
                  </div>
                  <span className="text-xs text-muted-foreground truncate">{svc.provider.name}</span>
                  {svc.provider.verified && (
                    <Shield className="size-3.5 text-gold shrink-0" />
                  )}
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`size-3 ${idx < Math.round(svc.rating) ? 'fill-gold text-gold' : 'text-muted-foreground/30'}`}
                  />
                ))}
                <span className="ml-1 text-xs text-muted-foreground">{svc.rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground/60">({svc.reviewCount})</span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-gold/10 pt-3 mt-auto">
                <div>
                  <span className="font-serif text-lg font-bold text-gold">${svc.price.toLocaleString()}</span>
                  <span className="ml-1 text-xs text-muted-foreground">/ {svc.duration}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className="h-px w-6 bg-gold/20" />
                  {svc.location}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="text-center text-xs text-muted-foreground">
          Showing {filtered.length} service{filtered.length !== 1 ? 's' : ''}
          {statusFilter !== 'all' && ` with status "${statusFilter}"`}
        </div>
      )}
    </motion.div>
  );
}

/* ========================================================================== */
/*  DISPUTES TAB                                                               */
/* ========================================================================== */

function DisputesTab() {
  const [disputes, setDisputes] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  const [resolveDialog, setResolveDialog] = useState<{ open: boolean; booking: Booking | null }>({
    open: false,
    booking: null,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/bookings?status=rejected');
        if (res.ok && !cancelled) {
          const data = await res.json();
          setDisputes(data.bookings ?? []);
        }
      } catch { /* silent */ }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleResolve = useCallback(async (booking: Booking) => {
    setResolving(booking.id);
    try {
      await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: booking.id, status: 'completed' }),
      });
      setDisputes((prev) => prev.filter((b) => b.id !== booking.id));
    } catch { /* silent */ }
    setResolving(null);
    setResolveDialog({ open: false, booking: null });
  }, []);

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg text-white">Cancellation &amp; Dispute Queue</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Bookings that were rejected or cancelled — review and resolve
          </p>
        </div>
        <Badge variant="outline" className="border-red-500/25 bg-red-500/10 text-red-400 text-xs">
          {disputes.length} open
        </Badge>
      </div>

      {/* Dispute List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
      ) : disputes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Gavel className="mb-3 size-12 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">No open disputes</p>
          <p className="mt-1 text-xs text-muted-foreground/60">All clear! Check back later.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((booking, i) => (
            <motion.div
              key={booking.id}
              variants={fadeUp}
              custom={i}
              className="luxury-card rounded-xl p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Service & Date */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-gold/30 bg-gold/5 text-gold text-[10px] font-mono">
                      {booking.id.slice(0, 8)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(booking.createdAt)}</span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-white truncate">
                      {booking.service?.title ?? 'Unknown Service'}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                      {booking.service?.category?.replace(/-/g, ' ') ?? 'Uncategorized'}
                    </p>
                  </div>

                  {/* People */}
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="size-3" />
                      Client: <span className="text-white">{booking.client?.name ?? 'Unknown'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="size-3" />
                      Provider: <span className="text-white">{booking.provider?.name ?? 'Unknown'}</span>
                    </span>
                  </div>

                  {/* Special Request / Reason */}
                  {booking.specialReq && (
                    <div className="rounded-lg bg-red-500/5 border border-red-500/10 p-3">
                      <p className="text-xs font-medium text-red-400 mb-0.5">Special Request / Notes</p>
                      <p className="text-xs text-muted-foreground">{booking.specialReq}</p>
                    </div>
                  )}

                  {/* Amount */}
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-lg font-bold text-gold">
                      ${booking.totalPrice.toLocaleString()}
                    </span>
                    <StatusBadge status={booking.status} />
                  </div>
                </div>

                {/* Resolve Action */}
                <div className="shrink-0">
                  <Button
                    size="sm"
                    disabled={resolving === booking.id}
                    onClick={() => setResolveDialog({ open: true, booking })}
                    className="h-9 bg-gradient-to-r from-gold-dark to-gold text-xs font-semibold text-black hover:brightness-110"
                  >
                    <CheckCircle2 className="size-3.5 mr-1" />
                    {resolving === booking.id ? 'Resolving...' : 'Resolve'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Resolve Confirm Dialog */}
      <Dialog open={resolveDialog.open} onOpenChange={(open) => setResolveDialog({ ...resolveDialog, open })}>
        <DialogContent className="bg-card border-gold/15 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-serif text-lg">Resolve Dispute</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              This will mark the booking as <span className="text-emerald-400 font-medium">completed</span> and
              remove it from the dispute queue. The client and provider will be notified.
            </DialogDescription>
          </DialogHeader>
          {resolveDialog.booking && (
            <div className="rounded-lg bg-surface p-3 space-y-1.5">
              <p className="text-xs text-muted-foreground">
                Booking: <span className="text-white">{resolveDialog.booking.service?.title}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Amount: <span className="text-gold font-semibold">${resolveDialog.booking.totalPrice.toLocaleString()}</span>
              </p>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-gold/20 text-muted-foreground text-sm hover:text-white">
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="bg-gradient-to-r from-gold-dark to-gold text-sm font-semibold text-black hover:brightness-110"
              onClick={() => resolveDialog.booking && handleResolve(resolveDialog.booking)}
            >
              Confirm Resolution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

/* ========================================================================== */
/*  ANALYTICS TAB                                                              */
/* ========================================================================== */

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gold/20 bg-card px-3 py-2 shadow-lg shadow-black/20">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value > 999 ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

function AnalyticsTab({ analytics, loading }: { analytics: AnalyticsData | null; loading: boolean }) {
  if (loading && !analytics) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28 bg-muted rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 bg-muted rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-72 bg-muted rounded-xl" />
          <Skeleton className="h-72 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  /* Prepare chart data */
  const statusChartData = Object.entries(analytics.bookingsByStatus).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: value as number,
  }));

  const categoryChartData = Object.entries(analytics.bookingsByCategory)
    .map(([name, value]) => ({ name: name.replace(/-/g, ' '), count: value as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const avgBookingValue = analytics.avgBookingValue ?? (analytics.totalBookings > 0
    ? analytics.totalRevenue / analytics.totalBookings
    : 0);

  const completionRate = analytics.completionRate ?? 0;
  const platformFees = analytics.totalRevenue * 0.15; // 15% platform fee
  const topProviders = analytics.topProviders ?? [];
  const bookingsByMonth = analytics.bookingsByMonth ?? [];

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={TrendingUp}
          label="Average Booking Value"
          value={formatCurrency(avgBookingValue)}
          sub="Per completed transaction"
          trend="up"
        />
        <StatCard
          icon={Activity}
          label="Completion Rate"
          value={`${completionRate}%`}
          sub="Completed out of total"
          trend="up"
        />
        <StatCard
          icon={DollarSign}
          label="Platform Fees Collected"
          value={formatCurrency(platformFees)}
          sub="15% commission rate"
          trend="up"
        />
        <StatCard
          icon={BarChart3}
          label="Total Bookings"
          value={analytics.totalBookings.toLocaleString()}
          sub="All statuses"
        />
      </div>

      {/* Revenue by Month — Bar Chart */}
      <Card className="luxury-card overflow-hidden">
        <CardHeader>
          <CardTitle className="font-serif text-lg text-white">Revenue by Month</CardTitle>
          <CardDescription className="text-xs">Monthly revenue from completed bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.revenueByMonth} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,169,110,0.08)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#8A8A8A' }}
                  axisLine={{ stroke: 'rgba(201,169,110,0.15)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#8A8A8A' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => formatCurrency(v)}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201,169,110,0.05)' }} />
                <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {analytics.revenueByMonth.map((_, i) => (
                    <Cell key={i} fill={i === analytics.revenueByMonth.length - 1 ? '#C9A96E' : 'rgba(201,169,110,0.35)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Over Time — Bar Chart */}
      <Card className="luxury-card overflow-hidden">
        <CardHeader>
          <CardTitle className="font-serif text-lg text-white">Bookings Over Time</CardTitle>
          <CardDescription className="text-xs">Monthly booking volume across all statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingsByMonth} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,169,110,0.08)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#8A8A8A' }}
                  axisLine={{ stroke: 'rgba(201,169,110,0.15)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#8A8A8A' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201,169,110,0.05)' }} />
                <Bar dataKey="bookings" name="Bookings" radius={[6, 6, 0, 0]} maxBarSize={48} fill="#C9A96E" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Providers Table */}
      <Card className="luxury-card overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif text-lg text-white">Top Providers</CardTitle>
              <CardDescription className="text-xs">Ranked by total revenue from completed bookings</CardDescription>
            </div>
            <Badge variant="outline" className="border-gold/30 bg-gold/5 text-gold text-xs">
              Top {topProviders.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {topProviders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No provider data available yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gold/10 hover:bg-transparent">
                  <TableHead className="text-xs text-muted-foreground w-12">#</TableHead>
                  <TableHead className="text-xs text-muted-foreground">Provider Name</TableHead>
                  <TableHead className="text-xs text-muted-foreground text-right">Revenue</TableHead>
                  <TableHead className="text-xs text-muted-foreground text-right">Bookings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProviders.map((provider, i) => (
                  <TableRow key={provider.name} className="border-gold/5">
                    <TableCell className="text-xs font-bold text-gold/70">{i + 1}</TableCell>
                    <TableCell className="text-sm text-white font-medium">{provider.name}</TableCell>
                    <TableCell className="text-sm font-serif font-semibold text-gold text-right">
                      ${provider.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground text-right">{provider.bookings}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Bottom row: Bookings by Status + Category */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Bookings by Status — PieChart */}
        <Card className="luxury-card overflow-hidden">
          <CardHeader>
            <CardTitle className="font-serif text-lg text-white">Bookings by Status</CardTitle>
            <CardDescription className="text-xs">Distribution of all bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="h-52 w-52 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {statusChartData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {statusChartData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-2 rounded-lg bg-surface px-3 py-1.5">
                    <span
                      className="size-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {entry.name}{' '}
                      <span className="font-semibold text-white">{entry.value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings by Category — Horizontal Bar Chart */}
        <Card className="luxury-card overflow-hidden">
          <CardHeader>
            <CardTitle className="font-serif text-lg text-white">Bookings by Category</CardTitle>
            <CardDescription className="text-xs">Top categories by booking count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryChartData}
                  layout="vertical"
                  barCategoryGap="20%"
                  margin={{ left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,169,110,0.08)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#8A8A8A' }} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tick={{ fontSize: 10, fill: '#8A8A8A' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(201,169,110,0.05)' }} />
                  <Bar dataKey="count" name="Bookings" radius={[0, 4, 4, 0]} maxBarSize={24} fill="#C9A96E" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Categories */}
      <Card className="luxury-card overflow-hidden">
        <CardHeader>
          <CardTitle className="font-serif text-lg text-white">Top Performing Categories</CardTitle>
          <CardDescription className="text-xs">Categories ranked by number of approved service listings</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.topCategories.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No category data available yet</p>
          ) : (
            <div className="space-y-3">
              {analytics.topCategories.map((cat, i) => {
                const maxCount = analytics.topCategories[0]?.count ?? 1;
                const pct = (cat.count / maxCount) * 100;
                return (
                  <div key={cat.name} className="flex items-center gap-4">
                    <span className="w-6 text-right text-sm font-bold text-gold/70">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white capitalize truncate">
                          {cat.name.replace(/-/g, ' ')}
                        </span>
                        <span className="text-xs font-semibold text-gold">{cat.count} services</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ========================================================================== */
/*  MAIN ADMIN DASHBOARD                                                       */
/* ========================================================================== */

/* ========================================================================== */
/*  VERIFICATIONS TAB                                                          */
/* ========================================================================== */

interface VerificationUser {
  id: string;
  name: string;
  email: string;
  role: string;
  location?: string;
  verificationStatus?: string;
  businessName?: string;
  businessLicense?: string;
  businessAddress?: string;
  idDocument?: string;
  submittedAt?: string;
  verifiedAt?: string;
  verificationNote?: string;
  _count?: { services: number; providerBookings: number };
}

function VerificationsTab() {
  const [users, setUsers] = useState<VerificationUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    user: VerificationUser | null;
  }>({ open: false, user: null });
  const [rejectNote, setRejectNote] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/verifications?status=${statusFilter}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setUsers(data.users ?? []);
        }
      } catch { /* silent */ }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [statusFilter]);

  const handleReview = useCallback(async (user: VerificationUser, status: 'approved' | 'rejected', note?: string) => {
    setActionLoading(user.id);
    try {
      const res = await fetch('/api/verifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, status, note }),
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
      }
    } catch { /* silent */ }
    setActionLoading(null);
    setReviewDialog({ open: false, user: null });
    setRejectNote('');
  }, []);

  const pendingCount = users.filter((u) => u.verificationStatus === 'pending').length;
  const statusCounts = {
    pending: users.filter((u) => u.verificationStatus === 'pending').length,
    approved: users.filter((u) => u.verificationStatus === 'approved').length,
    rejected: users.filter((u) => u.verificationStatus === 'rejected').length,
  };

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-serif text-lg font-semibold text-white">Provider Verification Requests</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Review and approve provider verification applications
          </p>
        </div>
        <Badge variant="outline" className="border-amber-500/25 bg-amber-500/10 text-amber-400 text-xs">
          {pendingCount} pending
        </Badge>
      </div>

      {/* Status Filters */}
      <div className="flex items-center gap-2">
        {(['pending', 'approved', 'rejected'] as const).map((status) => (
          <Button
            key={status}
            size="sm"
            variant={statusFilter === status ? 'default' : 'outline'}
            onClick={() => setStatusFilter(status)}
            className={
              statusFilter === status
                ? 'bg-gradient-to-r from-gold-dark to-gold text-black text-xs h-8'
                : 'border-gold/20 text-muted-foreground text-xs h-8 hover:text-white hover:border-gold/40'
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-1.5 rounded-full bg-black/20 px-1.5 py-0.5 text-[10px] font-bold">
              {statusCounts[status]}
            </span>
          </Button>
        ))}
      </div>

      {/* Verification List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 bg-muted rounded-xl" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShieldCheck className="mb-3 size-12 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">
            {statusFilter === 'pending' ? 'No pending verifications' : `No ${statusFilter} verifications`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            {statusFilter === 'pending' ? 'All clear! Check back later.' : 'Try a different filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user, i) => (
            <motion.div
              key={user.id}
              variants={fadeUp}
              custom={i}
              className="luxury-card rounded-xl p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 min-w-0 space-y-3">
                  {/* Provider Info */}
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-gold/10 text-sm font-bold text-gold shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      {user.location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="size-3" />
                          {user.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Business Details */}
                  <div className="grid gap-2 sm:grid-cols-2 rounded-lg bg-surface p-3">
                    <div>
                      <span className="text-[11px] text-muted-foreground">Business Name</span>
                      <p className="text-sm text-white font-medium truncate">{user.businessName ?? '—'}</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground">License Number</span>
                      <p className="text-sm text-white font-mono">{user.businessLicense ?? '—'}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[11px] text-muted-foreground">Address</span>
                      <p className="text-sm text-white truncate">{user.businessAddress ?? '—'}</p>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="size-3" />
                      ID: {user.idDocument ?? '—'}
                    </span>
                    {user.submittedAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        Submitted {formatDate(user.submittedAt)}
                      </span>
                    )}
                    {(user._count?.services ?? 0) > 0 && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="size-3" />
                        {user._count.services} service{user._count.services !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 sm:flex-row shrink-0">
                  {user.verificationStatus === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        disabled={actionLoading === user.id}
                        onClick={() => handleReview(user, 'approved')}
                        className="h-9 bg-gradient-to-r from-gold-dark to-gold text-xs font-semibold text-black hover:brightness-110"
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className="size-3.5 mr-1 animate-spin" />
                        ) : (
                          <><CheckCircle2 className="size-3.5 mr-1" />Approve</>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        disabled={actionLoading === user.id}
                        onClick={() => setReviewDialog({ open: true, user })}
                        className="h-9 border-red-500/30 text-red-400 text-xs hover:bg-red-500/10"
                      >
                        <XCircle className="size-3.5 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  {user.verificationStatus === 'approved' && (
                    <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/25 self-start">
                      <CheckCircle2 className="size-3 mr-1" />Approved
                    </Badge>
                  )}
                  {user.verificationStatus === 'rejected' && (
                    <Badge className="bg-red-500/15 text-red-400 border-red-500/25 self-start">
                      <XCircle className="size-3 mr-1" />Rejected
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog({ ...reviewDialog, open })}>
        <DialogContent className="bg-card border-gold/15 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white font-serif text-lg">Reject Verification</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Rejecting verification for <span className="text-white font-medium">{reviewDialog.user?.businessName ?? reviewDialog.user?.name}</span>. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="Reason for rejection (optional)..."
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              className="border-gold/15 bg-surface focus-visible:border-gold/40 resize-none"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="border-gold/20 text-muted-foreground text-sm hover:text-white">
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="bg-red-600 hover:bg-red-500 text-white text-sm font-semibold"
              onClick={() => {
                if (reviewDialog.user) handleReview(reviewDialog.user, 'rejected', rejectNote);
              }}
            >
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

/* ========================================================================== */
/*  MAIN ADMIN DASHBOARD                                                        */
/* ========================================================================== */

export function AdminDashboard() {
  const { currentView, setView } = useAppStore();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  /* Determine which tab is active based on currentView */
  const activeTab = useMemo((): string => {
    if (currentView === 'admin-users') return 'users';
    if (currentView === 'admin-services') return 'services';
    if (currentView === 'admin-disputes') return 'disputes';
    if (currentView === 'admin-analytics') return 'analytics';
    if (currentView === 'admin-verifications') return 'verifications';
    if (currentView === 'admin-integrations') return 'integrations';
    return 'dashboard';
  }, [currentView]);

  /* Fetch analytics data (used by dashboard & analytics tabs) */
  useEffect(() => {
    async function loadAnalytics() {
      setAnalyticsLoading(true);
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch { /* silent */ }
      setAnalyticsLoading(false);
    }
    loadAnalytics();
  }, []);

  /* Sync tab → store view */
  const handleTabChange = useCallback((tab: string) => {
    const viewMap: Record<string, string> = {
      dashboard: 'admin-dashboard',
      users: 'admin-users',
      services: 'admin-services',
      disputes: 'admin-disputes',
      analytics: 'admin-analytics',
      verifications: 'admin-verifications',
      integrations: 'admin-integrations',
    };
    setView(viewMap[tab] as 'admin-dashboard');
  }, [setView]);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
        >
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-gold/10">
                <LayoutDashboard className="size-5 text-gold" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Admin <span className="text-gold-gradient">Dashboard</span>
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Manage your platform, monitor performance, and resolve issues
                </p>
              </div>
            </div>

            {/* Decorative line */}
            <div className="mt-4 h-px bg-gradient-to-r from-gold/30 via-gold/10 to-transparent" />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="bg-surface border border-gold/10 rounded-lg p-1 flex-wrap gap-1 h-auto">
              {[
                { value: 'dashboard', label: 'Overview', icon: BarChart3 },
                { value: 'users',     label: 'Users',    icon: Users },
                { value: 'services',  label: 'Services', icon: ShoppingBag },
                { value: 'disputes',  label: 'Disputes', icon: Gavel },
                { value: 'analytics', label: 'Analytics',icon: PieChartIcon },
                { value: 'verifications', label: 'Verifications', icon: ShieldCheck },
                { value: 'integrations', label: 'Integrations', icon: Plug },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-dark data-[state=active]:to-gold data-[state=active]:text-black data-[state=active]:shadow-sm rounded-md gap-1.5 px-3 h-9 text-xs font-medium text-muted-foreground data-[state=active]:font-semibold"
                >
                  <tab.icon className="size-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="dashboard">
              <DashboardTab
                analytics={analytics}
                loading={analyticsLoading}
                onGoToUsers={() => handleTabChange('users')}
                onGoToServices={() => handleTabChange('services')}
              />
            </TabsContent>

            <TabsContent value="users">
              <UsersTab />
            </TabsContent>

            <TabsContent value="services">
              <ServicesTab />
            </TabsContent>

            <TabsContent value="disputes">
              <DisputesTab />
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsTab analytics={analytics} loading={analyticsLoading} />
            </TabsContent>

            <TabsContent value="verifications">
              <VerificationsTab />
            </TabsContent>

            <TabsContent value="integrations">
              <IntegrationsPage />
            </TabsContent>
          </Tabs>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
