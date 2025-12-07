import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Bell, Shield, Brain, Clock, DollarSign, Users, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    staffShortage: true,
    scheduleChanges: true,
    aiRecommendations: true,
    emailAlerts: false,
    smsAlerts: true,
  });

  const [aiSettings, setAiSettings] = useState({
    autoOptimization: true,
    predictionAccuracy: 'high',
    learningMode: 'adaptive',
    confidenceThreshold: 85,
  });

  const [businessSettings, setBusinessSettings] = useState({
    restaurantName: 'Bella Vista Restaurant',
    timezone: 'America/New_York',
    currency: 'USD',
    operatingHours: {
      open: '09:00',
      close: '23:00',
    },
    overtimeThreshold: 40,
    minimumStaffing: 3,
  });

  const { toast } = useToast();

  const handleSave = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `${section} settings have been updated successfully.`,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Settings className="h-6 w-6 text-gray-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>
            <Badge variant="secondary">
              RestaurantAI v2.1.0
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="ai">AI Settings</TabsTrigger>
            <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="restaurant-name">Restaurant Name</Label>
                    <Input
                      id="restaurant-name"
                      value={businessSettings.restaurantName}
                      onChange={(e) => setBusinessSettings(prev => ({
                        ...prev,
                        restaurantName: e.target.value
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select 
                      value={businessSettings.timezone}
                      onValueChange={(value) => setBusinessSettings(prev => ({
                        ...prev,
                        timezone: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select 
                      value={businessSettings.currency}
                      onValueChange={(value) => setBusinessSettings(prev => ({
                        ...prev,
                        currency: value
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="open-time">Opening Time</Label>
                    <Input
                      id="open-time"
                      type="time"
                      value={businessSettings.operatingHours.open}
                      onChange={(e) => setBusinessSettings(prev => ({
                        ...prev,
                        operatingHours: { ...prev.operatingHours, open: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="close-time">Closing Time</Label>
                    <Input
                      id="close-time"
                      type="time"
                      value={businessSettings.operatingHours.close}
                      onChange={(e) => setBusinessSettings(prev => ({
                        ...prev,
                        operatingHours: { ...prev.operatingHours, close: e.target.value }
                      }))}
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave('General')}>
                  Save General Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Staff Shortage Alerts</Label>
                      <p className="text-sm text-gray-500">Get notified when shifts are understaffed</p>
                    </div>
                    <Switch
                      checked={notifications.staffShortage}
                      onCheckedChange={(checked) => setNotifications(prev => ({
                        ...prev,
                        staffShortage: checked
                      }))}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Schedule Changes</Label>
                      <p className="text-sm text-gray-500">Notifications for shift modifications</p>
                    </div>
                    <Switch
                      checked={notifications.scheduleChanges}
                      onCheckedChange={(checked) => setNotifications(prev => ({
                        ...prev,
                        scheduleChanges: checked
                      }))}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">AI Recommendations</Label>
                      <p className="text-sm text-gray-500">AI-generated insights and suggestions</p>
                    </div>
                    <Switch
                      checked={notifications.aiRecommendations}
                      onCheckedChange={(checked) => setNotifications(prev => ({
                        ...prev,
                        aiRecommendations: checked
                      }))}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Email Alerts</Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.emailAlerts}
                      onCheckedChange={(checked) => setNotifications(prev => ({
                        ...prev,
                        emailAlerts: checked
                      }))}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">SMS Alerts</Label>
                      <p className="text-sm text-gray-500">Critical alerts via SMS</p>
                    </div>
                    <Switch
                      checked={notifications.smsAlerts}
                      onCheckedChange={(checked) => setNotifications(prev => ({
                        ...prev,
                        smsAlerts: checked
                      }))}
                    />
                  </div>
                </div>

                <Button onClick={() => handleSave('Notification')}>
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Settings */}
          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  AI Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Auto-Optimization</Label>
                      <p className="text-sm text-gray-500">Allow AI to automatically optimize schedules</p>
                    </div>
                    <Switch
                      checked={aiSettings.autoOptimization}
                      onCheckedChange={(checked) => setAiSettings(prev => ({
                        ...prev,
                        autoOptimization: checked
                      }))}
                    />
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base font-medium">Prediction Accuracy Level</Label>
                    <p className="text-sm text-gray-500 mb-2">Higher accuracy requires more processing time</p>
                    <Select 
                      value={aiSettings.predictionAccuracy}
                      onValueChange={(value) => setAiSettings(prev => ({
                        ...prev,
                        predictionAccuracy: value
                      }))}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="maximum">Maximum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base font-medium">Learning Mode</Label>
                    <p className="text-sm text-gray-500 mb-2">How the AI adapts to your restaurant's patterns</p>
                    <Select 
                      value={aiSettings.learningMode}
                      onValueChange={(value) => setAiSettings(prev => ({
                        ...prev,
                        learningMode: value
                      }))}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">Conservative</SelectItem>
                        <SelectItem value="adaptive">Adaptive</SelectItem>
                        <SelectItem value="aggressive">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base font-medium">Confidence Threshold ({aiSettings.confidenceThreshold}%)</Label>
                    <p className="text-sm text-gray-500 mb-2">Minimum confidence level for AI recommendations</p>
                    <input
                      type="range"
                      min="50"
                      max="95"
                      step="5"
                      value={aiSettings.confidenceThreshold}
                      onChange={(e) => setAiSettings(prev => ({
                        ...prev,
                        confidenceThreshold: parseInt(e.target.value)
                      }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>50%</span>
                      <span>95%</span>
                    </div>
                  </div>
                </div>

                <Button onClick={() => handleSave('AI')}>
                  Save AI Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduling Settings */}
          <TabsContent value="scheduling" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Scheduling Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="overtime-threshold">Overtime Threshold (hours/week)</Label>
                    <Input
                      id="overtime-threshold"
                      type="number"
                      value={businessSettings.overtimeThreshold}
                      onChange={(e) => setBusinessSettings(prev => ({
                        ...prev,
                        overtimeThreshold: parseInt(e.target.value)
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimum-staffing">Minimum Staff per Shift</Label>
                    <Input
                      id="minimum-staffing"
                      type="number"
                      value={businessSettings.minimumStaffing}
                      onChange={(e) => setBusinessSettings(prev => ({
                        ...prev,
                        minimumStaffing: parseInt(e.target.value)
                      }))}
                    />
                  </div>
                </div>
                
                <Button onClick={() => handleSave('Scheduling')}>
                  Save Scheduling Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Staff Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Auto-assign Shifts</Label>
                      <p className="text-sm text-gray-500">Automatically assign shifts based on availability</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Respect Availability Preferences</Label>
                      <p className="text-sm text-gray-500">Prioritize staff preferred time slots</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Balance Workload</Label>
                      <p className="text-sm text-gray-500">Distribute hours evenly among staff</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">Data Retention Period</Label>
                    <p className="text-sm text-gray-500 mb-2">How long to keep historical data</p>
                    <Select defaultValue="2years">
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6months">6 Months</SelectItem>
                        <SelectItem value="1year">1 Year</SelectItem>
                        <SelectItem value="2years">2 Years</SelectItem>
                        <SelectItem value="5years">5 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Add extra security to your account</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable 2FA
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Data Export</Label>
                      <p className="text-sm text-gray-500">Download your restaurant data</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Export Data
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Account Backup</Label>
                      <p className="text-sm text-gray-500">Backup your settings and data</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Create Backup
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                    <div>
                      <Label className="text-base font-medium text-red-600">Delete Account</Label>
                      <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
