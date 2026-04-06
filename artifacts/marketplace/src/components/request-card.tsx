import { Link } from "wouter";
import { formatCurrency, formatExpiry } from "@/lib/utils";
import { Clock, Tag, MessageCircle, ArrowRight } from "lucide-react";
import type { RequestSummary } from "@workspace/api-client-react";
import { useI18n } from "@/contexts/i18n";

interface RequestCardProps {
  request: RequestSummary;
  featured?: boolean;
}

export function RequestCard({ request, featured = false }: RequestCardProps) {
  const { t } = useI18n();
  const isExpiringSoon = new Date(request.expiresAt).getTime() - new Date().getTime() < 48 * 60 * 60 * 1000;

  return (
    <Link href={`/requests/${request.id}`} className="group block h-full">
      <div className={`
        bg-card rounded-2xl p-6 h-full flex flex-col
        shadow-sm border border-border
        transition-all duration-300 ease-out
        hover:shadow-lg hover:shadow-primary/8 hover:border-primary/40
        hover:-translate-y-1
        ${featured ? 'ring-2 ring-primary/30 bg-gradient-to-b from-white to-orange-50/30' : ''}
      `}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3 items-center">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl shadow-inner">
              {request.categoryIcon || '📦'}
            </div>
            <div>
              <h3 className="font-bold text-lg text-secondary line-clamp-1 group-hover:text-primary transition-colors">
                {request.title}
              </h3>
              <p className="text-sm text-muted-foreground">{request.brand}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 my-6">
          <div className="bg-muted/50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-1">
              <MessageCircle className="w-3.5 h-3.5" />
              Biedingen
            </div>
            <div className="font-display font-bold text-xl text-secondary">
              {request.bidCount}
            </div>
          </div>
          <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-1">
              <Tag className="w-3.5 h-3.5" />
              Laagste bod
            </div>
            <div className="font-display font-bold text-xl text-primary">
              {formatCurrency(request.lowestBidPrice)}
            </div>
          </div>
        </div>

        {/* Footer / Meta */}
        <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${isExpiringSoon ? 'text-destructive' : 'text-muted-foreground'}`}>
            <Clock className="w-3.5 h-3.5" />
            {formatExpiry(request.expiresAt, t.common)}
          </div>
          
          <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
