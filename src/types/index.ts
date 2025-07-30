export interface User {
  uid: string;
  email: string;
  displayName?: string;
  avatar?: string;
  createdAt?: Date;
}

export interface Feedback {
  id: string;
  userId: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  status: 'novo' | 'lido' | 'respondido';
  response?: {
    text: string;
    respondedBy: string;
    respondedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface FeedbackFilters {
  search: string;
  status: 'todos' | 'novo' | 'lido' | 'respondido';
  rating: 'todos' | '1' | '2' | '3' | '4' | '5';
  date: 'todos' | 'hoje' | 'semana' | 'mes';
}

export interface FeedbackMetrics {
  totalFeedbacks: number;
  averageRating: number;
  uniqueUsers: number;
  satisfactionRate: number;
}

export interface ExportData {
  metadata: {
    exportDate: string;
    totalRecords: number;
    filters: Partial<FeedbackFilters>;
  };
  feedbacks: Feedback[];
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
}

export type FeedbackStatus = Feedback['status'];
export type DateFilter = FeedbackFilters['date'];
