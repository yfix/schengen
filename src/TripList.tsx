import { useState } from 'react';
import { parseIso, toIso, type Ord } from './engine/dates';
import { toTrips, tripLength, type Trip } from './engine/ranges';
import { formatDay, plural } from './format';
import type { SelectionStore } from './state/selection';

type EditorProps = { trip: Trip; min: Ord; onSave: (trip: Trip) => void; onCancel: () => void };

const TripEditor = ({ trip, min, onSave, onCancel }: EditorProps) => {
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
        aria-label="Entry"
        value={start}
        min={toIso(min)}
        onChange={(ev) => setStart(ev.target.value)}
      />
      <input
        type="date"
        aria-label="Exit"
        value={end}
        min={start}
        onChange={(ev) => setEnd(ev.target.value)}
      />
      <button type="submit" disabled={!valid}>
        Save
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
};

type TripListProps = { selected: ReadonlySet<Ord>; min: Ord; store: SelectionStore };

const TripList = ({ selected, min, store }: TripListProps) => {
  const [editing, setEditing] = useState<Ord | null>(null);
  const trips = toTrips(selected);
  if (!trips.length) return null;
  return (
    <details className="Summary-Tools TripList">
      <summary>Trips ({trips.length})</summary>
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
                  {formatDay(trip.start)}
                  {trip.end > trip.start ? ` – ${formatDay(trip.end)}` : ''}
                </span>
                <span className="TripList-Length">{plural(tripLength(trip), 'day')}</span>
                <button
                  type="button"
                  onClick={() => setEditing(trip.start)}
                  aria-label={`Edit trip from ${formatDay(trip.start)}`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => store.replaceRange(trip, null)}
                  aria-label={`Delete trip from ${formatDay(trip.start)}`}
                >
                  Delete
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
