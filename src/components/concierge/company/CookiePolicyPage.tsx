'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import {
  Cookie,
  Settings,
  BarChart3,
  Heart,
  ShieldCheck,
  RefreshCw,
  Mail,
  ArrowLeft,
  Eye,
  Globe,
  Lock,
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

const sections = [
  {
    icon: Cookie,
    title: '1. What Are Cookies',
    content: [
      {
        heading: 'Definition',
        text: 'Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit our website. They are widely used to make websites work more efficiently and to provide information to the owners of the site.',
      },
      {
        heading: 'How They Work',
        text: 'When you visit ConciergeX, our servers send a cookie to your browser. Your browser stores this cookie and sends it back to our servers with each subsequent visit. This allows us to recognize your device and remember information about your preferences and past interactions.',
      },
      {
        heading: 'Types of Technology',
        text: 'In addition to cookies, we may use similar technologies such as pixel tags, web beacons, and local storage to collect information about your browsing activity and preferences.',
      },
    ],
  },
  {
    icon: Settings,
    title: '2. How We Use Cookies',
    content: [
      {
        heading: 'Essential Cookies',
        text: 'These cookies are strictly necessary for the operation of our platform. They enable core functionality such as user authentication, session management, security features, and shopping cart functionality. The platform cannot function properly without these cookies.',
      },
      {
        heading: 'Analytics Cookies',
        text: 'We use analytics cookies to understand how visitors interact with our platform. These cookies collect anonymous, aggregated data about which pages are visited most frequently, how users navigate between pages, and where errors may occur. This helps us improve our platform performance and user experience.',
      },
      {
        heading: 'Preference Cookies',
        text: 'These cookies allow our platform to remember choices you make (such as your preferred language, region, or theme settings) and provide enhanced, personalized features. They may also be used to provide services you have requested, such as watching a video or commenting on a blog.',
      },
    ],
  },
  {
    icon: Eye,
    title: '3. Types of Cookies We Use',
    content: [
      {
        heading: 'Session Cookies',
        text: 'Temporary cookies that are deleted when you close your browser. They are used to maintain your session and enable navigation between pages. For example, they remember that you are logged in as you move through different sections of the platform.',
      },
      {
        heading: 'Persistent Cookies',
        text: 'Cookies that remain on your device for a set period of time or until you manually delete them. They are used to remember your preferences and settings across multiple visits. For example, they remember your theme preference (dark/light mode) and notification settings.',
      },
      {
        heading: 'First-Party Cookies',
        text: 'Cookies set by ConciergeX directly. These are used to ensure the platform functions correctly and to collect analytics data about how you use our services.',
      },
      {
        heading: 'Third-Party Cookies',
        text: 'Cookies set by external services that we use on our platform, such as analytics tools, payment processors, and embedded content. These third parties have their own privacy and cookie policies.',
      },
    ],
  },
  {
    icon: Heart,
    title: '4. Managing Cookies',
    content: [
      {
        heading: 'Browser Settings',
        text: 'You can control and manage cookies through your browser settings. Most browsers allow you to refuse or accept cookies, delete existing cookies, and set preferences for certain websites. Please note that disabling essential cookies may affect the functionality of our platform.',
      },
      {
        heading: 'Opt-Out Tools',
        text: 'For analytics cookies, you may opt out through industry-standard tools such as the Network Advertising Initiative opt-out page or the Digital Advertising Alliance opt-out page. You may also use your browser\'s "Do Not Track" feature, though its support varies.',
      },
      {
        heading: 'Mobile Devices',
        text: 'If you access our platform from a mobile device, you can manage your cookie preferences through your device settings. Refer to your device manufacturer\'s instructions for more information.',
      },
    ],
  },
  {
    icon: Globe,
    title: '5. Third-Party Cookies',
    content: [
      {
        heading: 'Analytics Partners',
        text: 'We partner with analytics providers to help us understand usage patterns and improve our platform. These partners may set cookies on your device to collect anonymous usage data. We ensure all analytics partners comply with applicable data protection regulations.',
      },
      {
        heading: 'Payment Processors',
        text: 'When you make a payment on our platform, our payment processing partners (such as Stripe) may set cookies to facilitate secure transactions and prevent fraud. These cookies are essential for the payment process.',
      },
      {
        heading: 'Social Media',
        text: 'Our platform may include social media integration features (such as "Like" or "Share" buttons) that place cookies on your device. These cookies are governed by the respective social media platform\'s privacy policy.',
      },
    ],
  },
  {
    icon: ShieldCheck,
    title: '6. Cookie Security',
    content: [
      {
        heading: 'Protection Measures',
        text: 'We implement industry-standard security measures to protect the data stored in cookies. All cookies are encrypted using SSL/TLS protocols, and sensitive data is stored using HttpOnly and Secure flags to prevent unauthorized access.',
      },
      {
        heading: 'Data Integrity',
        text: 'We regularly audit our cookie practices to ensure compliance with data protection regulations and industry best practices. Any identified vulnerabilities are addressed promptly.',
      },
    ],
  },
  {
    icon: RefreshCw,
    title: '7. Changes to Cookie Policy',
    content: [
      {
        heading: 'Updates',
        text: 'We may update this Cookie Policy from time to time to reflect changes in our practices or in response to regulatory requirements. We will notify you of any material changes by posting the updated policy on our platform.',
      },
      {
        heading: 'Consent',
        text: 'Where required by applicable law, we will obtain your consent before placing non-essential cookies on your device. You may withdraw or change your consent at any time through your browser settings or our cookie preference center.',
      },
    ],
  },
  {
    icon: Mail,
    title: '8. Contact Us',
    content: [
      {
        heading: 'Questions',
        text: 'If you have any questions about our use of cookies or this Cookie Policy, please contact us at privacy@conciergex.com or write to us at ConciergeX Inc., 590 Madison Avenue, 21st Floor, New York, NY 10022.',
      },
      {
        heading: 'Data Protection Officer',
        text: 'For data protection related inquiries, you may also contact our Data Protection Officer directly at dpo@conciergex.com.',
      },
    ],
  },
];

