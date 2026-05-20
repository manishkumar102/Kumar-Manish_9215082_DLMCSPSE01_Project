'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import {
  FileCheck,
  Briefcase,
  UserCheck,
  Handshake,
  CreditCard,
  Ban,
  Shield,
  AlertTriangle,
  Gavel,
  RefreshCw,
  Scale,
  Mail,
  ArrowLeft,
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
    icon: FileCheck,
    title: '1. Acceptance of Terms',
    content: [
      {
        heading: 'Agreement',
        text: 'By accessing or using the ConciergeX platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use our Service. These Terms constitute a legally binding agreement between you and ConciergeX Inc.',
      },
      {
        heading: 'Eligibility',
        text: 'You must be at least 18 years of age and have the legal capacity to enter into binding agreements to use our Service. By using our platform, you represent and warrant that you meet these eligibility requirements.',
      },
    ],
  },
  {
    icon: Briefcase,
    title: '2. Service Description',
    content: [
      {
        heading: 'Luxury Marketplace',
        text: 'ConciergeX is a premium online marketplace that connects discerning clients with verified luxury service providers. Our platform facilitates the discovery, booking, and management of high-end lifestyle services including fine dining, private aviation, yacht charters, wellness, and more.',
      },
      {
        heading: 'Platform Role',
        text: 'ConciergeX acts as an intermediary platform and is not a party to any transaction between clients and providers. We do not guarantee the quality, safety, or legality of any service listed on our platform. Service quality and fulfillment are the sole responsibility of the providers.',
      },
    ],
  },
  {
    icon: UserCheck,
    title: '3. User Accounts',
    content: [
      {
        heading: 'Account Registration',
        text: 'To access certain features, you must create an account. You are responsible for providing accurate and complete information during registration and keeping your account credentials secure.',
      },
      {
        heading: 'Account Security',
        text: 'You are responsible for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account. ConciergeX reserves the right to suspend or terminate accounts that violate these Terms.',
      },
      {
        heading: 'Account Types',
        text: 'We offer three account types: Client (for booking services), Provider (for offering services), and Admin (for platform management). Each type has specific permissions and responsibilities.',
      },
    ],
  },
  {
    icon: Handshake,
    title: '4. Provider Responsibilities',
    content: [
      {
        heading: 'Service Standards',
        text: 'Providers must deliver services at the quality level described in their listings. All services must comply with applicable laws, regulations, and industry standards. Providers must maintain valid licenses, certifications, and insurance as required by their jurisdiction.',
      },
      {
        heading: 'Accuracy of Information',
        text: 'Providers are responsible for ensuring that all information in their listings—including descriptions, pricing, availability, and images—is accurate and up to date. Misleading or fraudulent listings will result in immediate removal and potential account termination.',
      },
      {
        heading: 'Professional Conduct',
        text: 'Providers must conduct themselves professionally at all times when interacting with clients. Any form of harassment, discrimination, or inappropriate behavior will result in immediate account suspension and potential legal action.',
      },
    ],
  },
  {
    icon: Handshake,
    title: '5. Client Responsibilities',
    content: [
      {
        heading: 'Booking Conduct',
        text: 'Clients must treat providers with respect and professionalism. Any form of harassment, discrimination, or inappropriate behavior toward providers or platform staff will result in immediate account suspension.',
      },
      {
        heading: 'Accurate Information',
        text: 'Clients must provide accurate information when making bookings, including the number of guests, dietary requirements, special needs, and contact details. False information may result in booking cancellation without refund.',
      },
      {
        heading: 'Compliance',
        text: 'Clients are responsible for complying with all applicable laws and regulations when using services booked through our platform, including age restrictions, health and safety requirements, and local customs.',
      },
    ],
  },
  {
    icon: CreditCard,
    title: '6. Pricing and Payments',
    content: [
      {
        heading: 'Service Pricing',
        text: 'All service prices are set by providers and displayed in the currency specified. Prices may include taxes and fees as indicated. ConciergeX may charge a platform fee or commission on transactions, which will be clearly disclosed before booking confirmation.',
      },
      {
        heading: 'Payment Processing',
        text: 'Payments are processed through our secure payment system. By making a booking, you authorize ConciergeX to charge your designated payment method for the service amount plus any applicable fees. We accept major credit cards and other payment methods as advertised.',
      },
      {
        heading: 'Currency & Exchange',
        text: 'All transactions are processed in the currency displayed at the time of booking. For international transactions, currency conversion will be handled by our payment processor at the prevailing exchange rate, which may include a conversion fee.',
      },
    ],
  },
  {
    icon: Ban,
    title: '7. Cancellation and Refund Policy',
    content: [
      {
        heading: 'Cancellation by Client',
        text: 'Clients may cancel bookings in accordance with the cancellation policy specified by each provider. Generally, cancellations made more than 48 hours before the scheduled service receive a full refund. Cancellations within 24-48 hours receive a 50% refund, and cancellations within 24 hours are non-refundable.',
      },
      {
        heading: 'Cancellation by Provider',
        text: 'If a provider cancels a confirmed booking, the client will receive a full refund plus a 10% credit toward their next booking as compensation. Repeated cancellations by a provider may result in delisting.',
      },
      {
        heading: 'Refund Processing',
        text: 'Refunds will be processed within 5-10 business days to the original payment method. Refund processing times may vary depending on your financial institution.',
      },
    ],
  },
  {
    icon: Shield,
    title: '8. Intellectual Property',
    content: [
      {
        heading: 'Platform Content',
        text: 'All content on the ConciergeX platform, including but not limited to logos, designs, text, graphics, and software, is the property of ConciergeX Inc. and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.',
      },
      {
        heading: 'User Content',
        text: 'By posting content on our platform, you grant ConciergeX a non-exclusive, worldwide, royalty-free license to use, reproduce, and display such content for the purpose of operating and promoting our platform.',
      },
    ],
  },
  {
    icon: AlertTriangle,
    title: '9. Limitation of Liability',
    content: [
      {
        heading: 'Disclaimer',
        text: 'ConciergeX provides the platform "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the platform will be uninterrupted, error-free, or free of viruses or other harmful components.',
      },
      {
        heading: 'Liability Cap',
        text: 'To the maximum extent permitted by law, ConciergeX shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform. Our total liability shall not exceed the amount paid by you to ConciergeX in the 12 months preceding the claim.',
      },
    ],
  },
  {
    icon: Gavel,
    title: '10. Dispute Resolution',
    content: [
      {
        heading: 'Informal Resolution',
        text: 'Before filing a formal dispute, parties agree to attempt to resolve any dispute arising from these Terms through good-faith negotiation. Either party may contact the other through the platform messaging system or via email.',
      },
      {
        heading: 'Arbitration',
        text: 'Any dispute that cannot be resolved informally shall be submitted to binding arbitration in New York, New York, in accordance with the rules of the American Arbitration Association. The arbitrator\'s decision shall be final and binding.',
      },
      {
        heading: 'Class Action Waiver',
        text: 'You agree to resolve disputes individually and waive any right to bring or participate in class actions, collective actions, or representative proceedings against ConciergeX.',
      },
    ],
  },
  {
    icon: RefreshCw,
    title: '11. Modifications to Terms',
    content: [
      {
        heading: 'Right to Modify',
        text: 'ConciergeX reserves the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on our platform and sending an email notification at least 30 days before the changes take effect.',
      },
      {
        heading: 'Continued Use',
        text: 'Your continued use of the platform after modifications to these Terms constitutes your acceptance of the revised terms. If you do not agree with any changes, you must stop using the platform and close your account.',
      },
    ],
  },
  {
    icon: Scale,
    title: '12. Governing Law',
    content: [
      {
        heading: 'Applicable Law',
        text: 'These Terms shall be governed by and construed in accordance with the laws of the State of New York, United States, without regard to its conflict of law provisions.',
      },
      {
        heading: 'Jurisdiction',
        text: 'Any legal action arising from these Terms or the use of our platform shall be brought exclusively in the federal or state courts located in New York County, New York.',
      },
    ],
  },
  {
    icon: Mail,
    title: '13. Contact',
    content: [
      {
        heading: 'Legal Department',
        text: 'For any legal inquiries regarding these Terms of Service, please contact our legal department at legal@conciergex.com or write to us at ConciergeX Inc., 590 Madison Avenue, 21st Floor, New York, NY 10022.',
      },
      {
        heading: 'Support',
        text: 'For general support and questions about our platform, please contact our customer service team at support@conciergex.com or call us at +1 (888) LUX-EXCL.',
      },
    ],
  },
];

export function TermsOfServicePage() {
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
            <span className="text-gold-gradient">Terms of Service</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: luxuryEase }}
            className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed"
          >
            Please review these terms carefully before using the ConciergeX platform.
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
