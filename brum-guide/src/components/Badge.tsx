import type { ReactNode } from 'react';
import type { Provenance } from '../content/types';
import type { Dictionary } from '../i18n';

export type BadgeTone = 'demo' | 'verified' | 'author' | 'provisional' | 'featured';

/** Etiqueta de estado: texto + forma, nunca solo color. */
export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span className="badge" data-tone={tone}>
      {children}
    </span>
  );
}

export const provenanceBadge = (p: Provenance, t: Dictionary): { label: string; tone: BadgeTone } =>
  p === 'demo'
    ? { label: t.badge.demo, tone: 'demo' }
    : p === 'verified'
      ? { label: t.badge.verified, tone: 'verified' }
      : { label: t.badge.author, tone: 'author' };
