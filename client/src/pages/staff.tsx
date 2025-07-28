import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Staff as StaffType, InsertStaff } from '@shared/schema';
import { Users, Plus, Search, Mail, Phone, Clock, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertStaffSchema } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function Staff() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: staff, isLoading } = useQuery<StaffType[]>({
    queryKey: ['/api/staff'],
  });

  const createStaffMutation = useMutation({
    mutationFn: async (data: InsertStaff) => {
      return apiRequest('POST', '/api/staff', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/staff'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Staff Added",
        description: "New staff member has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add staff member.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertStaff>({
    resolver: zodResolver(insertStaffSchema),
    defaultValues: {
      name: '',
      position: '',
      hourlyRate: '',
      email: '',
      phone: '',
      availability: {},
      skills: [],
      isActive: true,
    },
  });

  const onSubmit = (data: InsertStaff) => {
    createStaffMutation.mutate(data);
  };

  const filteredStaff = staff?.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getPositionColor = (position: string) => {
    switch (position.toLowerCase()) {
      case 'head server':
      case 'manager':
        return 'bg-purple-100 text-purple-800';
      case 'server':
        return 'bg-blue-100 text-blue-800';
      case 'line cook':
      case 'cook':
        return 'bg-orange-100 text-orange-800';
      case 'host':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Staff Member</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select position" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Server">Server</SelectItem>
                              <SelectItem value="Head Server">Head Server</SelectItem>
                              <SelectItem value="Line Cook">Line Cook</SelectItem>
                              <SelectItem value="Host">Host</SelectItem>
                              <SelectItem value="Manager">Manager</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hourlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Rate ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="15.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createStaffMutation.isPending}>
                        {createStaffMutation.isPending ? 'Adding...' : 'Add Staff'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-500 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Staff</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : staff?.length || 0}
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
                  <p className="text-sm font-medium text-gray-500">Available Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : Math.floor((staff?.length || 0) * 0.8)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-500 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Top Performers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading ? '...' : Math.floor((staff?.length || 0) * 0.3)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-500 mr-4" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Avg. Hourly Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${isLoading ? '...' : (staff?.reduce((sum, s) => sum + parseFloat(s.hourlyRate), 0) / (staff?.length || 1) || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search staff by name, position, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Staff List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
                    <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredStaff.length > 0 ? (
            filteredStaff.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <Badge className={`mb-3 ${getPositionColor(member.position)}`}>
                      {member.position}
                    </Badge>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center justify-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center justify-center">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>${member.hourlyRate}/hr</span>
                      </div>
                    </div>

                    {member.skills && member.skills.length > 0 && (
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {member.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No staff members found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
