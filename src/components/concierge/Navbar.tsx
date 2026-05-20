'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  X,
  Diamond,
  LogOut,
  User,
  MessageSquare,
  LayoutDashboard,
  Settings,
  ChevronDown,
  Search,
  Bell,
  CalendarCheck,
  Star,
  Check,
  MapPin,
} from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as const;

const dropdownVariants = {
  hidden: { 
    opacity: 0, 
    y: -8, 
    scale: 0.96,
    transition: { duration: 0.2, ease } 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.25, ease } 
  },
};

const menuItemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.05 + i * 0.03, duration: 0.2, ease },
  }),
};

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'booking': return CalendarCheck;
    case 'message': return MessageSquare;
    case 'review': return Star;
    default: return Bell;
  }
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <span key={i} className="font-semibold text-gold">{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

interface SearchSuggestion {
  id: string;
  title: string;
  category: string;
  price: number;
  location: string;
  rating: number;
  image?: string | null;
}

const POPULAR_CATEGORIES = [
  { emoji: '🍽', label: 'Fine Dining', category: 'Fine Dining' },
  { emoji: '🛥️', label: 'Yacht & Charter', category: 'Yacht & Charter' },
  { emoji: '✈️', label: 'Private Aviation', category: 'Private Aviation' },
  { emoji: '🍷', label: 'Wine & Spirits', category: 'Wine & Spirits' },
  { emoji: '🏔', label: 'Adventure & Sports', category: 'Adventure & Sports' },
  { emoji: '🚗', label: 'Luxury Transport', category: 'Luxury Transport' },
  { emoji: '💆', label: 'Beauty & Wellness', category: 'Beauty & Wellness' },
  { emoji: '🏠', label: 'Real Estate', category: 'Real Estate' },
  { emoji: '🎭', label: 'Art & Culture', category: 'Art & Culture' },
];

const TRENDING_SEARCHES = [
  'Private Chef', 'Yacht Charter', 'Luxury Safari', 'Penthouse Tour',
  'Wine Tasting', 'Helicopter Tour', 'Spa Retreat', 'Personal Shopper',
];

export function Navbar() {
  const { 
    user, setView, setUser, setMobileMenuOpen, mobileMenuOpen,
    notifications, unreadCount, setNotifications, markAllNotificationsRead,
    setSelectedService,
  } = useAppStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll-based background opacity & progress tracking
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(Math.min(progress, 100));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch notifications when user is logged in
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch {
        // Silently fail
      }
    };
    fetchNotifications();
    // Poll every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, setNotifications]);

  // Focus search input when search opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  // Close search suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  const handleCategorySearch = (category: string) => {
    setShowSuggestions(false);
    setSearchOpen(false);
    setSearchQuery('');
    const store = useAppStore.getState();
    store.setSearchQuery('');
    store.setSelectedCategory(category);
    store.setPriceRange([0, 50000]);
    store.setSortBy('featured');
    store.setSelectedLocation('');
    setView('services');
  };

  const handleTrendingClick = (term: string) => {
    setSearchQuery(term);
    useAppStore.getState().setSearchQuery(term);
    setShowSuggestions(false);
    setView('services');
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (value.trim().length < 2) {
      setSearchSuggestions([]);
      // Keep showing the popular dropdown when query is short
      if (value.trim().length === 0) {
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
      return;
    }

    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value.trim())}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setSearchSuggestions(data.suggestions || []);
          setShowSuggestions(true);
        }
      } catch {
        setSearchSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      useAppStore.getState().setSearchQuery(searchQuery.trim());
      setView('services');
      setSearchOpen(false);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = async (suggestion: SearchSuggestion) => {
    setShowSuggestions(false);
    setSearchOpen(false);
    setSearchQuery('');
    // Fetch full service and navigate
    try {
      const res = await fetch(`/api/services?id=${suggestion.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.service) {
          setSelectedService(data.service);
          setView('service-detail');
        }
      }
    } catch {
      // Silently fail
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    markAllNotificationsRead();
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true, userId: user.id }),
      });
    } catch {
      // Silently fail
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUserMenuOpen(false);
    setView('landing');
  };

  const handleServicesClick = () => {
    // Clear all filters before navigating to services
    const store = useAppStore.getState();
    store.setSearchQuery('');
    store.setSelectedCategory('all');
    store.setPriceRange([0, 50000]);
    store.setSortBy('featured');
    store.setSelectedLocation('');
    setView('services');
  };

  const navLinks = [
    { label: 'Services', view: 'services' as const, customOnClick: handleServicesClick },
    { label: 'Providers', view: 'provider-directory' as const },
    { label: 'How It Works', view: 'how-it-works' as const },
    { label: 'About', view: 'about' as const },
    { label: 'Contact', view: 'contact' as const },
  ];

  const getClientLinks = () => [
    { label: 'Dashboard', view: 'client-dashboard' as const, icon: LayoutDashboard },
    { label: 'Bookings', view: 'booking-history' as const, icon: Settings },
    { label: 'Favorites', view: 'favorites' as const, icon: Diamond },
    { label: 'Messages', view: 'chat' as const, icon: MessageSquare },
    { label: 'Profile', view: 'profile' as const, icon: User },
  ];

  const getProviderLinks = () => [
    { label: 'Dashboard', view: 'provider-dashboard' as const, icon: LayoutDashboard },
    { label: 'My Services', view: 'provider-services' as const, icon: Diamond },
    { label: 'Bookings', view: 'provider-bookings' as const, icon: Settings },
    { label: 'Messages', view: 'chat' as const, icon: MessageSquare },
    { label: 'Profile', view: 'profile' as const, icon: User },
  ];

  const getAdminLinks = () => [
    { label: 'Dashboard', view: 'admin-dashboard' as const, icon: LayoutDashboard },
    { label: 'Users', view: 'admin-users' as const, icon: User },
    { label: 'Services', view: 'admin-services' as const, icon: Diamond },
    { label: 'Disputes', view: 'admin-disputes' as const, icon: MessageSquare },
    { label: 'Analytics', view: 'admin-analytics' as const, icon: Settings },
  ];

  const roleLinks = user?.role === 'admin' ? getAdminLinks() 
    : user?.role === 'provider' ? getProviderLinks() 
    : user?.role === 'client' ? getClientLinks() : [];

  return (
    <>
    {/* Scroll Progress Indicator */}
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-[2px] transition-opacity duration-300"
      style={{
        background: 'linear-gradient(90deg, #C9A96E, #E8D5A3, #C9A96E)',
        width: `${scrollProgress}%`,
        opacity: scrollProgress > 0 ? 1 : 0,
        transition: 'width 0.1s linear, opacity 0.3s ease',
      }}
    />

    <nav 
      className={`sticky top-0 z-50 transition-all duration-500 ease-out ${
        scrolled 
          ? 'border-b border-gold/10 bg-background/90 backdrop-blur-2xl shadow-lg shadow-black/20' 
          : 'border-b border-transparent bg-background/50 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo with gold glow on hover */}
          <button 
            onClick={() => setView('landing')} 
            className="flex items-center gap-2 group relative"
          >
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center transition-all duration-500 group-hover:shadow-lg group-hover:shadow-gold/30 group-hover:scale-105`}>
              <Diamond className="w-5 h-5 text-background" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight">
              <span className="text-gold-gradient">Concierge</span>
              <span className="text-foreground">X</span>
            </span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.view}
                onClick={() => link.customOnClick ? link.customOnClick() : setView(link.view)}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-gold transition-colors duration-300 "
              >
                {link.label}
              </button>
            ))}
            
            {user && roleLinks.slice(0, 2).map((link) => (
              <button
                key={link.view}
                onClick={() => setView(link.view)}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-gold transition-colors duration-300 "
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search */}
            <div className="hidden md:block relative">
              <AnimatePresence>
                {searchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 280, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 flex items-end overflow-hidden"
                    ref={searchDropdownRef}
                  >
                    <form onSubmit={handleSearch} className="relative w-full">
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setShowSuggestions(false);
                            setSearchOpen(false);
                            setSearchQuery('');
                          }
                        }}
                        placeholder="Search luxury services..."
                        className="w-full bg-surface border border-gold/20 rounded-lg px-3 py-1.5 pr-8 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold/40 transition-all"
                        autoFocus
                      />
                      {/* Search suggestions dropdown */}
                      <AnimatePresence>
                        {showSuggestions && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute top-full right-0 mt-2 w-80 bg-card/95 backdrop-blur-xl border border-gold/15 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50"
                          >
                            {searchQuery.trim().length >= 2 ? (
                              isSearching ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                  <div className="inline-flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                                    Searching...
                                  </div>
                                </div>
                              ) : searchSuggestions.length > 0 ? (
                                <div className="py-1.5 max-h-80 overflow-y-auto">
                                  {searchSuggestions.map((suggestion) => {
                                    return (
                                      <button
                                        key={suggestion.id}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-gold/5 transition-colors duration-150"
                                      >
                                        <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                                          <Diamond className="w-4 h-4 text-gold" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-sm font-medium text-foreground truncate">
                                              {highlightMatch(suggestion.title, searchQuery)}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-gold/10 text-gold font-medium">
                                              {suggestion.category}
                                            </span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                              <MapPin className="w-3 h-3" />
                                              {suggestion.location}
                                            </span>
                                          </div>
                                          <div className="text-xs font-semibold text-gold mt-1">
                                            ${suggestion.price.toLocaleString()}
                                          </div>
                                        </div>
                                      </button>
                                    );
                                  })}
                                  <div className="border-t border-gold/10 px-4 py-2.5">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleSearch(e);
                                      }}
                                      className="text-xs text-gold hover:text-gold-light transition-colors"
                                    >
                                      View all results for &ldquo;{searchQuery}&rdquo;
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 text-center">
                                  <Search className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                                  <p className="text-sm text-muted-foreground">No results found</p>
                                  <p className="text-xs text-muted-foreground/60 mt-1">Try a different search term</p>
                                </div>
                              )
                            ) : (
                              /* Popular Categories + Trending dropdown when not typing */
                              <div className="py-3 max-h-80 overflow-y-auto">
                                {/* Popular Categories */}
                                <div className="px-4 pb-2">
                                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gold mb-2">Popular Categories</p>
                                  <div className="grid grid-cols-3 gap-1.5">
                                    {POPULAR_CATEGORIES.map((cat) => (
                                      <button
                                        key={cat.category}
                                        onClick={() => handleCategorySearch(cat.category)}
                                        className="flex flex-col items-center gap-1 p-2.5 rounded-lg hover:bg-gold/5 transition-colors duration-150 group"
                                      >
                                        <span className="text-lg group-hover:scale-110 transition-transform">{cat.emoji}</span>
                                        <span className="text-[10px] text-muted-foreground group-hover:text-gold transition-colors leading-tight text-center">{cat.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                
                                {/* Trending Searches */}
                                <div className="border-t border-gold/10 mt-2 pt-2 px-4">
                                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gold mb-2">Trending Searches</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {TRENDING_SEARCHES.map((term) => (
                                      <button
                                        key={term}
                                        onClick={() => handleTrendingClick(term)}
                                        className="px-2.5 py-1.5 text-xs rounded-full border border-gold/15 text-muted-foreground hover:text-gold hover:border-gold/30 hover:bg-gold/5 transition-all duration-150"
                                      >
                                        {term}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSearchOpen(!searchOpen);
                if (searchOpen) {
                  setSearchQuery('');
                  setShowSuggestions(false);
                } else {
                  // Show popular categories dropdown when opening search
                  setShowSuggestions(true);
                }
              }}
              className="hidden md:flex p-2 rounded-lg text-muted-foreground hover:text-gold hover:bg-gold/5 transition-all duration-300"
            >
              <Search className="w-5 h-5" />
            </motion.button>

            {/* Notification Bell */}
            <div className="hidden md:block relative" ref={notifRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg text-muted-foreground hover:text-gold hover:bg-gold/5 transition-all duration-300"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-background"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {notifOpen && (
                  <>
                    <motion.div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setNotifOpen(false)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="absolute right-0 mt-2 w-80 bg-card/95 backdrop-blur-xl border border-gold/15 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50"
                    >
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-gold/10 bg-gradient-to-r from-gold/5 to-transparent flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-gold" />
                          <span className="font-medium text-sm text-white">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1 text-xs text-gold hover:text-gold-light transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Mark all read
                          </motion.button>
                        )}
                      </div>

                      {/* Notifications list */}
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center">
                            <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.slice(0, 8).map((notif, idx) => {
                            const NotifIcon = getNotificationIcon(notif.type);
                            return (
                              <motion.div
                                key={notif.id}
                                variants={menuItemVariants}
                                initial="hidden"
                                animate="visible"
                                custom={idx}
                                className={`flex items-start gap-3 px-4 py-3 hover:bg-gold/5 transition-colors duration-150 cursor-pointer border-b border-gold/5 last:border-0 ${
                                  !notif.read ? 'bg-gold/[0.03]' : ''
                                }`}
                              >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                  !notif.read 
                                    ? 'bg-gold/15 text-gold' 
                                    : 'bg-surface text-muted-foreground'
                                }`}>
                                  <NotifIcon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm truncate ${!notif.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                                    {notif.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                                    {notif.message}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground/50 mt-1">
                                    {getRelativeTime(notif.createdAt)}
                                  </p>
                                </div>
                                {!notif.read && (
                                  <div className="w-2 h-2 rounded-full bg-gold mt-2 shrink-0" />
                                )}
                              </motion.div>
                            );
                          })
                        )}
                      </div>

                      {/* Footer */}
                      <div className="border-t border-gold/10 px-4 py-2.5">
                        <button
                          onClick={() => { setNotifOpen(false); }}
                          className="text-xs text-gold hover:text-gold-light transition-colors w-full text-center"
                        >
                          View All Notifications
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Auth buttons or user menu */}
            {!user ? (
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setView('login')}
                  className="text-muted-foreground hover:text-gold transition-colors duration-300"
                >
                  Sign In
                </Button>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => setView('register')}
                    className="bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background font-semibold hover:opacity-90 transition-all duration-300 border-0 hover:shadow-lg hover:shadow-gold/20"
                  >
                    Get Started
                  </Button>
                </motion.div>
              </div>
            ) : (
              <div className="hidden md:block relative">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface transition-all duration-300"
                >
                  <Avatar className="w-8 h-8 border border-gold/30 transition-all duration-300 hover:border-gold/60">
                    <AvatarFallback className="bg-surface text-gold text-xs font-bold">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium max-w-[100px] truncate">{user.name}</span>
                  {user.role === 'admin' && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gold/50 text-gold">
                      Admin
                    </Badge>
                  )}
                  {user.verified && user.role === 'provider' && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500/50 text-emerald-400">
                      Verified
                    </Badge>
                  )}
                  <motion.span
                    animate={{ rotate: userMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </motion.span>
                </motion.button>

                {/* Animated dropdown menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <motion.div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setUserMenuOpen(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="absolute right-0 mt-2 w-56 bg-card/95 backdrop-blur-xl border border-gold/15 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50"
                      >
                        <div className="p-3 border-b border-gold/10 bg-gradient-to-r from-gold/5 to-transparent">
                          <p className="font-medium text-sm text-white">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="p-1.5">
                          {roleLinks.map((link, i) => (
                            <motion.button
                              key={link.view}
                              variants={menuItemVariants}
                              initial="hidden"
                              animate="visible"
                              custom={i}
                              onClick={() => { setView(link.view); setUserMenuOpen(false); }}
                              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-gold/5 hover:rounded-lg transition-all duration-200"
                            >
                              <link.icon className="w-4 h-4" />
                              {link.label}
                            </motion.button>
                          ))}
                        </div>
                        <div className="border-t border-gold/10 p-1.5">
                          <motion.button
                            variants={menuItemVariants}
                            initial="hidden"
                            animate="visible"
                            custom={roleLinks.length}
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:rounded-lg transition-all duration-200"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </motion.button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-gold">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background border-border w-80 p-0">
                <div className="p-6 border-b border-border/50 flex items-center justify-between">
                  <span className="font-serif text-lg text-gold-gradient font-bold">Menu</span>
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="p-4 space-y-1">
                  {/* Mobile Search */}
                  <div className="mb-3">
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (searchQuery.trim()) {
                        useAppStore.getState().setSearchQuery(searchQuery.trim());
                        setView('services');
                        setMobileMenuOpen(false);
                        setSearchQuery('');
                      }
                    }} className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        onFocus={() => { setShowSuggestions(true); }}
                        placeholder="Search services..."
                        className="w-full bg-surface border border-gold/20 rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold/40 transition-all"
                      />
                    </form>
                    {/* Mobile search suggestions */}
                    <AnimatePresence>
                      {showSuggestions && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-1 bg-card border border-gold/15 rounded-xl overflow-hidden max-h-72 overflow-y-auto"
                        >
                          {searchQuery.trim().length >= 2 && searchSuggestions.length > 0 ? (
                            searchSuggestions.map((suggestion) => (
                              <button
                                key={suggestion.id}
                                onClick={() => {
                                  handleSuggestionClick(suggestion);
                                  setMobileMenuOpen(false);
                                }}
                                className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-gold/5 transition-colors"
                              >
                                <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                                  <Diamond className="w-3.5 h-3.5 text-gold" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm font-medium text-foreground truncate block">
                                    {highlightMatch(suggestion.title, searchQuery)}
                                  </span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/10 text-gold font-medium">
                                      {suggestion.category}
                                    </span>
                                    <span className="text-xs text-gold font-semibold">${suggestion.price.toLocaleString()}</span>
                                  </div>
                                </div>
                              </button>
                            ))
                          ) : searchQuery.trim().length < 2 ? (
                            <div className="py-3">
                              {/* Mobile Popular Categories */}
                              <div className="px-3 pb-2">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-gold mb-2">Popular Categories</p>
                                <div className="grid grid-cols-3 gap-1">
                                  {POPULAR_CATEGORIES.map((cat) => (
                                    <button
                                      key={cat.category}
                                      onClick={() => {
                                        handleCategorySearch(cat.category);
                                        setMobileMenuOpen(false);
                                      }}
                                      className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gold/5 transition-colors"
                                    >
                                      <span className="text-base">{cat.emoji}</span>
                                      <span className="text-[9px] text-muted-foreground leading-tight text-center">{cat.label}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                              {/* Mobile Trending */}
                              <div className="border-t border-gold/10 mt-1 pt-2 px-3">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-gold mb-2">Trending</p>
                                <div className="flex flex-wrap gap-1">
                                  {TRENDING_SEARCHES.map((term) => (
                                    <button
                                      key={term}
                                      onClick={() => {
                                        handleTrendingClick(term);
                                        setMobileMenuOpen(false);
                                      }}
                                      className="px-2 py-1 text-[11px] rounded-full border border-gold/15 text-muted-foreground hover:text-gold hover:border-gold/30 transition-all"
                                    >
                                      {term}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {navLinks.map((link) => (
                    <button
                      key={link.view}
                      onClick={() => {
                        if (link.customOnClick) { link.customOnClick(); } else { setView(link.view); }
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm rounded-lg hover:bg-surface transition-colors"
                    >
                      {link.label}
                    </button>
                  ))}
                  <div className="border-t border-border/50 my-3" />

                  {/* Notification bell in mobile */}
                  {user && (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setView('chat');
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm rounded-lg hover:bg-surface transition-colors text-muted-foreground"
                    >
                      <div className="relative">
                        <Bell className="w-4 h-4" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </div>
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-auto text-[11px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  )}

                  {!user ? (
                    <div className="space-y-2 pt-2">
                      <Button
                        variant="outline"
                        className="w-full border-border hover:border-gold hover:text-gold"
                        onClick={() => { setView('login'); setMobileMenuOpen(false); }}
                      >
                        Sign In
                      </Button>
                      <Button
                        className="w-full bg-gradient-to-r from-gold-dark via-gold to-gold-light text-background"
                        onClick={() => { setView('register'); setMobileMenuOpen(false); }}
                      >
                        Get Started
                      </Button>
                    </div>
                  ) : (
                    <>
                      {roleLinks.map((link) => (
                        <button
                          key={link.view}
                          onClick={() => { setView(link.view); setMobileMenuOpen(false); }}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm rounded-lg hover:bg-surface transition-colors"
                        >
                          <link.icon className="w-4 h-4 text-muted-foreground" />
                          {link.label}
                        </button>
                      ))}
                      <div className="border-t border-border/50 my-3" />
                      <button
                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}
