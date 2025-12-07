import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DemandChart from '@/components/demand-chart';
import ScheduleOverview from '@/components/schedule-overview';
import { 
  Users, 
  Percent, 
  Clock, 
  DollarSign, 
  Brain, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Calendar,
  UserPlus,
  BarChart3,
  Sparkles,
  Bell
} from 'lucide-react';
import { AiRecommendation } from '@shared/schema';

interface AnalyticsMetrics {
  activeStaff: number;
  scheduleEfficiency: number;
  avgShiftLength: string;
  laborCostSavings: number;
}

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<AnalyticsMetrics>({
    queryKey: ['/api/analytics/metrics'],
  });

  const { data: recommendations, isLoading: recommendationsLoading } = useQuery<AiRecommendation[]>({
    queryKey: ['/api/recommendations', { isRead: false }],
  });

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'optimization':
        return 'bg-blue-50 border-blue-200';
      case 'cost_reduction':
        return 'bg-amber-50 border-amber-200';
      case 'training':
        return 'bg-green-50 border-green-200';
      case 'alert':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getRecommendationTextColor = (type: string) => {
    switch (type) {
      case 'optimization':
        return 'text-blue-900';
      case 'cost_reduction':
        return 'text-amber-900';
      case 'training':
        return 'text-green-900';
      case 'alert':
        return 'text-red-900';
      default:
        return 'text-gray-900';
    }
  };

  const getRecommendationDescColor = (type: string) => {
    switch (type) {
      case 'optimization':
        return 'text-blue-700';
      case 'cost_reduction':
        return 'text-amber-700';
      case 'training':
        return 'text-green-700';
      case 'alert':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-600">AI Active</span>
              </div>
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Key Performance Indicators */}
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
                  <p className="text-sm font-medium text-gray-500">Active Staff</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metricsLoading ? '...' : metrics?.activeStaff || 0}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600 font-medium">↗ 8.2%</span>
                <span className="text-sm text-gray-500 ml-1">from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Percent className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Schedule Efficiency</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metricsLoading ? '...' : `${metrics?.scheduleEfficiency || 0}%`}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600 font-medium">↗ 3.1%</span>
                <span className="text-sm text-gray-500 ml-1">optimization</span>
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
                  <p className="text-sm font-medium text-gray-500">Avg. Shift Length</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metricsLoading ? '...' : `${metrics?.avgShiftLength || '0'}h`}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-red-600 font-medium">↘ 0.3h</span>
                <span className="text-sm text-gray-500 ml-1">optimized</span>
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
                  <p className="text-sm font-medium text-gray-500">Labor Cost Savings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metricsLoading ? '...' : `$${metrics?.laborCostSavings || 0}`}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Today's Schedule Overview */}
            <Card>
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle>Today's Schedule</CardTitle>
                  <Button size="sm">
                    <Sparkles className="h-4 w-4 mr-2 text-green-500" />
                    AI Optimize
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ScheduleOverview />
              </CardContent>
            </Card>

            {/* Demand Forecasting Chart */}
            <Card>
              <CardHeader className="border-b border-gray-100">
                <CardTitle>Demand Forecast</CardTitle>
                <p className="text-sm text-gray-500 mt-1">AI-powered predictions for the next 7 days</p>
              </CardHeader>
              <CardContent className="p-6">
                <DemandChart height={300} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* AI Recommendations */}
            <Card>
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center">
                  <Brain className="h-5 w-5 text-green-500 mr-2" />
                  <CardTitle>AI Recommendations</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {recommendationsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : recommendations && recommendations.length > 0 ? (
                  recommendations.slice(0, 3).map((rec) => (
                    <div key={rec.id} className={`flex items-start space-x-3 p-3 rounded-lg border ${getRecommendationColor(rec.type)}`}>
                      <div className="flex-shrink-0 w-2 h-2 bg-current rounded-full mt-2 opacity-60"></div>
                      <div>
                        <p className={`text-sm font-medium ${getRecommendationTextColor(rec.type)}`}>
                          {rec.title}
                        </p>
                        <p className={`text-sm mt-1 ${getRecommendationDescColor(rec.type)}`}>
                          {rec.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No new recommendations</p>
                )}
              </CardContent>
            </Card>

            {/* Real-Time Alerts */}
            <Card>
              <CardHeader className="border-b border-gray-100">
                <CardTitle>Live Alerts</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Staff Shortage</p>
                    <p className="text-xs text-red-600">Kitchen understaffed for lunch rush</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Optimal Coverage</p>
                    <p className="text-xs text-green-600">Evening shift fully staffed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="border-b border-gray-100">
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                  <span className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-500 mr-3" />
                    <span className="text-sm font-medium">Generate Weekly Schedule</span>
                  </span>
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                </Button>
                
                <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                  <span className="flex items-center">
                    <UserPlus className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-sm font-medium">Find Coverage</span>
                  </span>
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                </Button>
                
                <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                  <span className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-purple-500 mr-3" />
                    <span className="text-sm font-medium">View Reports</span>
                  </span>
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                </Button>
                
                <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                  <span className="flex items-center">
                    <Clock className="h-5 w-5 text-amber-500 mr-3" />
                    <span className="text-sm font-medium">Manage Availability</span>
                  </span>
                  <TrendingUp className="h-4 w-4 text-gray-400" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Weekly Schedule Preview */}
        <Card className="mt-8">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <CardTitle>Weekly Schedule Overview</CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Previous Week</Button>
                <Button size="sm">This Week</Button>
                <Button variant="outline" size="sm">Next Week</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => {
                const staffCounts = [
                  [5, 8, 6], [4, 6, 5], [5, 7, 6], [6, 9, 8], [6, 10, 12], [7, 12, 14], [6, 8, 7]
                ];
                const dayStaff = staffCounts[index];
                
                return (
                  <div key={day} className="text-center">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">{day}</h4>
                    <div className="space-y-2">
                      <div className="bg-blue-100 p-2 rounded text-xs">
                        <p className="font-medium text-blue-900">{dayStaff[0]} Staff</p>
                        <p className="text-blue-700">Morning</p>
                      </div>
                      <div className="bg-green-100 p-2 rounded text-xs">
                        <p className="font-medium text-green-900">{dayStaff[1]} Staff</p>
                        <p className="text-green-700">Afternoon</p>
                      </div>
                      <div className="bg-purple-100 p-2 rounded text-xs">
                        <p className="font-medium text-purple-900">{dayStaff[2]} Staff</p>
                        <p className="text-purple-700">Evening</p>
                      </div>
                    </div>
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
