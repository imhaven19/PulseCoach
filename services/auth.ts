import { supabase } from './supabase';
import type { User, WorkoutSession } from '../types';

const PENDING_TX_KEY = 'pulse_pending_tx';

export const getCurrentUser = async (): Promise<User | null> => {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  return {
    id: data.user.id,
    email: data.user.email ?? undefined,
    name: profile?.name ?? data.user.email?.split('@')[0] ?? 'User',
    goal: profile?.goal ?? 'Get fit',
    equipment: profile?.equipment ?? 'Bodyweight only',
    fitnessLevel: profile?.fitness_level ?? 'Beginner',
    subscriptionStatus: profile?.subscription_status ?? 'free',
    billingStatus: profile?.billing_status,
    premiumEndsAt: profile?.premium_ends_at,
    is_calendar_connected: profile?.is_calendar_connected ?? false,
    notifications_enabled: profile?.notifications_enabled ?? false,
    avatar_url: profile?.avatar_url,
    referralCode: profile?.referral_code,
    isAdmin: profile?.is_admin ?? false,
    accountStatus: profile?.account_status ?? 'active',
    isOnboardingComplete: profile?.is_onboarding_complete ?? false,
  };
};

export const login = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('Email not confirmed')) {
      throw new Error('CONFIRMATION_REQUIRED');
    }
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('Login failed');
  }

  const user = await getCurrentUser();
  if (!user) throw new Error('Failed to fetch user profile');
  
  return user;
};

export const logout = async (): Promise<void> => {
  await supabase.auth.signOut();
};

export const signup = async (userData: {
  name: string;
  email: string;
  password: string;
  goal: string;
  equipment: string;
  fitnessLevel: number;
}): Promise<User | null> => {
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        name: userData.name,
        goal: userData.goal,
        equipment: userData.equipment,
        fitness_level: userData.fitnessLevel,
      },
    },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      throw new Error('This email is already registered. Please login instead.');
    }
    throw new Error(error.message);
  }

  if (!data.user) {
    return null;
  }

  // Create profile record
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: data.user.id,
    email: userData.email,
    name: userData.name,
    goal: userData.goal,
    equipment: userData.equipment,
    fitness_level: userData.fitnessLevel.toString(),
    subscription_status: 'free',
    account_status: 'active',
    is_onboarding_complete: true,
  });

  if (profileError) {
    console.error('Profile creation error:', profileError);
  }

  // If email confirmation is required, return null to show confirmation screen
  if (!data.session) {
    return null;
  }

  // Auto-confirmed, return the user
  return getCurrentUser();
};

export const resendConfirmationEmail = async (email: string): Promise<boolean> => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });
  return !error;
};

export const addWorkoutLog = async (
  userId: string,
  workout: WorkoutSession
): Promise<User | null> => {
  return {
    id: userId,
    name: 'User',
    goal: 'Get fit',
    equipment: 'Bodyweight only',
    fitnessLevel: 'Beginner',
    subscriptionStatus: 'free',
    workouts: [workout],
  };
};

export const getPendingTransaction = (): { method: string; orderId: string; timestamp: number } | null => {
  try {
    const stored = localStorage.getItem(PENDING_TX_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const clearPendingTransaction = (): void => {
  localStorage.removeItem(PENDING_TX_KEY);
};

export const setPendingTransaction = (method: string, orderId: string): void => {
  localStorage.setItem(PENDING_TX_KEY, JSON.stringify({
    method,
    orderId,
    timestamp: Date.now(),
  }));
};

export const startSubscription = async (
  userId: string,
  isTrial: boolean = false,
  tier: 'starter' | 'premium' = 'premium'
): Promise<User | null> => {
  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_status: tier,
      billing_status: isTrial ? 'trialing' : 'active',
      premium_ends_at: isTrial 
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        : null,
    })
    .eq('id', userId);

  if (error) return null;
  return getCurrentUser();
};

export const toggleCalendarConnection = async (userId: string): Promise<User | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const newValue = !user.is_calendar_connected;
  
  const { error } = await supabase
    .from('profiles')
    .update({ is_calendar_connected: newValue })
    .eq('id', userId);

  if (error) return null;
  
  return {
    ...user,
    is_calendar_connected: newValue,
    calendarEvents: newValue ? [
      { id: '1', title: 'Team Standup', startTime: '09:00', endTime: '09:30' },
      { id: '2', title: 'Client Meeting', startTime: '11:00', endTime: '12:00' },
      { id: '3', title: 'Lunch Break', startTime: '12:30', endTime: '13:30' },
    ] : undefined,
  };
};

export const changePassword = async (userId: string, newPassword: string): Promise<boolean> => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return !error;
};

export const updateProfile = async (
  userId: string,
  updates: Partial<{
    name: string;
    goal: string;
    equipment: string;
    fitnessLevel: string;
    avatar_url: string;
  }>
): Promise<User | null> => {
  const { error } = await supabase
    .from('profiles')
    .update({
      name: updates.name,
      goal: updates.goal,
      equipment: updates.equipment,
      fitness_level: updates.fitnessLevel,
      avatar_url: updates.avatar_url,
    })
    .eq('id', userId);

  if (error) return null;
  return getCurrentUser();
};

export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((profile: any) => ({
    id: profile.id,
    email: profile.email ?? '',
    name: profile.name ?? 'Unknown',
    goal: profile.goal ?? 'Get fit',
    equipment: profile.equipment ?? 'Bodyweight only',
    fitnessLevel: profile.fitness_level ?? 'Beginner',
    subscriptionStatus: profile.subscription_status ?? 'free',
    billingStatus: profile.billing_status,
    isAdmin: profile.is_admin ?? false,
    accountStatus: profile.account_status ?? 'active',
  }));
};

export const updateUserStatus = async (
  userId: string,
  status: 'active' | 'disabled' | 'banned'
): Promise<boolean> => {
  const { error } = await supabase
    .from('profiles')
    .update({ account_status: status })
    .eq('id', userId);

  return !error;
};
