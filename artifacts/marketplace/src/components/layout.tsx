import { Link, useLocation } from "wouter";
import { Store, TrendingUp, PlusCircle, Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/requests", label: "Bekijk Uitvragen", icon: Search },
    { href: "/admin", label: "Beheer", icon: Store },
  ];

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
                  Best<span className="text-primary">Bod</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 text-sm font-semibold transition-colors hover:text-primary",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
              
              <Link
                href="/request/new"
                className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm bg-secondary text-secondary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                <PlusCircle className="w-4 h-4" />
                Uitvraag plaatsen
              </Link>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
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
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-secondary hover:bg-muted"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 text-primary" />
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/request/new"
                className="flex items-center justify-center gap-2 w-full mt-4 px-6 py-3 rounded-xl font-bold bg-primary text-primary-foreground shadow-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <PlusCircle className="w-5 h-5" />
                Nu Gratis Uitvraag Plaatsen
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
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
                <span className="font-display font-bold text-xl">BestBod</span>
              </Link>
              <p className="text-secondary-foreground/70 mb-6">
                Het slimste platform waar winkels strijden om jou de beste deal te geven voor je nieuwe aankoop.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Snel naar</h4>
              <ul className="space-y-4">
                <li><Link href="/requests" className="text-secondary-foreground/70 hover:text-white transition-colors">Alle uitvragen</Link></li>
                <li><Link href="/request/new" className="text-secondary-foreground/70 hover:text-white transition-colors">Plaats uitvraag</Link></li>
                <li><Link href="/admin" className="text-secondary-foreground/70 hover:text-white transition-colors">Voor winkeliers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Contact</h4>
              <ul className="space-y-4 text-secondary-foreground/70">
                <li>support@bestbod.nl</li>
                <li>+31 (0)20 123 4567</li>
                <li>Amsterdam, Nederland</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-secondary-foreground/50">
            &copy; {new Date().getFullYear()} BestBod Marketplace. Alle rechten voorbehouden.
          </div>
        </div>
      </footer>
    </div>
  );
}
