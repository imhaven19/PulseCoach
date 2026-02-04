// App routes enum
export enum AppRoute {
  DASHBOARD = 'DASHBOARD',
  COACH = 'COACH',
  PROGRESS = 'PROGRESS',
  PROFILE = 'PROFILE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  ADMIN = 'ADMIN',
  TERMS = 'TERMS',
  PRIVACY = 'PRIVACY',
  MEAL_SCAN = 'MEAL_SCAN',
}

// Workout session type
export interface WorkoutSession {
  id?: string;
  title: string;
  focus: string;
  difficulty: string;
  totalDuration: number;
}

// Calendar event type
export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
}

// User type
export interface User {
  id: string;
  email?: string;
  name: string;
  goal: string;
  equipment: string;
  fitnessLevel: string;
  workouts?: WorkoutSession[];
  subscriptionStatus: 'free' | 'starter' | 'premium';
  billingStatus?: 'trialing' | 'active' | 'cancelled';
  premiumEndsAt?: string;
  is_calendar_connected?: boolean;
  calendarEvents?: CalendarEvent[];
  notifications_enabled?: boolean;
  avatar_url?: string;
  referralCode?: string;
  isAdmin?: boolean;
  accountStatus?: 'active' | 'disabled' | 'banned';
}
