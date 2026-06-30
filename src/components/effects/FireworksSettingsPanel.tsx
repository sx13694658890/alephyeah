import { X } from 'lucide-react';

import type { FireworksConfig, ShellType } from '../../lib/fireworks/canvasEngine';
import { SCALE_FACTOR_OPTIONS, SHELL_TYPE_OPTIONS } from '../../lib/fireworks/canvasEngine';
import type { SoundSettings } from '../../lib/fireworks/soundManager';
import { fireworksSound } from '../../lib/fireworks/soundManager';
import { cn } from '../../lib/cn';

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
  crackle: 'fireworks.shellCrackle',
  crossette: 'fireworks.shellCrossette',
  crysanthemum: 'fireworks.shellCrysanthemum',
  fallingLeaves: 'fireworks.shellFallingLeaves',
  floral: 'fireworks.shellFloral',
  ghost: 'fireworks.shellGhost',
  horsetail: 'fireworks.shellHorsetail',
  palm: 'fireworks.shellPalm',
  ring: 'fireworks.shellRing',
  strobe: 'fireworks.shellStrobe',
  willow: 'fireworks.shellWillow',
};

interface FireworksSettingsPanelProps {
  open: boolean;
  onClose: () => void;
  config: FireworksConfig;
  sound: SoundSettings;
  onConfigChange: (patch: Partial<FireworksConfig>) => void;
  onSoundChange: (patch: Partial<SoundSettings>) => void;
  t: (key: string) => string;
}

export const FireworksSettingsPanel = ({
  open,
  onClose,
  config,
  sound,
  onConfigChange,
  onSoundChange,
  t,
}: FireworksSettingsPanelProps) => {
  return (
    <div
      className={cn(
        'fixed inset-0 z-40 flex items-center justify-center transition-all duration-300',
        open ? 'visible opacity-100' : 'invisible opacity-0 pointer-events-none',
      )}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-md"
        aria-label={t('fireworks.close')}
        onClick={onClose}
      />

      <div className="relative mx-4 flex max-h-[min(92vh,720px)] w-full max-w-[420px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[rgba(12,12,14,0.88)] shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-xl text-white/55 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={t('fireworks.close')}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="border-b border-white/8 px-6 pb-4 pt-6 text-center">
          <h2 className="text-[1.35rem] font-semibold tracking-wide text-white">{t('fireworks.settings')}</h2>
        </div>

        <form className="flex-1 space-y-3.5 overflow-y-auto px-5 py-4" onSubmit={(e) => e.preventDefault()}>
          <SettingSelectString
            label={t('fireworks.shellType')}
            value={config.shellType}
            onChange={(v) => onConfigChange({ shellType: v as ShellType })}
            options={SHELL_TYPE_OPTIONS.map((type) => ({
              value: type,
              label: t(SHELL_LABEL_KEYS[type]),
            }))}
          />
          <SettingSelect
            label={t('fireworks.shellSize')}
            value={config.shellSize}
            onChange={(v) => onConfigChange({ shellSize: v })}
            options={SIZE_OPTIONS}
          />
          <SettingSelect
            label={t('fireworks.quality')}
            value={config.quality}
            onChange={(v) => onConfigChange({ quality: v as FireworksConfig['quality'] })}
            options={QUALITY_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
          />
          <SettingSelect
            label={t('fireworks.skyLighting')}
            value={config.skyLighting}
            onChange={(v) => onConfigChange({ skyLighting: v as FireworksConfig['skyLighting'] })}
            options={SKY_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
          />
          <SettingSelectFloat
            label={t('fireworks.scaleFactor')}
            value={config.scaleFactor}
            onChange={(v) => onConfigChange({ scaleFactor: v })}
            options={SCALE_FACTOR_OPTIONS.map((v) => ({
              value: v,
              label: `${Math.round(v * 100)}%`,
            }))}
          />
            <SettingRange
              label={t('fireworks.volume')}
              value={sound.volume}
              min={0}
              max={1.5}
              step={0.05}
              format={(v) => `${Math.round(v * 100)}%`}
              onChange={(v) => onSoundChange({ volume: v })}
            />
          <SettingCheckbox
            label={t('fireworks.soundEnabled')}
            checked={sound.enabled}
            onChange={(v) => {
              onSoundChange({ enabled: v });
              if (v) void fireworksSound.unlock();
            }}
          />
          <SettingCheckbox
            label={t('fireworks.autoLaunch')}
            checked={config.autoLaunch}
            onChange={(v) => onConfigChange({ autoLaunch: v })}
          />
          <SettingCheckbox
            label={t('fireworks.finaleMode')}
            checked={config.finaleMode}
            onChange={(v) => onConfigChange({ finaleMode: v })}
            hint={t('fireworks.finaleHint')}
          />
          <SettingCheckbox
            label={t('fireworks.hideControls')}
            checked={config.hideControls}
            onChange={(v) => onConfigChange({ hideControls: v })}
          />
          <SettingCheckbox
            label={t('fireworks.longExposure')}
            checked={config.longExposure}
            onChange={(v) => onConfigChange({ longExposure: v })}
          />
        </form>
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
      <span className="w-[46%] shrink-0 text-right text-white/88">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9 flex-1 rounded-lg border border-white/18 bg-white/[0.06] px-2.5 text-white outline-none transition-colors focus:border-[#1e7fff]/75 focus:bg-white/[0.09] focus:ring-2 focus:ring-[#1e7fff]/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-neutral-950">
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SettingSelectFloat({
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
      <span className="w-[46%] shrink-0 text-right text-white/88">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9 flex-1 rounded-lg border border-white/18 bg-white/[0.06] px-2.5 text-white outline-none transition-colors focus:border-[#1e7fff]/75 focus:bg-white/[0.09] focus:ring-2 focus:ring-[#1e7fff]/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-neutral-950">
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
      <span className="w-[46%] shrink-0 text-right text-white/88">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 flex-1 rounded-lg border border-white/18 bg-white/[0.06] px-2.5 text-white outline-none transition-colors focus:border-[#1e7fff]/75 focus:bg-white/[0.09] focus:ring-2 focus:ring-[#1e7fff]/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-neutral-950">
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
      <span className="w-[46%] shrink-0 text-right text-white/88">
        {label}
        {hint ? <span className="mt-0.5 block text-[10px] font-normal text-white/38">{hint}</span> : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-[22px] w-[22px] accent-[#1e7fff]"
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
      <span className="w-[46%] shrink-0 text-right text-white/88">{label}</span>
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
        <span className="w-10 shrink-0 text-right text-xs text-white/50">{format(value)}</span>
      </div>
    </label>
  );
}
