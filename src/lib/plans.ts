export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    maxDocuments: 3,
    chatMessagesPerHour: 20,
    features: [
      '3 documents',
      '20 AI chats per hour',
      'PDF, TXT, DOCX support',
      'Basic document analysis',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 12,
    maxDocuments: 25,
    chatMessagesPerHour: Infinity,
    features: [
      '25 documents',
      'Unlimited AI chats',
      'Priority processing',
      'Full document analysis',
      'Export chat history',
    ],
  },
  team: {
    id: 'team',
    name: 'Team',
    price: 29,
    maxDocuments: Infinity,
    chatMessagesPerHour: Infinity,
    features: [
      'Unlimited documents',
      'Unlimited AI chats',
      'Team workspace',
      'API access',
      'Priority support',
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;

export const FREE_DOCUMENT_LIMIT = PLANS.free.maxDocuments;
export const FREE_CHAT_RATE_LIMIT = PLANS.free.chatMessagesPerHour;
export const CHAT_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
