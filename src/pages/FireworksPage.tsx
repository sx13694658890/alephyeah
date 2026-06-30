import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Pause, Play, Settings, Volume2, VolumeX } from 'lucide-react';

import {
  FireworksCanvas,
  useFireworksConfig,
  useFireworksSound,
} from '../components/effects/FireworksCanvas';
import { FireworksSettingsPanel } from '../components/effects/FireworksSettingsPanel';
import { fireworksSound } from '../lib/fireworks/soundManager';
import { usePreferences } from '../context/PreferencesContext';
import { cn } from '../lib/cn';

export const FireworksPage = () => {
  const { t } = usePreferences();
  const { config, updateConfig } = useFireworksConfig();
  const { sound, updateSound, toggleSound } = useFireworksSound();
  const [paused, setPaused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [simSpeed, setSimSpeed] = useState(0.82);
  const [sky, setSky] = useState({ r: 0, g: 0, b: 0 });

  const bgStyle = {
    backgroundColor: `rgb(${sky.r | 0}, ${sky.g | 0}, ${sky.b | 0})`,
  };

  const togglePause = useCallback(() => setPaused((p) => !p), []);
  const openMenu = useCallback(() => {
    void fireworksSound.unlock();
    setMenuOpen(true);
  }, []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const unlockOnce = () => {
      void fireworksSound.unlock();
    };
    window.addEventListener('pointerdown', unlockOnce, { once: true });
    return () => window.removeEventListener('pointerdown', unlockOnce);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'p' || event.key === 'P') togglePause();
      if (event.key === 'o' || event.key === 'O') openMenu();
      if (event.key === 'm' || event.key === 'M') void toggleSound();
      if (event.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePause, openMenu, closeMenu, toggleSound]);

  const controlsHidden = config.hideControls && !menuOpen;

  return (
    <div className="relative min-h-screen overflow-hidden text-white transition-colors duration-300" style={bgStyle}>
      <FireworksCanvas
        fullscreen
        paused={paused}
        config={config}
        sound={sound}
        simSpeed={simSpeed}
        onSimSpeedChange={setSimSpeed}
        onSkyColor={setSky}
      />

      <div
        className={cn(
          'fixed inset-x-0 top-0 z-30 flex items-start justify-between p-[max(0.5rem,env(safe-area-inset-top))] px-[max(0.75rem,env(safe-area-inset-left))] transition-opacity duration-300',
          controlsHidden ? 'pointer-events-none opacity-0 hover:pointer-events-auto hover:opacity-100' : 'opacity-100',
          !controlsHidden && config.autoLaunch && !menuOpen && 'opacity-35 hover:opacity-100',
        )}
      >
        <Link
          to="/about"
          onClick={() => void fireworksSound.unlock()}
          className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-black/40 px-3 py-2 text-sm text-white/90 backdrop-blur-md transition-all hover:border-white/20 hover:bg-black/60"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('fireworks.back')}
        </Link>

        <div className="flex gap-1">
          <ToolbarBtn
            label={sound.enabled ? t('fireworks.mute') : t('fireworks.unmute')}
            onClick={() => void toggleSound()}
          >
            {sound.enabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </ToolbarBtn>
          <ToolbarBtn
            label={paused ? t('fireworks.play') : t('fireworks.pause')}
            onClick={() => {
              void fireworksSound.unlock();
              togglePause();
            }}
          >
            {paused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
          </ToolbarBtn>
          <ToolbarBtn label={t('fireworks.settings')} onClick={openMenu}>
            <Settings className="h-6 w-6" />
          </ToolbarBtn>
        </div>
      </div>

      <p
        className={cn(
          'pointer-events-none fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-20 px-4 text-center text-[11px] leading-relaxed text-white/38 transition-opacity',
          controlsHidden && 'opacity-0',
        )}
      >
        {t('fireworks.hint')}
      </p>

      <FireworksSettingsPanel
        open={menuOpen}
        onClose={closeMenu}
        config={config}
        sound={sound}
        onConfigChange={updateConfig}
        onSoundChange={updateSound}
        t={t}
      />
    </div>
  );
};

function ToolbarBtn({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[50px] w-[50px] items-center justify-center rounded-xl text-white/65 transition-all hover:bg-white/10 hover:text-white active:scale-95"
      aria-label={label}
    >
      {children}
    </button>
  );
}
