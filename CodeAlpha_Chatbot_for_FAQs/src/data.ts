import { FAQTopic } from './types';

export const PRESET_TOPICS: FAQTopic[] = [
  {
    id: 'smarthome',
    name: 'Smart Home Hub Support',
    description: 'Setup guides, Wi-Fi sync, offline controls, voice integration, and pairing diagnostics.',
    icon: 'Home',
    faqs: [
      {
        id: 'sh-1',
        question: 'How do I connect my smart speaker to my home Wi-Fi network?',
        answer: 'To connect your smart speaker, plug it into power, open the companion mobile app on your smartphone, and select "Add Device". Ensure your phone is connected to a 2.4GHz Wi-Fi band, as 5GHz bands may not be compatible with older smart assistant hardware.'
      },
      {
        id: 'sh-2',
        question: 'What should I do if my assistant speaker won\'t connect to Wi-Fi?',
        answer: 'If the speaker fails to connect, first unplug it for 15 seconds. If that fails, perform a factory reset by holding the mute button for 10 seconds. In your router settings, verify that isolation mode is disabled and the network password contains only alphanumeric characters.'
      },
      {
        id: 'sh-3',
        question: 'Does the smart speaker work offline without an active internet connection?',
        answer: 'Most voice commands require an active cloud connection to process natural language. However, basic local offline controls like Bluetooth speaker pairing, pausing playback, and analog auxiliary audio output remain fully functional without internet access.'
      },
      {
        id: 'sh-4',
        question: 'How do I share smart home device access with my family members?',
        answer: 'Go to Settings in your Smart App and choose "Manage Family". Tap "Invite New Member" and enter their email address. They will receive an invitation to download the app and access your smart thermostat, light switches, and locks.'
      },
      {
        id: 'sh-5',
        question: 'How to reset a smart power strip lock to factory defaults?',
        answer: 'Unplug the power strip from the wall outlet. Hold down the physical power button on the strip, plug it back into the wall while keeping the button pressed, and continue holding for 8 seconds until the LED indicators flash amber.'
      }
    ]
  },
  {
    id: 'eco-shop',
    name: 'Eco-Threads E-Commerce Store',
    description: 'Sourcing inquiries, organic fabrics care, bio-degradable returns, and supply chain ethics.',
    icon: 'ShoppingBag',
    faqs: [
      {
        id: 'ec-1',
        question: 'Where do you source your organic cotton and linen fabrics?',
        answer: 'All of our non-toxic organic cotton is sourced from certified fair-trade agricultural cooperatives in India. Our sustainable flax linen is grown by ecological family-owned farms in Normandy, France, using high-efficiency rainwater irrigation.'
      },
      {
        id: 'ec-2',
        question: 'How do I care for and wash my organic cotton clothing?',
        answer: 'To preserve fibers and save energy, wash cold (30°C) with a mild biodegradable laundry detergent. Lay flat to air dry or tumble dry low. Avoid chemical fabric softeners and bleaching agents, which degrade the natural organic dyes.'
      },
      {
        id: 'ec-3',
        question: 'What is your biodegradable return and exchange shipping policy?',
        answer: 'Our eco-friendly return window is 30 days. We issue pre-paid return labels and package garments in 100% compostable bio-poly mailers. Returned items that cannot be re-sold are hygienically shredded and spun into industrial recycled felt.'
      },
      {
        id: 'ec-4',
        question: 'How do you guarantee fair wages for your garment workers?',
        answer: 'We operate under reciprocal transparent contracts audited annually by Third-Party Fair-Labor Associations. All partner factories must guarantee a living wage of at least 30% above the local legal minimum, alongside free healthcare clinics for staff.'
      }
    ]
  },
  {
    id: 'novapay-api',
    name: 'NovaPay Developer Platform API',
    description: 'API key authentication, webhook signatures, high-volume rate limits, and client SDKs.',
    icon: 'Cpu',
    faqs: [
      {
        id: 'np-1',
        question: 'How do I authenticate API requests to the NovaPay gateway?',
        answer: 'You must authenticate by passing an `Authorization: Bearer sec_live_...` or `Authorization: Bearer sec_test_...` header. Standard API requests made without this secure header or with expired developer tokens will return an HTTP 401 Unauthorized error.'
      },
      {
        id: 'np-2',
        question: 'What are the rate limits for the developer sandbox testing sandbox?',
        answer: 'The developer sandbox is limited to a generous burst rate of 100 requests per minute (RPM) per developer account. Production keys handle up to 5,000 requests per minute. Exceeding this rate triggers an HTTP 429 Too Many Requests response.'
      },
      {
        id: 'np-3',
        question: 'How can I verify the cryptographic security of webhook payloads?',
        answer: 'Every webhook request appends a `NovaPay-Signature` header containing a SHA-256 HMAC digest. To verify, generate the HMAC hash from raw payload bytes using your unique client webhook secret, and do a secure constant-time string comparison.'
      },
      {
        id: 'np-4',
        question: 'Does your developer SDK support asynchronous web requests?',
        answer: 'Yes, our official SDKs for Node.js, Python, and Go support modern asynchronous processing (e.g., Promises/async-await in Node, asyncio in Python, and goroutines in Go) natively to optimize network I/O.'
      }
    ]
  },
  {
    id: 'gym-membership',
    name: 'FitPulse Wellness Club Policies',
    description: 'Membership hold processes, swimming pool rules, locker keys, and personal trainer booking.',
    icon: 'Activity',
    faqs: [
      {
        id: 'gym-1',
        question: 'How can I temporarily pause or freeze my fitness club membership?',
        answer: 'You can pause your active membership via the user portal under the Billing sub-tab of your account. Club freezes are enabled for a minimum of 1 month and a maximum of 3 months per year, with a freeze fee of $15 per month.'
      },
      {
        id: 'gym-2',
        question: 'What are the scheduled hours of access for the indoor swimming pool?',
        answer: 'Our heated indoor lap swimming pool operates from 5:30 AM to 9:30 PM on weekdays, and 7:00 AM to 8:00 PM on weekends. Swim lanes are reserved for professional water aerobics masterclasses daily between 12:00 PM and 1:30 PM.'
      },
      {
        id: 'gym-3',
        question: 'How do I book an introductory session with a personal trainer?',
        answer: 'New members receive one complimentary personal assessments and orientation. You can browse certified coach bios and book directly in the Scheduling page, or call our physical front reception desk to lock in a workout consultation.'
      },
      {
        id: 'gym-4',
        question: 'Are bathroom lockers, towels, and showers included?',
        answer: 'Yes! Daily-use lockers are free for all members (just bring a padlock or rent one for $2). Premium membership tiers include fresh cotton towel services and unlimited access to the eucalyptus steam room and private hot showers.'
      }
    ]
  }
];