export function CookiePolicyPage() {
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
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Legal</span>
            <span className="h-px w-8 bg-gold/50" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: luxuryEase }}
            className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
          >
            <span className="text-gold-gradient">Cookie Policy</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: luxuryEase }}
            className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed"
          >
            This policy explains how ConciergeX uses cookies and similar technologies to enhance your experience.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-sm text-muted-foreground/60"
          >
            Last updated: January 2025
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Button
              onClick={() => setView('landing')}
              variant="outline"
              className="border-gold/30 hover:border-gold hover:text-gold"
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to Home
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="border-t border-gold/10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="space-y-16"
          >
            {sections.map((section, sectionIndex) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.title}
                  variants={fadeUp}
                  custom={sectionIndex * 0.2}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                      <Icon className="size-5" />
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-white">
                      <span className="text-gold-gradient">{section.title}</span>
                    </h2>
                  </div>
                  <div className="space-y-6 pl-0 sm:pl-13">
                    {section.content.map((item, itemIndex) => (
                      <motion.div
                        key={item.heading}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-40px' }}
                        variants={stagger}
                      >
                        <motion.h3
                          variants={fadeUp}
                          custom={itemIndex * 0.05}
                          className="text-base font-semibold text-white mb-2"
                        >
                          {item.heading}
                        </motion.h3>
                        <motion.p
                          variants={fadeUp}
                          custom={itemIndex * 0.05 + 0.05}
                          className="text-sm text-muted-foreground leading-relaxed"
                        >
                          {item.text}
                        </motion.p>
                      </motion.div>
                    ))}
                  </div>
                  {sectionIndex < sections.length - 1 && (
                    <div className="mt-8 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
