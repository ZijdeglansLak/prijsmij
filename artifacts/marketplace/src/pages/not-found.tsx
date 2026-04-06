import { Link } from "wouter";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/i18n";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <SearchX className="w-10 h-10 text-primary" />
      </div>
      <h1 className="text-6xl font-extrabold text-secondary mb-3">404</h1>
      <h2 className="text-2xl font-bold text-foreground mb-2">{t.notFound.title}</h2>
      <p className="text-muted-foreground max-w-sm mb-8">{t.notFound.subtitle}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/">
          <Button size="lg">{t.notFound.goHome}</Button>
        </Link>
        <Link href="/requests">
          <Button size="lg" variant="outline">{t.notFound.browseRequests}</Button>
        </Link>
      </div>
    </div>
  );
}
