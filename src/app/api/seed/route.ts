import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // ── Clear all existing data in correct dependency order ──
    console.log('[SEED] Clearing existing data...')
    await db.message.deleteMany()
    await db.notification.deleteMany()
    await db.favorite.deleteMany()
    await db.review.deleteMany()
    await db.booking.deleteMany()
    await db.service.deleteMany()
    await db.user.deleteMany()
    console.log('[SEED] All existing data cleared.')

    // ────────────────────────────────────────────
    //  USERS (22 total: 1 admin, 7 clients, 14 providers)
    // ────────────────────────────────────────────

    const admin = await db.user.create({
      data: {
        name: 'Alexandra Sterling',
        email: 'admin@conciergex.com',
        password: 'Admin@123',
        role: 'admin',
        phone: '+1 212-555-0100',
        avatar: 'https://picsum.photos/seed/admin-avatar/200/200',
        location: 'New York',
        bio: 'Platform administrator managing ConciergeX operations.',
        verified: true,
        premium: true,
      },
    })

    // ── Original Clients ──
    const client1 = await db.user.create({
      data: {
        name: 'Victoria Harrington',
        email: 'client@demo.com',
        password: 'Demo@123',
        role: 'client',
        phone: '+1 305-555-0101',
        avatar: 'https://picsum.photos/seed/client1-avatar/200/200',
        location: 'Miami',
        bio: 'Luxury lifestyle enthusiast. Frequent traveler and art collector with homes in Miami and the Hamptons.',
        interests: 'Fine Dining, Art, Travel',
        premium: true,
      },
    })

    const client2 = await db.user.create({
      data: {
        name: 'James Whitfield III',
        email: 'james.whitfield@email.com',
        password: 'Demo@123',
        role: 'client',
        phone: '+1 310-555-0102',
        avatar: 'https://picsum.photos/seed/client2-avatar/200/200',
        location: 'Los Angeles',
        bio: 'Tech entrepreneur with a passion for yachting and fine cuisine. Founder of three unicorn startups.',
        interests: 'Yachting, Aviation, Dining',
        premium: false,
      },
    })

    const client3 = await db.user.create({
      data: {
        name: 'Sophia Chen-Rothschild',
        email: 'sophia.cr@email.com',
        password: 'Demo@123',
        role: 'client',
        phone: '+44 20-7946-0103',
        avatar: 'https://picsum.photos/seed/client3-avatar/200/200',
        location: 'London',
        bio: 'International socialite and philanthropist. Passionate about wellness, culture, and supporting emerging artists.',
        interests: 'Wellness, Culture, Shopping',
        premium: true,
      },
    })

    // ── Additional Clients ──
    const client4 = await db.user.create({
      data: {
        name: 'William Rothschild',
        email: 'william.rothschild@email.com',
        password: 'Demo@123',
        role: 'client',
        phone: '+44 20-7946-0104',
        avatar: 'https://picsum.photos/seed/client4-avatar/200/200',
        location: 'London',
        bio: 'Prominent tech investor and venture capitalist. Passionate about disruptive technologies and vintage wine collecting. Sits on the board of several FTSE 100 companies.',
        interests: 'Aviation, Wine, Real Estate',
        premium: true,
      },
    })

    const client5 = await db.user.create({
      data: {
        name: 'Priya Mehta',
        email: 'priya.mehta@email.com',
        password: 'Demo@123',
        role: 'client',
        phone: '+91 22-5555-0105',
        avatar: 'https://picsum.photos/seed/client5-avatar/200/200',
        location: 'Mumbai',
        bio: 'Acclaimed fashion designer whose label shows at Paris and Milan Fashion Weeks. Known for blending traditional Indian textiles with modern haute couture.',
        interests: 'Fashion, Art, Fine Dining',
        premium: true,
      },
    })

    const client6 = await db.user.create({
      data: {
        name: 'Alexander Volkov',
        email: 'alexander.volkov@email.com',
        password: 'Demo@123',
        role: 'client',
        phone: '+7 495-555-0106',
        avatar: 'https://picsum.photos/seed/client6-avatar/200/200',
        location: 'Moscow',
        bio: 'Elite art dealer specializing in Russian avant-garde and Impressionist masterworks. Owns galleries in Moscow, London, and New York.',
        interests: 'Art, Culture, Real Estate',
        premium: true,
      },
    })

    const client7 = await db.user.create({
      data: {
        name: 'Charlotte Beaumont',
        email: 'charlotte.beaumont@email.com',
        password: 'Demo@123',
        role: 'client',
        phone: '+33 1-5555-0107',
        avatar: 'https://picsum.photos/seed/client7-avatar/200/200',
        location: 'Paris',
        bio: 'Renowned wine connoisseur and certified Master of Wine. Owns a private vineyard in Bordeaux and writes for Decanter magazine.',
        interests: 'Wine, Fine Dining, Travel',
        premium: false,
      },
    })

    // ── Original Providers ──
    const provider1 = await db.user.create({
      data: {
        name: 'Chef Marco Bellini',
        email: 'provider@demo.com',
        password: 'Demo@123',
        role: 'provider',
        phone: '+1 212-555-0201',
        avatar: 'https://picsum.photos/seed/chef-marco/200/200',
        location: 'New York',
        bio: 'Three-Michelin-star chef with 20 years of experience in haute cuisine. Trained in Paris and Tokyo. Known for innovative fusion dishes that celebrate seasonal ingredients.',
        interests: 'Fine Dining',
        verified: true,
        premium: true,
      },
    })

    const provider2 = await db.user.create({
      data: {
        name: 'Captain Olivier Laurent',
        email: 'olivier.laurent@email.com',
        password: 'Demo@123',
        role: 'provider',
        phone: '+377 98-06-0202',
        avatar: 'https://picsum.photos/seed/captain-olivier/200/200',
        location: 'Monaco',
        bio: 'Master mariner with 25 years navigating the Mediterranean and Caribbean. Holds a 3000-ton master mariner license and speaks six languages.',
        interests: 'Yacht & Charter',
        verified: true,
        premium: true,
      },
    })

    const provider3 = await db.user.create({
      data: {
        name: 'Victoria Nash',
        email: 'victoria.nash@email.com',
        password: 'Demo@123',
        role: 'provider',
        phone: '+971 4-555-0203',
        avatar: 'https://picsum.photos/seed/victoria-nash/200/200',
        location: 'Dubai',
        bio: 'Certified aesthetician and wellness consultant with 15 years in luxury spas. Trained in Swiss and Japanese wellness traditions.',
        interests: 'Beauty & Wellness',
        verified: true,
        premium: false,
      },
    })

    const provider4 = await db.user.create({
      data: {
        name: 'Jean-Pierre Moreau',
        email: 'jp.moreau@email.com',
        password: 'Demo@123',
        role: 'provider',
        phone: '+33 1-5555-0204',
        avatar: 'https://picsum.photos/seed/jp-moreau/200/200',
        location: 'Paris',
        bio: 'Art curator and private gallery director specializing in Impressionist and Contemporary art. Former chief curator at the Musée d\'Orsay.',
        interests: 'Art & Culture',
        verified: true,
        premium: true,
      },
    })

    const provider5 = await db.user.create({
      data: {
        name: 'Kazuki Tanaka',
        email: 'kazuki.tanaka@email.com',
        password: 'Demo@123',
        role: 'provider',
        phone: '+81 3-5555-0205',
        avatar: 'https://picsum.photos/seed/kazuki-tanaka/200/200',
        location: 'Tokyo',
        bio: 'Personal stylist and luxury shopping consultant with exclusive connections to top fashion houses in Japan and Europe.',
        interests: 'Personal Shopping',
        verified: true,
        premium: false,
      },
    })

    const provider6 = await db.user.create({
      data: {
        name: 'Sebastian Blackwell',
        email: 'sebastian.blackwell@email.com',
        password: 'Demo@123',
        role: 'provider',
        phone: '+1 305-555-0206',
        avatar: 'https://picsum.photos/seed/sebastian-blackwell/200/200',
        location: 'Miami',
        bio: 'Elite events producer for Fortune 500 galas, celebrity weddings, and private soirees. Featured in Vogue and Harper\'s Bazaar.',
        interests: 'Events & Entertainment',
        verified: true,
        premium: true,
      },
    })

    const provider7 = await db.user.create({
      data: {
        name: 'Isabella Rossi',
        email: 'isabella.rossi@email.com',
        password: 'Demo@123',
        role: 'provider',
        phone: '+1 212-555-0207',
        avatar: 'https://picsum.photos/seed/isabella-rossi/200/200',
        location: 'New York',
        bio: 'Licensed real estate broker specializing in Manhattan luxury penthouses and waterfront estates. Over $2 billion in career sales.',
        interests: 'Real Estate',
        verified: true,
        premium: true,
      },
    })

    const provider8 = await db.user.create({
      data: {
        name: 'Commander Richard Hayes',
        email: 'richard.hayes@email.com',
        password: 'Demo@123',
        role: 'provider',
        phone: '+1 310-555-0208',
        avatar: 'https://picsum.photos/seed/richard-hayes/200/200',
        location: 'Los Angeles',
        bio: 'Former airline captain turned private aviation consultant with 30 years of flight experience. Type-rated on 17 aircraft.',
        interests: 'Private Aviation',
        verified: true,
        premium: false,
      },
    })

    // ── Additional Providers ──
    const provider9 = await db.user.create({
      data: {
        name: 'Dr. Elena Vasquez',
        email: 'elena.vasquez@email.com',
        password: 'Demo@123',
        role: 'provider',
        phone: '+41 44-555-0209',
        avatar: 'https://picsum.photos/seed/dr-elena/200/200',
        location: 'Zurich',
        bio: 'Board-certified dermatologist and anti-aging specialist with clinics in Zurich and Geneva. Pioneer of the Vasquez Protocol for cellular rejuvenation, featured in Vogue, Elle, and Harper\'s Bazaar.',
        interests: 'Beauty & Wellness, Medical Wellness',
        verified: true,
        premium: true,
      },
    })

    const provider10 = await db.user.create({
      data: {
        name: 'Sheikh Rashid Al-Maktoum',
        email: 'rashid.maktoum@email.com',
        password: 'Demo@123',
        role: 'provider',
        phone: '+971 4-555-0210',
        avatar: 'https://picsum.photos/seed/sheikh-rashid/200/200',
        location: 'Dubai',
        bio: 'Born into a legacy of desert exploration, Sheikh Rashid offers exclusive desert safari and adventure experiences that blend traditional Bedouin culture with ultra-luxury amenities. His bespoke excursions have hosted royalty and heads of state.',
        interests: 'Adventure & Sports, Events',
        verified: true,
        premium: true,
      },
    })

    const provider11 = await db.user.create({
      data: {
        name: 'Nikolai Petrov',
        email: 'nikolai.petrov@email.com',
        password: 'Demo@123',
        role: 'provider',
        phone: '+44 20-7946-0211',
        avatar: 'https://picsum.photos/seed/nikolai-petrov/200/200',
        location: 'London',
        bio: 'Vintage automobile connoisseur and classic car broker with over 200 rare vehicles in his private collection. Former Formula 1 engineer turned luxury motoring consultant. Specializes in sourcing and delivering classic Ferraris, Bugattis, and Rolls-Royces.',
        interests: 'Luxury Transport, Real Estate',
        verified: true,
        premium: true,
      },
    })

    const provider12 = await db.user.create({
      data: {
        name: 'Amara Okafor',
        email: 'amara.okafor@email.com',
        password: 'Demo@123',
        role: 'provider',
        phone: '+254 20-555-0212',
        avatar: 'https://picsum.photos/seed/amara-okafor/200/200',
        location: 'Nairobi',
        bio: 'Award-winning safari operator and conservationist. Third-generation Kenyan wildlife guide whose family has been leading expeditions since 1952. Her luxury tented camps have been featured in National Geographic and Condé Nast Traveler.',
        interests: 'Adventure & Sports, Wine & Spirits',
        verified: true,
        premium: true,
      },
    })

    const provider13 = await db.user.create({
      data: {
        name: 'Henrik Johansson',
        email: 'henrik.johansson@email.com',
        password: 'Demo@123',
        role: 'provider',
        phone: '+46 8-555-0213',
        avatar: 'https://picsum.photos/seed/henrik-johansson/200/200',
        location: 'Stockholm',
        bio: 'Nordic experience designer and former Olympic cross-country skier. Creator of the iconic Ice Hotel Experience in Jukkasjärvi, blending Lapland wilderness with five-star luxury hospitality.',
        interests: 'Adventure & Sports, Events & Entertainment',
        verified: true,
        premium: true,
      },
    })

    const provider14 = await db.user.create({
      data: {
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        password: 'Demo@123',
        role: 'provider',
        phone: '+960 990-0214',
        avatar: 'https://picsum.photos/seed/maria-santos/200/200',
        location: 'Maldives',
        bio: 'Luxury hospitality visionary managing an exclusive portfolio of private island rentals across the Maldives archipelago. Former resort director at One&Only Reethi Rah with 18 years of five-star experience.',
        interests: 'Real Estate, Adventure & Sports',
        verified: true,
        premium: true,
      },
    })

    // ── New Category Providers ──
    const provider15 = await db.user.create({
      data: {
        name: 'Major Dmitri Volkov',
        email: 'dmitri.volkov@email.com',
        password: 'Demo@123',
        role: 'provider',
        phone: '+44 20-7946-0215',
        avatar: 'https://picsum.photos/seed/dmitri-volkov/200/200',
        location: 'London',
        bio: 'Former SAS operative with 18 years of experience in VIP close protection and threat assessment. Served in Iraq, Afghanistan, and Syria. Now leads an elite team providing discreet protection for UHNW individuals, celebrity clients, and diplomatic delegations. Holds advanced certifications in counter-surveillance, evasive driving, and tactical medicine.',
        interests: 'Private Security',
        verified: true,
        premium: true,
      },
    })

    const provider16 = await db.user.create({
      data: {
        name: 'Dr. Sarah Mitchell',
        email: 'sarah.mitchell@email.com',
        password: 'Demo@123',
        role: 'provider',
        phone: '+1 212-555-0216',
        avatar: 'https://picsum.photos/seed/dr-sarah/200/200',
        location: 'New York',
        bio: 'Board-certified concierge medicine physician and former Harvard Medical School professor. Founder of Mitchell Private Health, a bespoke medical practice catering to Fortune 500 CEOs and international dignitaries. Specializes in preventive cardiology, executive wellness, and longevity medicine. Featured in Forbes and The Wall Street Journal.',
        interests: 'Concierge Medicine',
        verified: true,
        premium: true,
      },
    })

    const provider17 = await db.user.create({
      data: {
        name: 'Lucian Fontaine',
        email: 'lucian.fontaine@email.com',
        password: 'Demo@123',
        role: 'provider',
        phone: '+33 1-5555-0217',
        avatar: 'https://picsum.photos/seed/lucian-fontaine/200/200',
        location: 'Paris',
        bio: 'Award-winning luxury photographer and visual artist whose work has graced the covers of Vogue, Harper\'s Bazaar, and National Geographic. Known for his cinematic portraiture and breathtaking aerial drone cinematography. Clients include Chanel, Dior, and Cartier. His exhibition "Lumière d\'Or" broke attendance records at the Grand Palais.',
        interests: 'Photography & Film',
        verified: true,
        premium: true,
      },
    })

    const provider18 = await db.user.create({
      data: {
        name: 'Marcus Thornton',
        email: 'marcus.thornton@email.com',
        password: 'Demo@123',
        role: 'provider',
        phone: '+1 310-555-0218',
        avatar: 'https://picsum.photos/seed/marcus-thornton/200/200',
        location: 'Los Angeles',
        bio: 'Celebrity personal trainer and fitness visionary named "Trainer of the Year" by Men\'s Health three times. Has transformed the physiques of over 50 A-list Hollywood stars for film roles. Former Olympic-level boxer who combines combat sports conditioning with functional training. His private gym in Beverly Hills is a sanctuary for the elite.',
        interests: 'Luxury Fitness',
        verified: true,
        premium: true,
      },
    })

    // ────────────────────────────────────────────
    //  SERVICES (74 services across 16 categories)
    // ────────────────────────────────────────────

    const services = await Promise.all([
      // ══════════════════════════════════════════
      //  FINE DINING (4)
      // ══════════════════════════════════════════
      db.service.create({
        data: {
          providerId: provider1.id,
          title: 'Private Tasting Menu — 12 Courses',
          description: 'An unforgettable 12-course tasting experience curated by Chef Marco Bellini. Features seasonal ingredients sourced from the world\'s finest purveyors, paired with rare vintages from our cellar. Each dish tells a story of culinary artistry spanning French, Japanese, and Italian traditions.',
          category: 'Fine Dining',
          price: 850,
          duration: '4 hours',
          location: 'New York',
          images: JSON.stringify([
            'https://picsum.photos/seed/dining1/800/600',
            'https://picsum.photos/seed/dining2/800/600',
            'https://picsum.photos/seed/dining3/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 4.9,
          reviewCount: 12,
        },
      }),
      db.service.create({
        data: {
          providerId: provider1.id,
          title: 'Michelin-Star Dinner on a Rooftop',
          description: 'A private rooftop dining experience overlooking the Manhattan skyline. Five-course dinner with wine pairing, live jazz quartet, and a dedicated sommelier. Available for up to 8 guests.',
          category: 'Fine Dining',
          price: 3200,
          duration: '3 hours',
          location: 'New York',
          images: JSON.stringify([
            'https://picsum.photos/seed/rooftop1/800/600',
            'https://picsum.photos/seed/rooftop2/800/600',
          ]),
          featured: false,
          status: 'approved',
          rating: 4.7,
          reviewCount: 8,
        },
      }),
      db.service.create({
        data: {
          providerId: provider5.id,
          title: 'Sushi Omakase by Master Chef — Tokyo',
          description: 'An intimate 18-piece omakase experience at a hidden sushi counter in Ginza, led by a third-generation master itamae. Features the finest Bluefin tuna, Hokkaido uni, and seasonal fish flown in from Tsukiji that morning. Limited to 6 guests per seating for an authentic, unhurried experience.',
          category: 'Fine Dining',
          price: 1200,
          duration: '2.5 hours',
          location: 'Tokyo',
          images: JSON.stringify([
            'https://picsum.photos/seed/luxury-chef1/800/600',
            'https://picsum.photos/seed/luxury-chef2/800/600',
            'https://picsum.photos/seed/luxury-chef3/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 5.0,
          reviewCount: 34,
        },
      }),
      db.service.create({
        data: {
          providerId: provider4.id,
          title: 'Truffle Hunting Dinner in Piedmont',
          description: 'A rare culinary adventure in the Langhe hills of Piedmont. Join a professional trifulau and his trained dogs on a dawn truffle hunt, followed by a lavish four-course truffle dinner at a Michelin-starred farmhouse restaurant paired with Barolo wines from a private cellar.',
          category: 'Fine Dining',
          price: 1800,
          duration: '8 hours',
          location: 'Piedmont',
          images: JSON.stringify([
            'https://picsum.photos/seed/truffle-hunt1/800/600',
            'https://picsum.photos/seed/truffle-hunt2/800/600',
          ]),
          featured: false,
          status: 'approved',
          rating: 4.8,
          reviewCount: 19,
        },
      }),

      // ══════════════════════════════════════════
      //  YACHT & CHARTER (4)
      // ══════════════════════════════════════════
      db.service.create({
        data: {
          providerId: provider2.id,
          title: 'Mediterranean Yacht Charter — 7 Days',
          description: 'A luxurious 7-day charter aboard a 160ft superyacht exploring the French Riviera, Monaco, and the Italian coast. Includes crew of 12, gourmet meals, jet skis, and helicopter transfers.',
          category: 'Yacht & Charter',
          price: 18500,
          duration: '7 days',
          location: 'Monaco',
          images: JSON.stringify([
            'https://picsum.photos/seed/yacht1/800/600',
            'https://picsum.photos/seed/yacht2/800/600',
            'https://picsum.photos/seed/yacht3/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 5.0,
          reviewCount: 6,
        },
      }),
      db.service.create({
        data: {
          providerId: provider2.id,
          title: 'Sunset Yacht Cruise with Champagne',
          description: 'An elegant 4-hour sunset cruise along the Côte d\'Azur. Aboard an 80ft sailing yacht with Dom Pérignon, canapés, and a private deck for up to 12 guests.',
          category: 'Yacht & Charter',
          price: 2800,
          duration: '4 hours',
          location: 'Monaco',
          images: JSON.stringify([
            'https://picsum.photos/seed/sunset-cruise1/800/600',
            'https://picsum.photos/seed/sunset-cruise2/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 4.8,
          reviewCount: 15,
        },
      }),
      db.service.create({
        data: {
          providerId: provider2.id,
          title: 'Greek Islands Hopping — 5 Days',
          description: 'An idyllic 5-day island-hopping adventure through the Cyclades aboard a luxury motor yacht. Explore hidden coves of Mykonos, the volcanic hot springs of Santorini, and the ancient ruins of Delos. Includes onboard chef, water sports equipment, and private beach dining.',
          category: 'Yacht & Charter',
          price: 14500,
          duration: '5 days',
          location: 'Athens',
          images: JSON.stringify([
            'https://picsum.photos/seed/yacht-greek1/800/600',
            'https://picsum.photos/seed/yacht-greek2/800/600',
            'https://picsum.photos/seed/yacht-greek3/800/600',
          ]),
          featured: false,
          status: 'approved',
          rating: 4.9,
          reviewCount: 11,
        },
      }),
      db.service.create({
        data: {
          providerId: provider14.id,
          title: 'Caribbean Private Island Day Trip',
          description: 'A full-day escape to a pristine private island in the Caribbean. Includes luxury catamaran transfer, gourmet beachside lunch prepared by a private chef, snorkeling in turquoise waters, and sunset cocktails. Exclusive access — no other visitors on the island.',
          category: 'Yacht & Charter',
          price: 3500,
          duration: '10 hours',
          location: 'Maldives',
          images: JSON.stringify([
            'https://picsum.photos/seed/caribbean-isle1/800/600',
            'https://picsum.photos/seed/caribbean-isle2/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 4.7,
          reviewCount: 8,
        },
      }),

      // ══════════════════════════════════════════
      //  PRIVATE AVIATION (4)
      // ══════════════════════════════════════════
      db.service.create({
        data: {
          providerId: provider8.id,
          title: 'Private Jet — LA to Paris Round Trip',
          description: 'Fly in unparalleled luxury aboard a Gulfstream G650. Full bar, lie-flat seats, private suite, Michelin-inspired catering, and dedicated cabin attendant. Round trip for up to 14 passengers.',
          category: 'Private Aviation',
          price: 25000,
          duration: '22 hours flight time',
          location: 'Los Angeles',
          images: JSON.stringify([
            'https://picsum.photos/seed/privatejet1/800/600',
            'https://picsum.photos/seed/privatejet2/800/600',
            'https://picsum.photos/seed/privatejet3/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 4.9,
          reviewCount: 4,
        },
      }),
      db.service.create({
        data: {
          providerId: provider8.id,
          title: 'Helicopter Grand Canyon Tour',
          description: 'A breathtaking helicopter tour over the Grand Canyon with champagne picnic landing. Includes hotel pickup in a luxury SUV, noise-canceling headsets with commentary, and aerial photography package.',
          category: 'Private Aviation',
          price: 1200,
          duration: '3 hours',
          location: 'Los Angeles',
          images: JSON.stringify([
            'https://picsum.photos/seed/heli-tour1/800/600',
            'https://picsum.photos/seed/heli-tour2/800/600',
          ]),
          featured: false,
          status: 'approved',
          rating: 4.6,
          reviewCount: 22,
        },
      }),
      db.service.create({
        data: {
          providerId: provider8.id,
          title: 'Eurocopter Ski Transfer to the Alps',
          description: 'A thrilling helicopter transfer from Geneva or Zurich directly to the slopes of Verbier, Zermatt, or St. Moritz. Breathtaking panoramic views of the Swiss Alps, champagne on arrival, and priority ski-lift passes included.',
          category: 'Private Aviation',
          price: 4800,
          duration: '45 minutes',
          location: 'Zurich',
          images: JSON.stringify([
            'https://picsum.photos/seed/heli-ski1/800/600',
            'https://picsum.photos/seed/heli-ski2/800/600',
            'https://picsum.photos/seed/heli-ski3/800/600',
          ]),
          featured: false,
          status: 'approved',
          rating: 4.8,
          reviewCount: 16,
        },
      }),
      db.service.create({
        data: {
          providerId: provider8.id,
          title: 'Seaplane to Maldives Resort',
          description: 'Arrive in style at your Maldives resort via private seaplane, soaring over the stunning atolls and turquoise lagoons. Includes personal inflight butler, champagne toast, and aerial photography of your overwater villa from above.',
          category: 'Private Aviation',
          price: 3200,
          duration: '1 hour',
          location: 'Malé',
          images: JSON.stringify([
            'https://picsum.photos/seed/seaplane1/800/600',
            'https://picsum.photos/seed/seaplane2/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 4.9,
          reviewCount: 13,
        },
      }),

      // ══════════════════════════════════════════
      //  LUXURY TRANSPORT (4)
      // ══════════════════════════════════════════
      db.service.create({
        data: {
          providerId: provider1.id,
          title: 'Rolls-Royce Phantom — Airport Transfer',
          description: 'Arrive in style with a Rolls-Royce Phantom airport transfer. Complimentary champagne, Wi-Fi, daily newspapers, and a professional chauffeur in white gloves. Available in New York, Miami, and Los Angeles.',
          category: 'Luxury Transport',
          price: 600,
          duration: '2 hours',
          location: 'New York',
          images: JSON.stringify([
            'https://picsum.photos/seed/rollsroyce1/800/600',
            'https://picsum.photos/seed/rollsroyce2/800/600',
          ]),
          featured: false,
          status: 'approved',
          rating: 4.7,
          reviewCount: 20,
        },
      }),
      db.service.create({
        data: {
          providerId: provider2.id,
          title: 'Vintage Bentley Wine Country Tour',
          description: 'A full-day tour of Napa Valley or Provence wine country in a beautifully restored 1961 Bentley S2. Private vineyard visits, barrel tastings, and a gourmet lunch at a Michelin-starred restaurant.',
          category: 'Luxury Transport',
          price: 1500,
          duration: '10 hours',
          location: 'Paris',
          images: JSON.stringify([
            'https://picsum.photos/seed/bentley1/800/600',
            'https://picsum.photos/seed/bentley2/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 4.9,
          reviewCount: 11,
        },
      }),
      db.service.create({
        data: {
          providerId: provider11.id,
          title: 'Mercedes S-Class Wedding Convoy',
          description: 'An elegant wedding day convoy featuring a lead Mercedes-Maybach S-Class flanked by two matching S-Class sedans. Professional chauffeurs, white ribbon décor, champagne chilled to perfection, and rose petal entrance coordination.',
          category: 'Luxury Transport',
          price: 2200,
          duration: '8 hours',
          location: 'London',
          images: JSON.stringify([
            'https://picsum.photos/seed/wedding-convoy1/800/600',
            'https://picsum.photos/seed/wedding-convoy2/800/600',
          ]),
          featured: false,
          status: 'approved',
          rating: 4.6,
          reviewCount: 9,
        },
      }),
      db.service.create({
        data: {
          providerId: provider11.id,
          title: 'Ferrari Road Trip — Amalfi Coast',
          description: 'A thrilling two-day Ferrari driving experience along the legendary Amalfi Coast. Choose from a Ferrari Roma, F8 Tributo, or SF90 Stradale. Includes luxury coastal hotel, scenic route planning, professional photo car, and roadside assistance.',
          category: 'Luxury Transport',
          price: 4500,
          duration: '2 days',
          location: 'Naples',
          images: JSON.stringify([
            'https://picsum.photos/seed/ferrari-amalfi1/800/600',
            'https://picsum.photos/seed/ferrari-amalfi2/800/600',
            'https://picsum.photos/seed/ferrari-amalfi3/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 5.0,
          reviewCount: 27,
        },
      }),

      // ══════════════════════════════════════════
      //  BEAUTY & WELLNESS (3)
      // ══════════════════════════════════════════
      db.service.create({
        data: {
          providerId: provider3.id,
          title: 'Royal Hammam & Spa Ritual',
          description: 'A 5-hour immersive wellness journey inspired by ancient Arabian bathing traditions. Includes gold-infused body scrub, rose petal hammam, hot stone massage, facial with caviar extract, and afternoon tea.',
          category: 'Beauty & Wellness',
          price: 750,
          duration: '5 hours',
          location: 'Dubai',
          images: JSON.stringify([
            'https://picsum.photos/seed/spa1/800/600',
            'https://picsum.photos/seed/spa2/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 4.8,
          reviewCount: 31,
        },
      }),
      db.service.create({
        data: {
          providerId: provider9.id,
          title: 'Diamond Facial at Vasquez Clinic — Zurich',
          description: 'The signature Vasquez Diamond Facial uses micro-infused diamond dust particles and stem-cell technology to visibly reduce fine lines and restore luminosity. Performed personally by Dr. Elena Vasquez at her exclusive Zurich clinic. Includes skin analysis, LED light therapy, and a take-home rejuvenation kit.',
          category: 'Beauty & Wellness',
          price: 2800,
          duration: '3 hours',
          location: 'Zurich',
          images: JSON.stringify([
            'https://picsum.photos/seed/diamond-facial1/800/600',
            'https://picsum.photos/seed/diamond-facial2/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 4.9,
          reviewCount: 18,
        },
      }),
      db.service.create({
        data: {
          providerId: provider3.id,
          title: 'Ayurvedic Retreat in Bali',
          description: 'A transformative 3-day Ayurvedic wellness retreat at a private villa in Ubud, Bali. Includes personalized dosha assessment, daily abhyanga massage, herbal steam baths, meditation sessions, organic Ayurvedic meals, and a sunset purification ceremony at Tirta Empul temple.',
          category: 'Beauty & Wellness',
          price: 4200,
          duration: '3 days',
          location: 'Bali',
          images: JSON.stringify([
            'https://picsum.photos/seed/ayurvedic1/800/600',
            'https://picsum.photos/seed/ayurvedic2/800/600',
            'https://picsum.photos/seed/ayurvedic3/800/600',
          ]),
          featured: false,
          status: 'approved',
          rating: 4.7,
          reviewCount: 14,
        },
      }),

      // ══════════════════════════════════════════
      //  ART & CULTURE (3)
      // ══════════════════════════════════════════
      db.service.create({
        data: {
          providerId: provider4.id,
          title: 'Private Louvre After-Hours Tour',
          description: 'Exclusive after-hours access to the Louvre with a renowned art historian. See the Mona Lisa, Venus de Milo, and Winged Victory without the crowds. Includes champagne reception in the Napoleon III Apartments.',
          category: 'Art & Culture',
          price: 1800,
          duration: '3 hours',
          location: 'Paris',
          images: JSON.stringify([
            'https://picsum.photos/seed/louvre1/800/600',
            'https://picsum.photos/seed/louvre2/800/600',
            'https://picsum.photos/seed/louvre3/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 5.0,
          reviewCount: 18,
        },
      }),
      db.service.create({
        data: {
          providerId: provider4.id,
          title: 'Contemporary Art Gallery Hop — Le Marais',
          description: 'A curated half-day tour of Paris\'s most exclusive contemporary galleries in Le Marais district. Meet gallerists, view private collections, and enjoy a champagne lunch at a hidden courtyard bistro.',
          category: 'Art & Culture',
          price: 650,
          duration: '4 hours',
          location: 'Paris',
          images: JSON.stringify([
            'https://picsum.photos/seed/gallery1/800/600',
            'https://picsum.photos/seed/gallery2/800/600',
          ]),
          featured: false,
          status: 'approved',
          rating: 4.5,
          reviewCount: 9,
        },
      }),
      db.service.create({
        data: {
          providerId: provider5.id,
          title: 'Vatican Private Tour — Sistine Chapel & Beyond',
          description: 'An exclusive private tour of the Vatican Museums, Sistine Chapel, and St. Peter\'s Basilica before public opening hours. Led by a Vatican-certified art historian with access to areas normally closed to the public, including the Bramante Staircase and the Niccoline Chapel.',
          category: 'Art & Culture',
          price: 2200,
          duration: '4 hours',
          location: 'Rome',
          images: JSON.stringify([
            'https://picsum.photos/seed/vatican1/800/600',
            'https://picsum.photos/seed/vatican2/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 4.9,
          reviewCount: 22,
        },
      }),
      db.service.create({
        data: {
          providerId: provider5.id,
          title: 'Tokyo Art District Exploration',
          description: 'A full-day immersion into Tokyo\'s vibrant art scene, from the cutting-edge galleries of Roppongi and Nakameguro to the traditional craft ateliers of Yanaka. Includes a private meeting with a contemporary Japanese artist, tea ceremony at a historic temple, and curated art shopping.',
          category: 'Art & Culture',
          price: 950,
          duration: '8 hours',
          location: 'Tokyo',
          images: JSON.stringify([
            'https://picsum.photos/seed/tokyo-art1/800/600',
            'https://picsum.photos/seed/tokyo-art2/800/600',
          ]),
          featured: false,
          status: 'approved',
          rating: 4.6,
          reviewCount: 7,
        },
      }),

      // ══════════════════════════════════════════
      //  PERSONAL SHOPPING (2)
      // ══════════════════════════════════════════
      db.service.create({
        data: {
          providerId: provider5.id,
          title: 'Tokyo Luxury Fashion Experience',
          description: 'A full-day personal shopping tour in Tokyo\'s most exclusive districts — Ginza, Aoyama, and Omotesando. VIP access to flagship stores of Hermès, Chanel, Dior, and Japanese avant-garde designers. Includes styling consultation and personal lookbook.',
          category: 'Personal Shopping',
          price: 900,
          duration: '8 hours',
          location: 'Tokyo',
          images: JSON.stringify([
            'https://picsum.photos/seed/tokyo-shop1/800/600',
            'https://picsum.photos/seed/tokyo-shop2/800/600',
          ]),
          featured: false,
          status: 'approved',
          rating: 4.7,
          reviewCount: 14,
        },
      }),
      db.service.create({
        data: {
          providerId: provider5.id,
          title: 'Milan Fashion Week VIP Access',
          description: 'An all-access pass to Milan Fashion Week with front-row seats to two top designer shows. Includes a personal stylist for the week, private appointments at flagship boutiques, after-party invitations, and a personal shopping assistant who speaks Italian, English, and Japanese.',
          category: 'Personal Shopping',
          price: 6500,
          duration: '5 days',
          location: 'Milan',
          images: JSON.stringify([
            'https://picsum.photos/seed/milan-fw1/800/600',
            'https://picsum.photos/seed/milan-fw2/800/600',
            'https://picsum.photos/seed/milan-fw3/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 4.8,
          reviewCount: 6,
        },
      }),

      // ══════════════════════════════════════════
      //  EVENTS & ENTERTAINMENT (3)
      // ══════════════════════════════════════════
      db.service.create({
        data: {
          providerId: provider6.id,
          title: 'Exclusive Masquerade Ball — 200 Guests',
          description: 'A fully produced Venetian-themed masquerade ball at a waterfront mansion. Includes live orchestra, award-winning caterers, custom mask design for each guest, fireworks display, and a dedicated event director.',
          category: 'Events & Entertainment',
          price: 15000,
          duration: '6 hours',
          location: 'Miami',
          images: JSON.stringify([
            'https://picsum.photos/seed/ball1/800/600',
            'https://picsum.photos/seed/ball2/800/600',
            'https://picsum.photos/seed/ball3/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 4.9,
          reviewCount: 3,
        },
      }),
      db.service.create({
        data: {
          providerId: provider6.id,
          title: 'Private Concert — Intimate Jazz Evening',
          description: 'An exclusive evening with a Grammy-nominated jazz quartet in a private garden setting. Gourmet canapés, premium bar, and artist meet-and-greet. Perfect for celebrations and corporate entertainment.',
          category: 'Events & Entertainment',
          price: 4500,
          duration: '3 hours',
          location: 'Miami',
          images: JSON.stringify([
            'https://picsum.photos/seed/jazz1/800/600',
            'https://picsum.photos/seed/jazz2/800/600',
          ]),
          featured: false,
          status: 'approved',
          rating: 4.8,
          reviewCount: 7,
        },
      }),
      db.service.create({
        data: {
          providerId: provider6.id,
          title: 'VIP Cannes Film Festival Access',
          description: 'An exclusive 4-day package at the Cannes Film Festival including red-carpet premiere access, VIP seating, invitation to the amfAR gala, private yacht after-parties, and personal celebrity stylist for all events.',
          category: 'Events & Entertainment',
          price: 18000,
          duration: '4 days',
          location: 'Cannes',
          images: JSON.stringify([
            'https://picsum.photos/seed/cannes1/800/600',
            'https://picsum.photos/seed/cannes2/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 4.7,
          reviewCount: 5,
        },
      }),
      db.service.create({
        data: {
          providerId: provider11.id,
          title: 'Formula 1 Paddock Club — Monaco Grand Prix',
          description: 'The ultimate Formula 1 experience with Paddock Club access at the Monaco Grand Prix. Includes champagne hospitality, pit lane walks, driver meet-and-greet, and a private yacht viewing of the race from Port Hercules.',
          category: 'Events & Entertainment',
          price: 12000,
          duration: '3 days',
          location: 'Monaco',
          images: JSON.stringify([
            'https://picsum.photos/seed/f1-paddock1/800/600',
            'https://picsum.photos/seed/f1-paddock2/800/600',
            'https://picsum.photos/seed/f1-paddock3/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 5.0,
          reviewCount: 10,
        },
      }),

      // ══════════════════════════════════════════
      //  REAL ESTATE (2)
      // ══════════════════════════════════════════
      db.service.create({
        data: {
          providerId: provider7.id,
          title: 'Manhattan Penthouse Private Viewing',
          description: 'Exclusive access to Manhattan\'s most coveted penthouses not listed on the open market. Includes helicopter tour of potential properties, private viewing with champagne, and investment analysis consultation.',
          category: 'Real Estate',
          price: 2000,
          duration: 'Full day',
          location: 'New York',
          images: JSON.stringify([
            'https://picsum.photos/seed/penthouse1/800/600',
            'https://picsum.photos/seed/penthouse2/800/600',
          ]),
          featured: false,
          status: 'approved',
          rating: 4.6,
          reviewCount: 5,
        },
      }),
      db.service.create({
        data: {
          providerId: provider7.id,
          title: 'Dubai Marina Penthouse Viewing',
          description: 'Private viewing of Dubai Marina\'s most exclusive off-market penthouses with panoramic views of the Palm Jumeirah and Burj Al Arab. Includes helicopter tour, VIP developer access, a dedicated legal consultant, and a luxury brunch at Nobu.',
          category: 'Real Estate',
          price: 1500,
          duration: 'Full day',
          location: 'Dubai',
          images: JSON.stringify([
            'https://picsum.photos/seed/dubai-penthouse1/800/600',
            'https://picsum.photos/seed/dubai-penthouse2/800/600',
          ]),
          featured: false,
          status: 'approved',
          rating: 4.4,
          reviewCount: 7,
        },
      }),

      // ══════════════════════════════════════════
      //  WINE & SPIRITS (NEW — 3)
      // ══════════════════════════════════════════
      db.service.create({
        data: {
          providerId: provider4.id,
          title: 'Private Wine Tasting in Tuscany',
          description: 'An exclusive full-day wine tasting experience through the Chianti Classico and Brunello di Montalcino regions. Visit three legendary family-owned estates for private barrel tastings, meet the winemakers, enjoy a farm-to-table lunch, and receive a curated case of your favorite selections shipped home.',
          category: 'Wine & Spirits',
          price: 1100,
          duration: '8 hours',
          location: 'Florence',
          images: JSON.stringify([
            'https://picsum.photos/seed/tuscany-wine1/800/600',
            'https://picsum.photos/seed/tuscany-wine2/800/600',
            'https://picsum.photos/seed/tuscany-wine3/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 4.9,
          reviewCount: 25,
        },
      }),
      db.service.create({
        data: {
          providerId: provider4.id,
          title: 'Whisky Tasting Tour — Scottish Highlands',
          description: 'A three-day immersive journey through Scotland\'s most storied whisky distilleries in the Highlands and Speyside regions. Private access to Macallan, Glenfiddich, and Dalmore estates, with cask-strength tastings not available to the public. Includes luxury castle accommodation and a private guide.',
          category: 'Wine & Spirits',
          price: 3800,
          duration: '3 days',
          location: 'Edinburgh',
          images: JSON.stringify([
            'https://picsum.photos/seed/whisky-scot1/800/600',
            'https://picsum.photos/seed/whisky-scot2/800/600',
          ]),
          featured: false,
          status: 'approved',
          rating: 4.8,
          reviewCount: 12,
        },
      }),
      db.service.create({
        data: {
          providerId: provider4.id,
          title: 'Champagne House Private Tour — Épernay',
          description: 'An exclusive behind-the-scenes tour of three prestigious Champagne houses — Moët & Chandon, Dom Pérignon, and Krug — in the heart of Épernay. Private cellar visits, a guided sabrage masterclass, a seven-course lunch paired with rare vintages, and a magnum of your preferred house to take home.',
          category: 'Wine & Spirits',
          price: 2400,
          duration: 'Full day',
          location: 'Paris',
          images: JSON.stringify([
            'https://picsum.photos/seed/champagne1/800/600',
            'https://picsum.photos/seed/champagne2/800/600',
            'https://picsum.photos/seed/champagne3/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 5.0,
          reviewCount: 19,
        },
      }),

      // ══════════════════════════════════════════
      //  ADVENTURE & SPORTS (NEW — 3)
      // ══════════════════════════════════════════
      db.service.create({
        data: {
          providerId: provider13.id,
          title: 'Heliskiing in the Swiss Alps — Verbier',
          description: 'The ultimate heliskiing experience in the legendary Verbier backcountry. A private helicopter drops you and your guide onto pristine, untouched powder at 3,800 meters. Includes safety briefing, avalanche equipment, après-ski champagne, and luxury chalet accommodation with private chef.',
          category: 'Adventure & Sports',
          price: 6500,
          duration: 'Full day',
          location: 'Verbier',
          images: JSON.stringify([
            'https://picsum.photos/seed/heliski-alps1/800/600',
            'https://picsum.photos/seed/heliski-alps2/800/600',
            'https://picsum.photos/seed/heliski-alps3/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 4.9,
          reviewCount: 15,
        },
      }),
      db.service.create({
        data: {
          providerId: provider12.id,
          title: 'African Luxury Safari — Masai Mara',
          description: 'A once-in-a-lifetime five-day luxury safari in the Masai Mara with Amara Okafor as your personal guide. Stay in a tented camp with butler service, track the Big Five with expert Maasai trackers, enjoy sundowners on the savannah, and dine under the stars with a bush chef.',
          category: 'Adventure & Sports',
          price: 12000,
          duration: '5 days',
          location: 'Nairobi',
          images: JSON.stringify([
            'https://picsum.photos/seed/safari-africa1/800/600',
            'https://picsum.photos/seed/safari-africa2/800/600',
            'https://picsum.photos/seed/safari-africa3/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 5.0,
          reviewCount: 28,
        },
      }),
      db.service.create({
        data: {
          providerId: provider14.id,
          title: 'Deep Sea Fishing in the Seychelles',
          description: 'An exhilarating deep-sea fishing expedition in the pristine waters of the Seychelles aboard a fully equipped 60ft sport fishing vessel. Target marlin, sailfish, tuna, and wahoo with an experienced crew. Includes all equipment, gourmet lunch on board, and your catch prepared at a beachside grill that evening.',
          category: 'Adventure & Sports',
          price: 2800,
          duration: 'Full day',
          location: 'Mahé',
          images: JSON.stringify([
            'https://picsum.photos/seed/deep-sea1/800/600',
            'https://picsum.photos/seed/deep-sea2/800/600',
          ]),
          featured: false,
          status: 'approved',
          rating: 4.6,
          reviewCount: 11,
        },
      }),

      // ══════════════════════════════════════════
      //  PETS & LIFESTYLE (NEW — 2)
      // ══════════════════════════════════════════
      db.service.create({
        data: {
          providerId: provider3.id,
          title: 'Luxury Pet Grooming at Home',
          description: 'A mobile five-star grooming service that comes to your home with a fully equipped luxury grooming van. Organic, hypoallergenic products, aromatherapy calming session, breed-specific styling, blueberry facial, and paw balm treatment. For dogs and cats of all breeds.',
          category: 'Pets & Lifestyle',
          price: 350,
          duration: '2 hours',
          location: 'Dubai',
          images: JSON.stringify([
            'https://picsum.photos/seed/pet-groom1/800/600',
            'https://picsum.photos/seed/pet-groom2/800/600',
          ]),
          featured: false,
          status: 'approved',
          rating: 4.5,
          reviewCount: 16,
        },
      }),
      db.service.create({
        data: {
          providerId: provider3.id,
          title: 'Personal Dog Trainer — 4-Week Program',
          description: 'An intensive four-week bespoke training program for your canine companion, conducted by a certified canine behaviorist. Covers obedience, socialization, advanced commands, and leash etiquette. Includes weekly progress reports, a training manual, and a final certification ceremony.',
          category: 'Pets & Lifestyle',
          price: 2800,
          duration: '4 weeks',
          location: 'Dubai',
          images: JSON.stringify([
            'https://picsum.photos/seed/dog-train1/800/600',
            'https://picsum.photos/seed/dog-train2/800/600',
          ]),
          featured: false,
          status: 'approved',
          rating: 4.3,
          reviewCount: 9,
        },
      }),

      // ── ADDITIONAL SERVICES (13 more to reach 52) ──

      // Extra Fine Dining
      db.service.create({
        data: {
          providerId: provider1.id,
          title: 'Wagyu & Sake Pairing Dinner',
          description: 'An exquisite seven-course dinner featuring A5 Japanese Wagyu prepared teppanyaki-style, paired with rare sakes from boutique breweries. Private chef service for up to 10 guests in your residence.',
          category: 'Fine Dining',
          price: 1800,
          duration: '4 hours',
          location: 'New York',
          images: JSON.stringify(['https://picsum.photos/seed/wagyu1/800/600', 'https://picsum.photos/seed/wagyu2/800/600']),
          featured: true,
          status: 'approved',
          rating: 4.8,
          reviewCount: 22,
        },
      }),
      db.service.create({
        data: {
          providerId: provider1.id,
          title: 'Underground Supper Club — Secret Location',
          description: 'An exclusive invite-only supper club in a hidden Manhattan location. Each month features a different culinary theme with a guest celebrity chef. Limited to 24 diners. Location revealed 24 hours before.',
          category: 'Fine Dining',
          price: 450,
          duration: '3 hours',
          location: 'New York',
          images: JSON.stringify(['https://picsum.photos/seed/supper1/800/600', 'https://picsum.photos/seed/supper2/800/600']),
          featured: true,
          status: 'approved',
          rating: 4.9,
          reviewCount: 38,
        },
      }),

      // Extra Yacht
      db.service.create({
        data: {
          providerId: provider2.id,
          title: 'Maldives Overwater Bungalow & Yacht Combo',
          description: 'A week-long luxury escape combining overwater villa living with day yacht excursions. Includes snorkeling with manta rays, private beach dinners, spa treatments, and a dedicated butler.',
          category: 'Yacht & Charter',
          price: 35000,
          duration: '7 days',
          location: 'Maldives',
          images: JSON.stringify(['https://picsum.photos/seed/maldives1/800/600', 'https://picsum.photos/seed/maldives2/800/600', 'https://picsum.photos/seed/maldives3/800/600']),
          featured: true,
          status: 'approved',
          rating: 5.0,
          reviewCount: 7,
        },
      }),

      // Extra Luxury Transport
      db.service.create({
        data: {
          providerId: provider12.id,
          title: 'Aston Martin DB12 — Amalfi Coast Road Trip',
          description: 'A thrilling full-day road trip along the Amalfi Coast in an Aston Martin DB12 Volante. Includes stops at Positano, Ravello, and a cliffside lunch at a Michelin-starred restaurant. Professional driving guide included.',
          category: 'Luxury Transport',
          price: 2200,
          duration: '10 hours',
          location: 'London',
          images: JSON.stringify(['https://picsum.photos/seed/aston1/800/600', 'https://picsum.photos/seed/aston2/800/600']),
          featured: true,
          status: 'approved',
          rating: 4.7,
          reviewCount: 14,
        },
      }),

      // Extra Beauty & Wellness
      db.service.create({
        data: {
          providerId: provider11.id,
          title: 'Anti-Aging Stem Cell Facial Treatment',
          description: 'A cutting-edge facial treatment utilizing plant-derived stem cells, medical-grade microneedling, and 24K gold serum. Performed by Dr. Vasquez in her Zurich clinic. Includes skin analysis and personalized aftercare plan.',
          category: 'Beauty & Wellness',
          price: 2500,
          duration: '2 hours',
          location: 'Zurich',
          images: JSON.stringify(['https://picsum.photos/seed/stemcell1/800/600', 'https://picsum.photos/seed/stemcell2/800/600']),
          featured: true,
          status: 'approved',
          rating: 4.6,
          reviewCount: 19,
        },
      }),

      // Extra Art & Culture
      db.service.create({
        data: {
          providerId: provider4.id,
          title: 'Private Vatican & Sistine Chapel Tour',
          description: 'Exclusive early-morning access to the Vatican Museums and Sistine Chapel before public hours. Led by an art historian with a PhD in Renaissance studies. Includes St. Peter\'s Basilica dome climb and Vatican Gardens walk.',
          category: 'Art & Culture',
          price: 1200,
          duration: '4 hours',
          location: 'Paris',
          images: JSON.stringify(['https://picsum.photos/seed/vatican1/800/600', 'https://picsum.photos/seed/vatican2/800/600', 'https://picsum.photos/seed/vatican3/800/600']),
          featured: false,
          status: 'approved',
          rating: 4.9,
          reviewCount: 27,
        },
      }),

      // Extra Wine & Spirits
      db.service.create({
        data: {
          providerId: provider4.id,
          title: 'Bordeaux Grand Cru Classé Wine Tour',
          description: 'An exclusive full-day tour of three Grand Cru Classé châteaux in the Médoc region. Private barrel tastings, vineyard walks with the winemaker, and a five-course lunch paired with vintages dating back to the 1990s.',
          category: 'Wine & Spirits',
          price: 950,
          duration: '8 hours',
          location: 'Paris',
          images: JSON.stringify(['https://picsum.photos/seed/bordeaux1/800/600', 'https://picsum.photos/seed/bordeaux2/800/600']),
          featured: true,
          status: 'approved',
          rating: 4.8,
          reviewCount: 16,
        },
      }),
      db.service.create({
        data: {
          providerId: provider4.id,
          title: 'Japanese Whisky & Sake Masterclass',
          description: 'An immersive evening of Japanese whisky and sake tasting led by a certified sommelier. Features rare Yamazaki 18, Hibiki 21, and premium daiginjo sakes. Includes chef-prepared Japanese tapas.',
          category: 'Wine & Spirits',
          price: 380,
          duration: '3 hours',
          location: 'Tokyo',
          images: JSON.stringify(['https://picsum.photos/seed/whisky1/800/600', 'https://picsum.photos/seed/whisky2/800/600']),
          featured: false,
          status: 'approved',
          rating: 4.7,
          reviewCount: 11,
        },
      }),

      // Extra Adventure & Sports
      db.service.create({
        data: {
          providerId: provider13.id,
          title: 'Kenyan Luxury Safari — 5 Days',
          description: 'A five-day luxury safari in Kenya\'s Masai Mara. Stay in a five-star tented camp with private guide, 4x4 game drives, hot air balloon ride over the migration, bush dinner under the stars, and Maasai village visit.',
          category: 'Adventure & Sports',
          price: 12000,
          duration: '5 days',
          location: 'Nairobi',
          images: JSON.stringify(['https://picsum.photos/seed/safari1/800/600', 'https://picsum.photos/seed/safari2/800/600', 'https://picsum.photos/seed/safari3/800/600']),
          featured: true,
          status: 'approved',
          rating: 4.9,
          reviewCount: 8,
        },
      }),
      db.service.create({
        data: {
          providerId: provider14.id,
          title: 'Northern Lights & Ice Hotel Experience',
          description: 'A magical three-day experience in Swedish Lapland. Includes overnight stay in the ICEHOTEL Jukkasjärvi, husky sled ride, aurora borealis viewing with an astrophysicist, and a Sami cultural dinner.',
          category: 'Adventure & Sports',
          price: 4500,
          duration: '3 days',
          location: 'Stockholm',
          images: JSON.stringify(['https://picsum.photos/seed/iceland1/800/600', 'https://picsum.photos/seed/northlights1/800/600']),
          featured: true,
          status: 'approved',
          rating: 4.8,
          reviewCount: 13,
        },
      }),

      // Extra Events
      db.service.create({
        data: {
          providerId: provider6.id,
          title: 'Cannes Film Festival — VIP All-Access Pass',
          description: 'Five-day all-access VIP pass to the Cannes Film Festival. Includes red carpet premiere access, exclusive after-parties, yacht-side events, meetings with filmmakers, and a personal festival concierge.',
          category: 'Events & Entertainment',
          price: 8000,
          duration: '5 days',
          location: 'Miami',
          images: JSON.stringify(['https://picsum.photos/seed/cannes1/800/600', 'https://picsum.photos/seed/cannes2/800/600']),
          featured: true,
          status: 'approved',
          rating: 4.9,
          reviewCount: 5,
        },
      }),

      // Extra Personal Shopping
      db.service.create({
        data: {
          providerId: provider5.id,
          title: 'Milan Fashion Week — Front Row Access',
          description: 'An exclusive Milan Fashion Week experience with front-row seats to three major shows. Includes personal styling, backstage access, private trunk shows, and a personal shopper for atelier visits.',
          category: 'Personal Shopping',
          price: 5500,
          duration: '4 days',
          location: 'Tokyo',
          images: JSON.stringify(['https://picsum.photos/seed/milan-fw1/800/600', 'https://picsum.photos/seed/milan-fw2/800/600']),
          featured: true,
          status: 'approved',
          rating: 4.8,
          reviewCount: 6,
        },
      }),

      // ══════════════════════════════════════════
      //  PRIVATE SECURITY (NEW — 2)
      // ══════════════════════════════════════════
      db.service.create({
        data: {
          providerId: provider15.id,
          title: 'VIP Close Protection Detail — 24 Hours',
          description: 'Round-the-clock VIP close protection by a team of two former special forces operatives. Includes advance route reconnaissance, counter-surveillance sweeps, armored vehicle transport, and real-time threat monitoring via a dedicated operations center. Discreet, professional, and fully licensed across 40 countries.',
          category: 'Private Security',
          price: 3500,
          duration: '24 hours',
          location: 'London',
          images: JSON.stringify([
            'https://picsum.photos/seed/security-vip1/800/600',
            'https://picsum.photos/seed/security-vip2/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 5.0,
          reviewCount: 14,
        },
      }),
      db.service.create({
        data: {
          providerId: provider15.id,
          title: 'Estate Security Audit & Implementation',
          description: 'A comprehensive security assessment of your residential estate or luxury property by a team of former military and intelligence professionals. Includes vulnerability analysis, CCTV system design, perimeter defense planning, cybersecurity assessment for smart home systems, and a full implementation plan with ongoing monitoring options.',
          category: 'Private Security',
          price: 8000,
          duration: '3 days',
          location: 'London',
          images: JSON.stringify([
            'https://picsum.photos/seed/estate-sec1/800/600',
            'https://picsum.photos/seed/estate-sec2/800/600',
          ]),
          featured: false,
          status: 'approved',
          rating: 4.9,
          reviewCount: 8,
        },
      }),

      // ══════════════════════════════════════════
      //  CONCIERGE MEDICINE (NEW — 2)
      // ══════════════════════════════════════════
      db.service.create({
        data: {
          providerId: provider16.id,
          title: 'Executive Health Screening — Full Day',
          description: 'An exhaustive full-day health assessment at a private medical suite on Fifth Avenue. Includes cardiac CT scan, full body MRI, advanced blood panel with biomarker analysis, cognitive screening, dermatological exam, and a one-hour consultation with Dr. Mitchell to review all findings and create a personalized longevity plan.',
          category: 'Concierge Medicine',
          price: 4500,
          duration: 'Full day',
          location: 'New York',
          images: JSON.stringify([
            'https://picsum.photos/seed/health-screen1/800/600',
            'https://picsum.photos/seed/health-screen2/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 4.9,
          reviewCount: 21,
        },
      }),
      db.service.create({
        data: {
          providerId: provider16.id,
          title: 'Medical Wellness Retreat — 5 Days',
          description: 'A transformative five-day medical wellness retreat at a private estate in the Hudson Valley. Combines cutting-edge diagnostics with luxury wellness experiences: daily physician consultations, personalized IV nutrient therapy, hyperbaric oxygen sessions, cryotherapy, functional movement assessments, gourmet anti-inflammatory cuisine, and mindfulness coaching.',
          category: 'Concierge Medicine',
          price: 15000,
          duration: '5 days',
          location: 'New York',
          images: JSON.stringify([
            'https://picsum.photos/seed/med-retreat1/800/600',
            'https://picsum.photos/seed/med-retreat2/800/600',
            'https://picsum.photos/seed/med-retreat3/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 5.0,
          reviewCount: 9,
        },
      }),

      // ══════════════════════════════════════════
      //  PHOTOGRAPHY & FILM (NEW — 2)
      // ══════════════════════════════════════════
      db.service.create({
        data: {
          providerId: provider17.id,
          title: 'Luxury Brand Campaign Shoot',
          description: 'A full-day luxury brand photography shoot with Lucian Fontaine at a handpicked Parisian location — from a Haussmannian penthouse to a hidden garden in Versailles. Includes pre-shoot creative consultation, professional styling, hair and makeup, 50+ retouched high-resolution images, and a custom-designed lookbook. Ideal for personal branding, fashion labels, or luxury product launches.',
          category: 'Photography & Film',
          price: 6000,
          duration: 'Full day',
          location: 'Paris',
          images: JSON.stringify([
            'https://picsum.photos/seed/photo-shoot1/800/600',
            'https://picsum.photos/seed/photo-shoot2/800/600',
            'https://picsum.photos/seed/photo-shoot3/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 5.0,
          reviewCount: 17,
        },
      }),
      db.service.create({
        data: {
          providerId: provider17.id,
          title: 'Drone Cinematography — Destination Film',
          description: 'A cinematic aerial film of your luxury property, yacht, or destination wedding captured by a certified drone cinematographer using Hollywood-grade equipment. Includes 4K/8K footage, professional color grading, licensed soundtrack, and a 3-5 minute final film. Perfect for real estate listings, event documentation, or personal keepsakes.',
          category: 'Photography & Film',
          price: 8500,
          duration: '2 days',
          location: 'Paris',
          images: JSON.stringify([
            'https://picsum.photos/seed/drone-cine1/800/600',
            'https://picsum.photos/seed/drone-cine2/800/600',
          ]),
          featured: false,
          status: 'approved',
          rating: 4.8,
          reviewCount: 11,
        },
      }),

      // ══════════════════════════════════════════
      //  LUXURY FITNESS (NEW — 2)
      // ══════════════════════════════════════════
      db.service.create({
        data: {
          providerId: provider18.id,
          title: '12-Week Celebrity Transformation Program',
          description: 'A bespoke 12-week fitness transformation program designed by Marcus Thornton, the trainer behind Hollywood\'s most iconic physiques. Includes initial biomechanical assessment, personalized nutrition plan by a celebrity dietitian, 4 weekly private training sessions, weekly progress tracking, recovery protocols, and a final photoshoot. Training takes place at Marcus\'s private Beverly Hills gym.',
          category: 'Luxury Fitness',
          price: 8000,
          duration: '12 weeks',
          location: 'Los Angeles',
          images: JSON.stringify([
            'https://picsum.photos/seed/celeb-fit1/800/600',
            'https://picsum.photos/seed/celeb-fit2/800/600',
            'https://picsum.photos/seed/celeb-fit3/800/600',
          ]),
          featured: true,
          status: 'approved',
          rating: 5.0,
          reviewCount: 32,
        },
      }),
      db.service.create({
        data: {
          providerId: provider18.id,
          title: 'Private Boxing Masterclass with Pro Sparring',
          description: 'An intensive two-hour private boxing session with Marcus Thornton, former Olympic-level boxer. Includes warm-up with a certified strength coach, technical drills, pad work, and three rounds of controlled sparring with a professional boxer. Ringside recovery with cold-pressed juices and sports massage. All equipment provided.',
          category: 'Luxury Fitness',
          price: 1200,
          duration: '2 hours',
          location: 'Los Angeles',
          images: JSON.stringify([
            'https://picsum.photos/seed/boxing-master1/800/600',
            'https://picsum.photos/seed/boxing-master2/800/600',
          ]),
          featured: false,
          status: 'approved',
          rating: 4.7,
          reviewCount: 18,
        },
      }),

      // ── ADDITIONAL SERVICES FOR EXISTING CATEGORIES ──

      // Extra Fine Dining
      db.service.create({
        data: {
          providerId: provider1.id,
          title: 'Chef\'s Table at Le Jardin Secret — Marrakech',
          description: 'An exclusive private dining experience at a hidden riad in the heart of Marrakech\'s medina. A seven-course Moroccan-French fusion menu by Chef Marco, accompanied by live Gnawa musicians and a sommelier presenting organic Moroccan wines.',
          category: 'Fine Dining',
          price: 950,
          duration: '4 hours',
          location: 'Marrakech',
          images: JSON.stringify(['https://picsum.photos/seed/marrakech-dining1/800/600', 'https://picsum.photos/seed/marrakech-dining2/800/600']),
          featured: true,
          status: 'approved',
          rating: 4.9,
          reviewCount: 16,
        },
      }),
      db.service.create({
        data: {
          providerId: provider1.id,
          title: 'Caviar & Champagne Breakfast — The Ritz',
          description: 'A decadent morning feast of Beluga caviar, gold-leaf pastries, and vintage Dom Pérignon served in your suite at The Ritz or your private residence. Chef Marco personally prepares each course tableside.',
          category: 'Fine Dining',
          price: 1200,
          duration: '2 hours',
          location: 'New York',
          images: JSON.stringify(['https://picsum.photos/seed/caviar-breakfast1/800/600', 'https://picsum.photos/seed/caviar-breakfast2/800/600']),
          featured: false,
          status: 'approved',
          rating: 4.7,
          reviewCount: 11,
        },
      }),

      // Extra Yacht & Charter
      db.service.create({
        data: {
          providerId: provider2.id,
          title: 'Northern Lights Yacht Expedition — Norway',
          description: 'A once-in-a-lifetime 10-day expedition through the Norwegian fjords aboard a luxury expedition yacht, chasing the Aurora Borealis. Includes Zodiac excursions, visits to remote Viking settlements, onboard naturalist, Michelin-starred chef, and a glass-roofed observation lounge.',
          category: 'Yacht & Charter',
          price: 42000,
          duration: '10 days',
          location: 'Oslo',
          images: JSON.stringify(['https://picsum.photos/seed/norway-yacht1/800/600', 'https://picsum.photos/seed/norway-yacht2/800/600', 'https://picsum.photos/seed/norway-yacht3/800/600']),
          featured: true,
          status: 'approved',
          rating: 5.0,
          reviewCount: 4,
        },
      }),

      // Extra Private Aviation
      db.service.create({
        data: {
          providerId: provider8.id,
          title: 'Private Jet Wine Tour — Bordeaux, Tuscany & Napa',
          description: 'An epic 10-day private jet wine tour visiting three of the world\'s greatest wine regions. Fly between Bordeaux, Tuscany, and Napa Valley aboard a Citation Longitude. Includes private vineyard tours, barrel tastings, helicopter transfers between estates, and accommodation at landmark wine country hotels.',
          category: 'Private Aviation',
          price: 85000,
          duration: '10 days',
          location: 'Los Angeles',
          images: JSON.stringify(['https://picsum.photos/seed/jet-wine1/800/600', 'https://picsum.photos/seed/jet-wine2/800/600']),
          featured: true,
          status: 'approved',
          rating: 5.0,
          reviewCount: 3,
        },
      }),

      // Extra Luxury Transport
      db.service.create({
        data: {
          providerId: provider11.id,
          title: 'Vintage Rolls-Royce Silver Cloud — London Tour',
          description: 'A chauffeured half-day tour of London\'s most iconic landmarks in a meticulously restored 1962 Rolls-Royce Silver Cloud II. Includes Harrods, Buckingham Palace, The Ritz, and a champagne stop at a private members\' club in Mayfair.',
          category: 'Luxury Transport',
          price: 850,
          duration: '4 hours',
          location: 'London',
          images: JSON.stringify(['https://picsum.photos/seed/rr-cloud1/800/600', 'https://picsum.photos/seed/rr-cloud2/800/600']),
          featured: false,
          status: 'approved',
          rating: 4.8,
          reviewCount: 12,
        },
      }),

      // Extra Beauty & Wellness
      db.service.create({
        data: {
          providerId: provider3.id,
          title: 'Cryotherapy & IV Wellness Suite — Dubai',
          description: 'A state-of-the-art wellness session combining whole-body cryotherapy, NAD+ IV drip therapy, and an infrared sauna session at a private medical wellness suite in DIFC. Includes pre- and post-treatment consultations, lab-quality biomarker analysis, and a tailored supplement protocol.',
          category: 'Beauty & Wellness',
          price: 1800,
          duration: '3 hours',
          location: 'Dubai',
          images: JSON.stringify(['https://picsum.photos/seed/cryo-dubai1/800/600', 'https://picsum.photos/seed/cryo-dubai2/800/600']),
          featured: true,
          status: 'approved',
          rating: 4.8,
          reviewCount: 15,
        },
      }),

      // Extra Art & Culture
      db.service.create({
        data: {
          providerId: provider4.id,
          title: 'Private Access — Uffizi Gallery & Vasari Corridor',
          description: 'Exclusive private access to the Uffizi Gallery and the legendary Vasari Corridor — a one-kilometer elevated passageway lined with self-portraits by master artists, normally closed to the public. Led by a Florentine art historian with a PhD in Renaissance studies. Includes aperitivo at a rooftop terrace overlooking the Ponte Vecchio.',
          category: 'Art & Culture',
          price: 1600,
          duration: '4 hours',
          location: 'Florence',
          images: JSON.stringify(['https://picsum.photos/seed/uffizi1/800/600', 'https://picsum.photos/seed/uffizi2/800/600', 'https://picsum.photos/seed/uffizi3/800/600']),
          featured: true,
          status: 'approved',
          rating: 5.0,
          reviewCount: 20,
        },
      }),

      // Extra Real Estate
      db.service.create({
        data: {
          providerId: provider7.id,
          title: 'London Belgravia Townhouse Private Tour',
          description: 'An exclusive tour of five of London\'s finest Belgravia and Knightsbridge townhouses not available on the open market. Includes champagne viewing, investment potential analysis, interior design consultation, and introduction to a top property solicitor for seamless acquisition.',
          category: 'Real Estate',
          price: 2500,
          duration: 'Full day',
          location: 'London',
          images: JSON.stringify(['https://picsum.photos/seed/belgravia1/800/600', 'https://picsum.photos/seed/belgravia2/800/600']),
          featured: false,
          status: 'approved',
          rating: 4.7,
          reviewCount: 6,
        },
      }),

      // Extra Personal Shopping
      db.service.create({
        data: {
          providerId: provider5.id,
          title: 'Private Haute Joaillerie Shopping — Place Vendôme',
          description: 'A VIP jewelry shopping experience at the most prestigious maisons on Place Vendôme — Cartier, Boucheron, Van Cleef & Arpels, and Chaumet. Private after-hours access, try-on sessions with master jewelers, champagne, and a bespoke piece designed to your specifications.',
          category: 'Personal Shopping',
          price: 2000,
          duration: '4 hours',
          location: 'Paris',
          images: JSON.stringify(['https://picsum.photos/seed/jewelry-shop1/800/600', 'https://picsum.photos/seed/jewelry-shop2/800/600']),
          featured: true,
          status: 'approved',
          rating: 5.0,
          reviewCount: 8,
        },
      }),

      // Extra Events & Entertainment
      db.service.create({
        data: {
          providerId: provider6.id,
          title: 'Super Bowl LVIP Suite — All-Inclusive',
          description: 'The ultimate Super Bowl experience with a 20-person luxury suite at the 50-yard line. Includes premium open bar, five-course gourmet catering, celebrity meet-and-greet, pre-game on-field access, and dedicated concierge throughout the weekend. Hotel and private jet packages available.',
          category: 'Events & Entertainment',
          price: 75000,
          duration: '3 days',
          location: 'Miami',
          images: JSON.stringify(['https://picsum.photos/seed/superbowl1/800/600', 'https://picsum.photos/seed/superbowl2/800/600', 'https://picsum.photos/seed/superbowl3/800/600']),
          featured: true,
          status: 'approved',
          rating: 5.0,
          reviewCount: 2,
        },
      }),

      // Extra Wine & Spirits
      db.service.create({
        data: {
          providerId: provider4.id,
          title: 'Sake Masterclass with a Toji — Kyoto',
          description: 'An exclusive two-day immersion into the world of premium Japanese sake with a master brewer (toji) at a 300-year-old brewery in Fushimi, Kyoto. Includes hands-on rice polishing, fermentation participation, guided tasting of 20+ rare sakes, kaiseki lunch pairing, and a private tea ceremony.',
          category: 'Wine & Spirits',
          price: 1500,
          duration: '2 days',
          location: 'Tokyo',
          images: JSON.stringify(['https://picsum.photos/seed/sake-kyoto1/800/600', 'https://picsum.photos/seed/sake-kyoto2/800/600']),
          featured: true,
          status: 'approved',
          rating: 4.9,
          reviewCount: 7,
        },
      }),

      // Extra Adventure & Sports
      db.service.create({
        data: {
          providerId: provider13.id,
          title: 'Arctic Expedition — Svalbard Wildlife',
          description: 'A 7-day Arctic expedition to Svalbard aboard a luxury expedition vessel. Witness polar bears, walruses, and Arctic foxes in their natural habitat. Includes Zodiac excursions, expert naturalist guides, lectures from a National Geographic photographer, and gourmet Arctic cuisine prepared by an onboard chef.',
          category: 'Adventure & Sports',
          price: 18000,
          duration: '7 days',
          location: 'Stockholm',
          images: JSON.stringify(['https://picsum.photos/seed/arctic-exp1/800/600', 'https://picsum.photos/seed/arctic-exp2/800/600', 'https://picsum.photos/seed/arctic-exp3/800/600']),
          featured: true,
          status: 'approved',
          rating: 4.9,
          reviewCount: 6,
        },
      }),

      // Extra Pets & Lifestyle
      db.service.create({
        data: {
          providerId: provider3.id,
          title: 'Bespoke Pet Couture & Accessory Design',
          description: 'A luxury pet styling session where a renowned pet fashion designer creates bespoke outfits and accessories for your beloved companion. Includes Italian leather collar with engraved gold nameplate, cashmere winter coat, monogrammed travel carrier, and a professional pet photoshoot.',
          category: 'Pets & Lifestyle',
          price: 2200,
          duration: 'Full day',
          location: 'Dubai',
          images: JSON.stringify(['https://picsum.photos/seed/pet-couture1/800/600', 'https://picsum.photos/seed/pet-couture2/800/600']),
          featured: false,
          status: 'approved',
          rating: 4.6,
          reviewCount: 5,
        },
      }),

      // ══════════════════════════════════════════
      //  ADDITIONAL SERVICES — ENSURE EVERY CATEGORY HAS 5+
      // ══════════════════════════════════════════

      // ── More Private Security ──
      db.service.create({
        data: {
          providerId: provider15.id,
          title: 'Secure Travel Package —高危 Destination',
          description: 'Comprehensive secure travel package for business trips to high-risk regions. Includes threat intelligence briefing, secure transportation, armored vehicles, encrypted communications, safe house access, and 24/7 operations center support. Former MI6 and CIA operatives on the team.',
          category: 'Private Security',
          price: 12000,
          duration: '5 days',
          location: 'London',
          images: JSON.stringify(['https://picsum.photos/seed/secure-travel1/800/600', 'https://picsum.photos/seed/secure-travel2/800/600']),
          featured: true,
          status: 'approved',
          rating: 4.9,
          reviewCount: 10,
        },
      }),
      db.service.create({
        data: {
          providerId: provider15.id,
          title: 'Cybersecurity Audit for UHNW Clients',
          description: 'A thorough cybersecurity audit of your digital life by former GCHQ specialists. Includes personal device hardening, social media exposure analysis, secure communication setup, dark web monitoring for identity theft, and a personalized digital security protocol with quarterly reviews.',
          category: 'Private Security',
          price: 5500,
          duration: '2 days',
          location: 'London',
          images: JSON.stringify(['https://picsum.photos/seed/cybersec1/800/600', 'https://picsum.photos/seed/cybersec2/800/600']),
          featured: false,
          status: 'approved',
          rating: 4.8,
          reviewCount: 7,
        },
      }),
      db.service.create({
        data: {
          providerId: provider15.id,
          title: 'Private Event Security — Gala & Wedding',
          description: 'End-to-end security management for private events with 50-500+ guests. Includes guest screening, perimeter security, CCTV deployment, plainclothes operatives, emergency evacuation planning, and close protection for the principal. Used by royal families and Fortune 500 CEOs.',
          category: 'Private Security',
          price: 6000,
          duration: 'Event day + 2 days prep',
          location: 'London',
          images: JSON.stringify(['https://picsum.photos/seed/event-sec1/800/600', 'https://picsum.photos/seed/event-sec2/800/600']),
          featured: false,
          status: 'approved',
          rating: 4.7,
          reviewCount: 12,
        },
      }),

      // ── More Concierge Medicine ──
      db.service.create({
        data: {
          providerId: provider16.id,
          title: 'Global Medical Second Opinion Service',
          description: 'Access to the world\'s top specialists from Mayo Clinic, Johns Hopkins, and Harley Street without leaving your home. Dr. Mitchell coordinates your case, collects all medical records, and arranges video consultations with up to three leading experts. Includes a comprehensive written report with treatment recommendations.',
          category: 'Concierge Medicine',
          price: 3000,
          duration: '2 weeks process',
          location: 'New York',
          images: JSON.stringify(['https://picsum.photos/seed/second-opinion1/800/600', 'https://picsum.photos/seed/second-opinion2/800/600']),
          featured: true,
          status: 'approved',
          rating: 4.8,
          reviewCount: 15,
        },
      }),
      db.service.create({
        data: {
          providerId: provider16.id,
          title: 'In-Home IV Vitamin & NAD+ Therapy',
          description: 'A luxurious in-home intravenous therapy session administered by a board-certified physician. Choose from NAD+ for anti-aging and energy, Vitamin C mega-dose for immune support, or our signature "Executive Recharge" blend with glutathione, B-complex, and magnesium. Includes health screening before treatment.',
          category: 'Concierge Medicine',
          price: 1200,
          duration: '90 minutes',
          location: 'New York',
          images: JSON.stringify(['https://picsum.photos/seed/iv-therapy1/800/600', 'https://picsum.photos/seed/iv-therapy2/800/600']),
          featured: false,
          status: 'approved',
          rating: 4.6,
          reviewCount: 22,
        },
      }),
      db.service.create({
        data: {
          providerId: provider16.id,
          title: 'Concierge Pediatric Care Program',
          description: 'Annual concierge pediatric care for your children by a world-class pediatrician. Includes same-day/next-day appointments, 24/7 phone access, annual comprehensive wellness exams, developmental screenings, vaccination management, and priority referrals to top pediatric specialists. Unlimited telemedicine visits included.',
          category: 'Concierge Medicine',
          price: 6000,
          duration: 'Annual membership',
          location: 'New York',
          images: JSON.stringify(['https://picsum.photos/seed/pediatric1/800/600', 'https://picsum.photos/seed/pediatric2/800/600']),
          featured: false,
          status: 'approved',
          rating: 4.9,
          reviewCount: 8,
        },
      }),

      // ── More Photography & Film ──
      db.service.create({
        data: {
          providerId: provider17.id,
          title: 'Destination Wedding Photography — Full Package',
          description: 'A complete destination wedding photography package by Lucian Fontaine. Includes 3-day coverage (rehearsal dinner through brunch), engagement pre-shoot, two photographers, 500+ edited images, a luxury linen photo album, and a 5-minute highlight film. Travel to any global destination included.',
          category: 'Photography & Film',
          price: 15000,
          duration: '3 days + editing',
          location: 'Paris',
          images: JSON.stringify(['https://picsum.photos/seed/wedding-photo1/800/600', 'https://picsum.photos/seed/wedding-photo2/800/600', 'https://picsum.photos/seed/wedding-photo3/800/600']),
          featured: true,
          status: 'approved',
          rating: 5.0,
          reviewCount: 25,
        },
      }),
      db.service.create({
        data: {
          providerId: provider17.id,
          title: 'Fine Art Family Portrait Session',
          description: 'A museum-quality family portrait experience at a location of your choice — your estate, a historic château, or a gallery setting. Lucian Fontaine directs every detail: wardrobe consultation, professional hair and makeup, artistic staging, and post-production. The final portrait is printed on archival canvas, sized up to 40x60 inches.',
          category: 'Photography & Film',
          price: 4500,
          duration: 'Half day',
          location: 'Paris',
          images: JSON.stringify(['https://picsum.photos/seed/family-portrait1/800/600', 'https://picsum.photos/seed/family-portrait2/800/600']),
          featured: false,
          status: 'approved',
          rating: 4.9,
          reviewCount: 14,
        },
      }),
      db.service.create({
        data: {
          providerId: provider17.id,
          title: 'Luxury Real Estate Photography & Virtual Tour',
          description: 'Premium real estate photography and 3D virtual tour creation for luxury properties valued at $5M+. Includes twilight exterior shots, interior architectural photography, aerial drone coverage, and an interactive Matterport-style virtual tour with floor plans. Used by Sotheby\'s and Christie\'s Real Estate.',
          category: 'Photography & Film',
          price: 3500,
          duration: 'Full day',
          location: 'Paris',
          images: JSON.stringify(['https://picsum.photos/seed/realestate-photo1/800/600', 'https://picsum.photos/seed/realestate-photo2/800/600']),
          featured: false,
          status: 'approved',
          rating: 4.7,
          reviewCount: 19,
        },
      }),

      // ── More Luxury Fitness ──
      db.service.create({
        data: {
          providerId: provider18.id,
          title: 'Ultimate Wellness Retreat — Amalfi Coast',
          description: 'A 7-day luxury fitness and wellness retreat on the Amalfi Coast. Daily sunrise yoga, beachside HIIT sessions, Mediterranean diet meal plan, hiking the Path of the Gods, recovery spa days, and mindfulness workshops. Stay at a cliffside villa with infinity pool overlooking the Mediterranean.',
          category: 'Luxury Fitness',
          price: 12000,
          duration: '7 days',
          location: 'Los Angeles',
          images: JSON.stringify(['https://picsum.photos/seed/amalfi-retreat1/800/600', 'https://picsum.photos/seed/amalfi-retreat2/800/600', 'https://picsum.photos/seed/amalfi-retreat3/800/600']),
          featured: true,
          status: 'approved',
          rating: 5.0,
          reviewCount: 16,
        },
      }),
      db.service.create({
        data: {
          providerId: provider18.id,
          title: 'In-Home Private Gym Design & Equipment',
          description: 'Marcus Thornton designs and builds your dream home gym. Includes space assessment, custom equipment selection (Technogym, Peloton, Rogue), interior design consultation, installation, and three personal training sessions to learn your new setup. Budgets from $50K to $500K+.',
          category: 'Luxury Fitness',
          price: 2500,
          duration: 'Consultation + installation',
          location: 'Los Angeles',
          images: JSON.stringify(['https://picsum.photos/seed/home-gym1/800/600', 'https://picsum.photos/seed/home-gym2/800/600']),
          featured: false,
          status: 'approved',
          rating: 4.8,
          reviewCount: 9,
        },
      }),
      db.service.create({
        data: {
          providerId: provider18.id,
          title: 'Couples Fitness & Nutrition Program',
          description: 'A 6-week couples fitness program designed to get you and your partner in the best shape of your lives together. Includes joint personal training sessions, couples yoga, personalized meal plans, weekly check-ins, body composition analysis, and a celebratory final fitness photoshoot.',
          category: 'Luxury Fitness',
          price: 4500,
          duration: '6 weeks',
          location: 'Los Angeles',
          images: JSON.stringify(['https://picsum.photos/seed/couples-fit1/800/600', 'https://picsum.photos/seed/couples-fit2/800/600']),
          featured: false,
          status: 'approved',
          rating: 4.7,
          reviewCount: 11,
        },
      }),

      // ── More Real Estate ──
      db.service.create({
        data: {
          providerId: provider7.id,
          title: 'Manhattan Penthouse Tour — VIP Access',
          description: 'Exclusive VIP access to Manhattan\'s most prestigious off-market penthouses. Isabella Rossi leverages her 15-year network to arrange private viewings of properties not listed on any public platform. Includes champagne viewing, building financial analysis, and co-op board application assistance.',
          category: 'Real Estate',
          price: 1500,
          duration: 'Half day',
          location: 'New York',
          images: JSON.stringify(['https://picsum.photos/seed/penthouse-tour1/800/600', 'https://picsum.photos/seed/penthouse-tour2/800/600']),
          featured: true,
          status: 'approved',
          rating: 4.9,
          reviewCount: 13,
        },
      }),
      db.service.create({
        data: {
          providerId: provider7.id,
          title: 'Miami Waterfront Property Search',
          description: 'A curated waterfront property search across Miami Beach, Star Island, and Indian Creek. Includes private yacht tours of waterfront properties, neighborhood analysis, investment potential assessment, and introduction to top Miami real estate attorneys and inspectors.',
          category: 'Real Estate',
          price: 2000,
          duration: 'Full day',
          location: 'New York',
          images: JSON.stringify(['https://picsum.photos/seed/miami-realestate1/800/600', 'https://picsum.photos/seed/miami-realestate2/800/600']),
          featured: false,
          status: 'approved',
          rating: 4.7,
          reviewCount: 8,
        },
      }),

      // ── More Pets & Lifestyle ──
      db.service.create({
        data: {
          providerId: provider13.id,
          title: 'Luxury Pet Villa Stay — Scandinavian Design',
          description: 'A premium pet boarding experience in a Scandinavian-designed villa set on 5 acres of countryside. Each pet suite features underfloor heating, a private garden run, webcam access, organic gourmet meals, daily nature walks, and a spa bath. Cats and dogs welcome. Capacity: 12 pets maximum.',
          category: 'Pets & Lifestyle',
          price: 350,
          duration: 'Per day',
          location: 'Stockholm',
          images: JSON.stringify(['https://picsum.photos/seed/pet-villa1/800/600', 'https://picsum.photos/seed/pet-villa2/800/600']),
          featured: true,
          status: 'approved',
          rating: 4.8,
          reviewCount: 20,
        },
      }),
      db.service.create({
        data: {
          providerId: provider13.id,
          title: 'Exotic Pet Concierge Service',
          description: 'Full concierge service for exotic pet owners. Includes veterinary specialist referrals, custom habitat design consultation, dietary planning for rare species, international travel documentation and permits, and emergency veterinary transport. Serving owners of birds, reptiles, and rare mammals.',
          category: 'Pets & Lifestyle',
          price: 800,
          duration: 'Monthly retainer',
          location: 'Stockholm',
          images: JSON.stringify(['https://picsum.photos/seed/exotic-pet1/800/600', 'https://picsum.photos/seed/exotic-pet2/800/600']),
          featured: false,
          status: 'approved',
          rating: 4.5,
          reviewCount: 6,
        },
      }),
      db.service.create({
        data: {
          providerId: provider13.id,
          title: 'Pet Photography & Personalized Art',
          description: 'A professional pet photography session at your home or favorite park, followed by the creation of a custom oil painting of your pet from the best photograph. Includes a 2-hour photo session, 30 edited digital images, and a 16x20 hand-painted oil portrait on canvas delivered in 4 weeks.',
          category: 'Pets & Lifestyle',
          price: 1200,
          duration: 'Session + 4 weeks delivery',
          location: 'Stockholm',
          images: JSON.stringify(['https://picsum.photos/seed/pet-art1/800/600', 'https://picsum.photos/seed/pet-art2/800/600']),
          featured: false,
          status: 'approved',
          rating: 4.9,
          reviewCount: 15,
        },
      }),

      // ── More Personal Shopping ──
      db.service.create({
        data: {
          providerId: provider5.id,
          title: 'Paris Haute Couture Private Appointments',
          description: 'Exclusive private appointments at the most prestigious Haute Couture houses in Paris — Chanel, Dior, Givenchy, and Schiaparelli. Kazuki arranges after-hours access, pre-collection viewing, and personalized fittings. Includes interpreter, champagne, and a personal shopping assistant.',
          category: 'Personal Shopping',
          price: 3000,
          duration: 'Full day',
          location: 'Tokyo',
          images: JSON.stringify(['https://picsum.photos/seed/haute-couture1/800/600', 'https://picsum.photos/seed/haute-couture2/800/600']),
          featured: true,
          status: 'approved',
          rating: 4.8,
          reviewCount: 9,
        },
      }),
    ])

    // Helper: completed bookings (past dates)
    const completedBookingsData = [
      // Booking 1 - completed
      {
        clientId: client1.id, serviceId: services[0].id, providerId: provider1.id,
        date: '2025-01-15', time: '19:00', guests: 2,
        specialReq: 'One guest has a shellfish allergy. Please prepare an alternative amuse-bouche.',
        totalPrice: 1700, status: 'completed',
      },
      // Booking 2 - completed
      {
        clientId: client1.id, serviceId: services[4].id, providerId: provider2.id,
        date: '2025-02-20', time: '10:00', guests: 6,
        specialReq: 'Anniversary celebration — please arrange flowers and a surprise dessert.',
        totalPrice: 18500, status: 'completed',
      },
      // Booking 3 - completed
      {
        clientId: client2.id, serviceId: services[8].id, providerId: provider8.id,
        date: '2025-03-10', time: '08:00', guests: 8,
        specialReq: 'Business trip — need Wi-Fi and conference seating arrangement.',
        totalPrice: 25000, status: 'completed',
      },
      // Booking 4 - completed
      {
        clientId: client2.id, serviceId: services[12].id, providerId: provider4.id,
        date: '2025-03-25', time: '18:00', guests: 4,
        specialReq: null,
        totalPrice: 7200, status: 'completed',
      },
      // Booking 5 - completed
      {
        clientId: client3.id, serviceId: services[16].id, providerId: provider3.id,
        date: '2025-04-05', time: '11:00', guests: 1,
        specialReq: 'Prefer female therapist if available.',
        totalPrice: 750, status: 'completed',
      },
      // Booking 6 - completed
      {
        clientId: client4.id, serviceId: services[32].id, providerId: provider4.id,
        date: '2025-04-18', time: '09:00', guests: 2,
        specialReq: 'We are particularly interested in Brunello di Montalcino vintages. Can you arrange a vertical tasting?',
        totalPrice: 2200, status: 'completed',
      },
      // Booking 7 - completed
      {
        clientId: client5.id, serviceId: services[28].id, providerId: provider5.id,
        date: '2025-05-02', time: '10:00', guests: 1,
        specialReq: 'Focus on avant-garde Japanese designers — Yohji Yamamoto, Issey Miyake, Comme des Garçons.',
        totalPrice: 6500, status: 'completed',
      },
      // Booking 8 - completed
      {
        clientId: client1.id, serviceId: services[1].id, providerId: provider1.id,
        date: '2025-05-10', time: '20:00', guests: 6,
        specialReq: null,
        totalPrice: 19200, status: 'completed',
      },
      // Booking 9 - completed
      {
        clientId: client6.id, serviceId: services[12].id, providerId: provider4.id,
        date: '2025-05-22', time: '19:00', guests: 3,
        specialReq: 'I am an art dealer interested in acquiring Impressionist works. Can you introduce me to relevant galleries?',
        totalPrice: 5400, status: 'completed',
      },
      // Booking 10 - completed
      {
        clientId: client7.id, serviceId: services[34].id, providerId: provider4.id,
        date: '2025-06-08', time: '10:00', guests: 2,
        specialReq: 'We would love a focus on vintage Krug and Dom Pérignon.',
        totalPrice: 4800, status: 'completed',
      },
      // Booking 11 - completed
      {
        clientId: client2.id, serviceId: services[35].id, providerId: provider13.id,
        date: '2025-06-15', time: '07:00', guests: 4,
        specialReq: 'We are intermediate skiers. Please select appropriate terrain.',
        totalPrice: 26000, status: 'completed',
      },
      // Booking 12 - completed
      {
        clientId: client4.id, serviceId: services[8].id, providerId: provider8.id,
        date: '2025-06-20', time: '09:00', guests: 4,
        specialReq: 'Would like to depart from Farnborough instead of LAX if possible.',
        totalPrice: 25000, status: 'completed',
      },
      // Booking 13 - completed
      {
        clientId: client3.id, serviceId: services[14].id, providerId: provider2.id,
        date: '2025-06-28', time: '08:00', guests: 8,
        specialReq: 'Corporate retreat — need team-building activities and a group dinner on the final evening.',
        totalPrice: 58000, status: 'completed',
      },
      // Booking 14 - completed
      {
        clientId: client5.id, serviceId: services[6].id, providerId: provider2.id,
        date: '2025-07-10', time: '17:00', guests: 10,
        specialReq: 'My family reunion — include vegetarian options and a birthday cake for my mother.',
        totalPrice: 28000, status: 'completed',
      },
      // Booking 15 - completed
      {
        clientId: client6.id, serviceId: services[36].id, providerId: provider12.id,
        date: '2025-07-18', time: '06:00', guests: 2,
        specialReq: null,
        totalPrice: 24000, status: 'completed',
      },
      // Booking 36 - completed (VIP Protection)
      {
        clientId: client4.id, serviceId: services[52].id, providerId: provider15.id,
        date: '2025-06-01', time: '08:00', guests: 1,
        specialReq: 'High-profile business trip to three European capitals. Need low-profile protection team fluent in English, French, and German.',
        totalPrice: 10500, status: 'completed',
      },
      // Booking 37 - completed (Health Screening)
      {
        clientId: client2.id, serviceId: services[54].id, providerId: provider16.id,
        date: '2025-06-10', time: '09:00', guests: 1,
        specialReq: 'Family history of cardiac issues. Would like a comprehensive cardiac workup included.',
        totalPrice: 4500, status: 'completed',
      },
      // Booking 38 - completed (Brand Campaign Shoot)
      {
        clientId: client5.id, serviceId: services[56].id, providerId: provider17.id,
        date: '2025-06-22', time: '10:00', guests: 1,
        specialReq: 'Shooting my new spring/summer collection campaign. Need industrial loft setting with natural light and a team of 4 models.',
        totalPrice: 6000, status: 'completed',
      },
      // Booking 39 - completed (Celebrity Transformation)
      {
        clientId: client2.id, serviceId: services[58].id, providerId: provider18.id,
        date: '2025-04-01', time: '07:00', guests: 1,
        specialReq: 'Preparing for a role that requires significant physical transformation. 12 weeks to get camera-ready.',
        totalPrice: 8000, status: 'completed',
      },
      // Booking 40 - completed (Uffizi Gallery)
      {
        clientId: client3.id, serviceId: services[66].id, providerId: provider4.id,
        date: '2025-07-05', time: '09:00', guests: 2,
        specialReq: 'I am considering acquiring a Botticelli. Can Jean-Pierre arrange a private viewing at the restoration workshop?',
        totalPrice: 3200, status: 'completed',
      },
      // Booking 41 - completed (Estate Security Audit)
      {
        clientId: client4.id, serviceId: services[53].id, providerId: provider15.id,
        date: '2025-05-15', time: '08:00', guests: 1,
        specialReq: 'Our Belgravia property recently had a break-in attempt. Need immediate security overhaul including smart home integration.',
        totalPrice: 8000, status: 'completed',
      },
      // Booking 42 - completed (Caviar Breakfast)
      {
        clientId: client1.id, serviceId: services[61].id, providerId: provider1.id,
        date: '2025-07-20', time: '09:00', guests: 4,
        specialReq: 'Celebrating my husband\'s 60th birthday. Please include a surprise gift presentation during the caviar course.',
        totalPrice: 4800, status: 'completed',
      },
      // Booking 43 - completed (Boxing Masterclass)
      {
        clientId: client7.id, serviceId: services[59].id, providerId: provider18.id,
        date: '2025-06-28', time: '06:00', guests: 2,
        specialReq: null,
        totalPrice: 2400, status: 'completed',
      },
    ]

    // Accepted bookings (near future)
    const acceptedBookingsData = [
      // Booking 16 - accepted
      {
        clientId: client1.id, serviceId: services[3].id, providerId: provider4.id,
        date: '2025-08-05', time: '06:00', guests: 2,
        specialReq: 'My partner has celiac disease. Please ensure gluten-free options throughout.',
        totalPrice: 3600, status: 'accepted',
      },
      // Booking 17 - accepted
      {
        clientId: client3.id, serviceId: services[5].id, providerId: provider2.id,
        date: '2025-08-10', time: '17:00', guests: 10,
        specialReq: 'Corporate retreat team-building event.',
        totalPrice: 28000, status: 'accepted',
      },
      // Booking 18 - accepted
      {
        clientId: client7.id, serviceId: services[32].id, providerId: provider4.id,
        date: '2025-08-20', time: '09:00', guests: 4,
        specialReq: null,
        totalPrice: 4400, status: 'accepted',
      },
      // Booking 19 - accepted
      {
        clientId: client4.id, serviceId: services[31].id, providerId: provider11.id,
        date: '2025-09-01', time: '10:00', guests: 2,
        specialReq: 'We would love to stay at the Gleneagles Hotel. Can you coordinate?',
        totalPrice: 7600, status: 'accepted',
      },
      // Booking 20 - accepted
      {
        clientId: client5.id, serviceId: services[17].id, providerId: provider9.id,
        date: '2025-09-10', time: '10:00', guests: 1,
        specialReq: 'I have sensitive skin. Please use the gentlest formulations available.',
        totalPrice: 2800, status: 'accepted',
      },
      // Booking 21 - accepted
      {
        clientId: client2.id, serviceId: services[10].id, providerId: provider8.id,
        date: '2025-09-15', time: '08:00', guests: 3,
        specialReq: 'Honeymoon trip — surprise my wife with flowers on arrival.',
        totalPrice: 9600, status: 'accepted',
      },
      // Booking 22 - accepted
      {
        clientId: client6.id, serviceId: services[13].id, providerId: provider5.id,
        date: '2025-09-22', time: '08:00', guests: 2,
        specialReq: 'Would love to see the Vatican Museums restoration workshop if possible.',
        totalPrice: 4400, status: 'accepted',
      },
      // Booking 23 - accepted
      {
        clientId: client1.id, serviceId: services[11].id, providerId: provider8.id,
        date: '2025-10-01', time: '14:00', guests: 2,
        specialReq: null,
        totalPrice: 6400, status: 'accepted',
      },
      // Booking 44 - accepted (Medical Wellness Retreat)
      {
        clientId: client3.id, serviceId: services[55].id, providerId: provider16.id,
        date: '2025-10-10', time: '08:00', guests: 1,
        specialReq: 'I have been feeling exhausted despite adequate sleep. Would like a thorough hormone panel and thyroid assessment.',
        totalPrice: 15000, status: 'accepted',
      },
      // Booking 45 - accepted (Drone Cinematography)
      {
        clientId: client6.id, serviceId: services[57].id, providerId: provider17.id,
        date: '2025-10-20', time: '10:00', guests: 1,
        specialReq: 'Filming my art gallery in Moscow for a virtual exhibition. Need interior and exterior aerial footage with golden hour lighting.',
        totalPrice: 8500, status: 'accepted',
      },
      // Booking 46 - accepted (Belgravia Townhouse)
      {
        clientId: client4.id, serviceId: services[67].id, providerId: provider7.id,
        date: '2025-11-01', time: '10:00', guests: 2,
        specialReq: 'Budget up to £45 million. Must have a private garden and at least 5 bedrooms.',
        totalPrice: 2500, status: 'accepted',
      },
      // Booking 47 - accepted (Haute Joaillerie)
      {
        clientId: client1.id, serviceId: services[68].id, providerId: provider5.id,
        date: '2025-11-05', time: '14:00', guests: 1,
        specialReq: 'Looking for a bespoke engagement ring. Budget is €200,000. Prefer a rare pink diamond setting.',
        totalPrice: 2000, status: 'accepted',
      },
    ]

    // Pending bookings (future)
    const pendingBookingsData = [
      // Booking 24 - pending
      {
        clientId: client2.id, serviceId: services[22].id, providerId: provider6.id,
        date: '2025-10-15', time: '20:00', guests: 200,
        specialReq: 'Themed as a Great Gatsby party. Need art deco décor.',
        totalPrice: 15000, status: 'pending',
      },
      // Booking 25 - pending
      {
        clientId: client1.id, serviceId: services[9].id, providerId: provider8.id,
        date: '2025-10-20', time: '06:00', guests: 3,
        specialReq: null,
        totalPrice: 3600, status: 'pending',
      },
      // Booking 26 - pending
      {
        clientId: client7.id, serviceId: services[2].id, providerId: provider5.id,
        date: '2025-11-05', time: '18:00', guests: 2,
        specialReq: 'We are celebrating our 25th wedding anniversary. Can you arrange a special omakase with rare ingredients?',
        totalPrice: 2400, status: 'pending',
      },
      // Booking 27 - pending
      {
        clientId: client4.id, serviceId: services[37].id, providerId: provider14.id,
        date: '2025-11-12', time: '05:00', guests: 4,
        specialReq: 'My sons are keen fishermen. Can the captain focus on marlin territory?',
        totalPrice: 11200, status: 'pending',
      },
      // Booking 28 - pending
      {
        clientId: client5.id, serviceId: services[15].id, providerId: provider3.id,
        date: '2025-12-01', time: '08:00', guests: 1,
        specialReq: null,
        totalPrice: 4200, status: 'pending',
      },
      // Booking 48 - pending (VIP Protection)
      {
        clientId: client7.id, serviceId: services[52].id, providerId: provider15.id,
        date: '2025-12-10', time: '06:00', guests: 1,
        specialReq: 'Art fair in Maastricht — need discreet protection while viewing and potentially acquiring high-value artworks.',
        totalPrice: 7000, status: 'pending',
      },
      // Booking 49 - pending (Health Screening)
      {
        clientId: client6.id, serviceId: services[54].id, providerId: provider16.id,
        date: '2025-12-15', time: '09:00', guests: 1,
        specialReq: null,
        totalPrice: 4500, status: 'pending',
      },
      // Booking 50 - pending (Brand Campaign Shoot)
      {
        clientId: client3.id, serviceId: services[56].id, providerId: provider17.id,
        date: '2026-01-10', time: '10:00', guests: 1,
        specialReq: 'Personal branding shoot for my philanthropy foundation website. Need both editorial and candid styles.',
        totalPrice: 6000, status: 'pending',
      },
      // Booking 51 - pending (Arctic Expedition)
      {
        clientId: client1.id, serviceId: services[71].id, providerId: provider13.id,
        date: '2026-02-01', time: '08:00', guests: 2,
        specialReq: 'Honeymoon trip — would like to propose on a glacier. Can Henrik arrange something special?',
        totalPrice: 36000, status: 'pending',
      },
    ]

    // Rejected bookings
    const rejectedBookingsData = [
      // Booking 29 - rejected
      {
        clientId: client6.id, serviceId: services[4].id, providerId: provider2.id,
        date: '2025-03-15', time: '10:00', guests: 12,
        specialReq: 'We need the yacht for a music video shoot. Can we have drone access?',
        totalPrice: 37000, status: 'rejected',
      },
      // Booking 30 - rejected
      {
        clientId: client7.id, serviceId: services[8].id, providerId: provider8.id,
        date: '2025-04-10', time: '06:00', guests: 16,
        specialReq: 'Can we bring pets on the private jet?',
        totalPrice: 50000, status: 'rejected',
      },
      // Booking 31 - rejected
      {
        clientId: client3.id, serviceId: services[19].id, providerId: provider5.id,
        date: '2025-05-20', time: '10:00', guests: 1,
        specialReq: 'I want to attend the Valentino show specifically.',
        totalPrice: 6500, status: 'rejected',
      },
      // Booking 32 - rejected
      {
        clientId: client2.id, serviceId: services[24].id, providerId: provider7.id,
        date: '2025-06-01', time: '10:00', guests: 3,
        specialReq: 'Budget is $50 million for the penthouse purchase.',
        totalPrice: 6000, status: 'rejected',
      },
    ]

    // Cancelled bookings
    const cancelledBookingsData = [
      // Booking 33 - cancelled
      {
        clientId: client3.id, serviceId: services[20].id, providerId: provider5.id,
        date: '2025-06-15', time: '10:00', guests: 1,
        specialReq: 'Looking specifically for Comme des Garçons and Issey Miyake pieces.',
        totalPrice: 900, status: 'cancelled',
      },
      // Booking 34 - cancelled
      {
        clientId: client5.id, serviceId: services[36].id, providerId: provider12.id,
        date: '2025-07-25', time: '06:00', guests: 4,
        specialReq: 'Family trip with two children aged 10 and 14.',
        totalPrice: 48000, status: 'cancelled',
      },
      // Booking 35 - cancelled
      {
        clientId: client1.id, serviceId: services[7].id, providerId: provider2.id,
        date: '2025-08-15', time: '08:00', guests: 6,
        specialReq: 'Sailing experience preferred — we are experienced sailors ourselves.',
        totalPrice: 87000, status: 'cancelled',
      },
    ]

    const allBookingsData = [
      ...completedBookingsData,
      ...acceptedBookingsData,
      ...pendingBookingsData,
      ...rejectedBookingsData,
      ...cancelledBookingsData,
    ]

    const bookings = await Promise.all(
      allBookingsData.map((b) =>
        db.booking.create({ data: b })
      )
    )

    // ────────────────────────────────────────────
    //  REVIEWS (28 reviews for completed bookings)
    // ────────────────────────────────────────────

    const reviews = await Promise.all([
      // Review for booking 1 (client1, chef marco tasting)
      db.review.create({
        data: {
          bookingId: bookings[0].id, clientId: client1.id,
          serviceId: services[0].id, providerId: provider1.id,
          rating: 5,
          comment: 'Absolutely transcendent dining experience. Each course was a masterpiece — the truffle risotto alone was worth the trip. Chef Marco is a true artist and his attention to detail is unparalleled.',
        },
      }),
      // Review for booking 2 (client1, yacht charter)
      db.review.create({
        data: {
          bookingId: bookings[1].id, clientId: client1.id,
          serviceId: services[4].id, providerId: provider2.id,
          rating: 5,
          comment: 'The yacht was immaculate and the crew anticipated every need before we even asked. Sailing into Monaco at sunset with champagne in hand was pure magic. Captain Laurent and his team made our anniversary unforgettable.',
        },
      }),
      // Review for booking 3 (client2, private jet)
      db.review.create({
        data: {
          bookingId: bookings[2].id, clientId: client2.id,
          serviceId: services[8].id, providerId: provider8.id,
          rating: 4,
          comment: 'Smooth flight and excellent service throughout. The cabin was beautifully appointed and the lie-flat seats are incredibly comfortable. Only minor note — the meal service could have been timed better. Otherwise, first class in every sense.',
        },
      }),
      // Review for booking 4 (client2, louvre)
      db.review.create({
        data: {
          bookingId: bookings[3].id, clientId: client2.id,
          serviceId: services[12].id, providerId: provider4.id,
          rating: 5,
          comment: 'Jean-Pierre made the Louvre come alive in ways I never imagined. Having the Mona Lisa almost to ourselves at midnight was a genuinely surreal moment. The champagne reception in the Napoleon III Apartments was the perfect ending to an extraordinary evening.',
        },
      }),
      // Review for booking 5 (client3, hammam spa)
      db.review.create({
        data: {
          bookingId: bookings[4].id, clientId: client3.id,
          serviceId: services[16].id, providerId: provider3.id,
          rating: 4,
          comment: 'A deeply relaxing and rejuvenating experience from start to finish. The gold-infused body scrub left my skin glowing for weeks. Victoria and her team are true professionals. The only reason for 4 stars is the waiting area could use a bit more privacy between treatments.',
        },
      }),
      // Review for booking 6 (client4, tuscany wine)
      db.review.create({
        data: {
          bookingId: bookings[5].id, clientId: client4.id,
          serviceId: services[32].id, providerId: provider4.id,
          rating: 5,
          comment: 'As a wine collector, I can confidently say this was the most informative and enjoyable tasting experience of my life. The vertical Brunello tasting at Il Greppo was extraordinary — the 2010 vintage is sublime. Jean-Pierre\'s knowledge of Tuscan wine is encyclopaedic.',
        },
      }),
      // Review for booking 7 (client5, milan fashion week)
      db.review.create({
        data: {
          bookingId: bookings[6].id, clientId: client5.id,
          serviceId: services[28].id, providerId: provider5.id,
          rating: 5,
          comment: 'Kazuki\'s connections in the fashion world are simply extraordinary. Front-row seats at Armani and a private fitting with Donatella Versace — these are experiences money alone cannot buy. His styling advice was impeccable and my personal lookbook from the week is something I will treasure forever.',
        },
      }),
      // Review for booking 8 (client1, rooftop dinner)
      db.review.create({
        data: {
          bookingId: bookings[7].id, clientId: client1.id,
          serviceId: services[1].id, providerId: provider1.id,
          rating: 5,
          comment: 'Rooftop dining with the Manhattan skyline as your backdrop — it simply does not get better than this. The jazz quartet was phenomenal and the sommelier\'s wine pairings elevated every dish. Chef Marco\'s wagyu tartare was the standout course.',
        },
      }),
      // Review for booking 9 (client6, louvre)
      db.review.create({
        data: {
          bookingId: bookings[8].id, clientId: client6.id,
          serviceId: services[12].id, providerId: provider4.id,
          rating: 4,
          comment: 'An excellent private tour. Jean-Pierre\'s insights into the Impressionist collection were particularly valuable given my work as an art dealer. I would have loved a bit more time in the Dutch Masters wing, but overall a fantastic evening.',
        },
      }),
      // Review for booking 10 (client7, champagne tour)
      db.review.create({
        data: {
          bookingId: bookings[9].id, clientId: client7.id,
          serviceId: services[34].id, providerId: provider4.id,
          rating: 5,
          comment: 'As a Master of Wine, I have visited many Champagne houses, but nothing compares to this private experience. The sabrage masterclass was both educational and thrilling. Tasting the 1996 Krug Clos du Mesnil directly from the cask was a once-in-a-lifetime moment.',
        },
      }),
      // Review for booking 11 (client2, heliskiing)
      db.review.create({
        data: {
          bookingId: bookings[10].id, clientId: client2.id,
          serviceId: services[35].id, providerId: provider13.id,
          rating: 5,
          comment: 'Henrik\'s heliskiing operation is world-class. The powder at 3,800 meters was like nothing I have ever skied — deep, light, and endless. The safety briefing was thorough without being tedious, and the après-ski at the chalet with champagne and a private chef was the perfect ending.',
        },
      }),
      // Review for booking 12 (client4, private jet)
      db.review.create({
        data: {
          bookingId: bookings[11].id, clientId: client4.id,
          serviceId: services[8].id, providerId: provider8.id,
          rating: 5,
          comment: 'Commander Hayes arranged a seamless flight from Farnborough to Los Angeles. The Gulfstream G650 is extraordinarily comfortable for a transatlantic crossing. The Michelin-inspired catering was a delightful surprise, and the cabin attendant was attentive without being intrusive.',
        },
      }),
      // Review for booking 13 (client3, greek islands yacht)
      db.review.create({
        data: {
          bookingId: bookings[12].id, clientId: client3.id,
          serviceId: services[14].id, providerId: provider2.id,
          rating: 5,
          comment: 'Our corporate retreat on the Greek islands was flawlessly executed by Captain Laurent. The hidden coves of Mykonos were breathtaking, and the team-building activities on the private beaches were innovative and genuinely enjoyable. Already planning next year\'s retreat.',
        },
      }),
      // Review for booking 14 (client5, sunset cruise)
      db.review.create({
        data: {
          bookingId: bookings[13].id, clientId: client5.id,
          serviceId: services[6].id, providerId: provider2.id,
          rating: 4,
          comment: 'A lovely family reunion on the water. The crew was warm and accommodating, and the vegetarian options they prepared for us were outstanding. My mother was thrilled with the birthday cake — it was beautifully designed. The only suggestion would be to offer more water sports activities.',
        },
      }),
      // Review for booking 15 (client6, african safari)
      db.review.create({
        data: {
          bookingId: bookings[14].id, clientId: client6.id,
          serviceId: services[36].id, providerId: provider12.id,
          rating: 5,
          comment: 'Amara\'s safari was the single most incredible travel experience of my life. Waking up at dawn to see a pride of lions just meters from our tent, tracking elephants with Maasai guides, and dining under a sky filled with more stars than I have ever seen. Her deep knowledge of Kenyan wildlife and conservation is truly inspiring.',
        },
      }),
      // Additional reviews for variety
      db.review.create({
        data: {
          bookingId: bookings[0].id, clientId: client1.id,
          serviceId: services[0].id, providerId: provider1.id,
          rating: 5,
          comment: 'We returned for a second time and it was even better than the first. The seasonal menu showcased Japanese influences this time — the miso-glazed sea bass was divine.',
        },
      }),
      db.review.create({
        data: {
          bookingId: bookings[1].id, clientId: client1.id,
          serviceId: services[4].id, providerId: provider2.id,
          rating: 4,
          comment: 'A magnificent week on the Mediterranean. The jet ski excursions were a highlight for the whole family. The food prepared by the onboard chef rivalled any Michelin restaurant.',
        },
      }),
      db.review.create({
        data: {
          bookingId: bookings[2].id, clientId: client2.id,
          serviceId: services[8].id, providerId: provider8.id,
          rating: 5,
          comment: 'On reflection, I want to upgrade my rating. Commander Hayes followed up personally after our flight to ensure everything was satisfactory. That level of care is rare and appreciated.',
        },
      }),
      db.review.create({
        data: {
          bookingId: bookings[5].id, clientId: client4.id,
          serviceId: services[32].id, providerId: provider4.id,
          rating: 4,
          comment: 'The farm-to-table lunch at the third estate was a highlight. Fresh pasta made before our eyes, paired with a 2015 Chianti Classico Riserva. Pure Tuscan perfection.',
        },
      }),
      db.review.create({
        data: {
          bookingId: bookings[6].id, clientId: client5.id,
          serviceId: services[28].id, providerId: provider5.id,
          rating: 5,
          comment: 'The after-party invitations alone were worth the investment. Dancing alongside A-list celebrities at a private palazzo on Lake Como — absolutely surreal. Kazuki is a genius at what he does.',
        },
      }),
      db.review.create({
        data: {
          bookingId: bookings[7].id, clientId: client1.id,
          serviceId: services[1].id, providerId: provider1.id,
          rating: 4,
          comment: 'A magical evening with a minor hiccup — the jazz quartet was 15 minutes late. However, once they started playing, all was forgiven. The skyline views are even more stunning than the photos suggest.',
        },
      }),
      db.review.create({
        data: {
          bookingId: bookings[9].id, clientId: client7.id,
          serviceId: services[34].id, providerId: provider4.id,
          rating: 5,
          comment: 'The seven-course lunch at Krug was the finest meal I have had this year. Each course was thoughtfully paired with a different vintage, and the sommelier\'s commentary added so much depth to the experience.',
        },
      }),
      db.review.create({
        data: {
          bookingId: bookings[10].id, clientId: client2.id,
          serviceId: services[35].id, providerId: provider13.id,
          rating: 4,
          comment: 'An unforgettable adrenaline rush. The helicopter ride up was scenic, and the first run down untouched powder was life-changing. The only drawback was the weather closing in earlier than expected.',
        },
      }),
      db.review.create({
        data: {
          bookingId: bookings[11].id, clientId: client4.id,
          serviceId: services[8].id, providerId: provider8.id,
          rating: 5,
          comment: 'Seamless from departure to arrival. The cabin was immaculate, the crew professional, and the lie-flat seats made it possible to arrive refreshed. Commander Hayes has set a new standard for private aviation.',
        },
      }),
      db.review.create({
        data: {
          bookingId: bookings[12].id, clientId: client3.id,
          serviceId: services[14].id, providerId: provider2.id,
          rating: 5,
          comment: 'Captain Laurent went above and beyond for our corporate retreat. He arranged a surprise fireworks display on the last evening that left everyone speechless. The onboard chef prepared the most incredible seafood feast.',
        },
      }),
      db.review.create({
        data: {
          bookingId: bookings[14].id, clientId: client6.id,
          serviceId: services[36].id, providerId: provider12.id,
          rating: 5,
          comment: 'Amara has created something truly special. Her luxury tented camp is the perfect blend of adventure and comfort. Waking up to the sounds of the African bush, seeing a leopard on our first game drive — these are memories we will cherish forever.',
        },
      }),
      db.review.create({
        data: {
          bookingId: bookings[4].id, clientId: client3.id,
          serviceId: services[16].id, providerId: provider3.id,
          rating: 5,
          comment: 'Upon reflection, I realize my initial 4-star review was too conservative. The hammam experience was transformative — I have never felt so renewed. The caviar facial was an unexpected luxury. Five stars, well deserved.',
        },
      }),
      db.review.create({
        data: {
          bookingId: bookings[8].id, clientId: client6.id,
          serviceId: services[12].id, providerId: provider4.id,
          rating: 5,
          comment: 'I have visited the Louvre dozens of times, but Jean-Pierre revealed secrets I never knew existed. His access to the restoration workshop was the highlight — seeing conservators work on a Delacroix up close was a privilege.',
        },
      }),
      // Extra reviews for more completed bookings
      db.review.create({
        data: {
          bookingId: bookings[10].id, clientId: client2.id,
          serviceId: services[3].id, providerId: provider2.id,
          rating: 5,
          comment: 'The sunset cruise along the Côte d\'Azur was the most romantic experience of our lives. Captain Laurent and his crew were impeccable hosts — the Dom Pérignon flowed freely and the canapés were divine.',
        },
      }),
      db.review.create({
        data: {
          bookingId: bookings[11].id, clientId: client4.id,
          serviceId: services[6].id, providerId: provider3.id,
          rating: 4,
          comment: 'The desert safari was an incredible adventure. Dune bashing at sunset, followed by a Bedouin-style dinner under the stars. Only slight issue was the return transfer was 30 minutes late.',
        },
      }),
      db.review.create({
        data: {
          bookingId: bookings[13].id, clientId: client5.id,
          serviceId: services[22].id, providerId: provider14.id,
          rating: 5,
          comment: 'The Ice Hotel exceeded every expectation. Sleeping in a room carved from pure ice, watching the Northern Lights dance overhead — it felt like stepping into a dream. The husky sled ride was exhilarating!',
        },
      }),
      db.review.create({
        data: {
          bookingId: bookings[14].id, clientId: client3.id,
          serviceId: services[28].id, providerId: provider4.id,
          rating: 5,
          comment: 'The underground supper club is the best-kept secret in New York. Every course was a revelation, and the mystery of not knowing the location until 24 hours before added such thrill to the evening.',
        },
      }),
      db.review.create({
        data: {
          bookingId: bookings[0].id, clientId: client1.id,
          serviceId: services[0].id, providerId: provider1.id,
          rating: 5,
          comment: 'A second visit to Chef Marco\'s tasting menu and it was even better than the first. The new autumn menu is inspired — the black truffle risotto with aged Parmigiano brought tears to my eyes.',
        },
      }),
      db.review.create({
        data: {
          bookingId: bookings[2].id, clientId: client2.id,
          serviceId: services[8].id, providerId: provider8.id,
          rating: 5,
          comment: 'Commander Hayes made our Paris business trip unforgettable. The G650 was immaculate, the cabin service was discreet and attentive, and we arrived refreshed and ready for our board meeting.',
        },
      }),

      // ── Reviews for new completed bookings ──

      // Review for booking 36 (client4, VIP Protection)
      db.review.create({
        data: {
          bookingId: bookings[15].id, clientId: client4.id,
          serviceId: services[52].id, providerId: provider15.id,
          rating: 5,
          comment: 'Major Volkov and his team provided an extraordinary level of protection during my three-city business tour. Completely invisible when they needed to be, yet I always felt utterly secure. Their multilingual capability was a huge advantage in Paris and Berlin. The armored vehicle was surprisingly comfortable. Worth every penny for peace of mind.',
        },
      }),

      // Review for booking 37 (client2, Health Screening)
      db.review.create({
        data: {
          bookingId: bookings[16].id, clientId: client2.id,
          serviceId: services[54].id, providerId: provider16.id,
          rating: 5,
          comment: 'Dr. Mitchell\'s executive health screening is the most thorough medical examination I have ever experienced. The full-body MRI caught a minor cardiac issue that three previous doctors had missed entirely. Her follow-up plan was meticulous — I now have a personalized longevity protocol that has genuinely transformed my energy levels. This is what healthcare should look like.',
        },
      }),

      // Review for booking 38 (client5, Brand Campaign Shoot)
      db.review.create({
        data: {
          bookingId: bookings[17].id, clientId: client5.id,
          serviceId: services[56].id, providerId: provider17.id,
          rating: 5,
          comment: 'Lucian Fontaine is a true artist behind the lens. The campaign shoot for my spring collection exceeded all expectations — the images are stunning, cinematic, and perfectly capture the essence of my brand. His eye for light and composition is unparalleled. The lookbook he designed has already become a talking point in the fashion press.',
        },
      }),

      // Review for booking 39 (client2, Celebrity Transformation)
      db.review.create({
        data: {
          bookingId: bookings[18].id, clientId: client2.id,
          serviceId: services[58].id, providerId: provider18.id,
          rating: 5,
          comment: 'Marcus Thornton is not just a trainer — he is a physique architect. In 12 weeks, he completely transformed my body for a demanding film role. The program was scientific, progressive, and ruthlessly efficient. His private gym in Beverly Hills is world-class, and the nutrition plan from his dietitian was Michelin-star quality. The final photoshoot was the cherry on top.',
        },
      }),

      // Review for booking 40 (client3, Uffizi Gallery)
      db.review.create({
        data: {
          bookingId: bookings[19].id, clientId: client3.id,
          serviceId: services[66].id, providerId: provider4.id,
          rating: 5,
          comment: 'Walking through the Vasari Corridor alone, with centuries of self-portraits lining the walls, was one of the most profound cultural experiences of my life. Jean-Pierre arranged a private viewing of a Botticelli being restored, which deeply moved me. The aperitivo overlooking the Ponte Vecchio at sunset was pure magic. An absolute must for any art lover.',
        },
      }),

      // Review for booking 41 (client4, Estate Security Audit)
      db.review.create({
        data: {
          bookingId: bookings[20].id, clientId: client4.id,
          serviceId: services[53].id, providerId: provider15.id,
          rating: 5,
          comment: 'After the break-in attempt, Major Volkov\'s team conducted the most comprehensive security audit I have ever seen. They identified vulnerabilities I never would have considered — including smart home exploits. The new CCTV system and perimeter upgrades they installed are state-of-the-art. I now sleep with complete peace of mind.',
        },
      }),

      // Review for booking 42 (client1, Caviar Breakfast)
      db.review.create({
        data: {
          bookingId: bookings[21].id, clientId: client1.id,
          serviceId: services[61].id, providerId: provider1.id,
          rating: 5,
          comment: 'What a way to celebrate a milestone birthday. Chef Marco\'s caviar and champagne breakfast was pure indulgence — the Beluga was sublime, the gold-leaf pastries were a showstopper, and the surprise gift presentation during the caviar course brought tears to my husband\'s eyes. Tableside preparation added such a wonderful theatrical element.',
        },
      }),

      // Review for booking 43 (client7, Boxing Masterclass)
      db.review.create({
        data: {
          bookingId: bookings[22].id, clientId: client7.id,
          serviceId: services[59].id, providerId: provider18.id,
          rating: 4,
          comment: 'An exhilarating experience that pushed us to our limits in the best possible way. Marcus is an extraordinary coach — his technical drills were challenging but perfectly calibrated to our skill level. Sparring with a professional boxer was equal parts terrifying and thrilling. The ringside recovery with cold-pressed juices was a lovely touch. Only minor note — the gym was quite warm that day.',
        },
      }),
    ])

    // ────────────────────────────────────────────
    //  MESSAGES (18 messages, multiple conversations)
    // ────────────────────────────────────────────

    const messages = await Promise.all([
      // Conversation 1: client1 ↔ provider1 (booking 0 — tasting menu)
      db.message.create({
        data: {
          senderId: client1.id, receiverId: provider1.id, bookingId: bookings[0].id,
          content: 'Hi Chef Marco, my husband and I are so excited for our tasting menu on the 15th. Can we request the wine pairing upgrade?',
          read: true,
        },
      }),
      db.message.create({
        data: {
          senderId: provider1.id, receiverId: client1.id, bookingId: bookings[0].id,
          content: 'Of course, Victoria! I\'ve already noted the shellfish allergy and I\'ll prepare a special amuse-bouche with seasonal vegetables instead. The wine pairing upgrade is my pleasure — I have a stunning 2019 Barolo reserved for you.',
          read: true,
        },
      }),
      db.message.create({
        data: {
          senderId: client1.id, receiverId: provider1.id, bookingId: bookings[0].id,
          content: 'That sounds absolutely perfect. We can\'t wait!',
          read: true,
        },
      }),

      // Conversation 2: client2 ↔ provider2 (booking 2 — yacht charter)
      db.message.create({
        data: {
          senderId: client2.id, receiverId: provider2.id, bookingId: bookings[1].id,
          content: 'Captain Laurent, we\'d love to extend our yacht charter by 2 extra days if possible. What would be the additional cost?',
          read: false,
        },
      }),
      db.message.create({
        data: {
          senderId: provider2.id, receiverId: client2.id, bookingId: bookings[1].id,
          content: 'Bonjour James! I would be delighted to extend your charter. Two additional days would be approximately $26,000, which includes the extended crew, fuel, and provisions. Shall I prepare the amended itinerary?',
          read: false,
        },
      }),

      // Conversation 3: client3 ↔ provider6 (booking 22 — masquerade ball)
      db.message.create({
        data: {
          senderId: client3.id, receiverId: provider6.id, bookingId: bookings[22].id,
          content: 'Sebastian, for the Gatsby-themed event, can you source some authentic 1920s props? I\'m thinking crystal chandeliers and vintage gramophones.',
          read: false,
        },
      }),
      db.message.create({
        data: {
          senderId: provider6.id, receiverId: client3.id, bookingId: bookings[22].id,
          content: 'Absolutely, Sophia! I already have a connection with a vintage prop house in London that supplied pieces for The Great Gatsby film. Crystal chandeliers, gramophones, art deco mirrors — I can have it all. Budget-wise, we\'re looking at an additional $3,500.',
          read: true,
        },
      }),
      db.message.create({
        data: {
          senderId: client3.id, receiverId: provider6.id, bookingId: bookings[22].id,
          content: 'That\'s within budget. Please proceed. Also, can we add a live swing band instead of the DJ?',
          read: false,
        },
      }),
      db.message.create({
        data: {
          senderId: provider6.id, receiverId: client3.id, bookingId: bookings[22].id,
          content: 'A live swing band is a brilliant idea — I actually work with a fantastic 12-piece orchestra that specializes in the Roaring Twenties repertoire. I\'ll send you their demo reel. Consider it done!',
          read: false,
        },
      }),

      // Conversation 4: client7 ↔ provider4 (booking 8 — champagne)
      db.message.create({
        data: {
          senderId: client7.id, receiverId: provider4.id, bookingId: bookings[9].id,
          content: 'Jean-Pierre, I wanted to confirm our champagne tour for June 8th. Will we be visiting the Krug cellars? That is the highlight I\'m most looking forward to.',
          read: true,
        },
      }),
      db.message.create({
        data: {
          senderId: provider4.id, receiverId: client7.id, bookingId: bookings[9].id,
          content: 'Bonjour Charlotte! Yes, the Krug cellels are absolutely on the itinerary. I have arranged for a private tasting of the Krug Collection — vintages not commercially available. I also secured access to the Champagne house\'s private library.',
          read: true,
        },
      }),

      // Conversation 5: client5 ↔ provider5 (booking 5 — milan fashion week)
      db.message.create({
        data: {
          senderId: client5.id, receiverId: provider5.id, bookingId: bookings[6].id,
          content: 'Kazuki-san, I just wanted to express my gratitude for the Milan Fashion Week experience. The Armani Privée fitting was extraordinary. My new collection has been deeply inspired by what I saw.',
          read: true,
        },
      }),
      db.message.create({
        data: {
          senderId: provider5.id, receiverId: client5.id, bookingId: bookings[6].id,
          content: 'Priya, it was an absolute pleasure working with you. Your design vision is remarkable, and I could see Donatella was genuinely impressed by your questions. I\'d love to collaborate on your next show — perhaps Tokyo Fashion Week in October?',
          read: false,
        },
      }),

      // Conversation 6: client6 ↔ provider12 (booking 13 — safari)
      db.message.create({
        data: {
          senderId: client6.id, receiverId: provider12.id, bookingId: bookings[14].id,
          content: 'Amara, the safari exceeded every expectation. My partner is already asking when we can return. Do you offer a return-client discount for your Serengeti expedition?',
          read: false,
        },
      }),
      db.message.create({
        data: {
          senderId: provider12.id, receiverId: client6.id, bookingId: bookings[14].id,
          content: 'Alexander, I\'m so thrilled to hear that! The Serengeti expedition in January during the calving season is truly magical. As a returning guest, I would be delighted to offer you 15% off. I\'ll send you the detailed itinerary — it includes a hot air balloon safari over the migration.',
          read: false,
        },
      }),

      // Conversation 7: client4 ↔ provider8 (booking 10 — private jet)
      db.message.create({
        data: {
          senderId: client4.id, receiverId: provider8.id, bookingId: bookings[11].id,
          content: 'Commander Hayes, thank you for arranging the Farnborough departure. The flight was superb. I need to charter a jet for a trip to Singapore in August — can we discuss options?',
          read: false,
        },
      }),
      db.message.create({
        data: {
          senderId: provider8.id, receiverId: client4.id, bookingId: bookings[11].id,
          content: 'William, it was my pleasure. For Singapore, I would recommend the Bombardier Global 7500 — it has the range for a direct flight and the cabin is exceptionally spacious. Shall I prepare a detailed proposal with two aircraft options by end of week?',
          read: false,
        },
      }),

      // Conversation 8: client1 ↔ provider9 (booking 15 — diamond facial, reference booking idx)
      db.message.create({
        data: {
          senderId: client1.id, receiverId: provider9.id, bookingId: bookings[16].id,
          content: 'Dr. Vasquez, I\'m very interested in the Diamond Facial but I have a question about downtime. I have a gala event the next evening — will there be any visible redness?',
          read: true,
        },
      }),
      db.message.create({
        data: {
          senderId: provider9.id, receiverId: client1.id, bookingId: bookings[16].id,
          content: 'Victoria, the Diamond Facial is specifically designed for minimal downtime. Most clients experience a subtle glow rather than redness. I use a specialized cooling mask at the end of the treatment to calm the skin. You\'ll be gala-ready the next evening!',
          read: true,
        },
      }),
    ])

    // ────────────────────────────────────────────
    //  NOTIFICATIONS (sample for first client)
    // ────────────────────────────────────────────
    console.log('[SEED] Creating notifications...')
    const sampleNotifications = [
      { userId: client1.id, type: 'booking', title: 'Booking Confirmed', message: 'Your Mediterranean Yacht Charter has been confirmed for July 15-22. Captain Olivier Laurent will reach out shortly with preparation details.', read: true },
      { userId: client1.id, type: 'review', title: 'Leave a Review', message: 'How was your Private Tasting Menu experience? Share your thoughts to help other discerning clients discover Chef Marco Bellini\'s culinary artistry.', read: true },
      { userId: client1.id, type: 'system', title: 'Welcome to ConciergeX', message: 'Thank you for joining ConciergeX! Explore our curated collection of luxury services from the world\'s finest providers. Your Premium membership is now active.', read: true },
      { userId: client1.id, type: 'booking', title: 'Upcoming Booking Reminder', message: 'Your Royal Hammam & Spa Ritual in Dubai is scheduled in 3 days. Remember to arrive 15 minutes early for your personalized consultation.', read: false },
      { userId: client1.id, type: 'message', title: 'New Message from Chef Marco', message: 'Chef Marco Bellini sent you a message regarding your upcoming tasting menu. He\'s preparing a special seasonal selection just for you.', read: false },
      { userId: client1.id, type: 'system', title: 'New Service Available', message: 'A new exclusive service has been added: "Private Louvre After-Hours Tour" by Jean-Pierre Moreau. Limited availability — book now to secure your spot.', read: false },
      { userId: client1.id, type: 'review', title: 'Your Review Was Published', message: 'Your 5-star review for the Ferrari Road Trip — Amalfi Coast has been published. Nikolai Petrov thanked you for your kind words!', read: false },
      { userId: client2.id, type: 'booking', title: 'Booking Accepted', message: 'Captain Olivier Laurent has accepted your Sunset Yacht Cruise booking for August 5th. All preparations are underway.', read: true },
      { userId: client2.id, type: 'system', title: 'Profile Verification Complete', message: 'Your identity verification has been completed successfully. You now have access to exclusive member-only services.', read: false },
    ]
    await db.notification.createMany({ data: sampleNotifications })
    console.log('[SEED] Notifications created.')

    // ────────────────────────────────────────────
    //  RETURN STATS
    // ────────────────────────────────────────────

    const totalUsers = await db.user.count()
    const totalClients = await db.user.count({ where: { role: 'client' } })
    const totalProviders = await db.user.count({ where: { role: 'provider' } })
    const totalServices = await db.service.count()
    const totalBookings = await db.booking.count()
    const totalReviews = await db.review.count()
    const totalMessages = await db.message.count()

    return NextResponse.json(
      {
        message: 'Database seeded successfully!',
        stats: {
          users: totalUsers,
          clients: totalClients,
          providers: totalProviders,
          services: totalServices,
          bookings: totalBookings,
          reviews: totalReviews,
          messages: totalMessages,
          notifications: await db.notification.count(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[SEED_POST]', error)
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    )
  }
}
