import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SupplierAuthProvider } from "@/contexts/supplier-auth";

// Pages
import Home from "@/pages/home";
import Requests from "@/pages/requests";
import RequestDetail from "@/pages/request-detail";
import CreateRequest from "@/pages/create-request";
import PlaceBid from "@/pages/place-bid";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";
import SupplierRegister from "@/pages/supplier-register";
import SupplierLogin from "@/pages/supplier-login";
import SupplierDashboard from "@/pages/supplier-dashboard";
import SupplierCredits from "@/pages/supplier-credits";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/requests" component={Requests} />
      <Route path="/request/new" component={CreateRequest} />
      <Route path="/requests/:id" component={RequestDetail} />
      <Route path="/requests/:id/bid" component={PlaceBid} />
      <Route path="/admin" component={Admin} />
      <Route path="/supplier/register" component={SupplierRegister} />
      <Route path="/supplier/login" component={SupplierLogin} />
      <Route path="/supplier/dashboard" component={SupplierDashboard} />
      <Route path="/supplier/credits" component={SupplierCredits} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SupplierAuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </SupplierAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
