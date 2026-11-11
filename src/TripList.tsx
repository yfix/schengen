import { useState } from 'react';
import { parseIso, toIso, type Ord } from './engine/dates';
import { toTrips, tripLength, type Trip } from './engine/ranges';
import { useI18n } from './i18n';
import type { SelectionStore } from './state/selection';

type EditorProps = { trip: Trip; min: Ord; onSave: (trip: Trip) => void; onCancel: () => void };

const TripEditor = ({ trip, min, onSave, onCancel }: EditorProps) => {
  const { t } = useI18n();
  const [start, setStart] = useState(toIso(trip.start));
  const [end, setEnd] = useState(toIso(trip.end));
  const s = parseIso(start);
  const e = parseIso(end);
  const valid = s !== null && e !== null && s <= e && s >= min;
  return (
    <form
      className="TripList-Editor"
      onSubmit={(ev) => {
        ev.preventDefault();
        if (valid) onSave({ start: s, end: e });
      }}
    >
      <input
        type="date"
        aria-label={t.entry}
        value={start}
        min={toIso(min)}
        onChange={(ev) => setStart(ev.target.value)}
      />
      <input
        type="date"
        aria-label={t.exit}
        value={end}
        min={start}
        onChange={(ev) => setEnd(ev.target.value)}
      />
      <button type="submit" disabled={!valid}>
        {t.save}
      </button>
      <button type="button" onClick={onCancel}>
        {t.cancel}
      </button>
    </form>
  );
};

type TripListProps = { selected: ReadonlySet<Ord>; min: Ord; store: SelectionStore };

const TripList = ({ selected, min, store }: TripListProps) => {
  const { t, fmt, days } = useI18n();
  const [editing, setEditing] = useState<Ord | null>(null);
  const trips = toTrips(selected);
  if (!trips.length) return null;
  return (
    <details className="Summary-Tools TripList">
      <summary>{t.trips(trips.length)}</summary>
      <ul>
        {trips.map((trip) => (
          <li key={trip.start}>
            {editing === trip.start ? (
              <TripEditor
                trip={trip}
                min={min}
                onCancel={() => setEditing(null)}
                onSave={(next) => {
                  store.replaceRange(trip, next);
                  setEditing(null);
                }}
              />
            ) : (
              <>
                <span className="TripList-Dates">
                  {fmt.day(trip.start)}
                  {trip.end > trip.start ? ` – ${fmt.day(trip.end)}` : ''}
                </span>
                <span className="TripList-Length">{days(tripLength(trip))}</span>
                <button
                  type="button"
                  onClick={() => setEditing(trip.start)}
                  aria-label={t.editTrip(fmt.day(trip.start))}
                >
                  {t.edit}
                </button>
                <button
                  type="button"
                  onClick={() => store.replaceRange(trip, null)}
                  aria-label={t.deleteTrip(fmt.day(trip.start))}
                >
                  {t.delete}
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </details>
  );
};

export default TripList;
