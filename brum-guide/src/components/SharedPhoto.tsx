import { useRef, type ComponentProps } from 'react';
import { useSharedArrival } from '../motion/sharedPhoto';
import { Photo } from './Photo';

type Props = ComponentProps<typeof Photo> & {
  /** Clave común a la tarjeta y a su destino, p. ej. `place:villa-park`. */
  sharedKey: string;
  /** Foto principal de la página: origen de la transición de vuelta. */
  hero?: boolean;
  wrapperClassName?: string;
};

/** Foto que participa en la transición tarjeta ↔ ficha. */
export function SharedPhoto({ sharedKey, hero = false, wrapperClassName, ...photo }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useSharedArrival(ref, sharedKey);
  return (
    <div
      ref={ref}
      className={['shared-photo', wrapperClassName].filter(Boolean).join(' ')}
      data-shared-key={sharedKey}
      data-shared-hero={hero || undefined}
    >
      <Photo {...photo} />
    </div>
  );
}
