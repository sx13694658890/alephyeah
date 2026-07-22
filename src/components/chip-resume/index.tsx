import { useId } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useTiltHover } from '../../hooks/useTiltHover';

import './index.css';

interface ChipResumeLoaderProps {
  className?: string;
  resumeHref: string;
  resumeLabel: string;
  eyebrow?: string;
  hint?: string;
}

const TRACE_PATHS = [
  { d: 'M100 100 H200 V210 H326', tone: 'sand', delay: '0s' },
  { d: 'M80 180 H180 V230 H326', tone: 'clay', delay: '0.45s' },
  { d: 'M60 260 H150 V250 H326', tone: 'olive', delay: '0.9s' },
  { d: 'M100 350 H200 V270 H326', tone: 'stone', delay: '1.35s' },
  { d: 'M700 90 H560 V210 H474', tone: 'clay', delay: '0.25s' },
  { d: 'M740 160 H580 V230 H474', tone: 'olive', delay: '0.7s' },
  { d: 'M720 250 H590 V250 H474', tone: 'umber', delay: '1.1s' },
  { d: 'M680 340 H570 V270 H474', tone: 'sand', delay: '1.55s' },
] as const;

const LEFT_PINS = [208, 230, 252, 274];
const RIGHT_PINS = [208, 230, 252, 274];
const LEFT_NODES = [
  [100, 100],
  [80, 180],
  [60, 260],
  [100, 350],
] as const;
const RIGHT_NODES = [
  [700, 90],
  [740, 160],
  [720, 250],
  [680, 340],
] as const;

/** Chip circuit CTA — From Uiverse.io by Vosoone, refined as clickable resume card */
export const ChipResumeLoader = ({
  className,
  resumeHref,
  resumeLabel,
  eyebrow,
  hint,
}: ChipResumeLoaderProps) => {
  const uid = useId().replace(/:/g, '');
  const chipGradient = `chipGradient-${uid}`;
  const pinGradient = `pinGradient-${uid}`;
  const { ref, onMouseMove, onMouseLeave } = useTiltHover<HTMLAnchorElement>({
    maxTilt: 4,
    scale: 1.02,
  });

  return (
    <a
      ref={ref}
      href={resumeHref}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('chip-resume group', className)}
      aria-label={resumeLabel}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ transform: 'perspective(800px)' }}
    >
      <div className="chip-resume__card">
        {eyebrow ? <p className="chip-resume__eyebrow">{eyebrow}</p> : null}

        <div className="chip-resume__stage">
          <svg
            className="chip-resume__svg"
            viewBox="40 70 720 360"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <defs>
              <linearGradient id={chipGradient} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5c554e" />
                <stop offset="100%" stopColor="#2d2a24" />
              </linearGradient>
              <linearGradient id={pinGradient} x1="1" y1="0" x2="0" y2="0">
                <stop offset="0%" stopColor="#e8e0d8" />
                <stop offset="50%" stopColor="#9a8b7a" />
                <stop offset="100%" stopColor="#6b6560" />
              </linearGradient>
            </defs>

            <g>
              {TRACE_PATHS.map((trace) => (
                <g key={trace.d}>
                  <path d={trace.d} className="chip-resume__trace-bg" />
                  <path
                    d={trace.d}
                    className={cn('chip-resume__trace-flow', `is-${trace.tone}`)}
                    style={{ animationDelay: trace.delay }}
                  />
                </g>
              ))}
            </g>

            <rect
              className="chip-resume__chip-body"
              x="312"
              y="175"
              width="176"
              height="130"
              rx="22"
              ry="22"
              fill={`url(#${chipGradient})`}
              stroke="#4a4540"
              strokeWidth="2"
            />

            <g>
              {LEFT_PINS.map((y) => (
                <rect
                  key={`l-${y}`}
                  x="302"
                  y={y}
                  width="10"
                  height="12"
                  fill={`url(#${pinGradient})`}
                  rx="2"
                />
              ))}
            </g>

            <g>
              {RIGHT_PINS.map((y) => (
                <rect
                  key={`r-${y}`}
                  x="488"
                  y={y}
                  width="10"
                  height="12"
                  fill={`url(#${pinGradient})`}
                  rx="2"
                />
              ))}
            </g>

            {LEFT_NODES.map(([cx, cy]) => (
              <circle key={`ln-${cx}-${cy}`} className="chip-resume__node" cx={cx} cy={cy} r="5" />
            ))}
            {RIGHT_NODES.map(([cx, cy]) => (
              <circle key={`rn-${cx}-${cy}`} className="chip-resume__node" cx={cx} cy={cy} r="5" />
            ))}
          </svg>

          {/* HTML CTA layered on chip — clearer click affordance than SVG text */}
         
        </div>

        <div className="chip-resume__footer">
          <span className="chip-resume__action">
            {resumeLabel}
            <ArrowUpRight className="chip-resume__action-icon" aria-hidden />
          </span>
          {hint ? <span className="chip-resume__hint">{hint}</span> : null}
        </div>
      </div>
    </a>
  );
};
