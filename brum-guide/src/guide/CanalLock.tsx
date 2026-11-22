import { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react';
import { usePreferences } from '../preferences/PreferencesProvider';
import { Photo } from '../components/Photo';
import { motionTokens, scrollSmoothing } from '../motion/springs';
import { useMediaQuery, useMotionPrefs, WIDE_QUERY } from '../motion/useMotionPrefs';

/** Canal entre ladrillo (dentro de la esclusa) y panorámica al anochecer (al abrirse). */
const LOCK_PHOTO = 'welcome-to-brum--birmingham-canal';
const NIGHT_PHOTO = 'welcome-to-brum--birmingham-panoramica-nocturna';

/**
 * Movimiento firma: la esclusa.
 *
 * Un escenario fijo con dos muros de ladrillo y una compuerta de dos hojas.
 * El progreso del scroll llena la cámara: el agua (clip-path sobre la foto del
 * canal a todo color) sube, el barco flota con ella y la regla marca el nivel.
 * Arriba, las hojas se abren y la foto nocturna ocupa la escena.
 *
 * Solo se anima transform, opacity y clip-path. Sin estado de React por frame.
 * Movimiento reducido: composición final estática (esclusa llena y abierta),
 * sin recorrido extra.
 */
export function CanalLock() {
  const { reduce } = useMotionPrefs();
  const wide = useMediaQuery(WIDE_QUERY);
  const mode = reduce ? 'static' : wide ? 'wide' : 'narrow';
  return <LockInner key={mode} mode={mode} />;
}

function LockInner({ mode }: { mode: 'static' | 'wide' | 'narrow' }) {
  const { t } = usePreferences();
  const ref = useRef<HTMLElement>(null);
  const k = motionTokens.lock;
  const animated = mode !== 'static';

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const smooth = useSpring(scrollYProgress, scrollSmoothing);
  const settled = useMotionValue(1);
  const p = animated ? smooth : settled;

  const level = useTransform(p, [k.fillFrom, k.fillTo], [0, 100], { clamp: true });
  const dryTop = useTransform(level, (l) => 100 - l);
  const waterClip = useMotionTemplate`inset(${dryTop}% 0% 0% 0%)`;
  // El flotador ocupa toda la cámara: trasladarlo un % de su alto equivale a un % de la cámara.
  const floatY = useTransform(level, (l) => `${100 - l - k.boatSinkPct}%`);
  const gauge = useTransform(level, [0, 100], [0, 1]);
  const gateL = useTransform(p, [k.gatesFrom, k.gatesTo], ['0%', '-101%'], { clamp: true });
  const gateR = useTransform(p, [k.gatesFrom, k.gatesTo], ['0%', '101%'], { clamp: true });
  const nightOpacity = useTransform(p, [k.gatesFrom, k.gatesTo], [0, 1], { clamp: true });
  const nightScale = useTransform(p, [k.gatesFrom, 1], [k.nightScaleFrom, 1], { clamp: true });

  const beats = t.home.lock.beats;
  const beatOpacity = useBeatOpacities(p, beats.length, k.gatesTo);
  const runway = mode === 'wide' ? k.runwayVhWide : k.runwayVhNarrow;

  return (
    <section
      ref={ref}
      className={`lock lock--${mode}`}
      data-sc-act="lock"
      aria-labelledby="lock-title"
      style={animated ? { height: `${runway}vh` } : undefined}
      data-peak=""
    >
      <div className="lock__stage">
        <div className="lock__chamber" aria-hidden="true">
          {/* Cámara vacía: el canal en sombra */}
          <Photo id={LOCK_PHOTO} className="lock__photo lock__photo--dry" sizes="100vw" decorative />
          {/* El agua: la misma foto a todo color, recortada desde abajo */}
          <motion.div className="lock__water" style={{ clipPath: waterClip }}>
            <Photo id={LOCK_PHOTO} className="lock__photo" sizes="100vw" decorative />
          </motion.div>
          <motion.div className="lock__float" style={{ y: floatY }}>
            <span className="lock__surface" />
            <svg className="lock__boat" viewBox="0 0 220 60">
              {/* Barcaza estrecha (narrowboat) en silueta */}
              <path d="M6 38h196c6 0 10 4 10 8v2H14c-6 0-10-4-8-10z" />
              <path d="M40 38V22h96v16z" />
              <path d="M136 38V28h34v10z" />
              <path className="lock__boat-window" d="M52 26h12v6H52zM72 26h12v6H72zM92 26h12v6H92zM112 26h12v6h-12z" />
            </svg>
          </motion.div>
          <div className="lock__wall lock__wall--left" />
          <div className="lock__wall lock__wall--right" />
          <div className="lock__gauge">
            <motion.span className="lock__gauge-fill" style={{ scaleY: gauge }} />
          </div>
          <motion.div className="lock__night" style={{ opacity: nightOpacity, scale: nightScale }}>
            <Photo id={NIGHT_PHOTO} className="lock__photo" sizes="100vw" decorative />
          </motion.div>
          <motion.div className="lock__gate lock__gate--left" style={{ x: gateL }} />
          <motion.div className="lock__gate lock__gate--right" style={{ x: gateR }} />
        </div>

        <div className="lock__copy">
          <p className="eyebrow">{t.home.lock.eyebrow}</p>
          <h2 id="lock-title" className="display lock__title">
            {t.home.lock.title}
          </h2>
          <ol className="lock__beats">
            {beats.map((b, i) => (
              <motion.li key={i} className="lock__beat" style={animated ? { opacity: beatOpacity[i] } : undefined}>
                {b}
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/**
 * Tres frases, cada una en su tramo del recorrido. La primera arranca visible y la
 * última queda a opacidad 1 hasta el final: el texto nunca reposa a medias.
 * El número de frases es fijo (es igual en los dos idiomas), así que los hooks
 * se llaman siempre en el mismo orden.
 */
function useBeatOpacities(p: MotionValue<number>, n: number, end: number) {
  const span = end / n;
  // Relevo sin solape: la saliente se apaga del todo antes de que entre la siguiente.
  const f = span * 0.12;
  const first = useTransform(p, [0, span - 2 * f, span - f], [1, 1, 0], { clamp: true });
  const middle = useTransform(p, [span - f, span, 2 * span - 2 * f, 2 * span - f], [0, 1, 1, 0], { clamp: true });
  const last = useTransform(p, [2 * span - f, 2 * span, 1], [0, 1, 1], { clamp: true });
  return n === 3 ? [first, middle, last] : Array.from({ length: n }, () => last);
}
