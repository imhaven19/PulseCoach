import { User } from '../types';

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
