import { NextRequest, NextResponse } from 'next/server';

/* -------------------------------------------------------------------------- */
/*  Mock data                                                                  */
/* -------------------------------------------------------------------------- */

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  connected: boolean;
  apiKey?: string;
  webhookUrl?: string;
  lastSync?: string;
  status: 'active' | 'disconnected' | 'error';
}

interface SyncEntry {
  id: string;
  service: string;
  action: string;
  status: 'success' | 'error';
  timestamp: string;
  details: string;
}

const integrations: Integration[] = [
  {
    id: 'google-maps',
    name: 'Google Maps API',
    description: 'Location services, geocoding, and map embedding for service addresses and provider locations.',
    icon: 'MapPin',
    category: 'Location',
    connected: true,
    apiKey: 'sk-maps-****-****-a7f2',
    webhookUrl: undefined,
    lastSync: new Date(Date.now() - 12 * 60000).toISOString(),
    status: 'active',
  },
  {
    id: 'stripe',
    name: 'Stripe Payment Gateway',
    description: 'Secure payment processing for bookings, refunds, and provider payouts.',
    icon: 'CreditCard',
    category: 'Payments',
    connected: true,
    apiKey: 'sk-live-****-****-b3d1',
    webhookUrl: 'https://conciergex.com/api/webhooks/stripe',
    lastSync: new Date(Date.now() - 3 * 60000).toISOString(),
    status: 'active',
  },
  {
    id: 'twilio',
    name: 'Twilio SMS',
    description: 'SMS notifications for booking reminders, cancellations, and verification codes.',
    icon: 'MessageSquare',
    category: 'Communications',
    connected: false,
    apiKey: undefined,
    webhookUrl: undefined,
    lastSync: undefined,
    status: 'disconnected',
  },
  {
    id: 'sendgrid',
    name: 'SendGrid Email',
    description: 'Transactional and marketing email delivery for booking confirmations and newsletters.',
    icon: 'Mail',
    category: 'Communications',
    connected: true,
    apiKey: 'SG.****-****-c9e4',
    webhookUrl: undefined,
    lastSync: new Date(Date.now() - 45 * 60000).toISOString(),
    status: 'active',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Calendar sync for provider availability and automated booking scheduling.',
    icon: 'Calendar',
    category: 'Scheduling',
    connected: false,
    apiKey: undefined,
    webhookUrl: undefined,
    lastSync: undefined,
    status: 'disconnected',
  },
];

const syncHistory: SyncEntry[] = [
  { id: '1', service: 'Google Maps API', action: 'Geocoded 3 new addresses', status: 'success', timestamp: new Date(Date.now() - 12 * 60000).toISOString(), details: 'Processed 3 service address updates' },
  { id: '2', service: 'Stripe Payment Gateway', action: 'Payment webhook received', status: 'success', timestamp: new Date(Date.now() - 3 * 60000).toISOString(), details: 'Booking #bk_8472 payment confirmed' },
  { id: '3', service: 'SendGrid Email', action: 'Sent booking confirmation', status: 'success', timestamp: new Date(Date.now() - 45 * 60000).toISOString(), details: 'Email sent to victoria@example.com' },
  { id: '4', service: 'Stripe Payment Gateway', action: 'Refund processed', status: 'success', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), details: 'Refund of $2,500 for booking #bk_8391' },
  { id: '5', service: 'Google Maps API', action: 'Location batch sync', status: 'success', timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), details: 'Synced 18 provider locations' },
  { id: '6', service: 'SendGrid Email', action: 'Welcome email sent', status: 'success', timestamp: new Date(Date.now() - 12 * 3600000).toISOString(), details: 'New user registration email delivered' },
  { id: '7', service: 'Stripe Payment Gateway', action: 'Payout batch', status: 'error', timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), details: 'Payout to provider #5 failed — insufficient balance' },
];

/* -------------------------------------------------------------------------- */
/*  GET — Fetch integrations + sync history                                    */
/* -------------------------------------------------------------------------- */

export async function GET() {
  try {
    return NextResponse.json({ integrations, syncHistory });
  } catch (error) {
    console.error('GET /api/integrations error:', error);
    return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------- */
/*  POST — Toggle / Sync / Test an integration                                */
/* -------------------------------------------------------------------------- */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service, action } = body;

    if (!service || !action) {
      return NextResponse.json({ error: 'Missing service or action' }, { status: 400 });
    }

    const integration = integrations.find((i) => i.id === service);
    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    if (action === 'toggle') {
      integration.connected = !integration.connected;
      if (integration.connected) {
        integration.status = 'active';
        integration.lastSync = new Date().toISOString();
        // Generate mock API key
        const prefix = integration.id === 'stripe' ? 'sk-live' : integration.id === 'sendgrid' ? 'SG' : 'sk';
        integration.apiKey = `${prefix}.${'****-****-'.repeat(2)}${Math.random().toString(16).slice(2, 6)}`;
      } else {
        integration.status = 'disconnected';
        integration.apiKey = undefined;
        integration.webhookUrl = undefined;
      }

      syncHistory.unshift({
        id: Date.now().toString(),
        service: integration.name,
        action: integration.connected ? 'Connected' : 'Disconnected',
        status: 'success',
        timestamp: new Date().toISOString(),
        details: integration.connected ? 'Integration activated successfully' : 'Integration disconnected',
      });

      return NextResponse.json({ integration });
    }

    if (action === 'sync') {
      if (!integration.connected) {
        return NextResponse.json({ error: 'Integration is not connected' }, { status: 400 });
      }
      integration.lastSync = new Date().toISOString();

      syncHistory.unshift({
        id: Date.now().toString(),
        service: integration.name,
        action: 'Manual sync triggered',
        status: 'success',
        timestamp: new Date().toISOString(),
        details: `Sync completed for ${integration.name}`,
      });

      return NextResponse.json({ message: `${integration.name} synced successfully` });
    }

    if (action === 'test') {
      const latency = `${(Math.random() * 200 + 50).toFixed(0)}ms`;
      return NextResponse.json({ message: 'Connection successful', latency });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/integrations error:', error);
    return NextResponse.json({ error: 'Failed to process integration action' }, { status: 500 });
  }
}
