import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DemandChart from '@/components/demand-chart';
import { BarChart3, TrendingUp, Clock, DollarSign, Users, Calendar } from 'lucide-react';

interface AnalyticsMetrics {
  activeStaff: number;
  scheduleEfficiency: number;
  avgShiftLength: string;
  laborCostSavings: number;
}

export default function Analytics() {
  const { data: metrics, isLoading } = useQuery<AnalyticsMetrics>({
    queryKey: ['/api/analytics/metrics'],
  });

  const weeklyData = [
    { day: 'Mon', hours: 120, cost: 1800, efficiency: 92 },
    { day: 'Tue', hours: 98, cost: 1470, efficiency: 89 },
    { day: 'Wed', hours: 134, cost: 2010, efficiency: 94 },
    { day: 'Thu', hours: 156, cost: 2340, efficiency: 96 },
    { day: 'Fri', hours: 189, cost: 2835, efficiency: 98 },
    { day: 'Sat', hours: 201, cost: 3015, efficiency: 97 },
    { day: 'Sun', hours: 145, cost: 2175, efficiency: 95 },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            </div>
            <Badge variant="secondary">
              Real-time Data
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Staff Hours</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : '1,043'}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600 font-medium">↗ 5.2%</span>
                <span className="text-sm text-gray-500 ml-1">vs last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Efficiency Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : `${metrics?.scheduleEfficiency || 0}%`}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600 font-medium">↗ 3.1%</span>
                <span className="text-sm text-gray-500 ml-1">improvement</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">2.3min</p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600 font-medium">↘ 15s</span>
                <span className="text-sm text-gray-500 ml-1">faster</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Cost Savings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${isLoading ? '...' : metrics?.laborCostSavings || 0}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600 font-medium">↗ 12.4%</span>
                <span className="text-sm text-gray-500 ml-1">this month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Demand Forecast Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Demand Forecast</CardTitle>
              <p className="text-sm text-gray-500">Predicted vs actual customer demand</p>
            </CardHeader>
            <CardContent>
              <DemandChart height={300} />
            </CardContent>
          </Card>

          {/* Weekly Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance Metrics</CardTitle>
              <p className="text-sm text-gray-500">Staff hours, costs, and efficiency by day</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyData.map((day) => (
                  <div key={day.day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                        {day.day}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{day.hours} hours</p>
                        <p className="text-xs text-gray-500">${day.cost} cost</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        className={
                          day.efficiency >= 95 
                            ? 'bg-green-100 text-green-800'
                            : day.efficiency >= 90
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {day.efficiency}% efficiency
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Staff Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Sarah Johnson', score: 98, hours: 42 },
                  { name: 'Emma Chen', score: 96, hours: 38 },
                  { name: 'Marcus Rodriguez', score: 94, hours: 40 },
                ].map((performer, index) => (
                  <div key={performer.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{performer.name}</p>
                        <p className="text-xs text-gray-500">{performer.hours}h this week</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {performer.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Schedule Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">On-time arrivals</span>
                  <span className="text-sm text-green-600 font-medium">96.3%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '96.3%' }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Shift completions</span>
                  <span className="text-sm text-green-600 font-medium">98.7%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '98.7%' }}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Break compliance</span>
                  <span className="text-sm text-yellow-600 font-medium">87.4%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '87.4%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Regular Hours</p>
                    <p className="text-xs text-blue-700">832 hours</p>
                  </div>
                  <p className="text-sm font-bold text-blue-900">$12,480</p>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-amber-900">Overtime</p>
                    <p className="text-xs text-amber-700">64 hours</p>
                  </div>
                  <p className="text-sm font-bold text-amber-900">$1,440</p>
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-900">Savings</p>
                    <p className="text-xs text-green-700">AI optimization</p>
                  </div>
                  <p className="text-sm font-bold text-green-900">-$2,340</p>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">Total Labor Cost</p>
                    <p className="text-lg font-bold">$11,580</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
