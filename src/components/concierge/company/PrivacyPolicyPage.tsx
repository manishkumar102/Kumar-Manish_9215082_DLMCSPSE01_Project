'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import {
  ShieldCheck,
  Eye,
  Lock,
  Globe,
  Cookie,
  Users,
  ArrowLeft,
  Scale,
  Mail,
  Baby,
  RefreshCw,
  FileText,
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
    icon: Users,
    title: '1. Information We Collect',
    content: [
      {
        heading: 'Personal Information',
        text: 'When you create an account or use our services, we may collect your name, email address, phone number, location, and profile information. For providers, we collect additional details such as business credentials, certifications, and payment information.',
      },
      {
        heading: 'Usage Data',
        text: 'We automatically collect information about how you interact with our platform, including pages visited, features used, search queries, booking patterns, device information, IP address, and browser type.',
      },
      {
        heading: 'Cookies & Tracking',
        text: 'We use cookies and similar technologies to enhance your browsing experience, remember your preferences, and analyze platform usage. See our Cookie Policy for detailed information.',
      },
      {
        heading: 'Communication Data',
        text: 'We store messages exchanged between clients and providers through our platform messaging system, as well as any support communications.',
      },
    ],
  },
  {
    icon: Eye,
    title: '2. How We Use Your Information',
    content: [
      {
        heading: 'Service Delivery',
        text: 'To provide, maintain, and improve our luxury marketplace services, process bookings, facilitate communication between clients and providers, and manage your account.',
      },
      {
        heading: 'Personalization',
        text: 'To tailor service recommendations, search results, and content to your preferences and browsing behavior.',
      },
      {
        heading: 'Safety & Security',
        text: 'To verify user identities, prevent fraud, enforce our terms of service, and protect the security of our platform and users.',
      },
      {
        heading: 'Analytics & Improvement',
        text: 'To analyze usage patterns, measure the effectiveness of our services, and develop new features that meet the needs of our community.',
      },
    ],
  },
  {
    icon: Globe,
    title: '3. Information Sharing',
    content: [
      {
        heading: 'With Other Users',
        text: 'Your profile information (name, location, bio, rating) is visible to other users. When you make a booking, your relevant details are shared with the service provider to facilitate the booking.',
      },
      {
        heading: 'Service Providers',
        text: 'We share necessary booking details with providers to fulfill your service requests. Providers have their own obligations regarding your data.',
      },
      {
        heading: 'Third-Party Services',
        text: 'We may share data with trusted third parties that help us operate our platform, including payment processors, analytics providers, and cloud hosting services.',
      },
      {
        heading: 'Legal Requirements',
        text: 'We may disclose your information if required by law, regulation, legal process, or governmental request, or when we believe in good faith that disclosure is necessary to protect our rights or your safety.',
      },
    ],
  },
  {
    icon: Lock,
    title: '4. Data Security',
    content: [
      {
        heading: 'Encryption & Protection',
        text: 'We implement industry-standard security measures including SSL/TLS encryption, secure data storage, and regular security audits to protect your personal information.',
      },
      {
        heading: 'Access Controls',
        text: 'Access to your personal data is limited to authorized personnel who need it to perform their duties. All employees undergo data protection training.',
      },
      {
        heading: 'Breach Notification',
        text: 'In the event of a data breach that may affect your personal information, we will notify you within 72 hours in accordance with applicable data protection laws.',
      },
    ],
  },
  {
    icon: Scale,
    title: '5. Your Rights',
    content: [
      {
        heading: 'Access',
        text: 'You have the right to request a copy of the personal data we hold about you. You can export your data at any time through your account settings.',
      },
      {
        heading: 'Correction',
        text: 'You can update or correct your personal information at any time through your profile settings or by contacting our support team.',
      },
      {
        heading: 'Deletion',
        text: 'You have the right to request deletion of your personal data. Upon account deletion, we will remove your data in accordance with our retention policies, except where retention is required by law.',
      },
      {
        heading: 'Objection & Restriction',
        text: 'You may object to or request restriction of processing of your personal data for marketing purposes or where processing is based on legitimate interests.',
      },
    ],
  },
  {
    icon: Cookie,
    title: '6. Cookies Policy',
    content: [
      {
        heading: 'Essential Cookies',
        text: 'Required for the platform to function properly, including session management, authentication, and security features. These cannot be disabled.',
      },
      {
        heading: 'Analytics Cookies',
        text: 'Help us understand how visitors interact with our platform by collecting anonymous usage data. This helps us improve our services and user experience.',
      },
      {
        heading: 'Preference Cookies',
        text: 'Remember your settings and preferences such as language, region, theme, and notification preferences to provide a personalized experience.',
      },
    ],
  },
  {
    icon: FileText,
    title: '7. Third-Party Services',
    content: [
      {
        heading: 'Integrated Services',
        text: 'Our platform may integrate with third-party services such as payment gateways (Stripe), mapping services, and analytics tools. Each of these services has their own privacy policies.',
      },
      {
        heading: 'Links to External Sites',
        text: 'Our platform may contain links to external websites. We are not responsible for the privacy practices of these external sites and encourage you to review their policies.',
      },
    ],
  },
  {
    icon: Baby,
    title: "8. Children's Privacy",
    content: [
      {
        heading: 'Age Requirement',
        text: 'ConciergeX is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have collected data from a minor, we will take steps to delete it promptly.',
      },
    ],
  },
  {
    icon: RefreshCw,
    title: '9. Changes to This Policy',
    content: [
      {
        heading: 'Updates',
        text: 'We may update this Privacy Policy from time to time to reflect changes in our practices or applicable regulations. We will notify you of material changes by posting the updated policy on our platform and, where appropriate, sending you a notification.',
      },
      {
        heading: 'Continued Use',
        text: 'Your continued use of the platform after any changes to this Privacy Policy constitutes your acceptance of the updated terms.',
      },
    ],
  },
  {
    icon: Mail,
    title: '10. Contact Us',
    content: [
      {
        heading: 'Data Protection Officer',
        text: 'If you have any questions about this Privacy Policy or our data practices, please contact our Data Protection Officer at privacy@conciergex.com or write to us at ConciergeX, 590 Madison Avenue, 21st Floor, New York, NY 10022.',
      },
      {
        heading: 'Regulatory Authorities',
        text: 'If you are unsatisfied with our response to any data protection concerns, you have the right to lodge a complaint with your local data protection authority.',
      },
    ],
  },
];

export function PrivacyPolicyPage() {
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
            <span className="text-gold-gradient">Privacy Policy</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: luxuryEase }}
            className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed"
          >
            Your privacy is paramount. This policy outlines how ConciergeX collects, uses, and protects your personal information.
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
