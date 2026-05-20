'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  ShieldCheck, ShieldX, Clock, FileText, Building2, CheckCircle2,
  Loader2, AlertTriangle, Upload, Send, RotateCcw,
} from 'lucide-react';

const STEPS = ['Business Info', 'Identity Document', 'Review & Submit'];

const STATUS_CONFIG: Record<string, {
  icon: typeof CheckCircle2;
  label: string;
  color: string;
  bg: string;
  border: string;
}> = {
  none: {
    icon: AlertTriangle,
    label: 'Not Verified',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  pending: {
    icon: Clock,
    label: 'Under Review',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  approved: {
    icon: ShieldCheck,
    label: 'Verified',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  rejected: {
    icon: ShieldX,
    label: 'Rejected',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
  },
};

export function ProviderVerification() {
  const { user } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [businessLicense, setBusinessLicense] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [idDocumentType, setIdDocumentType] = useState('');
  const [idDocumentNumber, setIdDocumentNumber] = useState('');

  // Fetch existing verification status
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/verifications?userId=${user.id}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          if (data.user) {
            setBusinessName(data.user.businessName ?? '');
            setBusinessLicense(data.user.businessLicense ?? '');
            setBusinessAddress(data.user.businessAddress ?? '');
            setIdDocumentNumber(data.user.idDocument ?? '');
            if (data.user.verificationStatus === 'pending' || data.user.verificationStatus === 'approved') {
              setSuccess(data.user.verificationStatus === 'approved');
            }
          }
        }
      } catch { /* silent */ }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  const handleSubmit = useCallback(async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          businessName,
          businessLicense,
          businessAddress,
          idDocument: `${idDocumentType}: ${idDocumentNumber}`,
        }),
      });
      if (res.ok) {
        setSuccess(true);
      }
    } catch { /* silent */ }
    setSubmitting(false);
  }, [user, businessName, businessLicense, businessAddress, idDocumentType, idDocumentNumber]);

  if (!user) return null;

  const status = user.verificationStatus || 'none';
  const statusConf = STATUS_CONFIG[status] || STATUS_CONFIG.none;
  const StatusIcon = statusConf.icon;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="luxury-card h-48 rounded-xl animate-pulse bg-muted/50" />
        ))}
      </div>
    );
  }

  // Already approved
  if (status === 'approved') {
    return (
      <Card className="luxury-card rounded-xl overflow-hidden">
        <CardContent className="p-6">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center py-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
              <ShieldCheck className="size-8 text-emerald-400" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white mb-2">Account Verified</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Your account has been verified. You can now offer services on ConciergeX with full credibility.
            </p>
            {user.verifiedAt && (
              <p className="mt-3 text-xs text-muted-foreground">
                Verified on {new Date(user.verifiedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  // Rejected - show reason and re-apply
  if (status === 'rejected') {
    return (
      <div className="space-y-4">
        <Card className="luxury-card rounded-xl overflow-hidden border-red-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-12 items-center justify-center rounded-full bg-red-500/10 shrink-0">
                <ShieldX className="size-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg font-bold text-white mb-1">Verification Rejected</h3>
                {user.verificationNote && (
                  <p className="text-sm text-red-400 bg-red-500/5 rounded-lg p-3 mt-2">
                    Reason: {user.verificationNote}
                  </p>
                )}
                <Button
                  onClick={() => setSuccess(false)}
                  className="mt-4 bg-gradient-to-r from-gold-dark to-gold text-black font-semibold text-sm"
                >
                  <RotateCcw className="size-4 mr-2" />
                  Re-apply for Verification
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pending review
  if (status === 'pending') {
    return (
      <Card className="luxury-card rounded-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col items-center py-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-blue-500/10 mb-4">
              <Clock className="size-8 text-blue-400" />
            </div>
            <h3 className="font-serif text-xl font-bold text-white mb-2">Verification Under Review</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Your verification request has been submitted and is being reviewed by our team. This typically takes 1-3 business days.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 text-left text-sm">
              <div className="bg-surface rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Business Name</p>
                <p className="font-medium text-white">{businessName || 'N/A'}</p>
              </div>
              <div className="bg-surface rounded-lg p-3">
                <p className="text-xs text-muted-foreground">License</p>
                <p className="font-medium text-white">{businessLicense ? businessLicense.slice(0, 8) + '...' : 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Verification Form (multi-step)
  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-2 flex-1">
            <div className={`flex size-8 items-center justify-center rounded-full text-xs font-bold shrink-0 transition-all ${
              i <= currentStep
                ? 'bg-gradient-to-r from-gold-dark to-gold text-black'
                : 'bg-muted text-muted-foreground'
            }`}>
              {i < currentStep ? <CheckCircle2 className="size-4" /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i <= currentStep ? 'text-gold' : 'text-muted-foreground'}`}>
              {step}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px ${i < currentStep ? 'bg-gold/50' : 'bg-muted'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="luxury-card rounded-xl overflow-hidden">
        <CardContent className="p-6">
          {currentStep === 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h3 className="font-serif text-lg font-semibold text-white flex items-center gap-2">
                <Building2 className="size-5 text-gold" />
                Business Information
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Business Name *</Label>
                  <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g., Grand Luxury Concierge" className="mt-1 border-gold/15 bg-surface text-white" />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Business License Number *</Label>
                  <Input value={businessLicense} onChange={(e) => setBusinessLicense(e.target.value)}
                    placeholder="e.g., BL-2026-XXXXX" className="mt-1 border-gold/15 bg-surface text-white" />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Business Address</Label>
                  <Textarea value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)}
                    placeholder="Full business address" rows={3}
                    className="mt-1 border-gold/15 bg-surface text-white resize-none" />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h3 className="font-serif text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="size-5 text-gold" />
                Identity Verification
              </h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Document Type *</Label>
                  <Select value={idDocumentType} onValueChange={setIdDocumentType}>
                    <SelectTrigger className="mt-1 border-gold/15 bg-surface text-white">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-gold/15">
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="national_id">National ID Card</SelectItem>
                      <SelectItem value="drivers_license">Driver&apos;s License</SelectItem>
                      <SelectItem value="business_registration">Business Registration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Document Number *</Label>
                  <Input value={idDocumentNumber} onChange={(e) => setIdDocumentNumber(e.target.value)}
                    placeholder="Enter your document number" className="mt-1 border-gold/15 bg-surface text-white" />
                </div>
                <div className="rounded-lg bg-gold/5 border border-gold/15 p-4">
                  <div className="flex items-start gap-3">
                    <Upload className="size-5 text-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-white">Document Upload</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        In production, you would upload your document here. For this demo, enter your document number above.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <h3 className="font-serif text-lg font-semibold text-white">Review & Submit</h3>
              <div className="space-y-3">
                <div className="bg-surface rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Business Name</span>
                    <span className="text-sm font-medium text-white">{businessName || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">License Number</span>
                    <span className="text-sm font-medium text-white">{businessLicense || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Address</span>
                    <span className="text-sm font-medium text-white">{businessAddress || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Document Type</span>
                    <span className="text-sm font-medium text-white capitalize">{idDocumentType?.replace('_', ' ') || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Document Number</span>
                    <span className="text-sm font-medium text-white">{idDocumentNumber || '—'}</span>
                  </div>
                </div>
                <div className="rounded-lg bg-gold/5 border border-gold/15 p-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    By submitting, you confirm all information is accurate. Verification typically takes 1-3 business days.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gold/10">
            <Button variant="ghost" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0} className="text-muted-foreground hover:text-white">
              Back
            </Button>
            {currentStep < STEPS.length - 1 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)}
                disabled={currentStep === 0 && (!businessName || !businessLicense)}
                className="bg-gradient-to-r from-gold-dark to-gold text-black font-semibold text-sm">
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting}
                className="bg-gradient-to-r from-gold-dark to-gold text-black font-semibold text-sm">
                {submitting ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Send className="size-4 mr-2" />}
                Submit Verification
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
