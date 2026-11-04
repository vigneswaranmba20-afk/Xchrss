VER Chess Intelligence — Fix the missing Stockfish engine (Android)
=================================================================

CONFIRMED: On November 4, 2026 both your website's self-hosted Stockfish
JS and WASM paths returned HTTP 404. The board is live; the engine isn't.

EASIEST FIX — GITHUB WILL DOWNLOAD STOCKFISH FOR YOU
1. Open your Xchrss repository on github.com while signed in.
2. Tap Add file → Create new file.
3. In the filename box type exactly:
   .github/workflows/install-stockfish.yml
4. Copy/paste the text from this ZIP's install-stockfish.yml into the editor.
   Commit to main.
5. Open the repository's Actions tab, then "Install Stockfish 19 Lite".
   If the run has not started automatically, use "Run workflow" → main.
6. Wait for a GREEN CHECK. It will commit these two files in /engine:
   - stockfish-19-lite-single.js
   - stockfish-19-lite-single.wasm
7. Open the Xchrss Code tab, check that the /engine folder exists.
8. Replace the root index.html with the updated index.html in this ZIP,
   and commit this change. This human-made commit also triggers GitHub
   Pages deployment (a bot's commit alone may not trigger it).
9. Test both links in Chrome (they should download/serve files, not show 404):
   https://vigneswaranmba20-afk.github.io/Xchrss/engine/stockfish-19-lite-single.js
   https://vigneswaranmba20-afk.github.io/Xchrss/engine/stockfish-19-lite-single.wasm
10. Open your website, import a game, tap Analyse.

IF THE WORKFLOW SHOWS PERMISSION ERROR:
GitHub repo Settings → Actions → General → Workflow permissions →
Read and write permissions → Save. Then rerun the workflow.
You do NOT need to enable any paid service.

WHY THIS VERSION WORKS BETTER
The new index.html uses the first-party Stockfish script as a normal
same-origin Web Worker so that its matching WASM is loaded from the same
/engine/ folder, as the Stockfish.js documentation recommends. Existing
board, arrow UI, analysis animation, PGN importer, copyright remain.

NOTES:
- Do NOT upload the .tgz/npm package. Only the two small /engine/ files
  are committed. npm fetches the official package in GitHub Actions.
- GitHub Pages hosts files but chess calculations run in users' browsers.
- Engine is GPL-3.0; do not remove its copyright/source attributions.
- Stockfish engine files (JS+WASM) are ~1.7 MB total.
- Independent smoke test of a real end-to-end evaluation is not possible
  until the live repository actually contains the files.
