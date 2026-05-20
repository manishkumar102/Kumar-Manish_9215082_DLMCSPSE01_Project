'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Info,
  AlertTriangle,
  CalendarCheck,
  MessageSquare,
  X,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'booking' | 'message';

interface ToastInput {
  type: string;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration: number;
}

interface NotificationContextValue {
  showNotification: (data: ToastInput) => void;
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const MAX_VISIBLE = 4;
const DEFAULT_DURATION = 5000;

const ease = [0.22, 1, 0.36, 1] as const;

/** Visual configuration per toast type */
const TOAST_STYLE: Record<
  ToastType,
  {
    icon: typeof CheckCircle2;
    borderColor: string;
    iconColor: string;
    iconBg: string;
    progressBarColor: string;
    tint: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    borderColor: 'border-l-emerald-500',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15',
    progressBarColor: 'bg-emerald-500',
    tint: 'bg-emerald-500/[0.04]',
  },
  error: {
    icon: XCircle,
    borderColor: 'border-l-red-500',
    iconColor: 'text-red-400',
    iconBg: 'bg-red-500/15',
    progressBarColor: 'bg-red-500',
    tint: 'bg-red-500/[0.04]',
  },
  info: {
    icon: Info,
    borderColor: 'border-l-blue-400',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-400/15',
    progressBarColor: 'bg-blue-400',
    tint: 'bg-blue-400/[0.04]',
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-l-amber-400',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-400/15',
    progressBarColor: 'bg-amber-400',
    tint: 'bg-amber-400/[0.04]',
  },
  booking: {
    icon: CalendarCheck,
    borderColor: 'border-l-gold',
    iconColor: 'text-gold',
    iconBg: 'bg-gold/15',
    progressBarColor: 'bg-gold',
    tint: 'bg-gold/[0.04]',
  },
  message: {
    icon: MessageSquare,
    borderColor: 'border-l-gold',
    iconColor: 'text-gold-light',
    iconBg: 'bg-gold/15',
    progressBarColor: 'bg-gold',
    tint: 'bg-gold/[0.04]',
  },
};

const VALID_TYPES: ReadonlySet<string> = new Set<string>([
  'success',
  'error',
  'info',
  'warning',
  'booking',
  'message',
]);

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                         */
/* -------------------------------------------------------------------------- */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0 },
  },
  exit: {
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
};

const toastVariants = {
  initial: {
    opacity: 0,
    x: 80,
    scale: 0.92,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.45, ease },
  },
  exit: {
    opacity: 0,
    x: 60,
    scale: 0.92,
    filter: 'blur(2px)',
    transition: { duration: 0.3, ease },
  },
};

const progressVariants = {
  initial: { width: '100%' },
  animate: {
    width: '0%',
    transition: { duration: 5, ease: 'linear' },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

let idCounter = 0;
function generateToastId(): string {
  idCounter += 1;
  return `toast-${Date.now()}-${idCounter}`;
}

function resolveType(raw: string): ToastType {
  return VALID_TYPES.has(raw) ? (raw as ToastType) : 'info';
}

/* -------------------------------------------------------------------------- */
/*  Context                                                                    */
/* -------------------------------------------------------------------------- */

const NotificationContext = createContext<NotificationContextValue | null>(null);

/* -------------------------------------------------------------------------- */
/*  Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      'useNotification must be used within a <NotificationProvider />'
    );
  }
  return ctx;
}

/* -------------------------------------------------------------------------- */
/*  Single Toast                                                               */
/* -------------------------------------------------------------------------- */

interface SingleToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

function SingleToast({ toast, onDismiss }: SingleToastProps) {
  const style = TOAST_STYLE[toast.type];
  const IconComponent = style.icon;
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Set up auto-dismiss timer */
  useEffect(() => {
    dismissTimerRef.current = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration);

    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, [toast.id, toast.duration, onDismiss]);

  const handleDismiss = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
    }
    onDismiss(toast.id);
  }, [toast.id, onDismiss]);

  /* Dynamically compute progress bar duration */
  const progressDuration = toast.duration / 1000;

  return (
    <motion.div
      layout
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`group relative w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border
        border-border/60 border-l-[4px] ${style.borderColor}
        ${style.tint} bg-card/95 shadow-2xl shadow-black/40 backdrop-blur-xl`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Content row */}
      <div className="flex items-start gap-3 px-4 py-3.5">
        {/* Icon */}
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${style.iconBg}`}
        >
          <IconComponent className={`size-[18px] ${style.iconColor}`} />
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-snug text-foreground">
            {toast.title}
          </p>
          {toast.message && (
            <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
              {toast.message}
            </p>
          )}
        </div>

        {/* Dismiss button */}
        <motion.button
          onClick={handleDismiss}
          whileHover={{ scale: 1.15, rotate: 90 }}
          whileTap={{ scale: 0.85 }}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/50
            transition-colors hover:bg-gold/10 hover:text-gold"
          aria-label="Dismiss notification"
        >
          <X className="size-3.5" />
        </motion.button>
      </div>

      {/* Progress bar */}
      <motion.div
        key={toast.id}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: progressDuration, ease: 'linear' }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
        className={`h-[2px] origin-left ${style.progressBarColor} opacity-60`}
      />
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Provider                                                                   */
/* -------------------------------------------------------------------------- */

export function NotificationProvider({ children }: { children?: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  /* Dismiss a toast by id */
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* Show a new notification */
  const showNotification = useCallback(
    (data: ToastInput) => {
      const newToast: ToastItem = {
        id: generateToastId(),
        type: resolveType(data.type),
        title: data.title,
        message: data.message,
        duration: data.duration ?? DEFAULT_DURATION,
      };

      setToasts((prev) => {
        /* Enforce max visible limit — remove oldest when at capacity */
        const next = [...prev, newToast];
        if (next.length > MAX_VISIBLE) {
          return next.slice(next.length - MAX_VISIBLE);
        }
        return next;
      });
    },
    []
  );

  /* Memoize context value to avoid unnecessary re-renders */
  const contextValue = useMemo(
    () => ({ showNotification }),
    [showNotification]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}

      {/* Toast container — fixed top-right */}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[60] flex flex-col-reverse items-end gap-3 sm:right-6 sm:top-6"
        aria-label="Notifications"
        role="region"
      >
        <AnimatePresence
          initial={false}
          mode="popLayout"
          variants={containerVariants}
        >
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <SingleToast toast={toast} onDismiss={dismissToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}
