import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Scheduling from "@/pages/scheduling";
import Staff from "@/pages/staff";
import Analytics from "@/pages/analytics";
import Predictions from "@/pages/predictions";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/Login";
import Sidebar from "@/components/sidebar";

function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        <Switch>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/scheduling" component={Scheduling} />
          <Route path="/staff" component={Staff} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/predictions" component={Predictions} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/login" component={LoginPage} />
      <Route component={MainLayout} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
