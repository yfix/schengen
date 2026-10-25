import { useEffect, useMemo } from 'react';
import './App.css';
import Calendar from './Calendar';
import Summary from './Summary';
import { analyze, visibleRange } from './engine/schengen';
import { settings as defaultSettings, type Settings } from './settings';
import { selectionStore, useSelection, type SelectionStore } from './state/selection';
import { useToday } from './state/useToday';

type AppProps = { store?: SelectionStore; settings?: Settings };

const App = ({ store = selectionStore, settings = defaultSettings }: AppProps) => {
  const today = useToday();
  const selected = useSelection(store);
  const range = useMemo(
    () => visibleRange(today, settings, settings.windowsAhead),
    [today, settings],
  );
  const analysis = useMemo(
    () => analyze(selected, range.from, range.to, settings),
    [selected, range, settings],
  );

  useEffect(() => store.prune(range.firstRelevant), [store, range.firstRelevant]);

  return (
    <div className="App">
      <Summary
        today={today}
        rules={settings}
        selected={selected}
        analysis={analysis}
        store={store}
      />
      <Calendar
        from={range.from}
        to={range.to}
        firstRelevant={range.firstRelevant}
        today={today}
        selected={selected}
        analysis={analysis}
        onToggle={store.toggle}
      />
    </div>
  );
};

export default App;
