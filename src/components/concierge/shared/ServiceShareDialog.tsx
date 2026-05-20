'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type Service } from '@/store/useAppStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Share2,
  Link2,
  Copy,
  Check,
  Twitter,
  Facebook,
  Mail,
  MessageCircle,
  Diamond,
  QrCode,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface ServiceShareDialogProps {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* -------------------------------------------------------------------------- */
/*  Share platform options                                                     */
/* -------------------------------------------------------------------------- */

interface ShareOption {
  name: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  getUrl: (service: Service, baseUrl: string) => string;
}

const SHARE_OPTIONS: ShareOption[] = [
  {
    name: 'Twitter / X',
    icon: Twitter,
    color: 'text-white',
    bgGradient: 'from-[#1DA1F2] to-[#0C85D0]',
    getUrl: (s, base) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out "${s.title}" on ConciergeX — ${s.category} starting at $${s.price.toLocaleString()}`)}&url=${encodeURIComponent(base)}`,
  },
  {
    name: 'Facebook',
    icon: Facebook,
    color: 'text-white',
    bgGradient: 'from-[#1877F2] to-[#0D65D9]',
    getUrl: (_s, base) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(base)}`,
  },
  {
    name: 'Email',
    icon: Mail,
    color: 'text-white',
    bgGradient: 'from-[#C9A96E] to-[#A08040]',
    getUrl: (s, base) =>
      `mailto:?subject=${encodeURIComponent(`ConciergeX: ${s.title}`)}&body=${encodeURIComponent(`I found this amazing ${s.category.toLowerCase()} service on ConciergeX:\n\n${s.title}\n$${s.price.toLocaleString()}\n${base}`)}`,
  },
  {
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'text-white',
    bgGradient: 'from-[#25D366] to-[#128C7E]',
    getUrl: (s, base) =>
      `https://wa.me/?text=${encodeURIComponent(`Check out "${s.title}" on ConciergeX — $${s.price.toLocaleString()}\n${base}`)}`,
  },
];

/* -------------------------------------------------------------------------- */
/*  Animation                                                                  */
/* -------------------------------------------------------------------------- */

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 + i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* -------------------------------------------------------------------------- */
/*  Main Component                                                             */
/* -------------------------------------------------------------------------- */

export function ServiceShareDialog({ service, open, onOpenChange }: ServiceShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const getShareUrl = useCallback(() => {
    if (!service) return '';
    const base = typeof window !== 'undefined' ? window.location.origin + window.location.pathname + '?service=' + service.id : '';
    return base;
  }, [service]);

  const getEmbedCode = useCallback(() => {
    if (!service) return '';
    return `<a href="${getShareUrl()}" style="color:#C9A96E;text-decoration:none;">${service.title} — ConciergeX</a>`;
  }, [service, getShareUrl]);

  const handleCopyLink = useCallback(async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  }, [getShareUrl]);

  const handleCopyEmbed = useCallback(async () => {
    const code = getEmbedCode();
    try {
      await navigator.clipboard.writeText(code);
      setCopiedEmbed(true);
      toast.success('Embed code copied!');
      setTimeout(() => setCopiedEmbed(false), 2000);
    } catch {
      toast.error('Failed to copy embed code');
    }
  }, [getEmbedCode]);

  const handleShare = useCallback(
    (option: ShareOption) => {
      if (!service) return;
      const url = option.getUrl(service, getShareUrl());
      window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
    },
    [service, getShareUrl]
  );

  if (!service) return null;

  const shareUrl = getShareUrl();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#141414] border-gold/15 p-0 overflow-hidden">
        {/* Header gradient */}
        <div className="relative bg-gradient-to-br from-gold/10 via-transparent to-gold/5 px-6 pt-6 pb-4">
          <div className="absolute top-3 right-3">
            <Diamond className="size-4 text-gold/20" />
          </div>

          <DialogHeader className="text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gold/10">
                <Share2 className="size-5 text-gold" />
              </div>
              <div>
                <DialogTitle className="text-white font-serif text-lg">
                  Share This Service
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-xs">
                  Spread the word about this luxury experience
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Service preview */}
        <div className="px-6 pb-3">
          <div className="flex items-center gap-3 rounded-lg border border-gold/10 bg-surface/50 p-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gold/20 to-gold-dark/10">
              <Diamond className="size-5 text-gold" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {service.title}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {service.category} · ${service.price.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Social share buttons */}
        <div className="px-6 pb-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Share via
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SHARE_OPTIONS.map((option, i) => {
              const Icon = option.icon;
              return (
                <motion.button
                  key={option.name}
                  custom={i}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleShare(option)}
                  className={`flex items-center gap-2.5 rounded-lg bg-gradient-to-r ${option.bgGradient} px-4 py-2.5 text-sm font-medium ${option.color} shadow-lg transition-shadow hover:shadow-xl`}
                >
                  <Icon className="size-4" />
                  {option.name}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Copy link */}
        <div className="px-6 pb-3">
          <div className="gold-separator mb-4" />
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Copy Link
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-lg border border-gold/15 bg-surface px-3 py-2.5">
              <Link2 className="size-4 shrink-0 text-gold/50" />
              <Input
                readOnly
                value={shareUrl}
                className="h-auto border-0 bg-transparent p-0 text-xs text-muted-foreground shadow-none focus-visible:ring-0"
              />
            </div>
            <Button
              onClick={handleCopyLink}
              className={`shrink-0 rounded-lg px-4 transition-all ${
                copied
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                  : 'bg-gold/10 border border-gold/20 text-gold hover:bg-gold/20'
              }`}
              size="sm"
            >
              {copied ? (
                <>
                  <Check className="mr-1.5 size-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 size-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Embed code */}
        <div className="px-6 pb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Embed Code
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-lg border border-gold/15 bg-surface px-3 py-2.5">
              <QrCode className="size-4 shrink-0 text-gold/50" />
              <Input
                readOnly
                value={getEmbedCode()}
                className="h-auto border-0 bg-transparent p-0 text-xs text-muted-foreground shadow-none focus-visible:ring-0"
              />
            </div>
            <Button
              onClick={handleCopyEmbed}
              variant="outline"
              className={`shrink-0 rounded-lg border-gold/15 px-4 text-xs text-muted-foreground hover:text-gold hover:border-gold/30 hover:bg-gold/5 ${
                copiedEmbed ? 'border-emerald-500/30 text-emerald-400' : ''
              }`}
              size="sm"
            >
              {copiedEmbed ? (
                <>
                  <Check className="mr-1.5 size-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 size-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
