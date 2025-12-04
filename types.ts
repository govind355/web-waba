export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
  isSystem?: boolean;
}

export interface ChatSession {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: Message[];
  isAI: boolean;
  online: boolean;
}

export enum ToolType {
  REWRITE = 'REWRITE',
  TRANSLATE = 'TRANSLATE',
  SUMMARIZE = 'SUMMARIZE',
  REPLY_SUGGESTION = 'REPLY_SUGGESTION'
}

export interface AIToolResponse {
  original: string;
  result: string;
  type: ToolType;
}
