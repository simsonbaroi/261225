import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch } from "wouter";
import { queryClient } from "@/lib/queryClient";
import Index from "./pages/Index";
import Outpatient from "./pages/Outpatient";
import Inpatient from "./pages/Inpatient";
import Database from "./pages/Database";
import AIAnalytics from "./pages/AIAnalytics";
import NotFound from "./pages/NotFound";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <Switch>
          <Route path="/" component={Index} />
          <Route path="/outpatient" component={Outpatient} />
          <Route path="/inpatient" component={Inpatient} />
          <Route path="/database" component={Database} />
          <Route path="/ai-analytics" component={AIAnalytics} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
