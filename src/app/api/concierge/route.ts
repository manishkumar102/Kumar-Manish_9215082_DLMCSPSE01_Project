import { NextRequest, NextResponse } from 'next/server'

// ── Types ──────────────────────────────────────────────────────────────
interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// In-memory conversation store keyed by sessionId
const conversations = new Map<string, ChatMessage[]>()

const MAX_MESSAGES = 20

const SYSTEM_PROMPT = `You are "Aria", the AI concierge for ConciergeX - a premium luxury services marketplace. You help users find luxury services (private jets, yachts, fine dining, personal styling, etc.), answer questions about bookings, provide recommendations, and assist with account inquiries. Be warm, sophisticated, and professional. Keep responses concise (2-3 paragraphs max).`

// ── Knowledge-based response engine ────────────────────────────────────
// Matches user intent via keyword analysis and returns contextual replies
const RESPONSE_PATTERNS: { keywords: string[]; response: string }[] = [
  {
    keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good evening', 'good afternoon'],
    response:
      'Welcome to ConciergeX! I\'m Aria, your personal luxury concierge. I can help you discover our curated collection of premium services — from private jets and yacht charters to Michelin-star dining and personal styling. How may I assist you today?',
  },
  {
    keywords: ['book', 'booking', 'reserve', 'reservation', 'schedule', 'appointment'],
    response:
      'To make a booking, simply browse our services and select the one that interests you. Click "Book Now" on the service detail page, choose your preferred date and time, and proceed to payment. You can view and manage all your bookings from your dashboard.\n\nIf you need help finding the perfect service, I\'d be happy to suggest options based on your preferences!',
  },
  {
    keywords: ['pay', 'payment', 'price', 'cost', 'fee', 'charge', 'billing', 'invoice'],
    response:
      'ConciergeX supports secure payment processing for all bookings. Our platform charges a 15% service fee to maintain our premium standards and provider vetting. You can view a detailed receipt for every completed booking from your dashboard.\n\nAll transactions are processed securely, and you\'ll receive a confirmation email with your booking details and payment summary.',
  },
  {
    keywords: ['cancel', 'cancellation', 'refund', 'return'],
    response:
      'You can cancel a booking from your dashboard by navigating to the booking details page. Select a cancellation reason and confirm the request. Cancellation policies may vary by service provider.\n\nFor any disputes or issues with a booking, you can use our Dispute Resolution feature to communicate with the provider and our support team.',
  },
  {
    keywords: ['jet', 'flight', 'aviation', 'plane', 'aircraft', 'fly'],
    response:
      'Our Private Aviation collection features world-class services including private jet charters, helicopter transfers, and luxury airport concierge. Browse our "Private Aviation" category to explore available options.\n\nEach aviation service includes detailed specifications, pilot credentials, and transparent pricing. Would you like me to help you find a specific type of flight?',
  },
  {
    keywords: ['yacht', 'boat', 'cruise', 'sailing', 'marine', 'charter'],
    response:
      'Explore our curated selection of luxury yacht charters and marine experiences. From Mediterranean cruises to Caribbean day sails, our vetted providers offer unforgettable maritime adventures.\n\nBrowse the "Yacht & Marine" category to see available vessels, crew details, and itinerary options.',
  },
  {
    keywords: ['dining', 'restaurant', 'chef', 'food', 'culinary', 'michelin', 'dinner', 'lunch'],
    response:
      'Discover extraordinary culinary experiences through ConciergeX. Our "Fine Dining" category features private chef services, exclusive restaurant reservations, wine tasting experiences, and bespoke dining events.\n\nWhether you\'re planning an intimate dinner or a grand celebration, our culinary partners deliver exceptional gastronomic experiences.',
  },
  {
    keywords: ['spa', 'wellness', 'massage', 'relax', 'health', 'beauty', 'treatment'],
    response:
      'Indulge in our premium wellness and spa services. From luxury spa retreats and in-home massage therapy to holistic wellness programs, our providers are carefully selected for their expertise and excellence.\n\nBrowse the "Wellness & Spa" category to find treatments that suit your preferences.',
  },
  {
    keywords: ['style', 'fashion', 'wardrobe', 'styling', 'personal shopper', 'clothing'],
    response:
      'Elevate your personal style with our curated fashion and styling services. Our expert stylists offer wardrobe consultations, personal shopping experiences, and bespoke fashion guidance.\n\nExplore the "Personal Styling" category to connect with top fashion professionals.',
  },
  {
    keywords: ['account', 'profile', 'settings', 'password', 'email', 'login', 'signup', 'register'],
    response:
      'You can manage your account settings from the Profile page. There you can update your personal information, change notification preferences, and manage your account security.\n\nIf you\'re new to ConciergeX, creating an account takes just a moment — simply click "Sign Up" and choose your role (Client or Service Provider).',
  },
  {
    keywords: ['review', 'rating', 'feedback', 'rate', 'star'],
    response:
      'After a completed booking, you can leave a review and rating for the service provider. Your feedback helps maintain our high standards and assists other clients in making informed decisions.\n\nYou can view all reviews on the service detail page and manage your submitted reviews from your dashboard.',
  },
  {
    keywords: ['provider', 'become', 'offer', 'service provider', 'sell', 'list'],
    response:
      'Becoming a ConciergeX service provider allows you to showcase your premium services to our discerning clientele. Sign up as a "Service Provider," complete the verification process, and start listing your services.\n\nOur platform handles bookings, payments, and client communications, letting you focus on delivering exceptional experiences.',
  },
  {
    keywords: ['favorite', 'save', 'wishlist', 'saved'],
    response:
      'You can save services to your favorites by clicking the heart icon on any service card. Access your saved favorites from your dashboard for quick booking later.\n\nThis feature helps you curate a personal collection of services you\'re interested in.',
  },
  {
    keywords: ['message', 'chat', 'contact', 'communicate', 'talk'],
    response:
      'ConciergeX features real-time messaging between clients and service providers. Once you have a booking, you can communicate directly with your provider to discuss details, special requests, or any questions.\n\nAccess your conversations from the Messages section in your dashboard.',
  },
  {
    keywords: ['help', 'support', 'assist', 'question', 'how'],
    response:
      'I\'m here to help! I can assist you with finding services, understanding our booking process, payment information, account management, and more. Feel free to ask me anything about ConciergeX.\n\nFor specific account issues, you can also reach our support team through the Contact Us page.',
  },
  {
    keywords: ['thank', 'thanks', 'appreciate', 'great', 'awesome', 'wonderful'],
    response:
      'You\'re most welcome! It\'s my pleasure to assist you. If you need anything else — whether it\'s finding the perfect service, understanding a feature, or just exploring what ConciergeX has to offer — don\'t hesitate to ask. Enjoy your luxury experience!',
  },
]

