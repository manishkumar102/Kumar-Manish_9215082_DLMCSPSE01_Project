'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import {
  Diamond,
  Globe,
  ShieldCheck,
  Award,
  Heart,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

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
  visible: { transition: { staggerChildren: 0.1 } },
};

const values = [
  {
    icon: ShieldCheck,
    title: 'Trust & Security',
    description:
      'Every provider undergoes rigorous vetting. Your transactions and data are protected with bank-level encryption and our secure escrow system.',
  },
  {
    icon: Award,
    title: 'Uncompromising Quality',
    description:
      'We accept only the top 5% of luxury service providers. Each experience is curated to meet the highest standards of excellence.',
  },
  {
    icon: Heart,
    title: 'Personalized Service',
    description:
      'Our dedicated concierge team provides 24/7 support, tailoring every recommendation to your unique preferences and lifestyle.',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description:
      'Access premium services across 50+ cities worldwide. From New York to Dubai, your luxury lifestyle travels with you.',
  },
];

const team = [
  { name: 'Manish Kumar', role: 'Project Developer', initial: 'MK' },
];

const milestones = [
  { year: 'Sprint 1', event: 'Weeks 1–4: Project inception, requirement gathering, conceptual design, technology stack selection (Next.js 16, TypeScript, Prisma), and database schema design.' },
  { year: 'Sprint 2', event: 'Weeks 5–8: Core authentication system (email + Google OAuth), multi-role user management (admin, client, provider), and base UI framework with Tailwind CSS 4 and shadcn/ui.' },
  { year: 'Sprint 3', event: 'Weeks 9–12: Service marketplace with browsing, search, filtering, and booking system. Provider dashboard with service management and booking acceptance.' },
  { year: 'Sprint 4', event: 'Weeks 13–16: Payment integration, review and rating system, favorites, notifications, messaging with real-time Socket.io, and AI concierge assistant.' },
  { year: 'Sprint 5', event: 'Weeks 17–20: Admin dashboard with analytics, user management, and service moderation. Advanced features: service comparison, spending analytics, receipt generation, and provider directory.' },
  { year: 'Sprint 6', event: 'Weeks 21–24: Comprehensive QA testing, bug fixes, UI/UX polish, performance optimization, responsive design refinements, and project documentation.' },
];

export function AboutUsPage() {
  const setView = useAppStore((s) => s.setView);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.04] blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: luxuryEase }}
            className="mb-4 flex items-center justify-center gap-3"
          >
            <span className="h-px w-8 bg-gold/50" />
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Our Story</span>
            <span className="h-px w-8 bg-gold/50" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: luxuryEase }}
            className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
          >
            Redefining <span className="text-gold-gradient">Luxury Living</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: luxuryEase }}
            className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed"
          >
            ConciergeX was born from a simple belief: everyone deserves access to extraordinary
            experiences. We connect the world&apos;s most discerning clients with the finest luxury
            service providers, creating unforgettable moments that transcend the ordinary.
          </motion.p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="border-t border-b border-gold/10 bg-gradient-to-b from-[#0e0e0e] to-[#0A0A0A] py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="text-center"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-2"
            >
              <Sparkles className="size-4 text-gold" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gold">Our Mission</span>
            </motion.div>
            <motion.blockquote
              variants={fadeUp}
              custom={1}
              className="font-serif text-2xl font-medium leading-relaxed text-white sm:text-3xl md:text-4xl"
            >
              &ldquo;To democratize luxury by making the world&apos;s most exclusive
              experiences accessible, seamless, and unforgettable for every client.&rdquo;
            </motion.blockquote>
            <motion.p variants={fadeUp} custom={2} className="mt-6 text-sm text-muted-foreground">
              &mdash; Manish Kumar, Project Developer
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="mb-14 text-center"
          >
            <motion.div variants={fadeUp} custom={0} className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-gold/50" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">What Drives Us</span>
              <span className="h-px w-8 bg-gold/50" />
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="font-serif text-3xl font-bold text-white sm:text-4xl">
              Our Core Values
            </motion.h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="grid gap-6 sm:grid-cols-2"
          >
            {values.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(201, 169, 110, 0.1)' }}
                  className="luxury-card group rounded-xl p-6 sm:p-8"
                >
                  <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-gold/10 text-gold">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="border-t border-gold/10 bg-gradient-to-b from-[#0A0A0A] via-[#0e0e0e] to-[#0A0A0A] py-20 md:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="mb-14 text-center"
          >
            <motion.div variants={fadeUp} custom={0} className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-gold/50" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Our Journey</span>
              <span className="h-px w-8 bg-gold/50" />
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="font-serif text-3xl font-bold text-white sm:text-4xl">
              Key Milestones
            </motion.h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="relative"
          >
            <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-gold/40 via-gold/20 to-gold/40 sm:left-6" />
            <div className="space-y-8">
              {milestones.map((milestone, i) => (
                <motion.div
                  key={milestone.year}
                  variants={fadeUp}
                  custom={i}
                  className="relative flex gap-4 sm:gap-6"
                >
                  <div className="relative z-10 mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-dark via-gold to-gold-light sm:size-10">
                    <Diamond className="size-3 text-black sm:size-4" />
                  </div>
                  <div className="pb-2">
                    <span className="text-sm font-bold text-gold">{milestone.year}</span>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{milestone.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="mb-14 text-center"
          >
            <motion.div variants={fadeUp} custom={0} className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-gold/50" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">The People</span>
              <span className="h-px w-8 bg-gold/50" />
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="font-serif text-3xl font-bold text-white sm:text-4xl">
              Leadership Team
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mx-auto mt-4 max-w-xl text-muted-foreground">
              The dedicated developer behind ConciergeX, bringing this luxury services marketplace to life as an academic project.
            </motion.p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-3xl mx-auto"
          >
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -4 }}
                className="luxury-card group flex flex-col items-center rounded-xl p-5 text-center"
              >
                <div className="mb-3 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-gold-dark to-gold shadow-lg shadow-gold/20 transition-shadow duration-300 group-hover:shadow-gold/30">
                  <span className="text-lg font-bold text-black">{member.initial}</span>
                </div>
                <h3 className="text-sm font-semibold text-white">{member.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{member.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gold/10 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} custom={0} className="font-serif text-3xl font-bold text-white sm:text-4xl">
              Join the <span className="text-gold-gradient">ConciergeX</span> Experience
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-4 text-muted-foreground">
              Whether you&apos;re seeking exclusive services or looking to offer your expertise,
              we&apos;d love to hear from you.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setView('register')}
                  size="lg"
                  className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background font-semibold border-0 px-8 shadow-lg shadow-gold/20"
                >
                  Get Started
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setView('contact')}
                  variant="outline"
                  size="lg"
                  className="border-gold/30 hover:border-gold hover:text-gold px-8"
                >
                  Contact Us
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
