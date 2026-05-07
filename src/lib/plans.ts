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
      'Upload one document at a time',
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
      'Upload multiple documents at once',
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
      'Upload multiple documents at once',
      'Team workspace',
      'API access',
      'Priority support',
    ],
  },
  live_test: {
    id: 'live_test',
    name: 'Live Test',
    price: 1,
    maxDocuments: 25,
    chatMessagesPerHour: Infinity,
    features: [
      'Live checkout test',
      'Live cancellation test',
      'Pro-level limits while active',
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;

export const FREE_DOCUMENT_LIMIT = PLANS.free.maxDocuments;
export const FREE_CHAT_RATE_LIMIT = PLANS.free.chatMessagesPerHour;
export const CHAT_RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
