import type { User, WorkoutSession, CalendarEvent, Exercise } from '../types';

// Generate exercises based on user preferences
function generateExercises(duration: number, focus: string, fitnessLevel: string, equipment: string): Exercise[] {
  const exercises: Exercise[] = [];
  let remainingTime = duration * 60; // Convert to seconds
  
  // Warmup
  exercises.push({
    id: crypto.randomUUID(),
    name: 'Dynamic Warmup',
    description: 'Arm circles, leg swings, and light jumping jacks to get your blood flowing.',
    duration: 60,
    type: 'cardio',
  });
  remainingTime -= 60;
  
  // Main exercises based on focus
  const strengthExercises = [
    { name: 'Push-Ups', description: 'Keep your core tight and lower your chest to the ground.', reps: '12 reps', type: 'strength' as const },
    { name: 'Squats', description: 'Feet shoulder-width apart, lower until thighs are parallel to floor.', reps: '15 reps', type: 'strength' as const },
    { name: 'Lunges', description: 'Step forward and lower your back knee toward the ground.', reps: '10 each leg', type: 'strength' as const },
    { name: 'Plank Hold', description: 'Keep your body in a straight line from head to heels.', reps: '45 seconds', type: 'strength' as const },
    { name: 'Mountain Climbers', description: 'Drive your knees toward your chest in a running motion.', reps: '20 reps', type: 'cardio' as const },
    { name: 'Burpees', description: 'Drop down, kick back, push up, jump up. Full body power.', reps: '8 reps', type: 'cardio' as const },
  ];
  
  const cardioExercises = [
    { name: 'High Knees', description: 'Run in place, bringing your knees up to hip level.', reps: '30 seconds', type: 'cardio' as const },
    { name: 'Jumping Jacks', description: 'Classic cardio move - jump feet out while raising arms.', reps: '25 reps', type: 'cardio' as const },
    { name: 'Butt Kicks', description: 'Run in place, kicking your heels up to your glutes.', reps: '30 seconds', type: 'cardio' as const },
    { name: 'Speed Skaters', description: 'Leap side to side, landing on one foot each time.', reps: '20 reps', type: 'cardio' as const },
  ];
  
  const mobilityExercises = [
    { name: 'Cat-Cow Stretch', description: 'Alternate between arching and rounding your back.', reps: '10 cycles', type: 'mobility' as const },
    { name: 'Hip Circles', description: 'Large circles with your hips to open up the joint.', reps: '8 each direction', type: 'mobility' as const },
    { name: 'Shoulder Rolls', description: 'Roll your shoulders forward and backward.', reps: '10 each way', type: 'mobility' as const },
    { name: 'Standing Quad Stretch', description: 'Pull your foot to your glute, keeping knees together.', reps: '30 sec each', type: 'mobility' as const },
  ];
  
  // Select exercises based on focus
  let selectedExercises = focus.toLowerCase().includes('strength') || focus.toLowerCase().includes('muscle') 
    ? [...strengthExercises, ...cardioExercises.slice(0, 2)]
    : focus.toLowerCase().includes('cardio') || focus.toLowerCase().includes('energy')
    ? [...cardioExercises, ...strengthExercises.slice(0, 2)]
    : [...strengthExercises.slice(0, 3), ...cardioExercises.slice(0, 2), ...mobilityExercises.slice(0, 1)];
  
  // Add main exercises with rest between
  let exerciseIndex = 0;
  while (remainingTime > 120) { // Keep at least 2 minutes for cooldown
    const exercise = selectedExercises[exerciseIndex % selectedExercises.length];
    const exerciseDuration = exercise.type === 'cardio' ? 45 : 60;
    
    exercises.push({
      id: crypto.randomUUID(),
      name: exercise.name,
      description: exercise.description,
      duration: exerciseDuration,
      type: exercise.type,
      reps: exercise.reps,
    });
    remainingTime -= exerciseDuration;
    
    // Add rest between exercises
    if (remainingTime > 150) {
      exercises.push({
        id: crypto.randomUUID(),
        name: 'Active Recovery',
        description: 'Walk in place, shake out your limbs, and catch your breath.',
        duration: 30,
        type: 'rest',
      });
      remainingTime -= 30;
    }
    
    exerciseIndex++;
  }
  
  // Cooldown
  exercises.push({
    id: crypto.randomUUID(),
    name: 'Cool Down Stretch',
    description: 'Deep breathing with gentle full-body stretches. Great work!',
    duration: Math.max(60, remainingTime),
    type: 'mobility',
  });
  
  return exercises;
}

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
  const workoutDuration = duration ?? 30;
  const workoutFocus = focus ?? user.goal;
  const exercises = generateExercises(workoutDuration, workoutFocus, user.fitnessLevel, user.equipment);
  
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
        duration: workoutDuration,
        focus: workoutFocus,
      }),
    });

    if (!res.ok) {
      return {
        id: crypto.randomUUID(),
        title: `${workoutDuration}-Minute ${workoutFocus} Session`,
        focus: workoutFocus,
        difficulty: user.fitnessLevel,
        totalDuration: workoutDuration,
        exercises,
      };
    }

    const data = await res.json();
    return {
      id: crypto.randomUUID(),
      title: data.title ?? `${workoutDuration}-Minute Workout`,
      focus: data.focus ?? workoutFocus,
      difficulty: data.difficulty ?? user.fitnessLevel,
      totalDuration: data.duration ?? workoutDuration,
      exercises,
    };
  } catch (err) {
    console.error('Failed to generate workout:', err);
    return {
      id: crypto.randomUUID(),
      title: `${workoutDuration}-Minute ${workoutFocus} Session`,
      focus: workoutFocus,
      difficulty: user.fitnessLevel,
      totalDuration: workoutDuration,
      exercises,
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
