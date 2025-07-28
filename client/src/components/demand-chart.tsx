import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { DemandForecast } from '@shared/schema';

interface DemandChartProps {
  height?: number;
}

export default function DemandChart({ height = 200 }: DemandChartProps) {
  const { data: forecasts, isLoading } = useQuery<DemandForecast[]>({
    queryKey: ['/api/demand-forecasts'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!forecasts || forecasts.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        No forecast data available
      </div>
    );
  }

  // Group forecasts by date and combine time slots
  const chartData = forecasts.reduce((acc, forecast) => {
    const dateKey = new Date(forecast.date).toLocaleDateString('en-US', { weekday: 'short' });
    
    if (!acc[dateKey]) {
      acc[dateKey] = {
        day: dateKey,
        predicted: 0,
        actual: 0,
        count: 0,
        actualCount: 0,
      };
    }
    
    acc[dateKey].predicted += forecast.predictedDemand;
    acc[dateKey].count += 1;
    
    if (forecast.actualDemand !== null) {
      acc[dateKey].actual += forecast.actualDemand;
      acc[dateKey].actualCount += 1;
    }
    
    return acc;
  }, {} as Record<string, any>);

  const data = Object.values(chartData).map((item: any) => ({
    day: item.day,
    predicted: Math.round(item.predicted / item.count),
    actual: item.actualCount > 0 ? Math.round(item.actual / item.actualCount) : null,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="day" 
          stroke="#666"
          fontSize={12}
        />
        <YAxis 
          stroke="#666"
          fontSize={12}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '6px',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="predicted"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ fill: '#3B82F6', r: 4 }}
          name="Predicted Demand"
        />
        <Line
          type="monotone"
          dataKey="actual"
          stroke="#10B981"
          strokeWidth={2}
          dot={{ fill: '#10B981', r: 4 }}
          name="Actual Demand"
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
