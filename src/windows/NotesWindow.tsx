// src/windows/NotesWindow.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import DraggableWindow from "../components/DraggableWindow";
import { useUI } from "../state/uiStore";

type Note = {
  id: string;
  text: string;
  createdAt: number;
  visibility: "public" | "admin";
};

const NOTES_KEY = "edvni.notes.v1";

function readNotes(): Note[] {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeNotes(notes: Note[]) {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch {
    // ignore
  }
}

export default function NotesWindow() {
  const closeNotes = useUI((s) => s.closeNotes);
  const focusWindow = useUI((s) => s.focusWindow);
  const isAdmin = useUI((s) => s.isAdmin);

  const [text, setText] = useState("");
  const [adminOnly, setAdminOnly] = useState(false);
  const [notes, setNotes] = useState<Note[]>(() => readNotes());

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    focusWindow("notes");
    inputRef.current?.focus();
  }, [focusWindow]);

  useEffect(() => {
    writeNotes(notes);
  }, [notes]);

  const visibleNotes = useMemo(() => {
    const sorted = [...notes].sort((a, b) => b.createdAt - a.createdAt);
    return isAdmin ? sorted : sorted.filter((n) => n.visibility === "public");
  }, [notes, isAdmin]);

  const addNote = () => {
    const t = text.trim();
    if (!t) return;

    const next: Note = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      text: t,
      createdAt: Date.now(),
      visibility: adminOnly ? "admin" : "public",
    };

    setNotes((n) => [next, ...n]);
    setText("");
    setAdminOnly(false);
    inputRef.current?.focus();
  };

  const deleteNote = (id: string) => {
    setNotes((n) => n.filter((x) => x.id !== id));
  };

  return (
    <DraggableWindow
      windowKey="notes"
      defaultSize={{ width: 820, height: 620 }}
      titleBar={({ onPointerDown }) => (
        <div
          onPointerDown={onPointerDown}
          style={{
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderBottom: "1px solid var(--border)",
            background: "var(--panelSolid)",
            borderTopLeftRadius: 18,
            borderTopRightRadius: 18,
            cursor: "grab",
            userSelect: "none",
          }}
        >
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              onClick={closeNotes}
              title="Close"
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                border: "none",
                background: "rgba(255,95,86,0.92)",
                cursor: "pointer",
                padding: 0,
              }}
            />
            <div style={{ width: 10, height: 10, borderRadius: 999, background: "rgba(255,189,46,0.9)" }} />
            <div style={{ width: 10, height: 10, borderRadius: 999, background: "rgba(39,201,63,0.9)" }} />
          </div>

          <div style={{ marginLeft: 6, color: "var(--fg)", fontSize: 13, fontWeight: 650 }}>Notes</div>

          <div style={{ marginLeft: "auto", color: "var(--muted)", fontSize: 12 }}>
            Leave feedback • Public or Admin-only
          </div>
        </div>
      )}
    >
      <div
        style={{
          height: "calc(620px - 44px)",
          borderBottomLeftRadius: 18,
          borderBottomRightRadius: 18,
          border: "1px solid var(--border)",
          borderTop: "none",
          background: "var(--panelSolid)",
          boxShadow: "var(--shadow)",
          overflow: "hidden",
          display: "grid",
          gridTemplateRows: "auto 1fr",
        }}
      >
        {/* composer */}
        <div style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Leave a note about this portfolio (feedback, impressions, suggestions)…"
            style={{
              width: "100%",
              minHeight: 90,
              resize: "none",
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 12,
              color: "var(--fg)",
              outline: "none",
              lineHeight: 1.5,
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)" }}>
              <input type="checkbox" checked={adminOnly} onChange={(e) => setAdminOnly(e.target.checked)} />
              Admin only
            </label>

            <button
              onClick={addNote}
              style={{
                marginLeft: "auto",
                border: "1px solid var(--border)",
                background: "var(--panel)",
                color: "var(--fg)",
                borderRadius: 12,
                padding: "10px 12px",
                cursor: "pointer",
              }}
            >
              Add Note
            </button>
          </div>

          <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 12 }}>
            Public notes are visible to anyone. Admin-only notes are hidden unless you’re logged in as admin.
          </div>
        </div>

        {/* list */}
        <div style={{ padding: 14, overflow: "auto" }}>
          {visibleNotes.length === 0 ? (
            <div style={{ color: "var(--muted)" }}>No notes yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {visibleNotes.map((n) => (
                <div
                  key={n.id}
                  style={{
                    border: "1px solid var(--border)",
                    background: "var(--panel)",
                    borderRadius: 14,
                    padding: 12,
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <div style={{ whiteSpace: "pre-wrap", color: "var(--fg)", lineHeight: 1.5 }}>{n.text}</div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>
                      {new Date(n.createdAt).toLocaleString()} • {n.visibility === "admin" ? "Admin-only" : "Public"}
                    </div>

                    {isAdmin ? (
                      <button
                        onClick={() => deleteNote(n.id)}
                        style={{
                          marginLeft: "auto",
                          border: "1px solid var(--border)",
                          background: "var(--panelSolid)",
                          color: "var(--fg)",
                          borderRadius: 10,
                          padding: "6px 10px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DraggableWindow>
  );
}
