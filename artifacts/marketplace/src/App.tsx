import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserAuthProvider, useUserAuth } from "@/contexts/user-auth";
import { I18nProvider } from "@/contexts/i18n";
import { useEffect, useState, lazy, Suspense } from "react";
const QuootjeChatbot = lazy(() => import("@/components/quootje-chatbot").then(m => ({ default: m.QuootjeChatbot })));
const CookieConsent = lazy(() => import("@/components/cookie-consent").then(m => ({ default: m.CookieConsent })));

// Critical pages — loaded immediately
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import OfflinePage from "@/pages/offline";

// Lazy-loaded pages — split into separate chunks
const Requests = lazy(() => import("@/pages/requests"));
const RequestDetail = lazy(() => import("@/pages/request-detail"));
const CreateRequest = lazy(() => import("@/pages/create-request"));
const PlaceBid = lazy(() => import("@/pages/place-bid"));
const Admin = lazy(() => import("@/pages/admin"));
const AuthRegister = lazy(() => import("@/pages/auth-register"));
const AuthLogin = lazy(() => import("@/pages/auth-login"));
const AuthForgotPassword = lazy(() => import("@/pages/auth-forgot-password"));
const AuthResetPassword = lazy(() => import("@/pages/auth-reset-password"));
const AuthVerifyEmail = lazy(() => import("@/pages/auth-verify-email"));
const Profile = lazy(() => import("@/pages/profile"));
const SupplierDashboard = lazy(() => import("@/pages/supplier-dashboard"));
const SupplierCredits = lazy(() => import("@/pages/supplier-credits"));
const BetalingGeslaagd = lazy(() => import("@/pages/betaling-geslaagd"));
const SupplierLeads = lazy(() => import("@/pages/supplier-leads"));
const BuyerRequests = lazy(() => import("@/pages/buyer-requests"));
const StaticPage = lazy(() => import("@/pages/static-page"));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-4 border-orange-400 border-t-transparent animate-spin" />
  </div>
);

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
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
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
            <Suspense fallback={null}>
              <QuootjeChatbot />
              <CookieConsent />
            </Suspense>
          </UserAuthProvider>
        </I18nProvider>
      </TooltipProvider>
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-slate-400/50 select-none pointer-events-none z-50">
        v4.40
      </div>
    </QueryClientProvider>
  );
}

export default App;
