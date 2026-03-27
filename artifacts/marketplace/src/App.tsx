import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserAuthProvider } from "@/contexts/user-auth";
import { I18nProvider } from "@/contexts/i18n";

// Pages
import Home from "@/pages/home";
import Requests from "@/pages/requests";
import RequestDetail from "@/pages/request-detail";
import CreateRequest from "@/pages/create-request";
import PlaceBid from "@/pages/place-bid";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";
import AuthRegister from "@/pages/auth-register";
import AuthLogin from "@/pages/auth-login";
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
      {/* New unified auth routes */}
      <Route path="/auth/register" component={AuthRegister} />
      <Route path="/auth/login" component={AuthLogin} />
      {/* Legacy redirects — map old supplier routes to new auth */}
      <Route path="/supplier/register" component={AuthRegister} />
      <Route path="/supplier/login" component={AuthLogin} />
      {/* Supplier dashboard (sellers only) */}
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
        <I18nProvider>
          <UserAuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </UserAuthProvider>
        </I18nProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
