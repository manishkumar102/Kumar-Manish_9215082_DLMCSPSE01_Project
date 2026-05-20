'use client';

import { useAppStore } from '@/store/useAppStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from '@/components/concierge/Navbar';
import { Footer } from '@/components/concierge/Footer';
import { BackToTop } from '@/components/concierge/shared/BackToTop';
import { ServiceComparison } from '@/components/concierge/shared/ServiceComparison';
import { AIConcierge } from '@/components/concierge/shared/AIConcierge';
import { NotificationProvider } from '@/components/concierge/shared/NotificationToast';
import { LandingPage } from '@/components/concierge/landing/LandingPage';
import { AuthPage } from '@/components/concierge/auth/AuthPage';
import { ServiceListingPage } from '@/components/concierge/services/ServiceListingPage';
import { ServiceDetailPage } from '@/components/concierge/services/ServiceDetailPage';
import { ClientDashboard } from '@/components/concierge/client/ClientDashboard';
import { BookingDetailPage } from '@/components/concierge/client/BookingDetailPage';
import { ProviderDashboard } from '@/components/concierge/provider/ProviderDashboard';
import { ProviderBookingsPage } from '@/components/concierge/provider/ProviderBookingsPage';
import { ManageServicesPage } from '@/components/concierge/provider/ManageServicesPage';
import { AdminDashboard } from '@/components/concierge/admin/AdminDashboard';
import { IntegrationsPage } from '@/components/concierge/admin/IntegrationsPage';
import { ProviderVerification } from '@/components/concierge/provider/ProviderVerification';
import { ChatPage } from '@/components/concierge/chat/ChatPage';
import { ProviderDirectory } from '@/components/concierge/shared/ProviderDirectory';
import { ProfilePage } from '@/components/concierge/shared/ProfilePage';
import { EmailNotifications } from '@/components/concierge/shared/EmailNotifications';
import { AboutUsPage } from '@/components/concierge/company/AboutUsPage';
import { HowItWorksPage } from '@/components/concierge/company/HowItWorksPage';
import { ContactUsPage } from '@/components/concierge/company/ContactUsPage';
import { PrivacyPolicyPage } from '@/components/concierge/company/PrivacyPolicyPage';
import { TermsOfServicePage } from '@/components/concierge/company/TermsOfServicePage';
import { CookiePolicyPage } from '@/components/concierge/company/CookiePolicyPage';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.995,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.998,
    filter: 'blur(2px)',
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function ConciergeXApp() {
  const { currentView } = useAppStore();

  const renderView = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage />;
      case 'login':
      case 'register':
        return <AuthPage />;
      case 'services':
        return <ServiceListingPage />;
      case 'provider-directory':
        return <ProviderDirectory />;
      case 'service-detail':
        return <ServiceDetailPage />;
      case 'about':
        return <AboutUsPage />;
      case 'how-it-works':
        return <HowItWorksPage />;
      case 'contact':
        return <ContactUsPage />;
      case 'client-dashboard':
      case 'booking-detail':
      case 'booking-history':
      case 'favorites':
        return <ClientDashboard />;
      case 'provider-dashboard':
      case 'provider-earnings':
        return <ProviderDashboard />;
      case 'provider-services':
        return <ManageServicesPage />;
      case 'provider-bookings':
        return <ProviderBookingsPage />;
      case 'provider-verification':
        return <ProviderVerification />;
      case 'admin-dashboard':
      case 'admin-users':
      case 'admin-services':
      case 'admin-disputes':
      case 'admin-analytics':
      case 'admin-verifications':
        return <AdminDashboard />;
      case 'admin-integrations':
        return <IntegrationsPage />;
      case 'chat':
        return <ChatPage />;
      case 'profile':
        return <ProfilePage />;
      case 'privacy-policy':
        return <PrivacyPolicyPage />;
      case 'terms-of-service':
        return <TermsOfServicePage />;
      case 'cookie-policy':
        return <CookiePolicyPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <NotificationProvider>
    <div className="min-h-screen flex flex-col relative">
      {/* Loading bar at top */}
      <div className="page-loading-bar" />

      <Navbar />

      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />

      {/* Global floating components */}
      <BackToTop />
      <ServiceComparison />
      <AIConcierge />
    </div>
    </NotificationProvider>
  );
}
