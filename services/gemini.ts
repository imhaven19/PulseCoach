import type { User, WorkoutSession, CalendarEvent } from '../types';

export const hasApiKey = (): boolean => {
  return typeof process !== 'undefined' && !!process.env?.API_KEY;
};

export async function chatWithCoach(
  history: any[],
  message: string,
  user?: User
): Promise<string> {
  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, message, user }),
    });

    if (!res.ok) throw new Error('Failed to get response');

    const data = await res.json();
    return data.text || 'Sorry, I could not respond right now.';
  } catch (err) {
    console.error(err);
    return 'Network error. Please try again.';
  }
}

export async function generateWorkout(
  user: User,
  duration?: number,
  focus?: string
): Promise<WorkoutSession | null> {
  try {
    const res = await fetch('/api/generate-workout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: {
          goal: user.goal,
          equipment: user.equipment,
          fitnessLevel: user.fitnessLevel,
        },
        duration: duration ?? 30,
        focus: focus ?? user.goal,
      }),
    });

    if (!res.ok) {
      return {
        id: crypto.randomUUID(),
        title: `${duration ?? 30}-Minute ${focus ?? 'Full Body'} Session`,
        focus: focus ?? 'General Fitness',
        difficulty: user.fitnessLevel,
        totalDuration: duration ?? 30,
      };
    }

    const data = await res.json();
    return {
      id: crypto.randomUUID(),
      title: data.title ?? 'Custom Workout',
      focus: data.focus ?? focus ?? 'General Fitness',
      difficulty: data.difficulty ?? user.fitnessLevel,
      totalDuration: data.duration ?? duration ?? 30,
    };
  } catch (err) {
    console.error('Failed to generate workout:', err);
    return {
      id: crypto.randomUUID(),
      title: `${duration ?? 30}-Minute ${focus ?? 'Full Body'} Session`,
      focus: focus ?? 'General Fitness',
      difficulty: user.fitnessLevel,
      totalDuration: duration ?? 30,
    };
  }
}

export async function analyzeSchedule(
  events: CalendarEvent[],
  userGoal?: string
): Promise<string> {
  try {
    const res = await fetch('/api/analyze-schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events, userGoal }),
    });

    if (!res.ok) throw new Error('Failed to analyze schedule');

    const data = await res.json();
    return data.insight ?? 'Based on your schedule, consider a quick workout during your lunch break.';
  } catch (err) {
    console.error('Failed to analyze schedule:', err);
    if (events.length === 0) {
      return 'Your calendar looks clear today - perfect for a longer training session!';
    }
    return 'I found a gap between your meetings - ideal for a quick 15-minute session.';
  }
}
