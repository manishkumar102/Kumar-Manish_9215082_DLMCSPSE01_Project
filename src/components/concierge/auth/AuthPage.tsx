'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, type User } from '@/store/useAppStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import {
  Diamond,
  Eye,
  EyeOff,
  Loader2,
  Crown,
  Briefcase,
  ArrowLeft,
  MapPin,
  Building2,
  FileText,
  Sparkles,
  Shield,
  Star,
  Mail,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Animation Variants                                                         */
/* -------------------------------------------------------------------------- */

const slideIn = {
  initial: { opacity: 0, x: 40 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    x: -40,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerChildren = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const leftPanelFade = {
  initial: { opacity: 0, scale: 0.98 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
  },
};

/* -------------------------------------------------------------------------- */
/*  Decorative Diamond SVG                                                     */
/* -------------------------------------------------------------------------- */

function GoldDiamond({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`size-full ${className}`}
    >
      <path d="M12 2L2 12l10 10 10-10L12 2zm0 3.41L18.59 12 12 18.59 5.41 12 12 5.41z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Left Branding Panel                                                        */
/* -------------------------------------------------------------------------- */

function BrandingPanel() {
  const features = [
    { icon: Shield, label: 'Verified Providers' },
    { icon: Star, label: '5-Star Experiences' },
    { icon: Sparkles, label: 'Bespoke Service' },
  ];

  return (
    <motion.div
      {...leftPanelFade}
      className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0d0d0d] via-[#111] to-[#0A0A0A] px-8 py-12 text-center lg:px-16"
    >
      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold/[0.06] blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-gold-dark/[0.05] blur-[120px]" />

      {/* Decorative gold lines */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[20%] h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
        <div className="absolute left-1/2 top-[80%] h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
      </div>

      {/* Floating diamond decorations */}
      <div className="pointer-events-none absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-gold/[0.06]"
            style={{
              left: `${10 + i * 20}%`,
              top: `${15 + (i % 3) * 28}%`,
              width: `${14 + (i % 3) * 8}px`,
            }}
            animate={{ y: [0, -12, 0], rotate: [0, 90, 180, 270, 360] }}
            transition={{
              duration: 7 + i * 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <GoldDiamond />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-dark via-gold to-gold-light shadow-lg shadow-gold/20"
        >
          <Diamond className="size-10 text-[#0A0A0A]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white lg:text-4xl">
            <span className="text-gold-gradient">Concierge</span>
            <span className="text-white">X</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="max-w-xs text-sm leading-relaxed text-muted-foreground lg:max-w-sm lg:text-base"
        >
          The world&apos;s premier luxury marketplace. Discover, book, and
          experience the extraordinary.
        </motion.p>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-gold/30" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/60">
            Trusted Excellence
          </span>
          <span className="h-px w-8 bg-gold/30" />
        </div>

        {/* Features */}
        <motion.div
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="mt-2 flex flex-col gap-4"
        >
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.label}
                variants={fadeUp}
                className="flex items-center gap-3"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-gold/10">
                  <Icon className="size-4 text-gold" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {feat.label}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Password Input with Toggle                                                 */
/* -------------------------------------------------------------------------- */

function FloatingLabelInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  autoComplete,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);
  const isFloating = focused || value.length > 0;

  return (
    <div className={`relative focus-gold rounded-lg transition-all duration-300 ${focused ? 'border-gold/40 shadow-[0_0_0_3px_rgba(201,169,110,0.1),0_0_20px_rgba(201,169,110,0.05)]' : 'border-border/60'}`}>
      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-300 pointer-events-none z-10 ${
          isFloating
            ? 'top-1.5 text-[10px] font-semibold text-gold uppercase tracking-wider'
            : 'top-1/2 -translate-y-1/2 text-sm text-muted-foreground/60'
        }`}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={isFloating ? '' : placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        className="w-full h-11 rounded-lg bg-surface px-4 pt-5 pb-1 text-sm text-foreground placeholder:text-transparent focus:outline-none border-0"
      />
    </div>
  );
}

function PasswordInput({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const isFloating = focused || value.length > 0;

  return (
    <div className={`relative focus-gold rounded-lg transition-all duration-300 ${focused ? 'border-gold/40 shadow-[0_0_0_3px_rgba(201,169,110,0.1),0_0_20px_rgba(201,169,110,0.05)]' : 'border-border/60'}`}>
      <label
        htmlFor={id}
        className={`absolute left-4 transition-all duration-300 pointer-events-none z-10 ${
          isFloating
            ? 'top-1.5 text-[10px] font-semibold text-gold uppercase tracking-wider'
            : 'top-1/2 -translate-y-1/2 text-sm text-muted-foreground/60'
        }`}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder={isFloating ? '' : placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full h-11 rounded-lg bg-surface px-4 pr-10 pt-5 pb-1 text-sm text-foreground placeholder:text-transparent focus:outline-none border-0"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute top-3 right-3 text-muted-foreground transition-colors hover:text-gold"
          tabIndex={-1}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Login Form                                                                 */
/* -------------------------------------------------------------------------- */

function LoginForm() {
  const { setView, setUser } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!email.trim()) {
        toast.error('Please enter your email address');
        return;
      }
      if (!password.trim()) {
        toast.error('Please enter your password');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', email: email.trim(), password }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || 'Sign in failed. Please try again.');
          return;
        }

        const user: User = data.user;
        setUser(user);
        toast.success(`Welcome back, ${user.name}!`);

        // Navigate to appropriate dashboard
        switch (user.role) {
          case 'admin':
            setView('admin-dashboard');
            break;
          case 'provider':
            setView('provider-dashboard');
            break;
          default:
            setView('client-dashboard');
            break;
        }
      } catch {
        toast.error('Network error. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    },
    [email, password, setUser, setView],
  );

  return (
    <motion.form
      key="login"
      variants={slideIn}
      initial="initial"
      animate="animate"
      exit="exit"
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="space-y-2">
        <h2 className="font-serif text-2xl font-bold tracking-tight text-white lg:text-3xl">
          Welcome Back
        </h2>
        <p className="text-sm text-muted-foreground">
          Sign in to your ConciergeX account
        </p>
      </motion.div>

      {/* Email */}
      <motion.div variants={fadeUp} className="space-y-2">
        <FloatingLabelInput
          id="login-email"
          label="Email Address"
          placeholder="you@example.com"
          value={email}
          onChange={setEmail}
          type="email"
          autoComplete="email"
        />
      </motion.div>

      {/* Password */}
      <motion.div variants={fadeUp}>
        <PasswordInput
          id="login-password"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={setPassword}
        />
      </motion.div>

      {/* Submit */}
      <motion.div variants={fadeUp}>
        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-lg bg-gradient-to-r from-gold-dark via-gold to-gold-light px-6 text-sm font-semibold text-[#0A0A0A] shadow-lg shadow-gold/15 transition-all hover:shadow-gold/30 hover:brightness-110 disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </motion.div>

      {/* Google Sign In */}
      <motion.div variants={fadeUp}>
        <GoogleSignInButton mode="login" />
      </motion.div>

      {/* Divider */}
      <motion.div
        variants={fadeUp}
        className="flex items-center gap-3"
      >
        <span className="h-px flex-1 bg-border/50" />
        <span className="text-xs text-muted-foreground/60">or sign in with email</span>
        <span className="h-px flex-1 bg-border/50" />
      </motion.div>

      {/* Register link */}
      <motion.div variants={fadeUp} className="text-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={() => setView('register')}
            className="font-semibold text-gold transition-colors hover:text-gold-light"
          >
            Create Account
          </button>
        </p>
      </motion.div>
    </motion.form>
  );
}

/* -------------------------------------------------------------------------- */
/*  Register Form                                                              */
/* -------------------------------------------------------------------------- */

function RegisterForm() {
  const { setView, setUser } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('client');
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const isProvider = role === 'provider';

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validation
      if (!name.trim()) {
        toast.error('Please enter your full name');
        return;
      }
      if (!email.trim()) {
        toast.error('Please enter your email address');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        toast.error('Please enter a valid email address');
        return;
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      setLoading(true);
      try {
        const payload: Record<string, string> = {
          action: 'register',
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        };

        if (isProvider) {
          if (businessName.trim()) payload.businessName = businessName.trim();
          if (location.trim()) payload.location = location.trim();
          if (bio.trim()) payload.bio = bio.trim();
        }

        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || 'Registration failed. Please try again.');
          return;
        }

        // Auto-login after registration
        const loginRes = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', email: email.trim(), password }),
        });

        const loginData = await loginRes.json();

        if (loginRes.ok && loginData.user) {
          const user: User = loginData.user;
          setUser(user);
          toast.success('Account created successfully! Welcome to ConciergeX.');

          switch (user.role) {
            case 'admin':
              setView('admin-dashboard');
              break;
            case 'provider':
              setView('provider-dashboard');
              break;
            default:
              setView('client-dashboard');
              break;
          }
        } else {
          toast.success('Account created! Please sign in to continue.');
          setView('login');
        }
      } catch {
        toast.error('Network error. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    },
    [
      name, email, password, confirmPassword, role,
      isProvider, businessName, location, bio,
      setUser, setView,
    ],
  );

  return (
    <motion.form
      key="register"
      variants={slideIn}
      initial="initial"
      animate="animate"
      exit="exit"
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="space-y-2">
        <h2 className="font-serif text-2xl font-bold tracking-tight text-white lg:text-3xl">
          Create Account
        </h2>
        <p className="text-sm text-muted-foreground">
          Join ConciergeX and start your luxury journey
        </p>
      </motion.div>

      {/* Full Name */}
      <motion.div variants={fadeUp} className="space-y-2">
        <FloatingLabelInput
          id="reg-name"
          label="Full Name"
          placeholder="Your full name"
          value={name}
          onChange={setName}
          autoComplete="name"
        />
      </motion.div>

      {/* Email */}
      <motion.div variants={fadeUp} className="space-y-2">
        <FloatingLabelInput
          id="reg-email"
          label="Email Address"
          placeholder="you@example.com"
          value={email}
          onChange={setEmail}
          type="email"
          autoComplete="email"
        />
      </motion.div>

      {/* Password */}
      <motion.div variants={fadeUp}>
        <PasswordInput
          id="reg-password"
          label="Password"
          placeholder="Min. 6 characters"
          value={password}
          onChange={setPassword}
        />
      </motion.div>

      {/* Confirm Password */}
      <motion.div variants={fadeUp}>
        <PasswordInput
          id="reg-confirm-password"
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
      </motion.div>

      {/* Role Selection */}
      <motion.div variants={fadeUp} className="space-y-3">
        <Label className="text-sm font-medium text-muted-foreground">
          I want to
        </Label>
        <RadioGroup
          value={role}
          onValueChange={setRole}
          className="grid grid-cols-2 gap-3"
        >
          {/* Client option */}
          <label
            htmlFor="role-client"
            className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
              role === 'client'
                ? 'border-gold/50 bg-gold/[0.08] shadow-md shadow-gold/10'
                : 'border-border/40 bg-surface hover:border-border/70'
            }`}
          >
            <RadioGroupItem value="client" id="role-client" className="sr-only" />
            <div
              className={`flex size-10 items-center justify-center rounded-lg transition-colors ${
                role === 'client' ? 'bg-gold/20 text-gold' : 'bg-muted text-muted-foreground'
              }`}
            >
              <Crown className="size-5" />
            </div>
            <div className="text-center">
              <p
                className={`text-sm font-semibold ${
                  role === 'client' ? 'text-gold' : 'text-foreground'
                }`}
              >
                Client
              </p>
              <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                Book luxury services
              </p>
            </div>
          </label>

          {/* Provider option */}
          <label
            htmlFor="role-provider"
            className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
              role === 'provider'
                ? 'border-gold/50 bg-gold/[0.08] shadow-md shadow-gold/10'
                : 'border-border/40 bg-surface hover:border-border/70'
            }`}
          >
            <RadioGroupItem value="provider" id="role-provider" className="sr-only" />
            <div
              className={`flex size-10 items-center justify-center rounded-lg transition-colors ${
                role === 'provider' ? 'bg-gold/20 text-gold' : 'bg-muted text-muted-foreground'
              }`}
            >
              <Briefcase className="size-5" />
            </div>
            <div className="text-center">
              <p
                className={`text-sm font-semibold ${
                  role === 'provider' ? 'text-gold' : 'text-foreground'
                }`}
              >
                Service Provider
              </p>
              <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                Offer your services
              </p>
            </div>
          </label>
        </RadioGroup>
      </motion.div>

      {/* Provider-specific fields (animated in/out) */}
      <AnimatePresence mode="wait">
        {isProvider && (
          <motion.div
            key="provider-fields"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-gold/15 bg-gold/[0.03] p-4 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gold/70">
                Provider Details (Optional)
              </p>

              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="biz-name" className="text-sm font-medium text-muted-foreground">
                  <Building2 className="mr-1.5 inline size-3.5" />
                  Business Name
                </Label>
                <Input
                  id="biz-name"
                  type="text"
                  placeholder="e.g. Le Jardin Private Dining"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="h-11 rounded-lg border-border/60 bg-surface px-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-gold/50 focus-visible:ring-gold/20"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="biz-location" className="text-sm font-medium text-muted-foreground">
                  <MapPin className="mr-1.5 inline size-3.5" />
                  Location
                </Label>
                <Input
                  id="biz-location"
                  type="text"
                  placeholder="e.g. Paris, France"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-11 rounded-lg border-border/60 bg-surface px-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-gold/50 focus-visible:ring-gold/20"
                />
              </div>

              {/* Description / Bio */}
              <div className="space-y-2">
                <Label htmlFor="biz-bio" className="text-sm font-medium text-muted-foreground">
                  <FileText className="mr-1.5 inline size-3.5" />
                  Description
                </Label>
                <textarea
                  id="biz-bio"
                  placeholder="Tell clients about your luxury services..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="flex w-full min-w-0 rounded-lg border border-border/60 bg-surface px-4 py-3 text-sm text-foreground shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground/60 focus-visible:border-gold/50 focus-visible:ring-gold/20 md:text-sm resize-none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <motion.div variants={fadeUp}>
        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-lg bg-gradient-to-r from-gold-dark via-gold to-gold-light px-6 text-sm font-semibold text-[#0A0A0A] shadow-lg shadow-gold/15 transition-all hover:shadow-gold/30 hover:brightness-110 disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </motion.div>

      {/* Google Sign Up */}
      <motion.div variants={fadeUp}>
        <GoogleSignInButton mode="register" role={role} />
      </motion.div>

      {/* Divider */}
      <motion.div
        variants={fadeUp}
        className="flex items-center gap-3"
      >
        <span className="h-px flex-1 bg-border/50" />
        <span className="text-xs text-muted-foreground/60">or sign up with email</span>
        <span className="h-px flex-1 bg-border/50" />
      </motion.div>

      {/* Login link */}
      <motion.div variants={fadeUp} className="text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => setView('login')}
            className="font-semibold text-gold transition-colors hover:text-gold-light"
          >
            Sign In
          </button>
        </p>
      </motion.div>
    </motion.form>
  );
}

/* -------------------------------------------------------------------------- */
/*  Google Sign-In Button                                                       */
/* -------------------------------------------------------------------------- */

function GoogleSignInButton({ mode, role }: { mode: 'login' | 'register'; role?: string }) {
  const { setView, setUser } = useAppStore();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true);
    try {
      /* Try the Google Identity Services library if available */
      if (typeof window !== 'undefined' && (window as unknown as Record<string, unknown>).google?.accounts) {
        const googleAccounts = (window as unknown as Record<string, unknown>).google as Record<string, unknown>;
        const accounts = googleAccounts.accounts as Record<string, (config: Record<string, unknown>) => void>;
        accounts.id?.({
          callback: async (response: { credential?: string }) => {
            try {
              // Decode JWT token
              const payload = JSON.parse(atob(response.credential!.split('.')[1]));
              const googleData = {
                name: payload.name || '',
                email: payload.email || '',
                googleId: payload.sub || '',
                avatar: payload.picture || '',
                role: mode === 'register' ? role : undefined,
              };

              const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'google-login', ...googleData }),
              });

              const data = await res.json();
              if (!res.ok) {
                toast.error(data.error || 'Google sign-in failed');
                return;
              }

              const user = data.user as User;
              setUser(user);

              if (data.isNew) {
                toast.success(`Account created with Google! Welcome, ${user.name}.`);
              } else {
                toast.success(`Welcome back, ${user.name}!`);
              }

              switch (user.role) {
                case 'admin': setView('admin-dashboard'); break;
                case 'provider': setView('provider-dashboard'); break;
                default: setView('client-dashboard'); break;
              }
            } catch {
              toast.error('Failed to process Google sign-in');
            } finally {
              setLoading(false);
            }
          },
        });
      } else {
        /* Fallback: simulate Google login with a popup prompt for demo */
        toast.info('Google Sign-In is loading. In production, a Google popup would appear.');

        // For demo purposes, create a simulated Google login
        const demoEmail = prompt('Enter your Gmail address (demo):');
        if (!demoEmail || !demoEmail.includes('@')) {
          setLoading(false);
          return;
        }

        const demoName = demoEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'google-login',
            name: demoName,
            email: demoEmail.trim(),
            googleId: 'demo_google_' + Date.now(),
            role: mode === 'register' ? role : undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || 'Google sign-in failed');
          setLoading(false);
          return;
        }

        const user = data.user as User;
        setUser(user);
        toast.success(`Signed in with Google as ${user.name}!`);

        switch (user.role) {
          case 'admin': setView('admin-dashboard'); break;
          case 'provider': setView('provider-dashboard'); break;
          default: setView('client-dashboard'); break;
        }
      }
    } catch {
      toast.error('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [mode, role, setView, setUser]);

  return (
    <Button
      type="button"
      variant="outline"
      disabled={loading}
      onClick={handleGoogleSignIn}
      className="h-12 w-full rounded-lg border-border/60 bg-surface px-6 text-sm font-medium text-foreground transition-all hover:border-gold/30 hover:bg-surface-hover hover:text-gold disabled:opacity-70"
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Connecting to Google...
        </>
      ) : (
        <>
          <svg className="size-4 mr-2" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          {mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
        </>
      )}
    </Button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Auth Page (Exported)                                                       */
/* -------------------------------------------------------------------------- */

export function AuthPage() {
  const { currentView, setView } = useAppStore();
  const isLogin = currentView === 'login';

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col lg:flex-row">
      {/* Left branding panel — hidden on mobile, visible on desktop */}
      <div className="relative hidden w-[440px] shrink-0 border-r border-border/30 lg:block xl:w-[500px]">
        <BrandingPanel />
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col">
        {/* Mobile branding header */}
        <div className="border-b border-border/30 bg-gradient-to-r from-[#0d0d0d] via-[#111] to-[#0A0A0A] p-6 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold-dark via-gold to-gold-light shadow-md shadow-gold/15">
              <Diamond className="size-5 text-[#0A0A0A]" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold tracking-tight text-white">
                <span className="text-gold-gradient">Concierge</span>
                <span className="text-white">X</span>
              </h1>
              <p className="text-[11px] text-muted-foreground">
                The Premier Luxury Marketplace
              </p>
            </div>
          </div>
        </div>

        {/* Form container */}
        <div className="flex flex-1 items-center justify-center px-6 py-10 lg:px-16">
          <div className="w-full max-w-md">
            {/* Back button */}
            <motion.button
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setView('landing')}
              className="mb-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-gold"
            >
              <ArrowLeft className="size-4" />
              Back to Home
            </motion.button>

            {/* Animated form switch */}
            <AnimatePresence mode="wait">
              {isLogin ? <LoginForm key="login" /> : <RegisterForm key="register" />}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom decorative bar */}
        <div className="hidden items-center justify-center gap-6 border-t border-border/20 py-4 lg:flex">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
            <Shield className="size-3" />
            <span>Secure & Encrypted</span>
          </div>
          <span className="text-border/30">|</span>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
            <Sparkles className="size-3" />
            <span>Premium Experience</span>
          </div>
          <span className="text-border/30">|</span>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
            <Star className="size-3" />
            <span>Trusted by Thousands</span>
          </div>
        </div>
      </div>
    </div>
  );
}
