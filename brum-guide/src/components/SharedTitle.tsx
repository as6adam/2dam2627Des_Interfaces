import { useRef } from 'react';
import { useSharedArrival } from '../motion/sharedPhoto';

export function SharedTitle({ id, text }: { id: string; text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useSharedArrival(ref, 'title:' + id);
  return <span className="shared-title" data-title-key={'title:' + id} ref={ref}>{text}</span>;
}
