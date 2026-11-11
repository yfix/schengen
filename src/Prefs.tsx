import { useI18n } from './i18n';
import { usePrefs, type Lang, type PrefsStore, type Theme } from './state/prefs';

type Option<T> = { value: T; label: string; title?: string };

const Segmented = <T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
}) => (
  <div className="Prefs-Group" role="group" aria-label={label}>
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        aria-pressed={o.value === value}
        title={o.title ?? o.label}
        aria-label={o.title ?? o.label}
        onClick={() => onChange(o.value)}
      >
        {o.label}
      </button>
    ))}
  </div>
);

type PrefsProps = { store: PrefsStore; weekStart: number };

const Prefs = ({ store, weekStart }: PrefsProps) => {
  const { t } = useI18n();
  const prefs = usePrefs(store);
  return (
    <div className="Prefs" role="toolbar" aria-label={t.prefs}>
      <Segmented<Lang>
        label={t.language}
        value={prefs.lang}
        options={[
          { value: 'uk', label: 'УКР', title: 'Українська' },
          { value: 'en', label: 'EN', title: 'English' },
        ]}
        onChange={(lang) => store.update({ lang })}
      />
      <Segmented<number>
        label={t.weekStart}
        value={weekStart}
        options={[
          { value: 1, label: t.monday },
          { value: 0, label: t.sunday },
        ]}
        onChange={(w) => store.update({ weekStart: w })}
      />
      <Segmented<Theme>
        label={t.theme}
        value={prefs.theme}
        options={[
          { value: 'auto', label: t.themeAuto },
          { value: 'light', label: '☀', title: t.themeLight },
          { value: 'dark', label: '☾', title: t.themeDark },
        ]}
        onChange={(theme) => store.update({ theme })}
      />
    </div>
  );
};

export default Prefs;
