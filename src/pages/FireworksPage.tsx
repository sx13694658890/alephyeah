import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Pause, Play, Settings, Volume2, VolumeX, X } from 'lucide-react';

import {
  FireworksCanvas,
  useFireworksConfig,
  useFireworksSound,
} from '../components/effects/FireworksCanvas';
import type { FireworksConfig, ShellType } from '../lib/fireworks/canvasEngine';
import { SHELL_TYPE_OPTIONS } from '../lib/fireworks/canvasEngine';
import { usePreferences } from '../context/PreferencesContext';
import { cn } from '../lib/cn';

const QUALITY_OPTIONS = [
  { value: 1, labelKey: 'fireworks.qualityLow' },
  { value: 2, labelKey: 'fireworks.qualityNormal' },
  { value: 3, labelKey: 'fireworks.qualityHigh' },
] as const;

const SIZE_OPTIONS = [
  { value: 1, label: '3"' },
  { value: 2, label: '4"' },
  { value: 3, label: '6"' },
  { value: 4, label: '8"' },
];

const SKY_OPTIONS = [
  { value: 0, labelKey: 'fireworks.skyNone' },
  { value: 1, labelKey: 'fireworks.skyDim' },
  { value: 2, labelKey: 'fireworks.skyNormal' },
] as const;

const SHELL_LABEL_KEYS: Record<ShellType, string> = {
  random: 'fireworks.shellRandom',
  crysanthemum: 'fireworks.shellCrysanthemum',
  crossette: 'fireworks.shellCrossette',
  crackle: 'fireworks.shellCrackle',
  strobe: 'fireworks.shellStrobe',
  willow: 'fireworks.shellWillow',
  ring: 'fireworks.shellRing',
};

