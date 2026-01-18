import { supabase } from './supabase';
import type { User, WorkoutSession } from '../types';

/**
 * Get the currently logged-in user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return {
    id: data.user.id,
    email: data.user.email ?? undefined,
  };
};

/**
 * Log out the current user
 */
export const logout = async (): Promise<void> => {
  await supabase.auth.signOut();
};

/**
 * Add a workout log (example implementation)
 * NOTE: This assumes you will later store workouts in Supabase DB
 */
export const addWorkoutLog = async (
  userId: string,
  workout: WorkoutSession
): Promise<User | null> => {
  // 🔹 TEMP implementation (frontend-safe)
  // You will later replace this with a real Supabase insert
  return {
    id: userId,
    workouts: [workout],
  };
};
