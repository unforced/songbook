import { useMemo, useState } from "react";
import {
  DIFFICULTY_ORDER,
  PLAY_ON_ICON,
  STATUS_LABEL,
  STATUS_ORDER,
  type PlayOn,
  type Song,
  type Status,
} from "../song";
import { SongDetail } from "./SongDetail";

type InstrumentFilter = "all" | PlayOn;

export function Library({ songs }: { songs: Song[] }) {
  const [query, setQuery] = useState("");
  const [instrument, setInstrument] = useState<InstrumentFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return songs.filter((s) => {
      if (instrument !== "all") {
        // "both" songs match either single-instrument filter too.
        const matches =
          s.playOn === instrument || s.playOn === "both" || instrument === "both";
        if (!matches) return false;
      }
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.key.toLowerCase().includes(q)
      );
    });
  }, [songs, query, instrument]);

  // Group the filtered songs by status, in journey order.
  const groups = useMemo(() => {
    return STATUS_ORDER.map((status) => ({
      status,
      items: filtered
        .filter((s) => s.status === status)
        .sort(
          (a, b) =>
            DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty] ||
            a.title.localeCompare(b.title),
        ),
    })).filter((g) => g.items.length > 0);
  }, [filtered]);

  const selected = useMemo(
    () => songs.find((s) => s.id === selectedId) ?? null,
    [songs, selectedId],
  );

  return (
    <div className="library">
      <aside className="library__list" aria-label="Song list">
        <div className="filters">
          <input
            className="filters__search"
            type="search"
            placeholder="Search title, artist, key…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="filters__chips" role="group" aria-label="Filter by instrument">
            {(["all", "harmonium", "guitar"] as InstrumentFilter[]).map((opt) => (
              <button
                key={opt}
                className={
                  "chip" + (instrument === opt ? " chip--active" : "")
                }
                onClick={() => setInstrument(opt)}
              >
                {opt === "all" ? "All" : opt[0].toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <SummaryBar songs={songs} />

        {groups.length === 0 ? (
          <p className="library__empty">No songs match your filters.</p>
        ) : (
          groups.map((g) => (
            <section key={g.status} className="group">
              <h2 className="group__title">
                {STATUS_LABEL[g.status]}
                <span className="group__count">{g.items.length}</span>
              </h2>
              <ul className="group__items">
                {g.items.map((song) => (
                  <li key={song.id}>
                    <SongRow
                      song={song}
                      active={song.id === selectedId}
                      onSelect={() => setSelectedId(song.id)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </aside>

      <section className="library__detail" aria-label="Song detail">
        {selected ? (
          <SongDetail song={selected} />
        ) : (
          <div className="detail-empty">
            <span className="detail-empty__mark" aria-hidden>♪</span>
            <p>Select a song to see its notes, chords, and key.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function SongRow({
  song,
  active,
  onSelect,
}: {
  song: Song;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={"song-row" + (active ? " song-row--active" : "")}
      onClick={onSelect}
      aria-current={active}
    >
      <span className="song-row__instrument" aria-hidden>
        {PLAY_ON_ICON[song.playOn]}
      </span>
      <span className="song-row__text">
        <span className="song-row__title">{song.title}</span>
        <span className="song-row__meta">
          {song.artist || "Unknown"}
          {song.key ? ` · ${song.key}` : ""}
        </span>
      </span>
      <span className={"badge badge--" + song.difficulty}>{song.difficulty}</span>
      {song.sing && (
        <span className="song-row__sing" title="Working on singing this too">
          🎤
        </span>
      )}
    </button>
  );
}

function SummaryBar({ songs }: { songs: Song[] }) {
  const counts = STATUS_ORDER.reduce(
    (acc, s) => {
      acc[s] = songs.filter((x) => x.status === s).length;
      return acc;
    },
    {} as Record<Status, number>,
  );
  return (
    <div className="summary">
      {STATUS_ORDER.map((s) => (
        <div key={s} className="summary__item">
          <span className="summary__num">{counts[s]}</span>
          <span className="summary__label">{STATUS_LABEL[s]}</span>
        </div>
      ))}
    </div>
  );
}
