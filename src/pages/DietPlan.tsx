import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';

export default function DietPlan() {
  const { dietPlan, generateAIAdvice } = useFitness();
  const [swappingItem, setSwappingItem] = useState<any>(null);
  const [swapSuggestion, setSwapSuggestion] = useState<string>('');
  const [loadingSwap, setLoadingSwap] = useState(false);

  const handleSwapClick = async (item: any, mealName: string) => {
    setSwappingItem(item);
    setSwapSuggestion('');
    setLoadingSwap(true);
    
    const prompt = `I want to swap "${item.name}" (${item.amount}) from my ${mealName}. Its macros are ${item.cal} kcal, ${item.p}g Protein, ${item.c}g Carbs, ${item.f}g Fats. Suggest 2 alternative foods that have very similar macros. Keep it concise and format with markdown.`;
    const response = await generateAIAdvice(prompt);
    
    setSwapSuggestion(response);
    setLoadingSwap(false);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Nutrition Plan</h1>
        <p className="text-slate-500 mt-1">Your personalized daily macros and meals</p>
      </header>

      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-slate-400 mb-1">Calories</p>
              <p className="text-2xl font-bold text-orange-400">{dietPlan.dailyTotal.cal}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Protein</p>
              <p className="text-2xl font-bold text-blue-400">{dietPlan.dailyTotal.p}g</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Carbs</p>
              <p className="text-2xl font-bold text-green-400">{dietPlan.dailyTotal.c}g</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Fats</p>
              <p className="text-2xl font-bold text-purple-400">{dietPlan.dailyTotal.f}g</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {dietPlan.meals.map((meal: any) => (
          <Card key={meal.id} className="shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg text-slate-800">{meal.name}</CardTitle>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-700">{meal.total.cal} kcal</span>
                </div>
              </div>
              <div className="flex space-x-3 text-xs text-slate-500 mt-2">
                <span>P: {meal.total.p}g</span>
                <span>C: {meal.total.c}g</span>
                <span>F: {meal.total.f}g</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[260px]">
                <div className="p-4 space-y-4">
                  {meal.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center group">
                      <div>
                        <p className="font-medium text-sm text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.amount}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right text-xs text-slate-500">
                          <p className="font-medium text-slate-700">{item.cal} kcal</p>
                          <p>P:{item.p} C:{item.c} F:{item.f}</p>
                        </div>
                        <Dialog>
                          <DialogTrigger render={
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => handleSwapClick(item, meal.name)}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          } />
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                <Sparkles className="w-5 h-5 text-blue-600" />
                                <span>AI Swap Suggestion</span>
                              </DialogTitle>
                            </DialogHeader>
                            <div className="mt-4">
                              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                                <p className="text-sm text-slate-500 mb-1">Swapping out:</p>
                                <p className="font-semibold text-slate-800">{item.name} ({item.amount})</p>
                                <p className="text-xs text-slate-500 mt-1">{item.cal} kcal | P:{item.p}g | C:{item.c}g | F:{item.f}g</p>
                              </div>
                              
                              {loadingSwap ? (
                                <div className="flex flex-col items-center justify-center py-8 text-blue-600">
                                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                  <span className="text-sm">Finding macro-friendly alternatives...</span>
                                </div>
                              ) : (
                                <div className="markdown-body prose prose-sm max-w-none">
                                  <Markdown>{swapSuggestion}</Markdown>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
