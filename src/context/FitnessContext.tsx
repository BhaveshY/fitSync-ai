import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, signInWithGoogle, logOut, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

// Initial Data from PDF
const initialDietPlan = {
  meals: [
    {
      id: 'meal1',
      name: 'Meal 1 (Breakfast)',
      items: [
        { name: 'Poha', amount: '55g', p: 4.62, f: 0, c: 42.13, cal: 192.5 },
        { name: 'Amfit whey protein', amount: '30g', p: 22.8, f: 2.76, c: 1.65, cal: 120.6 },
        { name: "Cow's Milk", amount: '200ml', p: 7, f: 7, c: 9, cal: 130 },
        { name: 'Egg Whole', amount: '1 piece', p: 6, f: 5, c: 0, cal: 69 },
        { name: 'Cooking Oil', amount: '5g', p: 0, f: 5, c: 0, cal: 45 },
      ],
      total: { p: 40.42, f: 19.76, c: 52.78, cal: 557.1 }
    },
    {
      id: 'meal2',
      name: 'Meal 2 (Lunch)',
      items: [
        { name: 'Dal/Lentils', amount: '25g', p: 5.23, f: 0, c: 15.19, cal: 81.34 },
        { name: 'Veggies', amount: '150g', p: 1.5, f: 0, c: 12, cal: 54 },
        { name: 'Rice', amount: '50g', p: 5, f: 0, c: 38, cal: 172 },
        { name: 'Cooking Oil', amount: '12g', p: 0, f: 12, c: 0, cal: 108 },
      ],
      total: { p: 11.73, f: 12, c: 65.19, cal: 415.34 }
    },
    {
      id: 'snacks',
      name: 'Snacks',
      items: [
        { name: 'Fruits', amount: '150g', p: 0, f: 0, c: 33, cal: 132 },
        { name: 'Amfit whey protein', amount: '20g', p: 15.2, f: 1.84, c: 1.1, cal: 80.4 },
        { name: 'Almonds', amount: '15g', p: 2.4, f: 9.6, c: 1.65, cal: 102.6 },
      ],
      total: { p: 17.6, f: 11.44, c: 35.75, cal: 315 }
    },
    {
      id: 'dinner',
      name: 'Dinner',
      items: [
        { name: 'Veggies', amount: '150g', p: 1.5, f: 0, c: 12, cal: 54 },
        { name: 'Dal/Lentils', amount: '25g', p: 5.23, f: 0, c: 15.19, cal: 81.34 },
        { name: 'Chicken', amount: '130g', p: 31.2, f: 9.1, c: 0, cal: 206.7 },
        { name: 'Curd (Dahi)', amount: '200g', p: 8, f: 6, c: 10, cal: 126 },
        { name: 'Cooking Oil', amount: '12g', p: 0, f: 12, c: 0, cal: 108 },
        { name: 'Rice', amount: '60g', p: 6, f: 0, c: 45.6, cal: 206.4 },
      ],
      total: { p: 51.93, f: 27.1, c: 82.79, cal: 782.44 }
    }
  ],
  dailyTotal: { p: 121, f: 70, c: 236, cal: 2069 }
};

