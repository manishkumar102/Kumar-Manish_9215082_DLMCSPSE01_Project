import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewType = 
  | 'landing'
  | 'login'
  | 'register'
  | 'services'
  | 'provider-directory'
  | 'service-detail'
  | 'about'
  | 'how-it-works'
  | 'contact'
  | 'client-dashboard'
  | 'booking-detail'
  | 'booking-history'
  | 'favorites'
  | 'provider-dashboard'
  | 'provider-services'
  | 'provider-bookings'
  | 'provider-earnings'
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-services'
  | 'admin-disputes'
  | 'admin-analytics'
  | 'admin-verifications'
  | 'admin-integrations'
  | 'provider-verification'
  | 'chat'
  | 'profile'
  | 'privacy-policy'
  | 'terms-of-service'
  | 'cookie-policy';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatar?: string;
  location?: string;
  bio?: string;
  interests?: string;
  verified?: boolean;
  premium?: boolean;
  verificationStatus?: string;
  verificationNote?: string;
  businessName?: string;
  businessLicense?: string;
  businessAddress?: string;
  idDocument?: string;
  submittedAt?: string;
  verifiedAt?: string;
}

export interface Service {
  id: string;
  providerId: string;
  title: string;
  description: string;
  category: string;
  price: number;
  duration: string;
  images?: string;
  location: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  status: string;
  provider?: User;
}

export interface Booking {
  id: string;
  clientId: string;
  serviceId: string;
  providerId: string;
  date: string;
  time: string;
  guests: number;
  specialReq?: string;
  totalPrice: number;
  status: string;
  paymentId?: string;
  createdAt: string;
  service?: Service;
  client?: User;
  provider?: User;
}

export interface Review {
  id: string;
  bookingId: string;
  clientId: string;
  serviceId: string;
  providerId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  client?: User;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'booking' | 'message' | 'review' | 'system';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

interface AppState {
  // Navigation
  currentView: ViewType;
  previousView: ViewType | null;
  setView: (view: ViewType) => void;
  goBack: () => void;

  // Auth
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;

  // Selected entities
  selectedServiceId: string | null;
  selectedService: Service | null;
  setSelectedService: (service: Service | null) => void;
  selectedBooking: Booking | null;
  setSelectedBooking: (booking: Booking | null) => void;
  selectedChatUser: User | null;
  setSelectedChatUser: (user: User | null) => void;

  // Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  priceRange: [number, number];
  setPriceRange: (r: [number, number]) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  selectedLocation: string;
  setSelectedLocation: (l: string) => void;

  // Cart/Booking state
  bookingForm: {
    date: string;
    time: string;
    guests: number;
    specialReq: string;
  };
  setBookingForm: (form: Partial<AppState['bookingForm']>) => void;
  resetBookingForm: () => void;

  // Notifications
  notifications: AppNotification[];
  unreadCount: number;
  setNotifications: (n: AppNotification[]) => void;
  addNotification: (n: AppNotification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Favorites
  favoriteIds: string[];
  setFavoriteIds: (ids: string[]) => void;
  toggleFavorite: (serviceId: string) => void;

  // Comparison
  compareIds: string[];
  setCompareIds: (ids: string[]) => void;
  toggleCompare: (serviceId: string) => void;
  clearCompare: () => void;

  // Payment
  paymentDialogOpen: boolean;
  setPaymentDialogOpen: (open: boolean) => void;
  pendingPaymentBooking: {
    serviceId: string;
    providerId: string;
    date: string;
    time: string;
    guests: number;
    specialReq: string;
    totalPrice: number;
    serviceTitle: string;
  } | null;
  setPendingPaymentBooking: (booking: AppState['pendingPaymentBooking']) => void;

  // Recently Viewed
  recentlyViewed: string[];
  addRecentlyViewed: (serviceId: string) => void;

  // UI
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

}

const defaultBookingForm = {
  date: '',
  time: '',
  guests: 1,
  specialReq: '',
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Navigation
      currentView: 'landing',
      previousView: null,
      setView: (view) => {
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return set((state) => ({ currentView: view, previousView: state.currentView }));
      },
      goBack: () => set((state) => ({ 
        currentView: state.previousView || 'landing', 
        previousView: null 
      })),

      // Auth
      user: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      isAuthenticated: false,

      // Selected entities
      selectedServiceId: null,
      selectedService: null,
      setSelectedService: (service) => set({ selectedService: service, selectedServiceId: service?.id ?? null }),
      selectedBooking: null,
      setSelectedBooking: (booking) => set({ selectedBooking: booking }),
      selectedChatUser: null,
      setSelectedChatUser: (user) => set({ selectedChatUser: user }),

      // Filters
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),
      selectedCategory: 'all',
      setSelectedCategory: (c) => set({ selectedCategory: c }),
      priceRange: [0, 50000],
      setPriceRange: (r) => set({ priceRange: r }),
      sortBy: 'featured',
      setSortBy: (s) => set({ sortBy: s }),
      selectedLocation: '',
      setSelectedLocation: (l) => set({ selectedLocation: l }),

      // Booking form
      bookingForm: { ...defaultBookingForm },
      setBookingForm: (form) => set((state) => ({ 
        bookingForm: { ...state.bookingForm, ...form } 
      })),
      resetBookingForm: () => set({ bookingForm: { ...defaultBookingForm } }),

      // Notifications
      notifications: [],
      unreadCount: 0,
      setNotifications: (notifications) => set({ notifications, unreadCount: notifications.filter(n => !n.read).length }),
      addNotification: (n) => set((state) => {
        const notifications = [n, ...state.notifications];
        return { notifications, unreadCount: state.unreadCount + 1 };
      }),
      markNotificationRead: (id) => set((state) => {
        const notifications = state.notifications.map(n => n.id === id ? { ...n, read: true } : n);
        return { notifications, unreadCount: Math.max(0, state.unreadCount - 1) };
      }),
      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      })),

      // Favorites
      favoriteIds: [],
      setFavoriteIds: (favoriteIds) => set({ favoriteIds }),
      toggleFavorite: (serviceId) => set((state) => {
        const isFav = state.favoriteIds.includes(serviceId);
        const favoriteIds = isFav
          ? state.favoriteIds.filter(id => id !== serviceId)
          : [...state.favoriteIds, serviceId];
        return { favoriteIds };
      }),

      // Comparison
      compareIds: [],
      setCompareIds: (compareIds) => set({ compareIds }),
      toggleCompare: (serviceId) => set((state) => {
        const isComparing = state.compareIds.includes(serviceId);
        const compareIds = isComparing
          ? state.compareIds.filter(id => id !== serviceId)
          : state.compareIds.length < 3
            ? [...state.compareIds, serviceId]
            : state.compareIds;
        return { compareIds };
      }),
      clearCompare: () => set({ compareIds: [] }),

      // Payment
      paymentDialogOpen: false,
      setPaymentDialogOpen: (open) => set({ paymentDialogOpen: open }),
      pendingPaymentBooking: null,
      setPendingPaymentBooking: (booking) => set({ pendingPaymentBooking: booking }),

      // Recently Viewed
      recentlyViewed: [],
      addRecentlyViewed: (serviceId) => set((state) => {
        const filtered = state.recentlyViewed.filter(id => id !== serviceId);
        const updated = [serviceId, ...filtered].slice(0, 8);
        return { recentlyViewed: updated };
      }),

      // UI
      sidebarOpen: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      mobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

    }),
    {
      name: 'concierge-x-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        recentlyViewed: state.recentlyViewed,
        favoriteIds: state.favoriteIds,
        compareIds: state.compareIds,
      }),
    }
  )
);
