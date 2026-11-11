import { useEffect, useMemo } from 'react';
import './App.css';
import Calendar from './Calendar';
import Summary from './Summary';
import { analyze, visibleRange } from './engine/schengen';
import { I18N, I18nContext } from './i18n';
import { settings as defaultSettings, type Settings } from './settings';
import { applyTheme, prefsStore, usePrefs, type PrefsStore } from './state/prefs';
import { selectionStore, useHistory, useSelection, type SelectionStore } from './state/selection';
import { useDragSelect } from './state/useDragSelect';
import { useGridKeys } from './state/useGridKeys';
import { useSharedLink } from './state/useSharedLink';
import { useToday } from './state/useToday';

type AppProps = { store?: SelectionStore; settings?: Settings; prefs?: PrefsStore };

const isEditable = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

const App = ({
  store = selectionStore,
  settings = defaultSettings,
  prefs = prefsStore,
}: AppProps) => {
  const { lang, theme, weekStart: storedWeek } = usePrefs(prefs);
  const i18n = I18N[lang];
  const weekStart = storedWeek ?? settings.weekStart ?? 1;
  const today = useToday();
  const selected = useSelection(store);
  const history = useHistory(store);
  useSharedLink(store, i18n.t.confirmShared);
  const range = useMemo(
    () => visibleRange(today, settings, settings.windowsAhead),
    [today, settings],
  );
  const drag = useDragSelect({
    selected,
    min: range.firstRelevant,
    max: range.to,
    onCommit: store.set,
  });
  const keys = useGridKeys({
    today,
    weekStart,
    min: range.firstRelevant,
    max: range.to,
    listRef: drag.listRef,
    onToggle: store.toggle,
    onAdd: store.add,
  });
  const shown = drag.preview ?? selected;
  const analysis = useMemo(
    () => analyze(shown, range.from, range.to, settings),
    [shown, range, settings],
  );

  useEffect(() => applyTheme(theme), [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = i18n.t.title;
  }, [lang, i18n]);

  useEffect(() => store.prune(range.firstRelevant), [store, range.firstRelevant]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || isEditable(e.target)) return;
      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) store.undo();
      else if ((key === 'z' && e.shiftKey) || key === 'y') store.redo();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [store]);

  return (
    <I18nContext value={i18n}>
      <div className="App">
        <Summary
          today={today}
          rules={settings}
          selected={shown}
          analysis={analysis}
          store={store}
          history={history}
          firstRelevant={range.firstRelevant}
          prefs={prefs}
          weekStart={weekStart}
        />
        <Calendar
          from={range.from}
          to={range.to}
          firstRelevant={range.firstRelevant}
          today={today}
          selected={shown}
          analysis={analysis}
          max={settings.max}
          range={drag.range}
          listRef={drag.listRef}
          handlers={drag.handlers}
          focus={keys.focus}
          weekStart={weekStart}
          keys={{ onKeyDown: keys.onKeyDown, onFocus: keys.onFocus }}
        />
      </div>
    </I18nContext>
  );
};

export default App;
