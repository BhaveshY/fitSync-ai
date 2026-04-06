import React, { useState } from 'react';
import { useFitness } from '../context/FitnessContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Loader2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function Progress() {
  const { progress, addProgress, isUpdatingPlan } = useFitness();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    weight: '',
    shoulder: '',
    chest: '',
    waist: '',
    naval: '',
    hip: '',
    thigh: '',
    bicep: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProgress({
      date: new Date().toISOString(),
      weight: Number(formData.weight),
      shoulder: Number(formData.shoulder),
      chest: Number(formData.chest),
      waist: Number(formData.waist),
      naval: Number(formData.naval),
      hip: Number(formData.hip),
      thigh: Number(formData.thigh),
      bicep: Number(formData.bicep),
      notes: formData.notes
    });
    setIsOpen(false);
    setFormData({ weight: '', shoulder: '', chest: '', waist: '', naval: '', hip: '', thigh: '', bicep: '', notes: '' });
  };

  const chartData = progress.map(p => ({
    ...p,
    dateStr: format(new Date(p.date), 'MMM dd')
  }));

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Progress Tracking</h1>
          <p className="text-slate-500 mt-1">Log your weekly measurements</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button className="bg-blue-600 hover:bg-blue-700" />}>
            <Plus className="w-4 h-4 mr-2" /> Log Progress
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Log Weekly Progress</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" type="number" step="0.1" required value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shoulder">Shoulder (cm)</Label>
                  <Input id="shoulder" type="number" step="0.1" required value={formData.shoulder} onChange={e => setFormData({...formData, shoulder: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chest">Chest (cm)</Label>
                  <Input id="chest" type="number" step="0.1" required value={formData.chest} onChange={e => setFormData({...formData, chest: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waist">Waist (cm)</Label>
                  <Input id="waist" type="number" step="0.1" required value={formData.waist} onChange={e => setFormData({...formData, waist: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="naval">Naval (cm)</Label>
                  <Input id="naval" type="number" step="0.1" required value={formData.naval} onChange={e => setFormData({...formData, naval: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hip">Hip (cm)</Label>
                  <Input id="hip" type="number" step="0.1" required value={formData.hip} onChange={e => setFormData({...formData, hip: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thigh">Thigh (cm)</Label>
                  <Input id="thigh" type="number" step="0.1" required value={formData.thigh} onChange={e => setFormData({...formData, thigh: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bicep">Bicep (cm)</Label>
                  <Input id="bicep" type="number" step="0.1" required value={formData.bicep} onChange={e => setFormData({...formData, bicep: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes / How do you feel?</Label>
                <Textarea id="notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>
              <Button type="submit" className="w-full bg-blue-600">Save & Update Plan</Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {isUpdatingPlan && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 flex items-center space-x-4">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <div>
              <p className="font-semibold text-blue-900">AI is analyzing your progress...</p>
              <p className="text-sm text-blue-700">Updating your diet and workout plans based on your latest measurements.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle>Weight Trend</CardTitle>
          <CardDescription>Your weight loss journey over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="dateStr" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                <p>Log your first progress entry to see the chart.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progress.slice().reverse().map((p, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-800">{format(new Date(p.date), 'MMM dd, yyyy')}</span>
                    <span className="text-blue-600 font-bold">{p.weight} kg</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs text-slate-500 mb-2">
                    <div>Shoulder: {p.shoulder}cm</div>
                    <div>Chest: {p.chest}cm</div>
                    <div>Waist: {p.waist}cm</div>
                    <div>Naval: {p.naval}cm</div>
                    <div>Hip: {p.hip}cm</div>
                    <div>Thigh: {p.thigh}cm</div>
                    <div>Bicep: {p.bicep}cm</div>
                  </div>
                  {p.notes && <p className="text-sm text-slate-600 italic">"{p.notes}"</p>}
                </div>
              ))}
              {progress.length === 0 && (
                <p className="text-slate-500 text-center py-4">No history yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
