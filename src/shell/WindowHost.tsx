import TerminalOverlay from "../overlays/TerminalOverlay";
import NotesWindow from "../windows/NotesWindow";
import { useUI } from "../state/uiStore";

export default function WindowHost() {
  const terminalOpen = useUI((s) => s.terminalOpen);
  const notesOpen = useUI((s) => s.notesOpen);

  return (
    <>
      {terminalOpen && <TerminalOverlay />}
      {notesOpen && <NotesWindow />}
    </>
  );
}
