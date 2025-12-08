import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { StackHandler, StackProvider, StackTheme } from "@stackframe/react";
import { stackClientApp } from "./lib/stack";
import Dashboard from "./pages/dashboard";
import Scheduling from "./pages/scheduling";
import Staff from "./pages/staff";
import Analytics from "./pages/analytics";
import Predictions from "./pages/predictions";
import Settings from "./pages/settings";
import NotFound from "./pages/not-found";
import LoginPage from "./pages/Login";
import Sidebar from "./components/sidebar";
import RequireLogin from "./components/RequireLogin";
import { Suspense } from "react";

function HandlerRoutes() {
  const [location] = useLocation();
  return <StackHandler app={stackClientApp} location={location} fullPage />;
}

function MainLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50">
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

function ProtectedLayout() {
  return (
    <RequireLogin>
      <MainLayout />
    </RequireLogin>
  );
}

export default function App() {
  return (
    <Suspense fallback={"Loading..."}>
      <StackProvider app={stackClientApp}>
        <StackTheme>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Switch>
                <Route path="/handler/:rest*" component={HandlerRoutes} />
                <Route path="/" component={LoginPage} />
                <Route path="/login" component={LoginPage} />
                <Route component={ProtectedLayout} />
              </Switch>
            </TooltipProvider>
          </QueryClientProvider>
        </StackTheme>
      </StackProvider>
    </Suspense>
  );
}
