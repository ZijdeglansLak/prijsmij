import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserAuthProvider, useUserAuth } from "@/contexts/user-auth";
import { I18nProvider } from "@/contexts/i18n";
import { useEffect, useState } from "react";
import { QuootjeChatbot } from "@/components/quootje-chatbot";
import { CookieConsent } from "@/components/cookie-consent";

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
import AuthForgotPassword from "@/pages/auth-forgot-password";
import AuthResetPassword from "@/pages/auth-reset-password";
import AuthVerifyEmail from "@/pages/auth-verify-email";
import Profile from "@/pages/profile";
import SupplierDashboard from "@/pages/supplier-dashboard";
import SupplierCredits from "@/pages/supplier-credits";
import BetalingGeslaagd from "@/pages/betaling-geslaagd";
import SupplierLeads from "@/pages/supplier-leads";
import BuyerRequests from "@/pages/buyer-requests";
import OfflinePage from "@/pages/offline";
import StaticPage from "@/pages/static-page";

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
      {/* Auth routes */}
      <Route path="/auth/register" component={AuthRegister} />
      <Route path="/auth/login" component={AuthLogin} />
      <Route path="/auth/forgot-password" component={AuthForgotPassword} />
      <Route path="/auth/reset-password" component={AuthResetPassword} />
      <Route path="/auth/verify-email" component={AuthVerifyEmail} />
      {/* Profile */}
      <Route path="/profile" component={Profile} />
      {/* Legacy redirects */}
      <Route path="/supplier/register" component={AuthRegister} />
      <Route path="/supplier/login" component={AuthLogin} />
      {/* Supplier dashboard (sellers only) */}
      <Route path="/supplier/dashboard" component={SupplierDashboard} />
      <Route path="/supplier/credits" component={SupplierCredits} />
      <Route path="/betaling-geslaagd" component={BetalingGeslaagd} />
      <Route path="/supplier/leads" component={SupplierLeads} />
      <Route path="/my-requests" component={BuyerRequests} />
      <Route path="/pages/:slug" component={StaticPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function SiteGate({ children }: { children: React.ReactNode }) {
  const [offlineMode, setOfflineMode] = useState<boolean | null>(null);
  const { isAdmin, isLoggedIn } = useUserAuth();

  useEffect(() => {
    fetch("/api/site-status")
      .then(r => r.json())
      .then(d => setOfflineMode(d.offlineMode ?? false))
      .catch(() => setOfflineMode(false));
  }, []);

  if (offlineMode === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-8 h-8 rounded-full border-4 border-orange-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (offlineMode && !(isLoggedIn && isAdmin)) {
    return <OfflinePage />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <I18nProvider>
          <UserAuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <SiteGate>
                <Router />
              </SiteGate>
            </WouterRouter>
            <Toaster />
            <QuootjeChatbot />
            <CookieConsent />
          </UserAuthProvider>
        </I18nProvider>
      </TooltipProvider>
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-400/50 select-none pointer-events-none z-50">
        v4.38
      </div>
    </QueryClientProvider>
  );
}

export default App;
