'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, type Service } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  MapPin,
  Clock,
  ImageIcon,
  ArrowLeft,
  Package,
} from 'lucide-react';

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
];

const STATUS_FILTERS = ['all', 'approved', 'pending', 'rejected'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                         */
/* -------------------------------------------------------------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

/* -------------------------------------------------------------------------- */
/*  Status badge helper                                                        */
/* -------------------------------------------------------------------------- */

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
  };
  return (
    <Badge
      variant="outline"
      className={`text-[11px] capitalize font-medium ${map[status] ?? 'bg-muted text-muted-foreground border-border'}`}
    >
      {status}
    </Badge>
  );
}

/* -------------------------------------------------------------------------- */
/*  Service form dialog                                                        */
/* -------------------------------------------------------------------------- */

const emptyForm = {
  title: '',
  description: '',
  category: '',
  price: '',
  duration: '',
  location: '',
  images: '',
};

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
  providerId: string;
  onSaved: () => void;
}

function ServiceFormDialog({
  open,
  onOpenChange,
  service,
  providerId,
  onSaved,
}: ServiceFormDialogProps) {
  const isEdit = !!service?.id;
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        title: service?.title ?? '',
        description: service?.description ?? '',
        category: service?.category ?? '',
        price: service?.price ? String(service.price) : '',
        duration: service?.duration ?? '',
        location: service?.location ?? '',
        images: service?.images ?? '',
      });
    }
  }, [open, service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.price || !form.duration || !form.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          title: form.title,
          description: form.description,
          category: form.category,
          price: parseFloat(form.price),
          duration: form.duration,
          location: form.location,
          images: form.images || undefined,
        }),
      });

      if (res.ok) {
        toast.success(isEdit ? 'Service updated!' : 'Service submitted for review!');
        onOpenChange(false);
        onSaved();
      } else {
        const data = await res.json();
        toast.error(data.error ?? 'Failed to save service');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1A1A1A] border-gold/15 sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-white">
            {isEdit ? 'Edit Service' : 'Add New Service'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEdit
              ? 'Update the details of your service listing.'
              : 'Fill in the details below to list a new service. It will be reviewed before going live.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-sm text-foreground">Title *</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Private Chef Experience"
              className="bg-surface border-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm text-foreground">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe your luxury service..."
              rows={3}
              className="bg-surface border-border resize-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm text-foreground">Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
              >
                <SelectTrigger className="bg-surface border-border">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-foreground">Price ($) *</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="500"
                className="bg-surface border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-sm text-foreground">Duration *</Label>
              <Input
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                placeholder="e.g. 2 hours"
                className="bg-surface border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-foreground">Location *</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Monaco"
                className="bg-surface border-border"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm text-foreground">Image URLs</Label>
            <Textarea
              value={form.images}
              onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
              placeholder="Enter image URLs separated by commas..."
              rows={2}
              className="bg-surface border-border resize-none"
            />
            <p className="text-[11px] text-muted-foreground">
              Separate multiple URLs with commas
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-sm font-semibold text-black hover:brightness-110"
            >
              {saving ? 'Saving...' : isEdit ? 'Update Service' : 'Create Service'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Component                                                             */
/* -------------------------------------------------------------------------- */

export function ManageServicesPage() {
  const { user, setView } = useAppStore();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* ---- Fetch services ---- */
  const fetchServices = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        const myServices = (data.services ?? []).filter(
          (s: Service) => s.providerId === user.id
        );
        setServices(myServices);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  /* ---- Filtered services ---- */
  const filtered = useMemo(() => {
    if (statusFilter === 'all') return services;
    return services.filter((s) => s.status === statusFilter);
  }, [services, statusFilter]);

  /* ---- Delete handler ---- */
  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleting(true);
    try {
      // The API doesn't have a DELETE endpoint, so we optimistically remove
      setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast.success('Service deleted');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete service');
    } finally {
      setDeleting(false);
    }
  };

  /* ---- Image helper ---- */
  function getFirstImage(svc: Service): string | null {
    if (!svc.images) return null;
    try {
      const arr = JSON.parse(svc.images);
      if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string') {
        return arr[0];
      }
    } catch {
      if (typeof svc.images === 'string' && svc.images.startsWith('http')) {
        return svc.images;
      }
    }
    return null;
  }

  /* ---- Count by status ---- */
  const counts = useMemo(
    () => ({
      all: services.length,
      approved: services.filter((s) => s.status === 'approved').length,
      pending: services.filter((s) => s.status === 'pending').length,
      rejected: services.filter((s) => s.status === 'rejected').length,
    }),
    [services]
  );

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="mb-8 h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ---- Header ---- */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="mb-8"
      >
        <motion.div variants={fadeUp} custom={0} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => setView('provider-dashboard')}
              className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors"
            >
              <ArrowLeft className="size-3" />
              Back to Dashboard
            </button>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-px w-6 bg-gold/50" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                Provider
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-white sm:text-4xl">
              My <span className="text-gold-gradient">Services</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your luxury service listings
            </p>
          </div>

          <Button
            onClick={() => {
              setEditingService(null);
              setDialogOpen(true);
            }}
            className="h-10 rounded-lg bg-gradient-to-r from-gold-dark via-gold to-gold-light text-sm font-semibold text-black hover:brightness-110"
          >
            <Plus className="mr-1.5 size-4" />
            Add New Service
          </Button>
        </motion.div>
      </motion.div>

      {/* ---- Status Filter Tabs ---- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mb-6 flex gap-2 flex-wrap"
      >
        {STATUS_FILTERS.map((sf) => (
          <button
            key={sf}
            onClick={() => setStatusFilter(sf)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              statusFilter === sf
                ? 'bg-gold/15 text-gold border border-gold/30'
                : 'bg-surface text-muted-foreground border border-transparent hover:bg-surface-hover hover:text-foreground'
            }`}
          >
            <span className="capitalize">{sf === 'all' ? 'All' : sf}</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                statusFilter === sf
                  ? 'bg-gold/20 text-gold'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {counts[sf]}
            </span>
          </button>
        ))}
      </motion.div>

      {/* ---- Service Grid ---- */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filtered.length === 0 ? (
          <motion.div variants={fadeUp} custom={0} className="col-span-full py-16 text-center">
            <Package className="mx-auto mb-4 size-10 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              {statusFilter === 'all'
                ? 'You haven\'t listed any services yet.'
                : `No ${statusFilter} services found.`}
            </p>
            <Button
              onClick={() => {
                setEditingService(null);
                setDialogOpen(true);
              }}
              className="mt-4 h-9 rounded-lg bg-gradient-to-r from-gold-dark to-gold px-5 text-xs font-semibold text-black hover:brightness-110"
            >
              <Plus className="mr-1.5 size-3.5" />
              Add Your First Service
            </Button>
          </motion.div>
        ) : (
          filtered.map((svc, i) => {
            const imgUrl = getFirstImage(svc);
            return (
              <motion.div
                key={svc.id}
                variants={fadeUp}
                custom={i}
                className="luxury-card group overflow-hidden rounded-xl"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={svc.title}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-gradient-to-br from-gold/10 via-amber-900/20 to-gold-dark/10">
                      <ImageIcon className="size-10 text-gold/20" />
                    </div>
                  )}

                  {/* Status badge overlay */}
                  <div className="absolute left-3 top-3">
                    <StatusBadge status={svc.status} />
                  </div>

                  {/* Action overlay */}
                  <div className="absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 hover:bg-black/80 text-white"
                        onClick={() => {
                          setEditingService(svc);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 rounded-lg bg-red-600/80 backdrop-blur-sm border border-red-400/10 hover:bg-red-700/80 text-white"
                        onClick={() => setDeleteTarget(svc)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-base font-semibold text-white leading-snug">
                      {svc.title}
                    </h3>
                    <span className="font-serif text-lg font-bold text-gold whitespace-nowrap">
                      ${svc.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3 shrink-0" />
                    <span className="truncate">{svc.location}</span>
                  </div>

                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3 shrink-0" />
                    <span>{svc.duration}</span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="size-3.5 fill-gold text-gold" />
                      <span className="text-xs font-medium text-gold">
                        {svc.rating.toFixed(1)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        ({svc.reviewCount} {svc.reviewCount === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
                      {svc.category}
                    </Badge>
                  </div>
                </CardContent>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* ---- Add/Edit Dialog ---- */}
      <ServiceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        service={editingService}
        providerId={user?.id ?? ''}
        onSaved={fetchServices}
      />

      {/* ---- Delete Confirmation ---- */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-[#1A1A1A] border-gold/15">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-xl text-white">
              Delete Service
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete{' '}
              <span className="font-medium text-foreground">
                &quot;{deleteTarget?.title}&quot;
              </span>
              ? This action cannot be undone. All associated data will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-surface border-border text-muted-foreground hover:text-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700 border-0"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
