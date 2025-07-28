import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DemandChart from '@/components/demand-chart';
import { Brain, TrendingUp, AlertTriangle, Calendar, Users, Clock, Target } from 'lucide-react';
import { DemandForecast } from '@shared/schema';
import { generatePredictions, calculateAccuracy, getRecommendations } from '@/lib/predictions';

export default function Predictions() {
  const [timeframe, setTimeframe] = useState('7days');
  const [predictionType, setPredictionType] = useState('demand');

  const { data: forecasts, isLoading } = useQuery<DemandForecast[]>({
    queryKey: ['/api/demand-forecasts'],
  });

  const predictions = generatePredictions(forecasts || [], timeframe);
  const accuracy = calculateAccuracy(forecasts || []);
  const recommendations = getRecommendations(predictions);

  const getPredictionColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-100 text-green-800';
    if (confidence >= 75) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 90) return '🟢';
    if (confidence >= 75) return '🟡';
    return '🔴';
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Brain className="h-6 w-6 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">AI Predictions</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">7 Days</SelectItem>
                  <SelectItem value="14days">14 Days</SelectItem>
                  <SelectItem value="30days">30 Days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={predictionType} onValueChange={setPredictionType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demand">Demand</SelectItem>
                  <SelectItem value="staffing">Staffing</SelectItem>
                  <SelectItem value="costs">Costs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* AI Model Performance */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Prediction Accuracy</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : `${accuracy.overall}%`}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-green-600 font-medium">↗ 2.3%</span>
                <span className="text-sm text-gray-500 ml-1">improved</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Model Confidence</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : `${accuracy.confidence}%`}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-blue-600 font-medium">High</span>
                <span className="text-sm text-gray-500 ml-1">reliability</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Brain className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Learning Rate</p>
                  <p className="text-2xl font-bold text-gray-900">Active</p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-purple-600 font-medium">Adaptive</span>
                <span className="text-sm text-gray-500 ml-1">algorithm</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Alerts Generated</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {recommendations.length}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-amber-600 font-medium">Active</span>
                <span className="text-sm text-gray-500 ml-1">insights</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Predictions */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Demand Forecast */}
            <Card>
              <CardHeader className="border-b border-gray-100">
                <CardTitle>Advanced Demand Forecasting</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Machine learning predictions with confidence intervals</p>
              </CardHeader>
              <CardContent className="p-6">
                <DemandChart height={300} />
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Peak Hours</p>
                    <p className="text-lg font-bold text-blue-800">7-9 PM</p>
                    <p className="text-xs text-blue-600">Friday-Saturday</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900">Optimal Staffing</p>
                    <p className="text-lg font-bold text-green-800">12-15</p>
                    <p className="text-xs text-green-600">servers needed</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-900">Revenue Impact</p>
                    <p className="text-lg font-bold text-purple-800">+8.2%</p>
                    <p className="text-xs text-purple-600">with optimization</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Future Predictions */}
            <Card>
              <CardHeader className="border-b border-gray-100">
                <CardTitle>Upcoming Predictions</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Next {timeframe} forecast breakdown</p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {predictions.map((prediction, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-medium">
                          {prediction.day}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{prediction.date}</p>
                          <p className="text-sm text-gray-500">
                            {prediction.predictedDemand} customers expected
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getPredictionColor(prediction.confidence)}>
                          {getConfidenceIcon(prediction.confidence)} {prediction.confidence}%
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          {prediction.recommendedStaff} staff
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* AI Insights */}
            <Card>
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center">
                  <Brain className="h-5 w-5 text-purple-500 mr-2" />
                  <CardTitle>AI Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        rec.priority === 'high' ? 'bg-red-500' :
                        rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{rec.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                        <Badge 
                          variant="secondary" 
                          className="mt-2"
                        >
                          {rec.impact}% impact
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Model Statistics */}
            <Card>
              <CardHeader className="border-b border-gray-100">
                <CardTitle>Model Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Demand Accuracy</span>
                  <span className="text-sm text-green-600 font-medium">{accuracy.demand}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${accuracy.demand}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Staffing Accuracy</span>
                  <span className="text-sm text-blue-600 font-medium">{accuracy.staffing}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${accuracy.staffing}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Cost Predictions</span>
                  <span className="text-sm text-purple-600 font-medium">{accuracy.cost}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${accuracy.cost}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="border-b border-gray-100">
                <CardTitle>Prediction Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-3" />
                  Generate Schedule from Predictions
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-3" />
                  Auto-assign Staff
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-3" />
                  Set Alert Thresholds
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-3" />
                  Export Predictions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Historical Accuracy */}
        <Card className="mt-8">
          <CardHeader className="border-b border-gray-100">
            <CardTitle>Historical Prediction Accuracy</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Model performance over time</p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - 6 + i);
                const accuracy = 85 + Math.random() * 15;
                
                return (
                  <div key={i} className="text-center">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <div className="h-24 bg-gray-100 rounded-lg flex items-end p-2">
                      <div 
                        className={`w-full rounded ${
                          accuracy >= 90 ? 'bg-green-500' :
                          accuracy >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ height: `${accuracy}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {accuracy.toFixed(1)}%
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
