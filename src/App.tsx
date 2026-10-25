import { useEffect, useMemo } from 'react';
import './App.css';
import Calendar from './Calendar';
import Summary from './Summary';
import { analyze, visibleRange } from './engine/schengen';
import { settings as defaultSettings, type Settings } from './settings';
import { selectionStore, useHistory, useSelection, type SelectionStore } from './state/selection';
import { useDragSelect } from './state/useDragSelect';
import { useToday } from './state/useToday';

type AppProps = { store?: SelectionStore; settings?: Settings };

const isEditable = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

const App = ({ store = selectionStore, settings = defaultSettings }: AppProps) => {
  const today = useToday();
  const selected = useSelection(store);
  const history = useHistory(store);
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
  const shown = drag.preview ?? selected;
  const analysis = useMemo(
    () => analyze(shown, range.from, range.to, settings),
    [shown, range, settings],
  );

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
    <div className="App">
      <Summary
        today={today}
        rules={settings}
        selected={shown}
        analysis={analysis}
        store={store}
        history={history}
      />
      <Calendar
        from={range.from}
        to={range.to}
        firstRelevant={range.firstRelevant}
        today={today}
        selected={shown}
        analysis={analysis}
        range={drag.range}
        listRef={drag.listRef}
        handlers={drag.handlers}
      />
    </div>
  );
};

export default App;
