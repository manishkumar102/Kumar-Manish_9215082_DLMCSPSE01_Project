'use client';

import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Diamond, Instagram, Twitter, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

export function Footer() {
  const { setView } = useAppStore();

  const handleCategoryClick = (category: string) => {
    const store = useAppStore.getState();
    store.setSearchQuery('');
    store.setSelectedCategory(category);
    store.setPriceRange([0, 50000]);
    store.setSortBy('featured');
    store.setSelectedLocation('');
    setView('services');
  };

  const handleServicesClick = () => {
    const store = useAppStore.getState();
    store.setSearchQuery('');
    store.setSelectedCategory('all');
    store.setPriceRange([0, 50000]);
    store.setSortBy('featured');
    store.setSelectedLocation('');
    setView('services');
  };

  const footerLinks = [
    'Fine Dining',
    'Yacht & Charter',
    'Private Aviation',
    'Wine & Spirits',
    'Adventure & Sports',
  ];

  const companyLinks = [
    { label: 'About Us', action: () => setView('about') },
    { label: 'How It Works', action: () => setView('how-it-works') },
    { label: 'Become a Provider', action: () => setView('register') },
    { label: 'Contact Us', action: () => setView('contact') },
  ];

  const socialLinks = [
    { Icon: Instagram, label: 'Instagram', href: 'https://instagram.com/conciergex' },
    { Icon: Twitter, label: 'Twitter', href: 'https://x.com/conciergex' },
    { Icon: Mail, label: 'Email', href: 'mailto:hello@conciergex.com' },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', view: 'privacy-policy' as const },
    { label: 'Terms of Service', view: 'terms-of-service' as const },
    { label: 'Cookie Policy', view: 'cookie-policy' as const },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="border-t border-border/30 bg-background"
    >
      {/* CTA Section */}
      <div className="border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Experience the <span className="text-gold-gradient">Extraordinary</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of discerning clients who trust ConciergeX for their luxury lifestyle needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setView('register')}
                  size="lg"
                  className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background font-semibold hover:opacity-90 border-0 px-8 shadow-lg shadow-gold/20 hover:shadow-gold/30 transition-shadow"
                >
                  Start Your Journey
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => handleServicesClick()}
                  variant="outline"
                  size="lg"
                  className="border-gold/30 hover:border-gold hover:text-gold px-8"
                >
                  Explore Services
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0, duration: 0.5 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setView('landing')}
              className="flex items-center gap-2 mb-4"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
                <Diamond className="w-4 h-4 text-background" />
              </div>
              <span className="font-serif text-lg font-bold">
                <span className="text-gold-gradient">Concierge</span>
                <span>X</span>
              </span>
            </motion.button>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              The world&apos;s premier marketplace for luxury lifestyle services. Connecting discerning clients with exclusive providers.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  whileHover={{ scale: 1.15, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-lg bg-surface border border-border/50 flex items-center justify-center text-muted-foreground hover:text-gold hover:border-gold/30 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <h3 className="font-serif text-base font-semibold mb-4 text-gold-light">Services</h3>
            <ul className="space-y-2.5">
              {footerLinks.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.3 }}
                >
                  <button
                    onClick={() => handleCategoryClick(item)}
                    className="text-sm text-muted-foreground hover:text-gold transition-colors duration-300"
                  >
                    {item}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <h3 className="font-serif text-base font-semibold mb-4 text-gold-light">Company</h3>
            <ul className="space-y-2.5">
              {companyLinks.map((item, i) => (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
                >
                  <button
                    onClick={item.action}
                    className="text-sm text-muted-foreground hover:text-gold transition-colors duration-300"
                  >
                    {item.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h3 className="font-serif text-base font-semibold mb-4 text-gold-light">Contact</h3>
            <ul className="space-y-3">
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4 text-gold/60" />
                <a href="mailto:concierge@conciergex.com" className="hover:text-gold transition-colors">concierge@conciergex.com</a>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Phone className="w-4 h-4 text-gold/60" />
                +1 (888) LUX-EXCL
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35, duration: 0.3 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <MapPin className="w-4 h-4 text-gold/60" />
                New York • Dubai • London • Monaco
              </motion.li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Gold divider line */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent origin-center"
        />
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ConciergeX. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {legalLinks.map((item, i) => (
              <motion.button
                key={item.view}
                onClick={() => setView(item.view)}
                whileHover={{ y: -1 }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + i * 0.05, duration: 0.3 }}
                className="text-xs text-muted-foreground hover:text-gold transition-colors duration-300"
              >
                {item.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
