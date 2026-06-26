import { NoteRenderer } from "@openparachute/surface-render";
import rehypeHighlight from "rehype-highlight";
import {
  PLAY_ON_LABEL,
  STATUS_LABEL,
  type Song,
} from "../song";

export function SongDetail({ song }: { song: Song }) {
  return (
    <article className="detail">
      <header className="detail__header">
        <div className="detail__heading">
          <h2 className="detail__title">{song.title}</h2>
          {song.artist && <p className="detail__artist">{song.artist}</p>}
        </div>
        <span className={"badge badge--" + song.difficulty}>{song.difficulty}</span>
      </header>

      <dl className="facts">
        <Fact label="Status" value={STATUS_LABEL[song.status]} />
        <Fact label="Instrument" value={PLAY_ON_LABEL[song.playOn]} />
        {song.key && <Fact label="Key" value={song.key} />}
        <Fact label="Singing" value={song.sing ? "Yes" : "Not yet"} />
      </dl>

      <div className="detail__body">
        <NoteRenderer
          note={song.note}
          // Wikilinks stay in-app as inert fragments — never pass a raw vault
          // target straight into an href (a note could carry javascript:).
          resolve={(target) => ({
            href: `#/song/${encodeURIComponent(target)}`,
            exists: true,
          })}
          rehypePlugins={[rehypeHighlight]}
        />
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="facts__item">
      <dt className="facts__label">{label}</dt>
      <dd className="facts__value">{value}</dd>
    </div>
  );
}
