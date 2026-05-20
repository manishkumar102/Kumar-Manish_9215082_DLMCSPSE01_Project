'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useAppStore, type Service } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, ArrowRight, Search, CalendarCheck, Crown, ChevronRight, ChevronLeft, Quote } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const CATEGORIES = [
  { name: 'Fine Dining', emoji: '🍽', description: 'Michelin-starred chefs & private dining experiences', key: 'fine-dining' },
  { name: 'Yacht & Charter', emoji: '🛥️', description: 'Luxury superyachts & sailing adventures', key: 'yacht-charter' },
  { name: 'Private Aviation', emoji: '✈️', description: 'Private jets & helicopter transfers', key: 'private-aviation' },
  { name: 'Luxury Transport', emoji: '🚗', description: 'Chauffeur services & exotic car rentals', key: 'luxury-transport' },
  { name: 'Beauty & Wellness', emoji: '💆', description: 'Exclusive spas & personal wellness retreats', key: 'beauty-wellness' },
  { name: 'Art & Culture', emoji: '🎭', description: 'Private gallery tours & cultural experiences', key: 'art-culture' },
  { name: 'Real Estate', emoji: '🏠', description: 'Luxury property viewings & investment advisory', key: 'real-estate' },
  { name: 'Personal Shopping', emoji: '🛍', description: 'Bespoke styling & luxury personal shoppers', key: 'personal-shopping' },
  { name: 'Events & Entertainment', emoji: '🎨', description: 'Exclusive events & VIP entertainment access', key: 'events-entertainment' },
  { name: 'Wine & Spirits', emoji: '🍷', description: 'Private tastings, vineyard tours & rare collections', key: 'wine-spirits' },
  { name: 'Adventure & Sports', emoji: '🏔', description: 'Heliskiing, safaris & extreme luxury adventures', key: 'adventure-sports' },
  { name: 'Pets & Lifestyle', emoji: '🐾', description: 'Luxury pet services & lifestyle concierge', key: 'pets-lifestyle' },
  { name: 'Private Security', emoji: '🛡️', description: 'VIP protection, estate security & cyber defense', key: 'private-security' },
  { name: 'Concierge Medicine', emoji: '🏥', description: 'Private doctors, health retreats & diagnostics', key: 'concierge-medicine' },
  { name: 'Photography & Film', emoji: '📷', description: 'Luxury photography, drone cinematography & brand films', key: 'photography-film' },
  { name: 'Luxury Fitness', emoji: '💪', description: 'Celebrity trainers, boxing coaches & yoga retreats', key: 'luxury-fitness' },
] as const;

const TESTIMONIALS = [
  {
    quote: 'ConciergeX transformed our anniversary celebration. The private chef they arranged was extraordinary \u2014 a truly unforgettable evening.',
    name: 'David Williams',
    role: 'Business Executive',
    initial: 'D',
  },
  {
    quote: 'From a superyacht charter in Monaco to a private jet to St. Barts, every booking was flawless. This is how luxury should work.',
    name: 'Sarah Johnson',
    role: 'Travel Enthusiast',
    initial: 'S',
  },
  {
    quote: 'The level of service is unmatched. I\u2019ve used concierge services worldwide, and ConciergeX sets the gold standard.',
    name: 'Michael Brown',
    role: 'Art Collector',
    initial: 'M',
  },
  {
    quote: 'Their attention to detail is extraordinary. Every recommendation was perfectly curated to our exact preferences.',
    name: 'Emily Davis',
    role: 'Event Planner',
    initial: 'E',
  },
] as const;

const STATS = [
  { value: 500, suffix: '+', label: 'Luxury Providers' },
  { value: 10000, suffix: '+', label: 'Successful Bookings' },
  { value: 50, suffix: '+', label: 'Cities Worldwide' },
  { value: 4.9, suffix: '★', label: 'Average Rating', isDecimal: true },
] as const;

/* -------------------------------------------------------------------------- */
/*  Animation helpers                                                         */
/* -------------------------------------------------------------------------- */

