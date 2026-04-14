
export type Document = {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'processing' | 'ready' | 'error';
  createdAt: string;
  contentSnippet?: string;
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
};

export type ChatSession = {
  id: string;
  title: string;
  lastMessageAt: Date;
};
