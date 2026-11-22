import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { useMotionPrefs } from '../motion/useMotionPrefs';
import { springs } from '../motion/springs';

export function FactNumber({ label }: { label: string }) {
  const ref = useRef<HTMLElement>(null);
  const shown = useInView(ref, { once: true, amount: 0.5 });
  const { reduce } = useMotionPrefs();
  return <strong ref={ref} className="title-2 fact-number" data-counter-ready={shown || reduce}>
    <span className="visually-hidden">{label}</span>
    <span aria-hidden="true">{Array.from(label, (char, index) => {
      if (reduce || !/^[0-9]$/.test(char)) return <span key={index}>{char}</span>;
      const digits = Array.from({length: Number(char) + 1}, (_, i) => i);
      return <span className="digit-window" key={index}><motion.span className="digit-strip" initial={false} animate={{y: shown ? '-' + char + 'em' : '0em'}} transition={springs.reveal}>
        {digits.map(digit => <span key={digit}>{digit}</span>)}
      </motion.span></span>;
    })}</span>
  </strong>;
}
