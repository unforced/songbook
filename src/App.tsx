import { useEffect, useMemo, useRef, useState } from "react";
import type { VaultClient } from "@openparachute/surface-client";
import { surface } from "./surface";
import { toSong, type Song } from "./song";
import { Library } from "./components/Library";

type Phase =
  | { kind: "connecting" }
  | { kind: "signed-out" }
  | { kind: "loading" }
  | { kind: "ready"; songs: Song[] }
  | { kind: "error"; message: string };

export function App() {
  const [phase, setPhase] = useState<Phase>({ kind: "connecting" });
  // Retain ONE VaultClient. getClient() builds a fresh client (and refresh
  // closure) on each call, so we must not call it per render — hold it here.
  const clientRef = useRef<VaultClient | null>(null);

  // Auth + initial data load. Runs once.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // If we're on the OAuth redirect, finish it (needs both code + state).
        const q = new URLSearchParams(window.location.search);
        if (q.get("code") && q.get("state")) {
          await surface.handleCallback();
          // handleCallback strips the query params; ensure we're back at root.
          window.history.replaceState({}, "", "/");
        }

        const client = surface.getClient();
        if (!client) {
          if (!cancelled) setPhase({ kind: "signed-out" });
          return;
        }
        clientRef.current = client;

        if (!cancelled) setPhase({ kind: "loading" });
        const notes = await client.queryNotes({ tag: "song", limit: 200 });
        if (cancelled) return;

        const songs = notes.map(toSong).sort((a, b) => a.title.localeCompare(b.title));
        setPhase({ kind: "ready", songs });
      } catch (err) {
        if (!cancelled) {
          setPhase({
            kind: "error",
            message: err instanceof Error ? err.message : String(err),
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = useMemo(
    () => () => {
      surface.logout();
      clientRef.current = null;
      setPhase({ kind: "signed-out" });
    },
    [],
  );

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <span className="app__brand-mark" aria-hidden>🎶</span>
          <div>
            <h1 className="app__title">Songbook</h1>
            <p className="app__subtitle">Your practice library</p>
          </div>
        </div>
        {phase.kind === "ready" && (
          <button className="btn btn--ghost" onClick={signOut}>
            Sign out
          </button>
        )}
      </header>

      <main className="app__main">
        {phase.kind === "connecting" && <Centered>Connecting…</Centered>}

        {phase.kind === "signed-out" && (
          <Centered>
            <div className="signin">
              <p className="signin__lead">
                Sign in to your Parachute vault to open your songbook.
              </p>
              <button className="btn btn--primary" onClick={() => surface.login()}>
                Sign in
              </button>
            </div>
          </Centered>
        )}

        {phase.kind === "loading" && <Centered>Loading your songs…</Centered>}

        {phase.kind === "error" && (
          <Centered>
            <div className="error">
              <p className="error__title">Something went wrong</p>
              <p className="error__detail">{phase.message}</p>
              <button className="btn" onClick={() => window.location.reload()}>
                Try again
              </button>
            </div>
          </Centered>
        )}

        {phase.kind === "ready" && <Library songs={phase.songs} />}
      </main>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="centered">{children}</div>;
}
