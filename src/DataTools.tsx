import { useState, type ChangeEvent } from 'react';
import { localToday, toIso, type Ord } from './engine/dates';
import { parseRanges } from './engine/ranges';
import type { Rules } from './engine/schengen';
import { parseExport, shareUrl, toExport } from './engine/share';
import { plural } from './format';
import type { SelectionStore } from './state/selection';

type DataToolsProps = { store: SelectionStore; selected: ReadonlySet<Ord>; rules: Rules };

const download = (name: string, text: string) => {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

const DataTools = ({ store, selected, rules }: DataToolsProps) => {
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');

  const submit = () => {
    const { days, errors } = parseRanges(text);
    if (errors.length) {
      setMessage(`Can't read line ${errors.join(', ')} (use YYYY-MM-DD YYYY-MM-DD)`);
      return;
    }
    store.add(days);
    setText('');
    setMessage(`Added ${plural(days.length, 'day')}`);
  };

  const exportJson = () => {
    download(
      `schengen-${toIso(localToday())}.json`,
      `${JSON.stringify(toExport(selected, rules), null, 2)}\n`,
    );
    setMessage(`Exported ${plural(selected.size, 'day')}`);
  };

  const importJson = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const days = parseExport(await file.text());
    if (days === null) {
      setMessage(`Can't read ${file.name}: not a Schengen export`);
      return;
    }
    store.add(days);
    setMessage(`Added ${plural(days.length, 'day')} from ${file.name}`);
  };

  const share = async () => {
    const url = shareUrl(location.href, selected);
    setLink(url);
    try {
      await navigator.clipboard.writeText(url);
      setMessage('Link copied');
    } catch {
      setMessage('Copy the link below');
    }
  };

  return (
    <details className="Summary-Tools">
      <summary>Import / export</summary>
      <textarea
        aria-label="Trips, one per line"
        placeholder={'2026-07-21 2026-08-02\n2026-10-04'}
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="Summary-Actions">
        <button type="button" onClick={submit} disabled={!text.trim()}>
          Add
        </button>
        <button
          type="button"
          onClick={() => window.confirm('Remove all marked days?') && store.clear()}
        >
          Clear all
        </button>
      </div>
      <div className="Summary-Actions">
        <button type="button" onClick={exportJson} disabled={!selected.size}>
          Export JSON
        </button>
        <label className="Summary-File">
          Import JSON
          <input type="file" accept="application/json,.json" onChange={(e) => void importJson(e)} />
        </label>
        <button type="button" onClick={() => void share()} disabled={!selected.size}>
          Share link
        </button>
      </div>
      {link ? (
        <input
          className="Summary-Link"
          aria-label="Share link"
          readOnly
          value={link}
          onFocus={(e) => e.target.select()}
        />
      ) : null}
      {message ? <p className="Summary-Message">{message}</p> : null}
    </details>
  );
};

export default DataTools;
