# Android PWA device QA

Physical Android testing: **PENDING**. Chromium mobile emulation is automated
Android-like evidence, not handset or installed-app certification.

Use only your Android phone, first in Chrome and then in the installed VER Chess
app: https://vigneswaranmba20-afk.github.io/Xchrss/ . Keep saved games and storage.
Do not uninstall the app or clear Chrome/app data to update it.

- [ ] **Install or update online.** Open the link in Android Chrome. Use Chrome
  **⋮ → Install app / Add to Home screen** if needed. Existing users: reopen
  online; when offered, tap **Reload update** after finishing your current review.
  Check that your existing saved games and PGNs still appear.
- [ ] **Board visibility.** Open a saved game or upload a PGN from your phone.
  At normal zoom, see all eight ranks and eight files above the bottom controls.
  Check Previous, Next, Reset board, Flip, Insights, and return to Board. Rotate
  once and return to portrait. Open **Read full**, try its available positions,
  and tap Done; confirm the same game and move remain selected.
- [ ] **Touch.** In Learn → Knight fork, tap e5, then f7. Tap Try again and drag
  the knight e5 → f7. A cancelled drag should leave the position intact, with no
  floating piece or accidental page scroll. Try Absolute pin too.
- [ ] **Lesson playback.** Step through Observe, Discover, Animate, Explain,
  Practice, Review. Check Back, Replay, Flip, and Close.
  **Lure, then fork** is the new combination: inspect the position, choose a
  candidate, then check Pause, Previous/Next move, Replay and Exit during
  playback. In Explain → Why this works, compare **…Kh7** and **…Kg8**. Complete
  Practice with the rook lure, knight check and queen capture. Enable Android's
  Remove animations option and repeat.
- [ ] **Stockfish online.** Wait for the offline-ready message, then analyse a
  short completed PGN. Confirm analysis starts and produces legal move advice.
- [ ] **Offline restart.** After the successful online visit, turn on airplane
  mode, close the app normally, and reopen from its icon. Confirm the board,
  previously loaded lessons, and a PGN uploaded from your phone work. Analyse a
  short PGN offline and confirm Stockfish starts. Online account searches require
  a connection. Reconnect afterward.
- [ ] **Preservation and retry.** Reopen online and check saved PGNs again. If a
  download was interrupted, reconnect and reopen; completed engine files should
  be reused. Use Reload update if offered. Never clear storage to recover.
- [ ] **Report unexpected behaviour.** Record phone model, Android and Chrome
  versions, Chrome versus installed app, portrait/landscape, online/offline,
  exact taps, selected game/move, and any error text. A phone screenshot or short
  screen recording helps; omit private usernames or PGN details if preferred.

Owner result: date ______ phone ______ Android ______ Chrome ______

Chrome checks: PASS / FAIL / PENDING ______

Installed PWA checks: PASS / FAIL / PENDING ______

Notes: ______
