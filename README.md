# 🐸 Frog Race — Multiplayer Typing Game

A real-time multiplayer typing race game where players race as frogs by typing a passage as fast and accurately as possible. Built with **React + Vite** (frontend) and **PartyKit** (real-time multiplayer backend).

---

## ✨ Features

- 🏠 **Create or join rooms** with a 6-character room code
- 🐸 **Frog avatars** that visibly hop forward as you type
- 🏁 **Live race track** showing all players' progress at a glance
- ⚙️ **Host settings** — configure word count (min 500) and time limit
- ✅ **Ready system** — host can only start when all players are ready
- ⏱ **Countdown** before the race begins
- 📊 **WPM + accuracy tracking** per player
- 🏆 **Results screen** with rankings, stats, and rematch option
- 📱 Responsive — works on desktop and mobile

---

## 🗂 Project Structure

```
frogracing/
├── party/
│   └── server.ts          # PartyKit real-time server (room & game logic)
├── src/
│   ├── lib/
│   │   ├── types.ts        # Shared types (RoomState, Player, Messages)
│   │   └── textGen.ts      # Passage generator
│   ├── hooks/
│   │   └── useRoom.ts      # React hook — PartyKit WebSocket connection
│   ├── components/
│   │   ├── RaceTrack.tsx   # Frog lane visualizer
│   │   └── TypingBox.tsx   # Typing input with character highlighting
│   ├── pages/
│   │   ├── LandingPage.tsx # Create / Join room
│   │   ├── LobbyPage.tsx   # Waiting room + settings
│   │   ├── RacePage.tsx    # Countdown + race screen
│   │   └── ResultsPage.tsx # Final rankings + rematch
│   ├── App.tsx             # Root — routing between screens
│   ├── main.tsx            # Entry point
│   └── styles.css          # Full design system
├── index.html
├── vite.config.ts
├── tsconfig.json
├── partykit.json           # PartyKit project config
├── vercel.json             # Vercel deploy config
├── .env.example            # Environment variable reference
└── package.json
```

---

## 🚀 Quick Start (Local Development)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

The default `.env` already points to `localhost:1999` (PartyKit's dev port) — no changes needed for local dev.

### 3. Run both servers concurrently

```bash
npm run dev
```

This starts:
- **Vite** dev server on `http://localhost:3000`
- **PartyKit** dev server on `http://localhost:1999`

Open `http://localhost:3000` in two browser tabs to test multiplayer locally.

---

## 🌐 Deployment

### Step 1 — Deploy the PartyKit server

You need a free PartyKit account. Sign up at [partykit.io](https://partykit.io) if you haven't.

```bash
# Authenticate with PartyKit
npx partykit login

# Deploy the server
npm run party:deploy
```

After deployment, you'll see your host printed in the terminal:

```
✓ Deployed to: frogracing.YOUR-USERNAME.partykit.dev
```

Copy that URL — you'll need it for the next step.

### Step 2 — Deploy the frontend to Vercel

#### Option A — Vercel CLI

```bash
# Install Vercel CLI if needed
npm install -g vercel

# Add the PartyKit host as an environment variable, then deploy
vercel --env VITE_PARTYKIT_HOST=frogracing.YOUR-USERNAME.partykit.dev
```

#### Option B — Vercel Dashboard

1. Push this project to a GitHub/GitLab/Bitbucket repo.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo.
3. In **Environment Variables**, add:
   - Key: `VITE_PARTYKIT_HOST`
   - Value: `frogracing.YOUR-USERNAME.partykit.dev`
4. Click **Deploy**.

> ⚠️ **Important:** The `VITE_PARTYKIT_HOST` must NOT include `https://` — just the hostname.

---

## 🎮 How to Play

1. **Host** opens the app, enters their name, clicks **Create Room**.
2. A 6-character **room code** appears in the lobby header — share it with friends.
3. **Players** enter the room code on the landing screen and click **Join Race**.
4. Each non-host player clicks **Ready Up** when they're ready.
5. Once all players are ready, the host can click **Start Race!**
6. A **3-2-1 countdown** plays, then typing begins.
7. Type the displayed passage as fast and accurately as possible.
8. **First to finish wins** — or if time runs out, the player with the highest progress wins.
9. After the race, the host can click **Play Again** for a rematch.

---

## ⚙️ Game Settings (Host Only)

Click the ⚙️ gear icon in the lobby to configure:

| Setting | Default | Min | Max |
|---------|---------|-----|-----|
| Word Count | 500 | 500 | 2000 |
| Time Limit | 120s | 30s | 600s |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Real-time backend | PartyKit |
| WebSocket client | partysocket |
| Frontend hosting | Vercel |
| Fonts | Fredoka One, Nunito, Space Mono (Google Fonts) |

---

## 🔧 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite + PartyKit dev servers together |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview the production build locally |
| `npm run party:dev` | Start only the PartyKit dev server |
| `npm run party:deploy` | Deploy PartyKit server to production |

---

## 📝 Notes

- **Room persistence**: Rooms exist as long as at least one player is connected. Rooms reset automatically when empty.
- **Host migration**: If the host disconnects, the next player in the room automatically becomes host.
- **Late joins**: Players who join while a race is in progress will see a "race in progress" message and can participate in the next round.
- **Text generation**: Passages are generated server-side from a curated word pool and assembled into sentences. The server ensures both players in the same room receive the exact same text.

---

## 🐸 Credits

Built with 💚 using React, Vite, and PartyKit.