const luxuryEase = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: luxuryEase },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* -------------------------------------------------------------------------- */
/*  Count-up hook                                                              */
/* -------------------------------------------------------------------------- */

function useCountUp(target: number, isDecimal: boolean, start: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    const duration = 2000;
    const startTime = Date.now();
    
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      
      if (isDecimal) {
        setCount(parseFloat((target * eased).toFixed(1)));
      } else {
        setCount(Math.floor(target * eased));
      }
      
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };
    
    requestAnimationFrame(tick);
  }, [target, isDecimal, start]);

  return count;
}

/* -------------------------------------------------------------------------- */
/*  Section wrapper                                                           */
/* -------------------------------------------------------------------------- */

function Section({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`relative py-20 md:py-24 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

function SectionHeading({
  title,
  subtitle,
  accent = true,
}: {
  title: string;
  subtitle?: string;
  accent?: boolean;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={fadeUp}
      custom={0}
      className="mb-14 text-center"
    >
      {accent && (
        <div className="mx-auto mb-4 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-gold/50" />
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Exclusive
          </span>
          <span className="h-px w-8 bg-gold/50" />
        </div>
      )}
      <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Star rating component                                                      */
/* -------------------------------------------------------------------------- */

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`size-3.5 ${i < Math.round(rating) ? 'fill-gold text-gold' : 'text-muted-foreground/40'}`}
        />
      ))}
      <span className="ml-1 text-xs font-medium text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hero Section                                                              */
/* -------------------------------------------------------------------------- */

function HeroSection() {
  const setView = useAppStore((s) => s.setView);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const line1Y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const line2Y = useTransform(scrollYProgress, [0, 1], ['0%', '60%']);
  const glowY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const diamondY = useTransform(scrollYProgress, [0, 1], ['0%', '-20%']);
  const diamondY2 = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <section ref={ref} className="relative flex min-h-[100dvh] items-center overflow-hidden">
      {/* Background with parallax */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-[#0A0A0A] to-[#0A0A0A]"
        style={{ y: bgY }}
      />
      <motion.div 
        className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-[#0A0A0A] to-[#0A0A0A]"
        style={{ opacity: bgOpacity }}
      />

      {/* Decorative gold lines with parallax */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute left-1/2 top-1/4 h-px w-3/5 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/20 to-transparent"
          style={{ y: line1Y }}
        />
        <motion.div
          className="absolute left-1/2 top-[60%] h-px w-2/5 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/10 to-transparent"
          style={{ y: line2Y }}
        />

        {/* Floating diamond decorations */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-gold/[0.07]"
            style={{
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 25}%`,
              fontSize: `${10 + (i % 3) * 6}px`,
              y: i % 2 === 0 ? diamondY : diamondY2,
            }}
            animate={{ y: [0, -14, 0], rotate: [0, 90, 180, 270, 360] }}
            transition={{
              duration: 6 + i * 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Diamond />
          </motion.div>
        ))}
      </div>

      {/* Radial glow with parallax */}
      <motion.div 
        className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.03] blur-[120px]"
        style={{ y: glowY }}
      />

      {/* Content with parallax */}
      <motion.div 
        className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        style={{ y: contentY }}
      >
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge with floating animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: luxuryEase }}
            className="mb-6"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Badge
                variant="outline"
                className="border-gold/30 bg-gold/5 px-4 py-1.5 text-xs tracking-widest text-gold uppercase"
              >
                The World&apos;s Premier Luxury Marketplace
              </Badge>
            </motion.div>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: luxuryEase }}
            className="font-serif text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Experience the Art of{' '}
            <span className="text-gold-gradient">Luxury Living</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: luxuryEase }}
            className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg md:text-xl"
          >
            Discover and book the world&apos;s most exclusive services &mdash; from private
            chefs to superyacht charters.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease: luxuryEase }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                onClick={() => {
                  const store = useAppStore.getState();
                  store.setSearchQuery('');
                  store.setSelectedCategory('all');
                  store.setPriceRange([0, 50000]);
                  store.setSortBy('featured');
                  store.setSelectedLocation('');
                  setView('services');
                }}
                className="h-12 min-w-[200px] rounded-lg bg-gradient-to-r from-gold-dark via-gold to-gold-light px-8 text-sm font-semibold text-black shadow-lg shadow-gold/20 transition-all hover:shadow-gold/40 hover:brightness-110"
              >
                Explore Services
                <ArrowRight className="ml-1 size-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setView('register')}
                className="h-12 min-w-[200px] rounded-lg border-gold/30 px-8 text-sm font-semibold text-gold hover:border-gold/60 hover:bg-gold/5 hover:text-gold"
              >
                Become a Provider
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats bar with count-up */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.85, ease: luxuryEase }}
        className="absolute inset-x-0 bottom-0 z-10 border-t border-gold/10 bg-[#0A0A0A]/80 backdrop-blur-md"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-gold/10 sm:grid-cols-4">
          {STATS.map((stat) => (
            <AnimatedStat key={stat.label} stat={stat} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Animated Stat with count-up                                               */
/* -------------------------------------------------------------------------- */

function AnimatedStat({ stat }: { stat: typeof STATS[number] }) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const count = useCountUp(
    'isDecimal' in stat ? stat.value : stat.value,
    !!('isDecimal' in stat && stat.isDecimal),
    inView
  );

  const displayValue = 'isDecimal' in stat && stat.isDecimal 
    ? count.toFixed(1)
    : count >= 1000 
      ? `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K`
      : count.toString();

  return (
    <div ref={ref} className="px-4 py-5 text-center sm:py-6">
      <p className="font-serif text-lg font-bold text-gold sm:text-xl">
        {displayValue}{stat.suffix}
      </p>
      <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted-foreground sm:text-xs">
        {stat.label}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Diamond SVG                                                               */
/* -------------------------------------------------------------------------- */

function Diamond() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-full">
      <path d="M12 2L2 12l10 10 10-10L12 2zm0 3.41L18.59 12 12 18.59 5.41 12 12 5.41z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Category Card with Tilt                                                    */
/* -------------------------------------------------------------------------- */

function CategoryCard({ cat, index }: { cat: typeof CATEGORIES[number]; index: number }) {
  const setView = useAppStore((s) => s.setView);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -8, y: x * 8 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  return (
    <motion.button
      key={cat.key}
      variants={fadeUp}
      custom={index}
      onClick={() => {
        const store = useAppStore.getState();
        store.setSearchQuery('');
        store.setSelectedCategory(cat.name);
        store.setPriceRange([0, 50000]);
        store.setSortBy('featured');
        store.setSelectedLocation('');
        setView('services');
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.2s ease-out',
      }}
      className="luxury-card group flex flex-col items-start gap-4 rounded-xl p-6 text-left transition-all"
    >
      <span className="text-4xl transition-transform duration-300 group-hover:scale-110">
        {cat.emoji}
      </span>
      <div className="flex-1">
        <h3 className="font-serif text-lg font-semibold text-white">{cat.name}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {cat.description}
        </p>
      </div>
      <div className="flex items-center gap-1 text-xs font-medium text-gold opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
        Explore <ChevronRight className="size-3" />
      </div>
    </motion.button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Categories Section                                                        */
/* -------------------------------------------------------------------------- */

function CategoriesSection() {
  return (
    <Section className="bg-[#0A0A0A]">
      <SectionHeading
        title="Curated Luxury Categories"
        subtitle="Explore our handpicked selection of the world's finest luxury services, each vetted for excellence."
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={stagger}
        className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      >
        {CATEGORIES.map((cat, i) => (
          <CategoryCard key={cat.key} cat={cat} index={i} />
        ))}
      </motion.div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  How It Works Section                                                      */
/* -------------------------------------------------------------------------- */

function HowItWorksSection() {
  const steps = [
    {
      num: 1,
      icon: <Search className="size-6" />,
      title: 'Browse & Discover',
      description:
        'Explore our curated collection of premium services from verified luxury providers around the globe.',
    },
    {
      num: 2,
      icon: <CalendarCheck className="size-6" />,
      title: 'Book & Confirm',
      description:
        'Seamlessly book your chosen experience with instant confirmation, flexible scheduling, and secure payment.',
    },
    {
      num: 3,
      icon: <Crown className="size-6" />,
      title: 'Experience Luxury',
      description:
        'Enjoy a world-class luxury experience backed by our satisfaction guarantee and 24/7 concierge support.',
    },
  ];

  return (
    <Section className="bg-gradient-to-b from-[#0A0A0A] via-[#0e0e0e] to-[#0A0A0A]">
      <SectionHeading
        title="How It Works"
        subtitle="Three simple steps to unlock a world of extraordinary experiences."
      />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={stagger}
        className="relative grid gap-8 md:grid-cols-3 md:gap-6"
      >
        {/* Dotted connector lines (desktop) */}
        <div className="pointer-events-none absolute left-0 right-0 top-[52px] hidden h-px md:block">
          <div className="mx-auto h-full w-4/5 bg-gradient-to-r from-gold/40 via-gold/20 to-gold/40 [border-top:2px_dashed_rgba(201,169,110,0.2)]" />
        </div>

        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            variants={fadeUp}
            custom={i}
            className="relative flex flex-col items-center text-center"
          >
            {/* Number circle */}
            <motion.div
              whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(201, 169, 110, 0.3)' }}
              className="relative z-10 mb-6 flex size-[72px] items-center justify-center rounded-full bg-gradient-to-br from-gold-dark via-gold to-gold-light shadow-lg shadow-gold/20 transition-shadow duration-500"
            >
              <span className="text-xl font-bold text-black">{step.num}</span>
            </motion.div>

            {/* Icon */}
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-gold/10 text-gold">
              {step.icon}
            </div>

            <h3 className="font-serif text-xl font-semibold text-white">{step.title}</h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Featured Services Section                                                  */
/* -------------------------------------------------------------------------- */

interface ServiceWithProvider extends Service {
  provider: { id: string; name: string; avatar?: string; verified: boolean; location?: string } | undefined;
}

function FeaturedServicesSection() {
  const [services, setServices] = useState<ServiceWithProvider[]>([]);
  const [loading, setLoading] = useState(true);

  const { setSelectedService, setView } = useAppStore();

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/services?featured=true');
        if (res.ok) {
          const data = await res.json();
          setServices(data.services?.slice(0, 6) ?? []);
        }
      } catch {
        // Silently fail — empty grid shown
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  const handleBook = useCallback(
    (service: Service) => {
      setSelectedService(service);
      setView('service-detail');
    },
    [setSelectedService, setView],
  );

  function getFirstImage(svc: Service): string | null {
    if (!svc.images) return null;
    try {
      const arr = JSON.parse(svc.images);
      if (Array.isArray(arr) && arr.length > 0 && typeof arr[0] === 'string') {
        return arr[0];
      }
    } catch {
      // Single URL string
      if (typeof svc.images === 'string' && svc.images.startsWith('http')) {
        return svc.images;
      }
    }
    return null;
  }

  const placeholders = [
    'from-gold/20 via-amber-900/30 to-gold-dark/20',
    'from-amber-800/30 via-gold-dark/20 to-stone-900/30',
    'from-stone-800/30 via-gold/20 to-amber-900/20',
  ];

  return (
    <Section className="bg-[#0A0A0A]">
      <SectionHeading
        title="Featured Experiences"
        subtitle="Hand-picked by our curators for their exceptional quality and unforgettable experiences."
      />

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="luxury-card overflow-hidden rounded-xl">
              <div className="aspect-[4/3] animate-shimmer" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-3/4 animate-shimmer rounded bg-muted" />
                <div className="h-3 w-1/2 animate-shimmer rounded bg-muted" />
                <div className="h-9 w-full animate-shimmer rounded-lg bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-12 text-center"
        >
          <p className="text-muted-foreground">Featured services are coming soon. Stay tuned!</p>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={stagger}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((svc, i) => {
            const imgUrl = getFirstImage(svc);
            return (
              <motion.div
                key={svc.id}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(201, 169, 110, 0.12)' }}
                transition={{ duration: 0.3, ease: luxuryEase }}
                className="luxury-card group overflow-hidden rounded-xl cursor-pointer"
                onClick={() => handleBook(svc)}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={svc.title}
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className={`size-full bg-gradient-to-br ${placeholders[i % placeholders.length]}`}
                    />
                  )}
                  {/* Category badge overlay */}
                  <div className="absolute left-3 top-3">
                    <Badge className="border-gold/30 bg-black/60 text-[11px] text-gold backdrop-blur-sm">
                      {svc.category}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-5">
                  <h3 className="font-serif text-lg font-semibold leading-snug text-white">
                    {svc.title}
                  </h3>

                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="size-3 shrink-0" />
                    <span className="truncate">{svc.location}</span>
                  </div>

                  <div className="mt-2.5">
                    <StarRating rating={svc.rating} />
                  </div>

                  {/* Provider */}
                  {svc.provider && (
                    <div className="mt-3 flex items-center gap-2">
                      <Avatar className="size-6 border border-gold/20">
                        <AvatarImage src={svc.provider.avatar} alt={svc.provider.name} />
                        <AvatarFallback className="bg-gold/10 text-[10px] text-gold">
                          {svc.provider.name?.charAt(0) ?? 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-xs text-muted-foreground">
                        {svc.provider.name}
                      </span>
                    </div>
                  )}

                  {/* Price + CTA */}
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="font-serif text-xl font-bold text-gold">
                        ${svc.price.toLocaleString()}
                      </span>
                      <span className="ml-1 text-xs text-muted-foreground">/ {svc.duration}</span>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleBook(svc); }}
                        className="h-9 rounded-lg bg-gradient-to-r from-gold-dark to-gold px-4 text-xs font-semibold text-black hover:brightness-110"
                      >
                        Book Now
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {services.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Button
            variant="outline"
            onClick={() => {
              const store = useAppStore.getState();
              store.setSearchQuery('');
              store.setSelectedCategory('all');
              store.setPriceRange([0, 50000]);
              store.setSortBy('featured');
              store.setSelectedLocation('');
              store.setView('services');
            }}
            className="mx-auto h-11 rounded-lg border-gold/30 px-8 text-sm font-semibold text-gold hover:border-gold/60 hover:bg-gold/5 hover:text-gold"
          >
            View All Services
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </motion.div>
      )}
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Testimonials Section with Carousel                                         */
/* -------------------------------------------------------------------------- */

function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const goTo = useCallback((newIndex: number) => {
    setDirection(newIndex > activeIndex ? 1 : -1);
    setActiveIndex(newIndex);
  }, [activeIndex]);

  const goNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(goNext, 6000);
    return () => clearInterval(timer);
  }, [goNext]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0, scale: 0.95 }),
  };

  return (
    <Section className="bg-gradient-to-b from-[#0A0A0A] via-[#0e0e0e] to-[#0A0A0A]">
      <SectionHeading
        title="What Our Clients Say"
        subtitle="Real experiences from discerning clients who trust ConciergeX."
      />

      <div className="relative mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-2xl border border-gold/10 bg-gradient-to-b from-[#1A1A1A] to-[#141414] p-8 md:p-12">
          {/* Quote icon */}
          <div className="absolute right-6 top-6 text-gold/10">
            <Quote className="size-12" />
          </div>

          <div className="relative min-h-[200px] flex items-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={activeIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: luxuryEase }}
                className="w-full"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
                  {/* Avatar */}
                  <Avatar className="size-16 shrink-0 border-2 border-gold/30 shadow-lg shadow-gold/10">
                    <AvatarFallback className="bg-gradient-to-br from-gold-dark to-gold text-xl font-bold text-black">
                      {TESTIMONIALS[activeIndex].initial}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    {/* Stars */}
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(5)].map((_, si) => (
                        <Star key={si} className="size-4 fill-gold text-gold" />
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-base md:text-lg leading-relaxed text-muted-foreground italic">
                      &ldquo;{TESTIMONIALS[activeIndex].quote}&rdquo;
                    </p>

                    {/* Author */}
                    <div className="mt-4 flex items-center gap-2">
                      <p className="text-sm font-semibold text-white">{TESTIMONIALS[activeIndex].name}</p>
                      <span className="text-gold/40">•</span>
                      <p className="text-xs text-muted-foreground">{TESTIMONIALS[activeIndex].role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            {/* Dots */}
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === activeIndex
                      ? 'w-8 bg-gold'
                      : 'w-1.5 bg-gold/20 hover:bg-gold/40'
                  }`}
                />
              ))}
            </div>

            {/* Arrows */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={goPrev}
                className="flex size-9 items-center justify-center rounded-full border border-gold/20 text-gold hover:bg-gold/10 transition-colors"
              >
                <ChevronLeft className="size-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={goNext}
                className="flex size-9 items-center justify-center rounded-full border border-gold/20 text-gold hover:bg-gold/10 transition-colors"
              >
                <ChevronRight className="size-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stats Section                                                             */
/* -------------------------------------------------------------------------- */

function StatsSection() {
  const bigStats = [
    { value: 500, suffix: '+', label: 'Luxury Providers', icon: Crown },
    { value: 10000, suffix: '+', label: 'Bookings Completed', icon: CalendarCheck, formatK: true },
    { value: 50, suffix: '+', label: 'Cities Worldwide', icon: MapPin },
    { value: 4.9, suffix: '★', label: 'Average Rating', icon: Star, isDecimal: true },
  ];

  return (
    <Section className="bg-[#0A0A0A] py-16 md:py-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={stagger}
        className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8"
      >
        {bigStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(201, 169, 110, 0.1)' }}
              className="flex flex-col items-center gap-3 text-center rounded-xl p-4 transition-shadow duration-300"
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
                className="flex size-14 items-center justify-center rounded-full bg-gold/10"
              >
                <Icon className="size-6 text-gold" />
              </motion.div>
              <StatCountUp target={stat.value} suffix={stat.suffix} isDecimal={!!stat.isDecimal} formatK={!!stat.formatK} />
              <p className="text-xs uppercase tracking-widest text-muted-foreground sm:text-sm">
                {stat.label}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </Section>
  );
}

function StatCountUp({ target, suffix, isDecimal, formatK }: { target: number; suffix: string; isDecimal: boolean; formatK: boolean }) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const count = useCountUp(target, isDecimal, inView);

  let displayValue: string;
  if (isDecimal) {
    displayValue = count.toFixed(1);
  } else if (formatK && count >= 1000) {
    displayValue = count >= 10000 ? `${Math.round(count / 1000)}K` : `${(count / 1000).toFixed(1)}K`;
  } else {
    displayValue = count.toString();
  }

  return (
    <p ref={ref} className="font-serif text-3xl font-bold text-gold sm:text-4xl md:text-5xl">
      {displayValue}<span className="ml-0.5 text-gold">{suffix}</span>
    </p>
  );
}

/* -------------------------------------------------------------------------- */
/*  Final CTA Section                                                         */
/* -------------------------------------------------------------------------- */

function FinalCTASection() {
  const setView = useAppStore((s) => s.setView);

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#111] to-[#0A0A0A]" />

      {/* Decorative glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.04] blur-[100px]" />

      {/* Gold lines */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute bottom-0 left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={fadeUp}
          custom={0}
        >
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-gold/10"
          >
            <Crown className="size-8 text-gold" />
          </motion.div>

          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to Experience{' '}
            <span className="text-gold-gradient">Luxury?</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Join thousands of discerning clients who have elevated their lifestyle
            with ConciergeX. Your next extraordinary experience awaits.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                onClick={() => {
                  const store = useAppStore.getState();
                  store.setSearchQuery('');
                  store.setSelectedCategory('all');
                  store.setPriceRange([0, 50000]);
                  store.setSortBy('featured');
                  store.setSelectedLocation('');
                  setView('services');
                }}
                className="h-12 min-w-[200px] rounded-lg bg-gradient-to-r from-gold-dark via-gold to-gold-light px-8 text-sm font-semibold text-black shadow-lg shadow-gold/20 transition-all hover:shadow-gold/40 hover:brightness-110"
              >
                Browse Services
                <ArrowRight className="ml-1 size-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setView('register')}
                className="h-12 min-w-[200px] rounded-lg border-gold/30 px-8 text-sm font-semibold text-gold hover:border-gold/60 hover:bg-gold/5 hover:text-gold"
              >
                Join as Provider
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Animated Stats Counter Section                                           */
/* -------------------------------------------------------------------------- */

function AnimatedStatsCounterSection() {
  const metricsStats = [
    { value: 500, suffix: '+', label: 'Luxury Providers', icon: Crown, isDecimal: false },
    { value: 1200, suffix: '+', label: 'Premium Services', icon: CalendarCheck, isDecimal: false },
    { value: 45, suffix: '+', label: 'Countries Served', icon: MapPin, isDecimal: false },
    { value: 99.8, suffix: '%', label: 'Client Satisfaction', icon: Star, isDecimal: true },
  ];

  const [sectionInView, setSectionInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setSectionInView(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 md:py-24 bg-gradient-to-b from-[#0A0A0A] via-[#0c0c0c] to-[#0A0A0A]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Trusted Worldwide"
          subtitle="Numbers that reflect our commitment to excellence."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={stagger}
          className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4"
        >
          {metricsStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(201, 169, 110, 0.1)' }}
                className="group relative flex flex-col items-center gap-4 rounded-xl border border-gold/15 bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-sm p-6 md:p-8 text-center transition-shadow duration-300"
              >
                {/* Subtle gold accent line at top */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent rounded-t-xl" />

                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.4 }}
                  className="flex size-14 items-center justify-center rounded-full bg-gold/10 ring-1 ring-gold/20"
                >
                  <Icon className="size-6 text-gold" />
                </motion.div>

                {/* Animated number */}
                <MetricCountUp
                  target={stat.value}
                  suffix={stat.suffix}
                  isDecimal={stat.isDecimal}
                  started={sectionInView}
                />

                {/* Label */}
                <p className="text-xs uppercase tracking-widest text-muted-foreground sm:text-sm">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

function MetricCountUp({ target, suffix, isDecimal, started }: { target: number; suffix: string; isDecimal: boolean; started: boolean }) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!started) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  const count = useCountUp(target, isDecimal, inView);

  let displayValue: string;
  if (isDecimal) {
    displayValue = count.toFixed(1);
  } else {
    displayValue = count.toLocaleString();
  }

  return (
    <span ref={ref} className="font-serif text-3xl font-bold text-gold sm:text-4xl md:text-5xl">
      {displayValue}<span className="ml-0.5 text-gold">{suffix}</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Back to Top Button                                                        */
/* -------------------------------------------------------------------------- */

function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          transition={{ duration: 0.3, ease: luxuryEase }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-gold-dark via-gold to-gold-light shadow-lg shadow-gold/25 transition-shadow duration-300 hover:shadow-gold/40"
          whileHover={{ scale: 1.1, boxShadow: '0 8px 30px rgba(201, 169, 110, 0.4)' }}
          whileTap={{ scale: 0.9 }}
          aria-label="Back to top"
        >
          <Diamond className="size-5 text-black rotate-45" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/*  Scroll Progress Indicator                                                 */
/* -------------------------------------------------------------------------- */

function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="scroll-progress"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Landing Page (exported)                                                   */
/* -------------------------------------------------------------------------- */

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <ScrollProgress />
      <HeroSection />
      <CategoriesSection />
      <HowItWorksSection />
      <AnimatedStatsCounterSection />
      <FeaturedServicesSection />
      <TestimonialsSection />
      <StatsSection />
      <FinalCTASection />
      <BackToTopButton />
    </div>
  );
}
