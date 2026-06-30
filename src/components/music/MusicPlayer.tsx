import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { animate } from 'animejs';

import { defaultTrack, type MusicTrack } from '../../data/music';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { cn } from '../../lib/cn';
import { Glass } from '../ul-liquid-glass';

interface MusicPlayerProps {
  track?: MusicTrack;
  className?: string;
}

/** 与 Navbar 同系光学参数，略收敛以适配小尺寸控件 */
const musicGlassOptics = {
  frost: 18,
  strength: 0.28,
  curvature: 0.42,
  depth: 0.5,
  glow: 0.18,
  glowSpread: 0.35,
  sheen: 0.38,
  sheenWidth: 2.5,
  saturate: 1.28,
  specular: 1,
  brightness: 0.1,
  dispersion: 0.28,
};

const MusicBars = ({ active }: { active: boolean }) => (
  <div
    className={cn('flex h-3 w-4 items-end gap-0.5', !active && 'opacity-35')}
    aria-hidden
  >
    {[0, 1, 2].map((index) => (
      <span
        key={index}
        className={cn(
          'w-0.5 rounded-full bg-accent/70',
          active && 'music-bar',
        )}
        style={active ? { animationDelay: `${index * 0.2}s` } : { height: '24%' }}
      />
    ))}
  </div>
);

export const MusicPlayer = ({ track = defaultTrack, className }: MusicPlayerProps) => {
  const shellRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const reducedMotion = useReducedMotion();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (reducedMotion || !shellRef.current) return;

    animate(shellRef.current, {
      opacity: [0, 1],
      translateY: [14, 0],
      ease: 'outExpo',
      duration: 820,
      delay: 900,
    });
  }, [reducedMotion]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.pause();
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    audio.pause();
  }, []);

  return (
    <div
      ref={shellRef}
      className={cn(
        'pointer-events-none fixed z-40',
        'left-[max(1rem,env(safe-area-inset-left))]',
        'bottom-[max(1.25rem,env(safe-area-inset-bottom))]',
        reducedMotion ? 'opacity-100' : 'opacity-0',
        className,
      )}
    >
      <audio ref={audioRef} src={track.audioSrc} loop preload="none" />

      <Glass
        radius={16}
        optics={musicGlassOptics}
        className={cn(
          'music-player-glass pointer-events-auto w-fit transition-[box-shadow,transform] duration-500',
          'rounded-2xl border border-white/60 bg-gradient-to-br from-white/52 via-white/36 to-white/20',
          'shadow-[0_12px_36px_rgba(45,42,36,0.12),0_2px_8px_rgba(45,42,36,0.06),inset_0_1px_0_rgba(255,255,255,0.72)]',
          'ring-1 ring-accent/15',
          'dark:border-white/10 dark:from-white/14 dark:via-white/8 dark:to-white/5',
          'dark:shadow-[0_12px_40px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.1)]',
          'dark:ring-white/8',
          isPlaying && 'ring-accent/25 shadow-[0_14px_42px_rgba(154,139,122,0.18),inset_0_1px_0_rgba(255,255,255,0.75)]',
        )}
      >
        <div className="flex items-center gap-3 p-2 lg:gap-4 lg:p-2.5 lg:pr-4">
          <button
            type="button"
            onClick={togglePlay}
            className={cn(
              'group relative h-10 w-10 shrink-0 overflow-hidden rounded-xl',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_8px_rgba(45,42,36,0.12)]',
              'transition-transform duration-300 hover:scale-[1.03] active:scale-95',
              'lg:h-12 lg:w-12',
            )}
            aria-label={isPlaying ? '暂停' : '播放'}
          >
            <img
              src={track.coverSrc}
              alt={track.title}
              className={cn(
                'h-full w-full object-cover transition-transform duration-500',
                isPlaying ? 'scale-110' : 'scale-100 group-hover:scale-105',
              )}
            />
            <span
              className={cn(
                'pointer-events-none absolute inset-0 bg-accent/10 opacity-0 transition-opacity duration-300',
                isPlaying && 'opacity-100',
              )}
              aria-hidden
            />
          </button>

          <div className="hidden min-w-32 flex-col justify-center lg:flex">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-light tracking-tight text-foreground">
                {track.title}
              </span>
              <MusicBars active={isPlaying} />
            </div>
            <span className="text-[11px] font-light uppercase tracking-[0.14em] text-muted-foreground">
              {track.artist}
            </span>
          </div>

          <button
            type="button"
            onClick={togglePlay}
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
              'border border-white/40 bg-white/30 text-foreground',
              'shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_2px_6px_rgba(45,42,36,0.08)]',
              'transition-all duration-300 hover:scale-105 hover:bg-white/45 active:scale-90',
              'dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/16',
              'lg:ml-0.5 lg:h-10 lg:w-10',
            )}
            aria-label={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? (
              <Pause size={18} className="fill-current" />
            ) : (
              <Play size={18} className="ml-0.5 fill-current" />
            )}
          </button>
        </div>
      </Glass>
    </div>
  );
};
