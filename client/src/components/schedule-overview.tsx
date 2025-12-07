import { useQuery } from '@tanstack/react-query';
import { Staff, Shift } from '@shared/schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Check, User } from 'lucide-react';

export default function ScheduleOverview() {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: shifts, isLoading: shiftsLoading } = useQuery<Shift[]>({
    queryKey: ['/api/shifts', { date: today }],
  });

  const { data: staff, isLoading: staffLoading } = useQuery<Staff[]>({
    queryKey: ['/api/staff'],
  });

  const isLoading = shiftsLoading || staffLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg animate-pulse">
            <div className="h-10 w-10 bg-gray-300 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/3" />
              <div className="h-3 bg-gray-300 rounded w-1/4" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-20" />
              <div className="h-6 bg-gray-300 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!shifts || shifts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No shifts scheduled for today</p>
      </div>
    );
  }

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Check className="w-3 h-3 mr-1" />;
      case 'scheduled':
        return <Clock className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {shifts.map((shift) => {
        const staffMember = staffLookup[shift.staffId];
        return (
          <div key={shift.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                {staffMember?.name.split(' ').map(n => n[0]).join('') || '?'}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {staffMember?.name || 'Unknown Staff'}
              </p>
              <p className="text-sm text-gray-500">{shift.position}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {shift.startTime} - {shift.endTime}
              </p>
              <Badge className={`text-xs font-medium ${getStatusColor(shift.status)}`}>
                {getStatusIcon(shift.status)}
                {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
              </Badge>
            </div>
          </div>
        );
      })}
      
      <div className="mt-6 flex space-x-3">
        <Button className="flex-1">
          View Full Schedule
        </Button>
        <Button variant="outline" className="flex-1">
          Add Shift
        </Button>
      </div>
    </div>
  );
}
