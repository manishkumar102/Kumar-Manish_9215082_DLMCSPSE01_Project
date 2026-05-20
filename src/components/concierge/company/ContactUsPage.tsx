'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Instagram,
  Twitter,
  Globe,
  CheckCircle2,
  MessageSquare,
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

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@conciergex.com',
    href: 'mailto:hello@conciergex.com',
    description: 'We respond within 2 hours',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+1 (888) LUX-EXCL',
    href: 'tel:+18885893225',
    description: 'Available 24/7 for VIP clients',
  },
  {
    icon: MapPin,
    label: 'Headquarters',
    value: 'New York City',
    href: null,
    description: 'Also in Dubai, London & Monaco',
  },
  {
    icon: Clock,
    label: 'Support Hours',
    value: '24/7',
    href: null,
    description: 'Concierge team always available',
  },
];

const socialLinks = [
  {
    icon: Instagram,
    label: 'Instagram',
    handle: '@conciergex',
    href: 'https://instagram.com/conciergex',
    color: 'hover:text-pink-400',
  },
  {
    icon: Twitter,
    label: 'Twitter / X',
    handle: '@conciergex',
    href: 'https://x.com/conciergex',
    color: 'hover:text-sky-400',
  },
  {
    icon: Mail,
    label: 'Email',
    handle: 'hello@conciergex.com',
    href: 'mailto:hello@conciergex.com',
    color: 'hover:text-gold',
  },
  {
    icon: Globe,
    label: 'Website',
    handle: 'www.conciergex.com',
    href: '#',
    color: 'hover:text-gold',
  },
];