const initialWorkoutPlan = [
  {
    day: 1,
    name: 'Day 1',
    exercises: [
      { name: 'Dumbbell shoulder thrusters', sets: 3, reps: '12', target: 'Shoulders' },
      { name: 'Jumping Jacks', sets: 2, reps: '0-0', target: 'Full Body' },
      { name: 'Burpees', sets: 3, reps: '0-0', target: 'Full Body' },
      { name: 'Mountain Climbers', sets: 3, reps: '0-0', target: 'Abdominals' },
      { name: 'Crunches', sets: 3, reps: '12', target: 'Abdominals' },
      { name: 'Treadmill Workout (Beginner)', sets: 1, reps: '0-0', target: 'Full Body' }
    ]
  },
  {
    day: 2,
    name: 'Day 2',
    exercises: [
      { name: 'Dumbbell Flat bench press', sets: 3, reps: '12', target: 'Chest' },
      { name: 'Dumbbell Incline bench press', sets: 3, reps: '12', target: 'Chest' },
      { name: 'Overhead tricep extension - seated', sets: 3, reps: '12', target: 'Triceps' },
      { name: 'Dumbbell Lateral Raise', sets: 3, reps: '12', target: 'Shoulders' },
      { name: 'Seated Rowing - Single arm', sets: 3, reps: '12', target: 'Middle Back' },
      { name: 'Dumbbell Biceps Curls', sets: 3, reps: '12', target: 'Biceps' },
      { name: 'Dumbbell Hammer Curls', sets: 3, reps: '12', target: 'Biceps' },
      { name: 'Incline Treadmill', sets: 0, reps: '0-0', target: 'Cardio' }
    ]
  },
  {
    day: 3,
    name: 'Day 3',
    exercises: [
      { name: 'Smith Machine Back Squats', sets: 3, reps: '12', target: 'Quadriceps' },
      { name: 'Leg Extension', sets: 3, reps: '12', target: 'Quadriceps' },
      { name: 'Seated Leg Curls', sets: 3, reps: '12', target: 'Hamstrings' },
      { name: 'Seated Dumbbell calf raises', sets: 1, reps: '0-0', target: 'Calves' },
      { name: 'Cycling', sets: 1, reps: '10', target: 'Cardio' },
      { name: 'Incline Treadmill', sets: 1, reps: '0-0', target: 'Cardio' }
    ]
  },
  {
    day: 4,
    name: 'Day 4',
    exercises: [
      { name: 'Lat Pulldown - Wide Grip Bar', sets: 3, reps: '12', target: 'Lats' },
      { name: 'Barbell Bent-over Row', sets: 3, reps: '12', target: 'Middle Back' },
      { name: 'Barbell Biceps Curls', sets: 3, reps: '12', target: 'Biceps' },
      { name: 'Machine fly', sets: 3, reps: '12', target: 'Chest' },
      { name: 'Skull Crusher - EZ Bar', sets: 3, reps: '12', target: 'Triceps' },
      { name: 'Dumbbell Front Raise', sets: 3, reps: '12', target: 'Shoulders' },
      { name: 'Cable Face Pull', sets: 3, reps: '12', target: 'Shoulders' }
    ]
  },
  {
    day: 5,
    name: 'Day 5',
    exercises: [
      { name: 'Goblet Squats', sets: 1, reps: '0-0', target: 'Quadriceps' },
      { name: 'Leg Extension', sets: 3, reps: '12', target: 'Quadriceps' },
      { name: 'Seated Leg Curls', sets: 3, reps: '12', target: 'Hamstrings' },
      { name: 'Walking Lunges', sets: 3, reps: '12', target: 'Quadriceps' },
      { name: 'Cycling', sets: 1, reps: '10', target: 'Cardio' },
      { name: 'Incline Treadmill', sets: 1, reps: '0-0', target: 'Cardio' }
    ]
  },
  {
    day: 6,
    name: 'Day 6',
    exercises: [
      { name: 'Dumbbell shoulder thrusters', sets: 3, reps: '12', target: 'Shoulders' },
      { name: 'Farmer Walks', sets: 3, reps: '0-0', target: 'Forearms' },
      { name: 'Burpees', sets: 3, reps: '0-0', target: 'Full Body' },
      { name: 'Mountain Climbers', sets: 3, reps: '0-0', target: 'Abdominals' },
      { name: 'Crunches', sets: 3, reps: '12', target: 'Abdominals' },
      { name: 'Treadmill Workout (Beginner)', sets: 1, reps: '0-0', target: 'Full Body' }
    ]
  },
  {
    day: 7,
    name: 'Day 7',
    exercises: [] // Rest Day
  }
];

type ProgressEntry = {
  date: string;
  weight: number;
  shoulder: number;
  chest: number;
  waist: number;
  naval: number;
  hip: number;
  thigh: number;
  bicep: number;
  notes: string;
};

type FitnessContextType = {
  user: User | null;
  isAuthReady: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  dietPlan: any;
  setDietPlan: (plan: any) => void;
  workoutPlan: any;
  setWorkoutPlan: (plan: any) => void;
  progress: ProgressEntry[];
  addProgress: (entry: ProgressEntry) => void;
  dailyTracking: Record<string, { meals: Record<string, boolean>, workouts: Record<string, boolean> }>;
  toggleMealTracking: (date: string, mealId: string) => void;
  toggleWorkoutTracking: (date: string, exerciseName: string) => void;
  generateAIAdvice: (prompt: string) => Promise<string>;
  updatePlanWithAI: (latestProgress: ProgressEntry) => Promise<void>;
  isUpdatingPlan: boolean;
};

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

// Backend API helper -- calls our Vercel serverless function
const callGeminiAPI = async (prompt: string, responseMimeType?: string): Promise<string> => {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, responseMimeType }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `API error: ${res.status}`);
  }

  const data = await res.json();
  return data.text || '';
};

