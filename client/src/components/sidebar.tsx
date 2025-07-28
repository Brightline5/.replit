import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  ChartLine, 
  Calendar, 
  Users, 
  BarChart3, 
  Brain, 
  Settings,
  Utensils
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: ChartLine },
  { name: "Smart Scheduling", href: "/scheduling", icon: Calendar },
  { name: "Staff Management", href: "/staff", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "AI Predictions", href: "/predictions", icon: Brain },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto border-r" style={{ backgroundColor: "var(--sidebar-bg)" }}>
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-6">
          <Utensils className="h-8 w-8 text-green-400 mr-3" />
          <h1 className="text-xl font-bold text-white">RestaurantAI</h1>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || (item.href === "/dashboard" && location === "/");
              
              return (
                <Link key={item.name} href={item.href}>
                  <a className={cn(
                    "sidebar-nav-item",
                    isActive ? "sidebar-nav-item-active" : "sidebar-nav-item-inactive"
                  )}>
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile */}
        <div className="flex-shrink-0 p-4">
          <div className="flex items-center">
            <img
              className="inline-block h-10 w-10 rounded-full"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150"
              alt="Manager profile"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Alex Thompson</p>
              <p className="text-xs text-gray-300">Restaurant Manager</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
