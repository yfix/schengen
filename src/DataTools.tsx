import { useState, type ChangeEvent } from 'react';
import { localToday, toIso, type Ord } from './engine/dates';
import { toIcs } from './engine/ics';
import { parseRanges } from './engine/ranges';
import type { Rules } from './engine/schengen';
import { parseExport, shareUrl, toExport } from './engine/share';
import { useI18n } from './i18n';
import type { SelectionStore } from './state/selection';

type DataToolsProps = { store: SelectionStore; selected: ReadonlySet<Ord>; rules: Rules };

const download = (name: string, text: string, type: string) => {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

const DataTools = ({ store, selected, rules }: DataToolsProps) => {
  const { t } = useI18n();
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');

  const submit = () => {
    const { days, errors } = parseRanges(text);
    if (errors.length) {
      setMessage(t.cantReadLines(errors.join(', ')));
      return;
    }
    store.add(days);
    setText('');
    setMessage(t.added(days.length));
  };

  const exportJson = () => {
    download(
      `schengen-${toIso(localToday())}.json`,
      `${JSON.stringify(toExport(selected, rules), null, 2)}\n`,
      'application/json',
    );
    setMessage(t.exported(selected.size));
  };

  const exportIcs = () => {
    download(`schengen-${toIso(localToday())}.ics`, toIcs(selected), 'text/calendar');
    setMessage(t.exportedCalendar);
  };

  const importJson = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const days = parseExport(await file.text());
    if (days === null) {
      setMessage(t.notExport(file.name));
      return;
    }
    store.add(days);
    setMessage(t.addedFrom(days.length, file.name));
  };

  const share = async () => {
    const url = shareUrl(location.href, selected);
    setLink(url);
    try {
      await navigator.clipboard.writeText(url);
      setMessage(t.linkCopied);
    } catch {
      setMessage(t.copyBelow);
    }
  };

  return (
    <details className="Summary-Tools">
      <summary>{t.tools}</summary>
      <textarea
        aria-label={t.tripsInput}
        placeholder={'2026-07-21 2026-08-02\n2026-10-04'}
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="Summary-Actions">
        <button type="button" onClick={submit} disabled={!text.trim()}>
          {t.add}
        </button>
        <button type="button" onClick={() => window.confirm(t.confirmClear) && store.clear()}>
          {t.clearAll}
        </button>
      </div>
      <div className="Summary-Actions">
        <button type="button" onClick={exportJson} disabled={!selected.size}>
          {t.exportJson}
        </button>
        <button type="button" onClick={exportIcs} disabled={!selected.size}>
          {t.exportIcs}
        </button>
        <label className="Summary-File">
          {t.importJson}
          <input type="file" accept="application/json,.json" onChange={(e) => void importJson(e)} />
        </label>
        <button type="button" onClick={() => void share()} disabled={!selected.size}>
          {t.shareLink}
        </button>
      </div>
      {link ? (
        <input
          className="Summary-Link"
          aria-label={t.shareLink}
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
