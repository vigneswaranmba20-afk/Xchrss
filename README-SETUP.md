# VER Chess Intelligence 2.1 — Analysis Loading Animation

New: A full-screen, mobile-friendly analysis experience appears when you click **Analyse entire game**. It shows engine startup, real position-by-position progress, a Stop button, a success transition and readable errors. Existing PGN importing, chessboard, arrows, self-hosted Stockfish and copyright remain.

# VER Chess Intelligence — self-hosted Stockfish upgrade

YES: You can host Stockfish in your GitHub Pages repository, beside the app.

This package contains the upgraded index.html with local-first engine loading and
persistent browser Cache Storage. The Stockfish binary itself is NOT included.
You must add the matching two engine files (instructions below).

YOUR SITE:
https://vigneswaranmba20-afk.github.io/Xchrss/

## Upload on your Android phone
1. Replace the root index.html in your Xchrss repository with this package's index.html.
2. Download the two original engine files (about 1.7 MB combined):
   https://cdn.jsdelivr.net/npm/stockfish@19.0.1/bin/stockfish-19-lite-single.js
   https://cdn.jsdelivr.net/npm/stockfish@19.0.1/bin/stockfish-19-lite-single.wasm
3. Add both to a folder named engine in your GitHub repository (exact spelling).
4. Add COPYRIGHT.md and GPL-3.0-STOCKFISH-LICENSE.txt to repository root.
5. Commit your changes. Wait for GitHub Pages deployment.
6. Open the website and analyse a sample PGN.
   Expected status: 'Self-hosted Stockfish 19 · ready' on first load,
   then 'Self-hosted Stockfish 19 · cached' on repeat visits from the same browser.

Folder tree:
Xchrss/
  index.html
  COPYRIGHT.md
  GPL-3.0-STOCKFISH-LICENSE.txt
  engine/
    stockfish-19-lite-single.js
    stockfish-19-lite-single.wasm

What the upgrade does:
* Local engine is attempted first, with the matching WASM file.
* If present, engine loads from your own github.io website.
* Cache Storage retains fetched engine assets across visits (subject to browser eviction).
* CDN fallback still works if files are not uploaded, avoiding disruption.
* No paid chess API and no server-side computation.

IMPORTANT: Self-hosted engine still has to be downloaded by each visitor's browser
on first use, and sometimes if browser cache was cleared. Local hosting does not
mean the wasm runs on GitHub servers.

Engine license: GPL-3.0. Source: https://github.com/nmrugg/stockfish.js
Your original website copyright applies only to your protectable original material,
not Stockfish or Cburnett third-party piece artwork.

Termux option to download files:
  pkg install curl -y
  mkdir -p ~/storage/downloads/ver-chess-engine
  curl -fL 'https://cdn.jsdelivr.net/npm/stockfish@19.0.1/bin/stockfish-19-lite-single.js' -o ~/storage/downloads/ver-chess-engine/stockfish-19-lite-single.js
  curl -fL 'https://cdn.jsdelivr.net/npm/stockfish@19.0.1/bin/stockfish-19-lite-single.wasm' -o ~/storage/downloads/ver-chess-engine/stockfish-19-lite-single.wasm
(If ~/storage/downloads doesn't exist, run termux-setup-storage and grant permission.)
