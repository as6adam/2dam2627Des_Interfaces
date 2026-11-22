import type { CitedText, LocalizedText, Place, PracticalFact, PracticalKind, SourceRef, TransportOption } from '../types.ts';

/** Fecha de consulta de las fuentes de la fase 6. */
export const CHECKED = '2026-11-22';

export const t = (es: string, en: string): LocalizedText => ({ es, en });
export const c = (es: string, en: string, ...sourceIds: string[]): CitedText => ({ text: { es, en }, sourceIds });
export const fact = (kind: PracticalKind, es: string, en: string, ...sourceIds: string[]): PracticalFact => ({
  kind,
  text: { es, en },
  sourceIds,
});
export const src = (id: string, title: string, publisher: string, url: string): SourceRef => ({
  id,
  title,
  publisher,
  url,
  checkedOn: CHECKED,
});

/** Opción de transporte con menos ruido en los datos. */
export const go = (o: TransportOption): TransportOption => o;

/**
 * Ampliación editorial de una ficha. Reemplaza nombre, resumen, descripción,
 * dirección, imprescindibles, datos prácticos y consejos; añade transporte,
 * accesibilidad, avisos y fuentes a los ya existentes.
 */
export type PlaceDetail = Partial<
  Pick<Place, 'name' | 'summary' | 'description' | 'address' | 'map' | 'highlights' | 'practical' | 'tips' | 'transport' | 'accessibility' | 'caveats' | 'sources'>
>;
