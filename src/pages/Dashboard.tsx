import React, { useEffect, useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { CheckCircle2, Circle, Flame, Dumbbell, Utensils, Target, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Markdown from 'react-markdown';

export default function Dashboard() {
  const { dietPlan, workoutPlan, dailyTracking, toggleMealTracking, toggleWorkoutTracking, generateAIAdvice } = useFitness();
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  
  const today = new Date();
  const dateStr = format(today, 'yyyy-MM-dd');
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // 1-7 (Mon-Sun)
  
  const todayWorkout = workoutPlan.find((w: any) => w.day === dayOfWeek) || workoutPlan[0];
  const todayTracking = dailyTracking[dateStr] || { meals: {}, workouts: {} };

  useEffect(() => {
    const fetchInsight = async () => {
      const cachedInsight = localStorage.getItem(`insight_${dateStr}`);
      if (cachedInsight) {
        setInsight(cachedInsight);
        return;
      }
      
      setLoadingInsight(true);
      const prompt = `Generate a very short, 2-sentence highly personalized motivational insight for today. Today's workout is ${todayWorkout.name} (${todayWorkout.exercises.length} exercises). Today's calorie target is ${dietPlan.dailyTotal.cal} kcal.`;
      const response = await generateAIAdvice(prompt);
      setInsight(response);
      // Only cache successful responses, not error messages
      if (!response.includes('error occurred') && !response.includes('try again')) {
        localStorage.setItem(`insight_${dateStr}`, response);
      }
      setLoadingInsight(false);
    };
    fetchInsight();
  }, [dateStr, todayWorkout, dietPlan]);

  // Calculate progress
  const totalMeals = dietPlan.meals.length;
  const completedMeals = Object.values(todayTracking.meals).filter(Boolean).length;
  const mealProgress = totalMeals > 0 ? (completedMeals / totalMeals) * 100 : 0;

  const totalExercises = todayWorkout.exercises.length;
  const completedExercises = Object.values(todayTracking.workouts).filter(Boolean).length;
  const workoutProgress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Good Morning, Bhavesh!</h1>
        <p className="text-slate-500 mt-1">Here's your plan for {format(today, 'EEEE, MMMM do')}</p>
      </header>

      {/* AI Insight */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none shadow-md">
        <CardContent className="p-6 flex items-start space-x-4">
          <div className="bg-white/20 p-3 rounded-full shrink-0">
            <Sparkles className="w-6 h-6 text-blue-100" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-50 mb-1">AI Daily Insight</h3>
            {loadingInsight ? (
              <div className="animate-pulse flex space-x-2">
                <div className="h-4 bg-white/20 rounded w-3/4"></div>
              </div>
            ) : (
              <div className="text-sm text-blue-100 leading-relaxed">
                <Markdown>{insight}</Markdown>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-100">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-2">
              <Flame className="text-orange-600 w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{dietPlan.dailyTotal.cal}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Calories</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <Target className="text-blue-600 w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{dietPlan.dailyTotal.p}g</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Protein</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <Utensils className="text-green-600 w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{dietPlan.dailyTotal.c}g</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Carbs</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-100">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mb-2">
              <Dumbbell className="text-purple-600 w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{dietPlan.dailyTotal.f}g</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Fats</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's Diet */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg flex items-center">
                  <Utensils className="w-5 h-5 mr-2 text-green-600" />
                  Today's Diet
                </CardTitle>
                <CardDescription>Track your meals</CardDescription>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-green-600">{Math.round(mealProgress)}%</span>
              </div>
            </div>
            <Progress value={mealProgress} className="h-2 mt-2 bg-slate-100" />
          </CardHeader>
          <CardContent className="space-y-4">
            {dietPlan.meals.map((meal: any) => {
              const isCompleted = todayTracking.meals[meal.id];
              return (
                <div 
                  key={meal.id} 
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                    isCompleted ? "bg-green-50 border-green-200" : "bg-white border-slate-100 hover:border-green-300"
                  )}
                  onClick={() => toggleMealTracking(dateStr, meal.id)}
                >
                  <div className="flex items-center space-x-3">
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300" />
                    )}
                    <div>
                      <p className={cn("font-medium", isCompleted ? "text-green-800 line-through opacity-70" : "text-slate-800")}>
                        {meal.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {meal.total.cal} kcal • {meal.total.p}g P
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Today's Workout */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg flex items-center">
                  <Dumbbell className="w-5 h-5 mr-2 text-purple-600" />
                  Today's Workout
                </CardTitle>
                <CardDescription>{todayWorkout.name}</CardDescription>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-purple-600">{Math.round(workoutProgress)}%</span>
              </div>
            </div>
            <Progress value={workoutProgress} className="h-2 mt-2 bg-slate-100" />
          </CardHeader>
          <CardContent className="space-y-3">
            {todayWorkout.exercises.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="text-lg font-medium">Rest Day!</p>
                <p className="text-sm">Take time to recover.</p>
              </div>
            ) : (
              todayWorkout.exercises.map((ex: any, idx: number) => {
                const isCompleted = todayTracking.workouts[ex.name];
                return (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                      isCompleted ? "bg-purple-50 border-purple-200" : "bg-white border-slate-100 hover:border-purple-300"
                    )}
                    onClick={() => toggleWorkoutTracking(dateStr, ex.name)}
                  >
                    <div className="flex items-center space-x-3">
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-purple-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-300" />
                      )}
                      <div>
                        <p className={cn("font-medium text-sm", isCompleted ? "text-purple-800 line-through opacity-70" : "text-slate-800")}>
                          {ex.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {ex.sets} sets • {ex.reps} reps
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
