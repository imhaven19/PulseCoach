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

// User type
export interface User {
  id: string;
  email?: string;
  name?: string;
  workouts?: WorkoutSession[];
  subscription?: 'free' | 'premium';
  }