const DEFAULT_RESPONSE =
  'Thank you for your message. I\'d be happy to help you explore our luxury services marketplace. You can browse categories like Private Aviation, Yacht Charters, Fine Dining, Wellness & Spa, Personal Styling, and many more.\n\nFeel free to ask me about bookings, payments, specific service categories, or any other aspect of ConciergeX. I\'m here to ensure you have an exceptional experience.'

function generateResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase()

  // Score each pattern by how many keywords match
  let bestMatch: { score: number; response: string } = { score: 0, response: DEFAULT_RESPONSE }

  for (const pattern of RESPONSE_PATTERNS) {
    const score = pattern.keywords.filter((kw) => lower.includes(kw)).length
    if (score > bestMatch.score) {
      bestMatch = { score, response: pattern.response }
    }
  }

  return bestMatch.response
}

// ── Session helpers ────────────────────────────────────────────────────
function getSessionMessages(sessionId: string): ChatMessage[] {
  return conversations.get(sessionId) ?? []
}

function setSessionMessages(sessionId: string, messages: ChatMessage[]): void {
  if (messages.length > MAX_MESSAGES + 1) {
    const systemPrompt = messages[0]
    const trimmed = messages.slice(-MAX_MESSAGES)
    messages = [systemPrompt, ...trimmed]
  }
  conversations.set(sessionId, messages)
}

// ── POST /api/concierge — send a message to the concierge ─────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId } = body

    // Validate request body
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'A non-empty "message" string is required.' },
        { status: 400 }
      )
    }

    if (message.length > 4000) {
      return NextResponse.json(
        { error: 'Message must be 4000 characters or less.' },
        { status: 400 }
      )
    }

    const sid = typeof sessionId === 'string' && sessionId.trim() ? sessionId.trim() : 'default'

    // Build conversation history
    let messages = getSessionMessages(sid)

    // Initialize with system prompt if this is a new session
    if (messages.length === 0) {
      messages = [{ role: 'system', content: SYSTEM_PROMPT }]
    }

    // Append the user's message
    messages.push({ role: 'user', content: message })

    // Trim old messages if over the limit
    if (messages.length > MAX_MESSAGES + 1) {
      const systemPrompt = messages[0]
      messages = [systemPrompt, ...messages.slice(-MAX_MESSAGES)]
    }

    // Generate a contextual response based on user intent
    const assistantContent = generateResponse(message)

    // Store the assistant's reply in conversation history
    messages.push({ role: 'assistant', content: assistantContent })
    setSessionMessages(sid, messages)

    return NextResponse.json({ response: assistantContent })
  } catch (error) {
    console.error('[CONCIERGE_POST]', error)

    return NextResponse.json(
      { error: 'An internal error occurred while processing your request.' },
      { status: 500 }
    )
  }
}

// DELETE /api/concierge?sessionId=... — clear conversation history for a session
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId || !sessionId.trim()) {
      return NextResponse.json(
        { error: 'A "sessionId" query parameter is required.' },
        { status: 400 }
      )
    }

    const sid = sessionId.trim()
    const existed = conversations.has(sid)
    conversations.delete(sid)

    return NextResponse.json({
      message: existed
        ? `Conversation history for session "${sid}" has been cleared.`
        : `No conversation history found for session "${sid}".`,
      cleared: existed,
    })
  } catch (error) {
    console.error('[CONCIERGE_DELETE]', error)
    return NextResponse.json(
      { error: 'Internal server error while clearing conversation history.' },
      { status: 500 }
    )
  }
}
