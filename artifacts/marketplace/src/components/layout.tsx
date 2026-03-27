import { Link, useLocation } from "wouter";
import { Store, TrendingUp, PlusCircle, Search, Menu, X, LogIn, Coins, LogOut, Globe, ShieldCheck, User } from "lucide-react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useUserAuth } from "@/contexts/user-auth";
import { useI18n, FLAG, LABEL, type Language } from "@/contexts/i18n";
import { Badge } from "@/components/ui/badge";

const LANGUAGES: Language[] = ["nl", "en", "de", "fr"];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const { user, isLoggedIn, isSeller, isBuyer, isAdmin, logout } = useUserAuth();
  const { t, lang, setLang } = useI18n();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchVal.trim()) {
      setLocation(`/requests?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchOpen(false);
      setSearchVal("");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="font-display font-bold text-2xl tracking-tight text-secondary">
                  Prijs<span className="text-primary">Mij</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-5">
              {/* Admin search (only for admins) */}
              {isAdmin && (
                <form onSubmit={handleSearch} className="relative flex items-center">
                  {searchOpen ? (
                    <input
                      ref={searchRef}
                      autoFocus
                      type="text"
                      value={searchVal}
                      onChange={e => setSearchVal(e.target.value)}
                      onBlur={() => { if (!searchVal) setSearchOpen(false); }}
                      placeholder="Zoek uitvragen..."
                      className="w-48 pl-8 pr-3 py-1.5 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50); }}
                      className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  )}
                  {searchOpen && <Search className="absolute left-2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />}
                </form>
              )}

              {/* Uitvragen link — visible to sellers and non-logged-in users */}
              {(!isLoggedIn || isSeller || isAdmin) && (
                <Link
                  href="/requests"
                  className={cn(
                    "flex items-center gap-2 text-sm font-semibold transition-colors hover:text-primary",
                    location.startsWith("/requests") ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Search className="w-4 h-4" />
                  {t.nav.requests}
                </Link>
              )}

              {/* Beheer — only for admins */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center gap-2 text-sm font-semibold transition-colors hover:text-primary",
                    location === "/admin" ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <ShieldCheck className="w-4 h-4" />
                  {t.nav.manage}
                </Link>
              )}

              {/* Language switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>{FLAG[lang]} {LABEL[lang]}</span>
                </button>
                {showLangMenu && (
                  <div className="absolute right-0 top-8 bg-white border border-border rounded-xl shadow-lg p-1 min-w-[120px] z-50">
                    {LANGUAGES.map(l => (
                      <button
                        key={l}
                        onClick={() => { setLang(l); setShowLangMenu(false); }}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors",
                          l === lang ? "bg-primary/10 text-primary" : "hover:bg-muted text-secondary"
                        )}
                      >
                        {FLAG[l]} {LABEL[l]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Auth area */}
              {isLoggedIn && user ? (
                <>
                  {isSeller && !isAdmin && (
                    <Link
                      href="/supplier/dashboard"
                      className={cn(
                        "flex items-center gap-2 text-sm font-semibold transition-colors hover:text-primary",
                        location.startsWith("/supplier") ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      <Coins className="w-4 h-4" />
                      <span>{user.storeName ?? user.contactName}</span>
                      <Badge variant="secondary" className="ml-1">{user.credits}</Badge>
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      href="/profile"
                      className={cn(
                        "flex items-center gap-2 text-sm font-semibold transition-colors hover:text-primary",
                        location === "/profile" ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      <User className="w-4 h-4" />
                      <span>{user.contactName}</span>
                      <Badge variant="outline" className="ml-1 text-xs">Admin</Badge>
                    </Link>
                  )}
                  {isBuyer && !isAdmin && (
                    <Link
                      href="/profile"
                      className={cn(
                        "flex items-center gap-2 text-sm font-semibold transition-colors hover:text-primary",
                        location === "/profile" ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      <User className="w-4 h-4" />
                      <span>{user.contactName}</span>
                    </Link>
                  )}
                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t.nav.logout}
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  {t.nav.login}
                </Link>
              )}

              {/* CTA: buyers or not logged in see "Uitvraag plaatsen" */}
              {(!isLoggedIn || isBuyer) && !isAdmin && (
                <Link
                  href="/request/new"
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm bg-secondary text-secondary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  <PlusCircle className="w-4 h-4" />
                  {t.nav.postRequest}
                </Link>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={() => {
                  const idx = LANGUAGES.indexOf(lang);
                  setLang(LANGUAGES[(idx + 1) % LANGUAGES.length]);
                }}
                className="text-lg"
              >
                {FLAG[lang]}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-secondary hover:bg-muted"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white">
            <div className="px-4 pt-2 pb-6 space-y-2">
              {isAdmin && (
                <form onSubmit={e => { handleSearch(e); setIsMobileMenuOpen(false); }} className="px-4 py-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchVal}
                      onChange={e => setSearchVal(e.target.value)}
                      placeholder="Zoek uitvragen..."
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </form>
              )}

              {(!isLoggedIn || isSeller || isAdmin) && (
                <Link
                  href="/requests"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-secondary hover:bg-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Search className="w-5 h-5 text-primary" />
                  {t.nav.requests}
                </Link>
              )}

              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-secondary hover:bg-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  {t.nav.manage}
                </Link>
              )}

              {/* Language switcher mobile */}
              <div className="px-4 py-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Taal / Language</p>
                <div className="flex gap-2">
                  {LANGUAGES.map(l => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); }}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-bold transition-colors",
                        l === lang ? "bg-primary text-white" : "bg-muted text-secondary"
                      )}
                    >
                      {FLAG[l]} {LABEL[l]}
                    </button>
                  ))}
                </div>
              </div>

              {isLoggedIn && user ? (
                <>
                  {isSeller && !isAdmin && (
                    <Link
                      href="/supplier/dashboard"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-secondary hover:bg-muted"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Coins className="w-5 h-5 text-primary" />
                      {user.storeName ?? user.contactName} ({user.credits} credits)
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-secondary hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5 text-primary" />
                    {t.nav.profile}
                  </Link>
                  <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-secondary hover:bg-muted w-full"
                  >
                    <LogOut className="w-5 h-5 text-primary" />
                    {t.nav.logout}
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-secondary hover:bg-muted"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn className="w-5 h-5 text-primary" />
                  {t.nav.login}
                </Link>
              )}

              {(!isLoggedIn || isBuyer) && !isAdmin && (
                <Link
                  href="/request/new"
                  className="flex items-center justify-center gap-2 w-full mt-4 px-6 py-3 rounded-xl font-bold bg-primary text-primary-foreground shadow-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <PlusCircle className="w-5 h-5" />
                  {t.nav.postRequest}
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1" onClick={() => showLangMenu && setShowLangMenu(false)}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="font-display font-bold text-xl">PrijsMij</span>
              </Link>
              <p className="text-secondary-foreground/70 mb-6">{t.footer.tagline}</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">{t.footer.quickLinks}</h4>
              <ul className="space-y-4">
                <li><Link href="/requests" className="text-secondary-foreground/70 hover:text-white transition-colors">{t.footer.allRequests}</Link></li>
                <li><Link href="/request/new" className="text-secondary-foreground/70 hover:text-white transition-colors">{t.footer.postRequest}</Link></li>
                <li><Link href="/auth/register" className="text-secondary-foreground/70 hover:text-white transition-colors">{t.footer.forSellers}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">{t.footer.contact}</h4>
              <ul className="space-y-4 text-secondary-foreground/70">
                <li>support@prijsmij.nl</li>
                <li>+31 (0)20 123 4567</li>
                <li>Amsterdam, Nederland</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-secondary-foreground/50">
            &copy; {new Date().getFullYear()} PrijsMij. Alle rechten voorbehouden.
          </div>
        </div>
      </footer>
    </div>
  );
}
