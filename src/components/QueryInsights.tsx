/**
 * Query insights — shows how the search engine understood the query:
 * exact phrases, boolean structure, and the structured filters that are
 * actively constraining results. Proof (not promises) that operators are
 * executed, and a teaching moment for the syntax.
 */
import { useMemo } from 'react';
import { Globe, Type, FileType, Languages, Tag, CalendarDays, Quote, Braces } from 'lucide-react';

import { parseQuery, type FilterClause } from '@/lib/queryParser';
import { cn } from '@/lib/utils';

interface QueryInsightsProps {
  query: string;
  className?: string;
}

const FIELD_META: Record<FilterClause['field'], { icon: React.ReactNode; label: string; hint: string }> = {
  site: { icon: <Globe className="w-3 h-3" />, label: 'Site', hint: 'Results only from this site (incl. subdomains)' },
  domain: { icon: <Globe className="w-3 h-3" />, label: 'Domain', hint: 'Results only from this exact host' },
  title: { icon: <Type className="w-3 h-3" />, label: 'Title', hint: 'Words must appear in the title' },
  type: { icon: <FileType className="w-3 h-3" />, label: 'Type', hint: 'Document type (page, repository, pdf, …)' },
  lang: { icon: <Languages className="w-3 h-3" />, label: 'Language', hint: 'Content language (ISO 639-1)' },
  tag: { icon: <Tag className="w-3 h-3" />, label: 'Tag', hint: 'Exact topic tag' },
  before: { icon: <CalendarDays className="w-3 h-3" />, label: 'Before', hint: 'Published/observed before this date' },
  after: { icon: <CalendarDays className="w-3 h-3" />, label: 'After', hint: 'Published/observed on or after this date' },
};

export function QueryInsights({ query, className }: QueryInsightsProps) {
  const parsed = useMemo(() => parseQuery(query), [query]);

  if (!parsed.hasFilters && !parsed.hasPhrases && !parsed.hasBoolean) return null;

  return (
    <div className={cn('flex items-center gap-1.5 flex-wrap text-xs', className)}>
      <span className="text-muted-foreground/60">Understood as:</span>

      {parsed.hasBoolean && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-nostr/30 text-nostr bg-nostr/5"
          title="Boolean operators are executed (AND / OR / NOT, parentheses)"
        >
          <Braces className="w-3 h-3" />
          Boolean
        </span>
      )}

      {parsed.hasPhrases && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-primary/30 text-primary bg-primary/5"
          title="Exact phrase matching (order-sensitive), ranked above loose keyword matches"
        >
          <Quote className="w-3 h-3" />
          exact phrase
        </span>
      )}

      {parsed.filters.map((f, i) => {
        const meta = FIELD_META[f.field];
        return (
          <span
            key={`${f.field}-${f.value}-${i}`}
            title={f.negated ? `Exclude — ${meta.hint}` : meta.hint}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-mono',
              f.negated
                ? 'border-destructive/30 text-destructive/80 bg-destructive/5 line-through'
                : 'border-clearnet/30 text-clearnet bg-clearnet/5',
            )}
          >
            {meta.icon}
            {f.field}:{f.value}
          </span>
        );
      })}
    </div>
  );
}
