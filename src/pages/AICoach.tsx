import React, { useState, useRef, useEffect } from 'react';
import { useFitness } from '../context/FitnessContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from '@/lib/utils';

export default function AICoach() {
  const { generateAIAdvice } = useFitness();
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: "Hi Bhavesh! I'm your personal AI fitness coach. How can I help you with your diet or workout today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const response = await generateAIAdvice(userMsg);
    
    setMessages(prev => [...prev, { role: 'ai', content: response }]);
    setIsLoading(false);
  };

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)] flex flex-col space-y-4">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">AI Coach</h1>
        <p className="text-slate-500 mt-1">Get personalized advice anytime</p>
      </header>

      <Card className="flex-1 flex flex-col shadow-sm border-slate-200 overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <div className="space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={cn("flex space-x-3", msg.role === 'user' ? "flex-row-reverse space-x-reverse" : "")}>
                <Avatar className={cn("w-8 h-8 shrink-0", msg.role === 'ai' ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600")}>
                  {msg.role === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </Avatar>
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                  msg.role === 'user' ? "bg-blue-600 text-white rounded-tr-none" : "bg-slate-100 text-slate-800 rounded-tl-none"
                )}>
                  {msg.role === 'ai' ? (
                    <div className="markdown-body prose prose-sm max-w-none dark:prose-invert">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex space-x-3">
                <Avatar className="w-8 h-8 bg-blue-100 text-blue-600 shrink-0">
                  <Bot className="w-5 h-5" />
                </Avatar>
                <div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-3 flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                  <span className="text-sm text-slate-500">Coach is typing...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex space-x-2">
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Ask about your diet, form, or alternatives..." 
              className="flex-1 rounded-full bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()} className="rounded-full w-10 h-10 p-0 bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