export const FitnessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  const [dietPlan, setDietPlan] = useState(initialDietPlan);
  const [workoutPlan, setWorkoutPlan] = useState(initialWorkoutPlan);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [dailyTracking, setDailyTracking] = useState<Record<string, { meals: Record<string, boolean>, workouts: Record<string, boolean> }>>({});
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Sync
  useEffect(() => {
    if (!isAuthReady) return;

    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      
      // Check if document exists, if not create it with initial data
      getDoc(userDocRef).then((docSnap) => {
        if (!docSnap.exists()) {
          setDoc(userDocRef, {
            uid: user.uid,
            dietPlan: JSON.stringify(initialDietPlan),
            workoutPlan: JSON.stringify(initialWorkoutPlan),
            progress: JSON.stringify([]),
            dailyTracking: JSON.stringify({})
          }).catch(err => handleFirestoreError(err, OperationType.CREATE, 'users/' + user.uid));
        }
      }).catch(err => handleFirestoreError(err, OperationType.GET, 'users/' + user.uid));

      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.dietPlan) setDietPlan(JSON.parse(data.dietPlan));
          if (data.workoutPlan) setWorkoutPlan(JSON.parse(data.workoutPlan));
          if (data.progress) setProgress(JSON.parse(data.progress));
          if (data.dailyTracking) setDailyTracking(JSON.parse(data.dailyTracking));
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'users/' + user.uid);
      });

      return () => unsubscribe();
    } else {
      // Reset to initial state when logged out
      setDietPlan(initialDietPlan);
      setWorkoutPlan(initialWorkoutPlan);
      setProgress([]);
      setDailyTracking({});
    }
  }, [user, isAuthReady]);

  // Save to Firestore helper
  const saveToFirestore = async (updates: any) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, updates, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users/' + user.uid);
    }
  };

  const addProgress = (entry: ProgressEntry) => {
    const newProgress = [...progress, entry];
    setProgress(newProgress);
    saveToFirestore({ progress: JSON.stringify(newProgress) });
    updatePlanWithAI(entry);
  };

  const toggleMealTracking = (date: string, mealId: string) => {
    const newTracking = { ...dailyTracking };
    const dayData = newTracking[date] || { meals: {}, workouts: {} };
    newTracking[date] = {
      ...dayData,
      meals: {
        ...dayData.meals,
        [mealId]: !dayData.meals[mealId]
      }
    };
    setDailyTracking(newTracking);
    saveToFirestore({ dailyTracking: JSON.stringify(newTracking) });
  };

  const toggleWorkoutTracking = (date: string, exerciseName: string) => {
    const newTracking = { ...dailyTracking };
    const dayData = newTracking[date] || { meals: {}, workouts: {} };
    newTracking[date] = {
      ...dayData,
      workouts: {
        ...dayData.workouts,
        [exerciseName]: !dayData.workouts[exerciseName]
      }
    };
    setDailyTracking(newTracking);
    saveToFirestore({ dailyTracking: JSON.stringify(newTracking) });
  };

  const generateAIAdvice = async (prompt: string) => {
    try {
      const contextPrompt = `
        You are an expert, award-winning AI fitness coach. 
        The user's current diet plan is: ${JSON.stringify(dietPlan)}
        The user's current workout plan is: ${JSON.stringify(workoutPlan)}
        The user's progress history is: ${JSON.stringify(progress)}
        
        User query: ${prompt}
        
        Provide a helpful, motivating, and highly personalized response. Keep it concise but informative. Format in Markdown.
      `;

      const text = await callGeminiAPI(contextPrompt);
      return text || "Sorry, I couldn't generate a response at this time.";
    } catch (error) {
      console.error("AI Error:", error);
      return "An error occurred while communicating with your AI coach. Please try again later.";
    }
  };

  const updatePlanWithAI = async (latestProgress: ProgressEntry) => {
    setIsUpdatingPlan(true);
    try {
      const prompt = `
        You are an expert AI fitness coach. The user just logged their weekly progress:
        Weight: ${latestProgress.weight}kg, Shoulder: ${latestProgress.shoulder}cm, Chest: ${latestProgress.chest}cm, Waist: ${latestProgress.waist}cm, Naval: ${latestProgress.naval}cm, Hip: ${latestProgress.hip}cm, Thigh: ${latestProgress.thigh}cm, Bicep: ${latestProgress.bicep}cm.
        Notes: ${latestProgress.notes}
        
        Current Diet Plan: ${JSON.stringify(dietPlan)}
        Current Workout Plan: ${JSON.stringify(workoutPlan)}
        
        Based on this new progress, suggest modifications to their diet and workout plan to keep them progressing.
        Return ONLY a JSON object with the following structure, no markdown formatting, no explanation:
        {
          "dietPlan": { ... updated diet plan object matching the current structure ... },
          "workoutPlan": [ ... updated workout plan array matching the current structure ... ],
          "coachMessage": "A short motivating message explaining the changes made."
        }
      `;

      const text = await callGeminiAPI(prompt, 'application/json');

      if (text) {
        const result = JSON.parse(text);
        
        const updates: any = {};
        if (result.dietPlan) {
          setDietPlan(result.dietPlan);
          updates.dietPlan = JSON.stringify(result.dietPlan);
        }
        if (result.workoutPlan) {
          setWorkoutPlan(result.workoutPlan);
          updates.workoutPlan = JSON.stringify(result.workoutPlan);
        }
        
        if (Object.keys(updates).length > 0) {
          saveToFirestore(updates);
        }
      }
    } catch (error) {
      console.error("Error updating plan with AI:", error);
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  return (
    <FitnessContext.Provider value={{
      user, isAuthReady, signIn: signInWithGoogle, signOut: logOut,
      dietPlan, setDietPlan,
      workoutPlan, setWorkoutPlan,
      progress, addProgress,
      dailyTracking, toggleMealTracking, toggleWorkoutTracking,
      generateAIAdvice, updatePlanWithAI, isUpdatingPlan
    }}>
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => {
  const context = useContext(FitnessContext);
  if (context === undefined) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
};
