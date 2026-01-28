
export type Category = 'College' | 'Company' | 'Lifestyle' | 'Trending';

export interface User {
  id: string;
  realName: string;
  anonymousName: string;
  avatar: string;
  bio: string;
  details: {
    college?: string;
    company?: string;
    lifestyle?: string;
  };
}

export interface Message {
  id: string;
  userId: string;
  anonymousName: string;
  text: string;
  timestamp: number;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  category: Category;
  participantCount: number;
  expiresAt: number;
  isClosed: boolean;
  summary?: string;
}

export interface Connection {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted';
}
