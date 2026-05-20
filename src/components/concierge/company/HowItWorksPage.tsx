'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import {
  Search,
  CalendarCheck,
  ShieldCheck,
  Crown,
  ArrowRight,
  Star,
  MessageSquare,
  CreditCard,
  PartyPopper,
  Headphones,
  CheckCircle2,
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

const steps = [
  {
    num: 1,
    icon: Search,
    title: 'Browse & Discover',
    description:
      'Explore our curated collection of premium services from verified luxury providers around the globe. Filter by category, location, price, and more.',
    details: ['Browse 16 luxury categories', 'Filter by location & budget', 'Read verified reviews', 'Compare providers'],
  },
  {
    num: 2,
    icon: CalendarCheck,
    title: 'Book & Confirm',
    description:
      'Select your preferred date, time, and number of guests. Your booking is instantly confirmed with flexible scheduling and secure payment processing.',
    details: ['Choose date, time & guests', 'Instant confirmation', 'Secure payment processing', 'Add special requests'],
  },
  {
    num: 3,
    icon: Crown,
    title: 'Experience Luxury',
    description:
      'Enjoy a world-class luxury experience backed by our satisfaction guarantee and 24/7 dedicated concierge support throughout your journey.',
    details: ['World-class experience', '24/7 concierge support', 'Satisfaction guaranteed', 'Leave a review'],
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: 'Verified Providers',
    description: 'Every provider is vetted through a rigorous multi-step verification process.',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Bank-level encryption with secure escrow — funds released only after service completion.',
  },
  {
    icon: MessageSquare,
    title: 'Direct Messaging',
    description: 'Communicate directly with your provider before, during, and after your experience.',
  },
  {
    icon: Star,
    title: 'Genuine Reviews',
    description: 'Read authentic reviews from verified clients who have experienced the service.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our dedicated concierge team is available around the clock to assist you.',
  },
  {
    icon: PartyPopper,
    title: 'Satisfaction Guaranteed',
    description: "If the experience doesn't meet expectations, we'll make it right or refund you.",
  },
];

const faqs = [
  {
    question: 'How do I book a luxury service?',
    answer:
      'Simply browse our marketplace, select the service you want, choose your preferred date and time, and confirm your booking. Payment is processed securely, and you\'ll receive instant confirmation.',
  },
  {
    question: 'How are providers verified?',
    answer:
      'Each provider undergoes a comprehensive vetting process including identity verification, credential checks, reference validation, and a trial period. Only the top 5% of applicants are accepted.',
  },
  {
    question: 'What is your cancellation policy?',
    answer:
      'Most services can be cancelled or rescheduled up to 48 hours before the scheduled time for a full refund. Each provider may have specific policies listed on their service page.',
  },
  {
    question: 'How does the payment system work?',
    answer:
      'Payments are held in a secure escrow account until the service is completed. Once you confirm the service was delivered as expected, the provider receives their payment. ConciergeX charges a 15% platform fee.',
  },
  {
    question: 'Can I communicate with my provider before booking?',
    answer:
      'Yes! Once you create an account, you can message any provider directly to ask questions, discuss special requests, or clarify details before making your booking.',
  },
  {
    question: 'What if the service doesn\'t meet my expectations?',
    answer:
      'We have a satisfaction guarantee. If the service falls short of the description or your expectations, contact our 24/7 support team and we\'ll work to resolve the issue or process a refund.',
  },
];

export function HowItWorksPage() {
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
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Simple & Seamless</span>
            <span className="h-px w-8 bg-gold/50" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: luxuryEase }}
            className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
          >
            How It <span className="text-gold-gradient">Works</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: luxuryEase }}
            className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed"
          >
            Three simple steps to unlock a world of extraordinary experiences. From browsing to booking,
            we&apos;ve made luxury accessible and effortless.
          </motion.p>
        </div>
      </section>

      {/* 3 Steps */}
      <section className="border-t border-gold/10 bg-gradient-to-b from-[#0e0e0e] to-[#0A0A0A] py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="relative grid gap-8 md:grid-cols-3 md:gap-6"
          >
            {/* Connector lines */}
            <div className="pointer-events-none absolute left-0 right-0 top-[52px] hidden h-px md:block">
              <div className="mx-auto h-full w-4/5 bg-gradient-to-r from-gold/40 via-gold/20 to-gold/40 [border-top:2px_dashed_rgba(201,169,110,0.2)]" />
            </div>

            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  variants={fadeUp}
                  custom={i}
                  className="relative flex flex-col items-center text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(201, 169, 110, 0.3)' }}
                    className="relative z-10 mb-6 flex size-[72px] items-center justify-center rounded-full bg-gradient-to-br from-gold-dark via-gold to-gold-light shadow-lg shadow-gold/20"
                  >
                    <span className="text-xl font-bold text-black">{step.num}</span>
                  </motion.div>

                  <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-gold/10 text-gold">
                    <Icon className="size-6" />
                  </div>

                  <h3 className="font-serif text-xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>

                  {/* Detail list */}
                  <ul className="mt-4 space-y-2">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="size-3.5 shrink-0 text-gold/60" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Platform Features */}
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
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Why ConciergeX</span>
              <span className="h-px w-8 bg-gold/50" />
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="font-serif text-3xl font-bold text-white sm:text-4xl">
              Platform Features
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Everything you need for a seamless luxury experience, all in one platform.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(201, 169, 110, 0.1)' }}
                  className="luxury-card group rounded-xl p-6"
                >
                  <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-gold/10 text-gold">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
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
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">FAQ</span>
              <span className="h-px w-8 bg-gold/50" />
            </motion.div>
            <motion.h2 variants={fadeUp} custom={1} className="font-serif text-3xl font-bold text-white sm:text-4xl">
              Frequently Asked Questions
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="space-y-4"
          >
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="luxury-card rounded-xl p-6"
              >
                <h3 className="font-serif text-base font-semibold text-white">{faq.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
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
              Ready to Get Started?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-4 text-muted-foreground">
              Create your free account and start exploring the world&apos;s finest luxury services today.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setView('services')}
                  size="lg"
                  className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background font-semibold border-0 px-8 shadow-lg shadow-gold/20"
                >
                  Explore Services
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setView('register')}
                  variant="outline"
                  size="lg"
                  className="border-gold/30 hover:border-gold hover:text-gold px-8"
                >
                  Create Account
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
