import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dumbbell, PlayCircle, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Markdown from 'react-markdown';
import { exerciseMapping } from '../lib/exercise-mapping';

export default function WorkoutPlan() {
  const { workoutPlan } = useFitness();
  const today = new Date().getDay() === 0 ? 7 : new Date().getDay();
  const [activeTab, setActiveTab] = useState(today.toString());
  
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  const handleExerciseClick = (ex: any) => {
    setSelectedExercise(ex);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Workout Plan</h1>
        <p className="text-slate-500 mt-1">Your weekly training schedule</p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <ScrollArea className="w-full pb-2">
          <TabsList className="w-full justify-start inline-flex min-w-max">
            {workoutPlan.map((day: any) => (
              <TabsTrigger key={day.day} value={day.day.toString()} className="px-4">
                Day {day.day}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {workoutPlan.map((day: any) => (
          <TabsContent key={day.day} value={day.day.toString()} className="mt-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-xl flex items-center">
                  <Dumbbell className="w-5 h-5 mr-2 text-purple-600" />
                  {day.name} Routine
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {day.exercises.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <p className="text-xl font-medium mb-2">Rest Day</p>
                    <p>Take it easy and let your body recover.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {day.exercises.map((ex: any, idx: number) => {
                      const mapping = exerciseMapping[ex.name];
                      return (
                        <Dialog key={idx}>
                          <DialogTrigger render={
                            <button 
                              className="w-full text-left p-4 flex justify-between items-center hover:bg-slate-50 transition-colors cursor-pointer group gap-4"
                              onClick={() => handleExerciseClick(ex)}
                            >
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className="w-10 h-10 shrink-0 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                  <PlayCircle className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-slate-800 break-words">{ex.name}</p>
                                  <p className="text-sm text-slate-500 mt-1 truncate">Target: {ex.target}</p>
                                </div>
                              </div>
                              <div className="text-center shrink-0 bg-purple-50 px-3 py-2 rounded-lg border border-purple-100 min-w-[80px]">
                                <p className="font-bold text-purple-700">{ex.sets} Sets</p>
                                <p className="text-sm text-purple-600">{ex.reps} Reps</p>
                              </div>
                            </button>
                          } />
                          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-2xl">{ex.name}</DialogTitle>
                            </DialogHeader>
                            
                            <div className="mt-4 space-y-6">
                              {/* Visualisation */}
                              <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-center justify-center gap-4 p-4">
                                {mapping?.image ? (
                                  <>
                                    <img 
                                      src={mapping.image} 
                                      alt={`${ex.name} start position`}
                                      className="w-full sm:w-1/2 h-auto object-cover rounded-lg shadow-sm"
                                      referrerPolicy="no-referrer"
                                    />
                                    {mapping.image2 && (
                                      <img 
                                        src={mapping.image2} 
                                        alt={`${ex.name} end position`}
                                        className="w-full sm:w-1/2 h-auto object-cover rounded-lg shadow-sm"
                                        referrerPolicy="no-referrer"
                                      />
                                    )}
                                  </>
                                ) : (
                                  <div className="text-slate-400 flex flex-col items-center py-12">
                                    <Dumbbell className="w-12 h-12 mb-2 opacity-20" />
                                    <p>Visualization not available</p>
                                  </div>
                                )}
                              </div>

                              {/* Static Instructions */}
                              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                                <div className="flex items-center space-x-2 mb-4">
                                  <Info className="w-5 h-5 text-blue-600" />
                                  <h3 className="font-semibold text-blue-900">Form Guide & Instructions</h3>
                                </div>
                                
                                <div className="markdown-body prose prose-sm max-w-none prose-blue">
                                  {mapping?.instructions ? (
                                    <Markdown>{mapping.instructions.replace(/\\n/g, '\n')}</Markdown>
                                  ) : (
                                    <p>1. Maintain proper form.<br/>2. Control the movement.<br/>3. Breathe steadily throughout the exercise.</p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex justify-center">
                                <Button variant="outline" className="w-full" asChild>
                                  <a 
                                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' exercise form tutorial')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Watch on YouTube
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
