'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  MapPin, CreditCard, MessageSquare, Mail, Calendar, ExternalLink,
  Plug, CheckCircle2, XCircle, Settings, RefreshCw,
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: typeof MapPin;
  status: 'connected' | 'mock' | 'disconnected';
  category: string;
  lastSync?: string;
  apiKey?: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'google_maps',
    name: 'Google Maps API',
    description: 'Location services, geocoding, and place search for service locations',
    icon: MapPin,
    status: 'connected',
    category: 'Location',
    lastSync: '2 minutes ago',
    apiKey: 'AIza...••••7f3d',
  },
  {
    id: 'stripe',
    name: 'Stripe Payment Gateway',
    description: 'Secure payment processing for bookings and transactions',
    icon: CreditCard,
    status: 'connected',
    category: 'Payments',
    lastSync: '5 minutes ago',
    apiKey: 'sk_live_••••••4k2m',
  },
  {
    id: 'twilio',
    name: 'Twilio SMS',
    description: 'SMS notifications for booking updates and reminders',
    icon: MessageSquare,
    status: 'mock',
    category: 'Communications',
    apiKey: 'AC•••••••9e1b',
  },
  {
    id: 'sendgrid',
    name: 'SendGrid Email',
    description: 'Transactional email delivery for confirmations and notifications',
    icon: Mail,
    status: 'connected',
    category: 'Communications',
    lastSync: '1 minute ago',
    apiKey: 'SG.••••••w8n2',
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar Sync',
    description: 'Automatic calendar events for confirmed bookings',
    icon: Calendar,
    status: 'mock',
    category: 'Productivity',
    apiKey: '••••••apps.g',
  },
];

function StatusDot({ status }: { status: string }) {
  const color = status === 'connected' ? 'bg-emerald-400' : status === 'mock' ? 'bg-amber-400' : 'bg-red-400';
  return <div className={`size-2 rounded-full ${color} animate-pulse`} />;
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const [enabled, setEnabled] = useState(integration.status !== 'disconnected');
  const Icon = integration.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="luxury-card rounded-xl p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-gold/10 shrink-0">
            <Icon className="size-5 text-gold" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-white">{integration.name}</h4>
              <div className="flex items-center gap-1.5">
                <StatusDot status={integration.status} />
                <span className={`text-[10px] uppercase tracking-wider ${
                  integration.status === 'connected' ? 'text-emerald-400' :
                  integration.status === 'mock' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {integration.status}
                </span>
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{integration.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline" className="border-gold/15 bg-gold/5 text-[10px] text-gold/80">
                {integration.category}
              </Badge>
              {integration.apiKey && (
                <Badge variant="outline" className="border-muted text-[10px] text-muted-foreground font-mono">
                  {integration.apiKey}
                </Badge>
              )}
              {integration.lastSync && (
                <span className="text-[10px] text-muted-foreground">Synced {integration.lastSync}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            className="data-[state=checked]:bg-gold"
          />
          {integration.status === 'connected' && (
            <Button size="sm" variant="ghost" className="text-xs text-muted-foreground hover:text-gold h-7">
              <RefreshCw className="size-3 mr-1" />
              Sync
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function IntegrationsPage() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? INTEGRATIONS
    : INTEGRATIONS.filter((i) => i.status === filter);

  const statusCounts = {
    all: INTEGRATIONS.length,
    connected: INTEGRATIONS.filter((i) => i.status === 'connected').length,
    mock: INTEGRATIONS.filter((i) => i.status === 'mock').length,
    disconnected: INTEGRATIONS.filter((i) => i.status === 'disconnected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-serif text-xl font-semibold text-white">Third-Party Integrations</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage external service connections and API integrations
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Connected', count: statusCounts.connected, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Mock Mode', count: statusCounts.mock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Disconnected', count: statusCounts.disconnected, color: 'text-red-400', bg: 'bg-red-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="luxury-card rounded-lg p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(['all', 'connected', 'mock', 'disconnected'] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
            className={filter === f
              ? 'bg-gradient-to-r from-gold-dark to-gold text-black text-xs h-8'
              : 'border-gold/20 text-muted-foreground text-xs h-8 hover:text-white hover:border-gold/40'}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-1.5 rounded-full bg-black/20 px-1.5 py-0.5 text-[10px] font-bold">
              {statusCounts[f]}
            </span>
          </Button>
        ))}
      </div>

      {/* Integration Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>

      {/* Technical Debt Notice */}
      <Card className="border-amber-500/20 bg-amber-500/5 rounded-xl">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Settings className="size-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white">Technical Debt & Future Scope</h4>
              <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">&#8226;</span>
                  <span><strong>Native Mobile Apps (iOS/Android):</strong> Would require React Native or separate mobile development. Web app provides mobile-responsive alternative.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">&#8226;</span>
                  <span><strong>SMS Notifications:</strong> Currently in mock mode. Production requires Twilio account and phone number provisioning.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">&#8226;</span>
                  <span><strong>Payment Processing:</strong> Mock Stripe integration. Production requires Stripe merchant account and API key configuration.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">&#8226;</span>
                  <span><strong>Calendar Sync:</strong> Mock Google Calendar. Production requires OAuth2 setup and Google Cloud project configuration.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 mt-0.5">&#8226;</span>
                  <span><strong>Real Email Delivery:</strong> Currently logged only. Production requires SendGrid/SES account setup and domain verification.</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
