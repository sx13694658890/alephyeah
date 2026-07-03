import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { animate } from 'animejs';

import { defaultTrack, type MusicTrack } from '../../data/music';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { cn } from '../../lib/cn';

interface MusicPlayerProps {
  track?: MusicTrack;
  className?: string;
}

const PEEK_WIDTH = 34;

export const MusicPlayer = ({ track = defaultTrack, className }: MusicPlayerProps) => {
  const shellRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();
  const [isPlaying, setIsPlaying] = useState(false);
  const [expanded, setExpanded] = useState(reducedMotion);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia('(hover: none)').matches);
  }, []);

  useEffect(() => {
    if (reducedMotion || !shellRef.current) return;

    animate(shellRef.current, {
      opacity: [0, 1],
      translateX: [-8, 0],
      ease: 'outExpo',
      duration: 720,
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

  const openDrawer = useCallback(() => setExpanded(true), []);
  const closeDrawer = useCallback(() => {
    if (!isTouch) return;
    setExpanded(false);
  }, [isTouch]);

  const handleCoverClick = useCallback(() => {
    if (isTouch) {
      setExpanded((value) => !value);
      return;
    }
    if (!expanded) setExpanded(true);
  }, [expanded, isTouch]);

  const showExpanded = expanded || reducedMotion;

  const handleMouseEnter = useCallback(() => {
    if (isTouch) return;
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setExpanded(true);
  }, [isTouch]);

  const handleMouseLeave = useCallback(() => {
    if (isTouch) return;
    closeTimerRef.current = window.setTimeout(() => {
      setExpanded(false);
      closeTimerRef.current = null;
    }, 320);
  }, [isTouch]);

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    },
    [],
  );

  return (
    <div
      ref={shellRef}
      className={cn(
        'fixed left-0 z-40',
        'bottom-[max(0.75rem,env(safe-area-inset-bottom))]',
        reducedMotion ? 'opacity-100' : 'opacity-0',
        className,
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <audio ref={audioRef} src={track.audioSrc} loop preload="none" />

      <div
        className={cn(
          'will-change-transform transition-transform',
          showExpanded
            ? 'duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)]'
            : 'duration-[520ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
        )}
        style={{
          transform: showExpanded ? 'translateX(0)' : `translateX(calc(-100% + ${PEEK_WIDTH}px))`,
        }}
      >
        <div
          className={cn(
            'flex w-47 items-center gap-2 rounded-r-xl border border-l-0 border-border/55 bg-background/92 py-1.5 pl-1.5 pr-2 backdrop-blur-md',
            'shadow-[0_6px_24px_rgba(45,42,36,0.1)] transition-[box-shadow,background-color] duration-500',
            'dark:border-white/10 dark:bg-background/88 dark:shadow-[0_8px_28px_rgba(0,0,0,0.35)]',
            showExpanded &&
              'shadow-[0_10px_32px_rgba(45,42,36,0.14)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.42)]',
          )}
        >
          <button
            type="button"
            onClick={handleCoverClick}
            className={cn(
              'relative h-8 w-8 shrink-0 overflow-hidden rounded-lg transition-transform duration-500 ease-out active:scale-95',
              showExpanded && 'scale-100',
              !showExpanded && 'scale-[0.96]',
            )}
            aria-label={showExpanded ? (isPlaying ? '暂停' : '播放') : '展开音乐播放器'}
          >
            <img
              src={track.coverSrc}
              alt=""
              className={cn(
                'h-full w-full object-cover transition-transform duration-500',
                isPlaying && showExpanded && 'scale-105',
              )}
            />
            {!showExpanded ? (
              <span className="pointer-events-none absolute inset-0 bg-foreground/10" aria-hidden />
            ) : null}
          </button>

          <div
            className={cn(
              'min-w-0 flex-1 overflow-hidden transition-[opacity,transform]',
              showExpanded
                ? 'translate-x-0 opacity-100 duration-500 delay-200 ease-out'
                : 'translate-x-2 opacity-0 duration-300 delay-0 ease-in pointer-events-none',
            )}
          >
            <p className="truncate text-[11px] font-medium leading-tight text-foreground">
              {track.title}
            </p>
            <p className="truncate text-[9px] font-medium uppercase tracking-[0.12em] text-foreground/45">
              {track.artist}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!showExpanded) {
                openDrawer();
                return;
              }
              void togglePlay();
            }}
            onBlur={closeDrawer}
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-foreground/75',
              'transition-[opacity,transform,background-color,color] hover:bg-muted/70 hover:text-foreground active:scale-90',
              showExpanded
                ? 'translate-x-0 scale-100 opacity-100 duration-500 delay-[280ms] ease-out'
                : 'translate-x-1 scale-90 opacity-0 duration-300 delay-0 ease-in pointer-events-none',
            )}
            aria-label={isPlaying ? '暂停' : '播放'}
            tabIndex={showExpanded ? 0 : -1}
          >
            {isPlaying ? (
              <Pause size={13} className="fill-current" />
            ) : (
              <Play size={13} className="ml-px fill-current" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