export const FireworksPage = () => {
  const { t } = usePreferences();
  const { config, updateConfig } = useFireworksConfig();
  const { sound, updateSound, toggleSound } = useFireworksSound();
  const [paused, setPaused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);
  const [sky, setSky] = useState({ r: 0, g: 0, b: 0 });

  const bgStyle = {
    backgroundColor: `rgb(${sky.r | 0}, ${sky.g | 0}, ${sky.b | 0})`,
  };

  const togglePause = useCallback(() => setPaused((p) => !p), []);
  const toggleMenu = useCallback(() => setMenuOpen((m) => !m), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'p' || event.key === 'P') togglePause();
      if (event.key === 'o' || event.key === 'O') toggleMenu();
      if (event.key === 'm' || event.key === 'M') void toggleSound();
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePause, toggleMenu, toggleSound]);

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
          'fixed inset-x-0 top-0 z-30 flex items-start justify-between p-[max(0.5rem,env(safe-area-inset-top))] px-[max(0.75rem,env(safe-area-inset-left))]',
          config.autoLaunch && !menuOpen ? 'opacity-30 hover:opacity-100' : 'opacity-100',
          'transition-opacity duration-300',
        )}
      >
        <Link
          to="/about"
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white/90 backdrop-blur-md transition-colors hover:bg-black/60"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('fireworks.back')}
        </Link>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => void toggleSound()}
            className="flex h-[50px] w-[50px] items-center justify-center rounded-xl text-white/70 transition-all hover:bg-white/10 hover:text-white"
            aria-label={sound.enabled ? t('fireworks.mute') : t('fireworks.unmute')}
          >
            {sound.enabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </button>
          <button
            type="button"
            onClick={togglePause}
            className="flex h-[50px] w-[50px] items-center justify-center rounded-xl text-white/70 transition-all hover:bg-white/10 hover:text-white"
            aria-label={paused ? t('fireworks.play') : t('fireworks.pause')}
          >
            {paused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
          </button>
          <button
            type="button"
            onClick={toggleMenu}
            className="flex h-[50px] w-[50px] items-center justify-center rounded-xl text-white/70 transition-all hover:bg-white/10 hover:text-white"
            aria-label={t('fireworks.settings')}
          >
            <Settings className="h-6 w-6" />
          </button>
        </div>
      </div>

      <p className="pointer-events-none fixed inset-x-0 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-20 px-4 text-center text-[11px] leading-relaxed text-white/40">
        {t('fireworks.hint')}
      </p>

      <div
        className={cn(
          'fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300',
          menuOpen ? 'visible opacity-100' : 'invisible opacity-0',
        )}
        role="dialog"
        aria-modal="true"
        aria-hidden={!menuOpen}
      >
        <div className="relative mx-4 flex max-h-[min(90vh,680px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/10 bg-[rgba(18,18,18,0.92)] shadow-2xl">
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl text-white/60 hover:bg-white/10 hover:text-white"
            aria-label={t('fireworks.close')}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="border-b border-white/10 px-6 py-5">
            <h2 className="text-xl font-semibold text-white">{t('fireworks.settings')}</h2>
            <p className="mt-1 text-xs text-white/45">{t('fireworks.settingsDesc')}</p>
          </div>

          <form className="flex-1 space-y-3 overflow-y-auto px-6 py-4" onSubmit={(e) => e.preventDefault()}>
            <SettingSelectString
              label={t('fireworks.shellType')}
              value={config.shellType}
              onChange={(v) => updateConfig({ shellType: v as ShellType })}
              options={SHELL_TYPE_OPTIONS.map((type) => ({
                value: type,
                label: t(SHELL_LABEL_KEYS[type]),
              }))}
            />
            <SettingSelect
              label={t('fireworks.shellSize')}
              value={config.shellSize}
              onChange={(v) => updateConfig({ shellSize: v })}
              options={SIZE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            />
            <SettingSelect
              label={t('fireworks.quality')}
              value={config.quality}
              onChange={(v) => updateConfig({ quality: v as FireworksConfig['quality'] })}
              options={QUALITY_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
            />
            <SettingSelect
              label={t('fireworks.skyLighting')}
              value={config.skyLighting}
              onChange={(v) => updateConfig({ skyLighting: v as FireworksConfig['skyLighting'] })}
              options={SKY_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
            />
            <SettingRange
              label={t('fireworks.volume')}
              value={sound.volume}
              min={0}
              max={2}
              step={0.05}
              format={(v) => `${Math.round(v * 100)}%`}
              onChange={(v) => updateSound({ volume: v })}
            />
            <SettingCheckbox
              label={t('fireworks.soundEnabled')}
              checked={sound.enabled}
              onChange={(v) => {
                updateSound({ enabled: v });
                if (v) void import('../lib/fireworks/soundManager').then((m) => m.fireworksSound.unlock());
              }}
            />
            <SettingCheckbox
              label={t('fireworks.autoLaunch')}
              checked={config.autoLaunch}
              onChange={(v) => updateConfig({ autoLaunch: v })}
            />
            <SettingCheckbox
              label={t('fireworks.finaleMode')}
              checked={config.finaleMode}
              onChange={(v) => updateConfig({ finaleMode: v })}
              hint={t('fireworks.finaleHint')}
            />
            <SettingCheckbox
              label={t('fireworks.longExposure')}
              checked={config.longExposure}
              onChange={(v) => updateConfig({ longExposure: v })}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

function SettingSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  options: { value: number; label: string }[];
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="w-[42%] shrink-0 text-right text-white/80">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9 flex-1 rounded-lg border border-white/20 bg-white/5 px-2 text-white outline-none focus:border-[#1e7fff]/70 focus:ring-2 focus:ring-[#1e7fff]/25"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-neutral-900">
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SettingSelectString({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="w-[42%] shrink-0 text-right text-white/80">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 flex-1 rounded-lg border border-white/20 bg-white/5 px-2 text-white outline-none focus:border-[#1e7fff]/70 focus:ring-2 focus:ring-[#1e7fff]/25"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-neutral-900">
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SettingCheckbox({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-[42%] shrink-0 text-right text-white/80">
        {label}
        {hint ? <span className="mt-0.5 block text-[10px] font-normal text-white/35">{hint}</span> : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 accent-[#1e7fff]"
      />
    </div>
  );
}

function SettingRange({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <span className="w-[42%] shrink-0 text-right text-white/80">{label}</span>
      <div className="flex flex-1 items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1.5 flex-1 accent-[#1e7fff]"
        />
        <span className="w-10 shrink-0 text-right text-xs text-white/55">{format(value)}</span>
      </div>
    </label>
  );
}
