import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Staff, Shift } from '@shared/schema';
import { Calendar, Clock, Users, Sparkles, Plus } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function Scheduling() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();

  const { data: shifts, isLoading: shiftsLoading } = useQuery<Shift[]>({
    queryKey: ['/api/shifts', { date: selectedDate }],
  });

  const { data: staff, isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: ['/api/staff'],
  });

  const optimizeMutation = useMutation({
    mutationFn: async (date: string) => {
      const response = await fetch('/api/schedule/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date }),
      });
      if (!response.ok) throw new Error('Failed to optimize schedule');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Schedule Optimized",
        description: `Efficiency improved by ${data.efficiencyImprovement}% with potential savings of $${data.costSavings}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/shifts'] });
    },
    onError: () => {
      toast({
        title: "Optimization Failed", 
        description: "Unable to optimize schedule at this time",
        variant: "destructive",
      });
    },
  });

  const isLoading = shiftsLoading || staffLoading;

  const staffLookup = staff?.reduce((acc, s) => {
    acc[s.id] = s;
    return acc;
  }, {} as Record<string, Staff>) || {};

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-amber-100 text-amber-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const timeSlots = [
    { name: 'Morning', start: '06:00', end: '14:00' },
    { name: 'Afternoon', start: '14:00', end: '22:00' },
    { name: 'Evening', start: '22:00', end: '06:00' },
  ];

  const getShiftsForTimeSlot = (slot: { start: string; end: string }) => {
    if (!shifts) return [];
    return shifts.filter(shift => {
      const shiftStart = parseInt(shift.startTime.replace(':', ''));
      const slotStart = parseInt(slot.start.replace(':', ''));
      const slotEnd = parseInt(slot.end.replace(':', ''));
      
      if (slotEnd < slotStart) { // Overnight shift
        return shiftStart >= slotStart || shiftStart < slotEnd;
      }
      return shiftStart >= slotStart && shiftStart < slotEnd;
    });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Smart Scheduling</h1>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <Button
                onClick={() => optimizeMutation.mutate(selectedDate)}
                disabled={optimizeMutation.isPending}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {optimizeMutation.isPending ? 'Optimizing...' : 'AI Optimize'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Schedule Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Scheduled Staff</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : shifts?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-500 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Hours</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : shifts?.reduce((total, shift) => {
                      const start = new Date(`2000-01-01T${shift.startTime}`);
                      const end = new Date(`2000-01-01T${shift.endTime}`);
                      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                    }, 0).toFixed(0) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-500 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Coverage Rate</p>
                  <p className="text-2xl font-bold text-gray-900">95%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Time Slot Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {timeSlots.map((slot) => {
            const slotShifts = getShiftsForTimeSlot(slot);
            
            return (
              <Card key={slot.name}>
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center justify-between">
                    <span>{slot.name}</span>
                    <Badge variant="secondary">{slotShifts.length} staff</Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-500">{slot.start} - {slot.end}</p>
                </CardHeader>
                <CardContent className="p-6">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-16 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : slotShifts.length > 0 ? (
                    <div className="space-y-3">
                      {slotShifts.map((shift) => {
                        const staffMember = staffLookup[shift.staffId];
                        return (
                          <div key={shift.id} className="p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-gray-900">
                                {staffMember?.name || 'Unknown'}
                              </p>
                              <Badge className={getStatusColor(shift.status)}>
                                {shift.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{shift.position}</p>
                            <p className="text-sm text-gray-500">
                              {shift.startTime} - {shift.endTime}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No staff scheduled</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Shift
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Weekly View */}
        <Card className="mt-8">
          <CardHeader className="border-b border-gray-100">
            <CardTitle>Weekly Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - date.getDay() + i);
                const dateStr = date.toISOString().split('T')[0];
                const isSelected = dateStr === selectedDate;
                
                return (
                  <div
                    key={i}
                    className={`text-center p-4 rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-100 border-2 border-blue-500' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedDate(dateStr)}
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {date.getDate()}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {Math.floor(Math.random() * 15) + 10} staff
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