export function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
    toast.success('Your message has been sent! We\'ll get back to you shortly.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-24">
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.04] blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: luxuryEase }}
            className="mb-4 flex items-center justify-center gap-3"
          >
            <span className="h-px w-8 bg-gold/50" />
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Get in Touch</span>
            <span className="h-px w-8 bg-gold/50" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: luxuryEase }}
            className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
          >
            Contact <span className="text-gold-gradient">Us</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: luxuryEase }}
            className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed"
          >
            Have a question, special request, or want to become a provider?
            Our dedicated concierge team is here to help.
          </motion.p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="border-t border-gold/10 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {contactInfo.map((info, i) => {
              const Icon = info.icon;
              const Wrapper = info.href ? 'a' : 'div';
              return (
                <motion.div
                  key={info.label}
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(201, 169, 110, 0.1)' }}
                  className="luxury-card group rounded-xl p-5"
                >
                  <Wrapper
                    {...(info.href ? { href: info.href, target: info.href.startsWith('http') ? '_blank' : undefined, rel: info.href.startsWith('http') ? 'noopener noreferrer' : undefined } : {})}
                    className="block cursor-pointer"
                  >
                    <div className="mb-3 flex size-11 items-center justify-center rounded-lg bg-gold/10 text-gold">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">{info.label}</h3>
                    <p className="mt-1 text-sm font-medium text-gold">{info.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{info.description}</p>
                  </Wrapper>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Form + Social Links */}
      <section className="border-t border-gold/10 bg-gradient-to-b from-[#0e0e0e] to-[#0A0A0A] py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Contact Form */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={stagger}
              className="lg:col-span-3"
            >
              <motion.div variants={fadeUp} custom={0} className="mb-6">
                <h2 className="font-serif text-2xl font-bold text-white">Send Us a Message</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Fill out the form below and our team will respond within 24 hours.
                </p>
              </motion.div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="luxury-card flex flex-col items-center rounded-xl p-12 text-center"
                >
                  <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle2 className="size-8 text-green-400" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-white">Message Sent!</h3>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Thank you for reaching out. Our concierge team will get back to you within 24 hours.
                  </p>
                  <Button
                    onClick={() => setSubmitted(false)}
                    variant="outline"
                    className="mt-6 border-gold/20 text-gold hover:border-gold/40 hover:bg-gold/5"
                  >
                    Send Another Message
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  variants={fadeUp}
                  custom={1}
                  onSubmit={handleSubmit}
                  className="luxury-card space-y-5 rounded-xl p-6 sm:p-8"
                >
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gold">
                        Name <span className="text-red-400">*</span>
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        required
                        className="h-10 border-gold/15 bg-surface text-sm text-white placeholder:text-muted-foreground focus-visible:border-gold/40 focus-visible:ring-gold/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-gold">
                        Email <span className="text-red-400">*</span>
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                        className="h-10 border-gold/15 bg-surface text-sm text-white placeholder:text-muted-foreground focus-visible:border-gold/40 focus-visible:ring-gold/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gold">
                      Subject
                    </label>
                    <Input
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      className="h-10 border-gold/15 bg-surface text-sm text-white placeholder:text-muted-foreground focus-visible:border-gold/40 focus-visible:ring-gold/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gold">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your inquiry..."
                      required
                      rows={5}
                      className="border-gold/15 bg-surface text-sm text-white placeholder:text-muted-foreground focus-visible:border-gold/40 focus-visible:ring-gold/20 resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-11 w-full rounded-lg bg-gradient-to-r from-gold-dark via-gold to-gold-light text-sm font-semibold text-black shadow-lg shadow-gold/20 transition-all hover:shadow-gold/40 hover:brightness-110 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-block size-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <>
                        <Send className="mr-2 size-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </motion.form>
              )}
            </motion.div>

            {/* Sidebar: Social + Quick Links */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={stagger}
              className="space-y-6 lg:col-span-2"
            >
              {/* Social Links */}
              <motion.div variants={fadeUp} custom={0} className="luxury-card rounded-xl p-6">
                <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold text-white">
                  <MessageSquare className="size-4 text-gold" />
                  Follow Us
                </h3>
                <div className="space-y-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target={social.href.startsWith('http') ? '_blank' : undefined}
                        rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className={`flex items-center gap-3 rounded-lg p-3 transition-all duration-200 hover:bg-surface ${social.color}`}
                      >
                        <div className="flex size-9 items-center justify-center rounded-lg border border-gold/15 bg-gold/5">
                          <Icon className="size-4 text-gold" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{social.label}</p>
                          <p className="text-xs text-muted-foreground">{social.handle}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </motion.div>

              {/* Quick Help */}
              <motion.div variants={fadeUp} custom={1} className="luxury-card rounded-xl p-6">
                <h3 className="mb-3 font-serif text-lg font-semibold text-white">Quick Help</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <span className="text-gold font-medium">New to ConciergeX?</span> Check out our{' '}
                    <a href="#" onClick={(e) => { e.preventDefault(); useAppStore.getState().setView('how-it-works'); }} className="text-gold hover:underline">
                      How It Works
                    </a>{' '}
                    guide.
                  </p>
                  <p>
                    <span className="text-gold font-medium">Want to become a provider?</span>{' '}
                    <a href="#" onClick={(e) => { e.preventDefault(); useAppStore.getState().setView('register'); }} className="text-gold hover:underline">
                      Register here
                    </a>{' '}
                    to start offering your services.
                  </p>
                  <p>
                    <span className="text-gold font-medium">Report an issue?</span> Email us directly at{' '}
                    <a href="mailto:support@conciergex.com" className="text-gold hover:underline">
                      support@conciergex.com
                    </a>
                  </p>
                </div>
              </motion.div>

              {/* Response Time */}
              <motion.div variants={fadeUp} custom={2} className="luxury-card rounded-xl p-6">
                <h3 className="mb-3 font-serif text-lg font-semibold text-white">Response Times</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">General inquiries</span>
                    <span className="text-sm font-medium text-gold">Under 24 hours</span>
                  </div>
                  <div className="h-px bg-gold/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Booking issues</span>
                    <span className="text-sm font-medium text-gold">Under 4 hours</span>
                  </div>
                  <div className="h-px bg-gold/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">VIP clients</span>
                    <span className="text-sm font-medium text-gold">Under 1 hour</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
