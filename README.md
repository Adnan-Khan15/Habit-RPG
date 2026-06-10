# Habit RPG ⚔️

Turn your real-life tasks into an RPG adventure. Complete habits, dailies, and to-dos to earn XP and gold, level up your character, buy cosmetic gear, and compete on the leaderboard.

## Features

### 🎮 Core Gameplay
- **3 task types** — Habits (repeatable, positive or negative), Dailies (reset daily, miss = HP loss), To-Dos (one-off with optional due dates)
- **RPG stats** — XP, levels (1–50), HP, gold, streak bonuses (up to +50% XP)
- **Classes** — Warrior, Mage, Rogue (determines character sprite, no gameplay difference)
- **Fainting** — HP reaches 0 → faint overlay, greyed stats, 24hr debuff
- **XP Boosts** — 1.5× XP for 1 hour (consumable from the store)

### 🏪 Store & Cosmetics
- **4 gear sets** — Iron (common), Shadow (rare, Lv10), Celestial (epic, Lv20), Dragon (legendary, Lv30)
- **Equip system** — gear shows visually on your SVG character sprite
- **Consumables** — HP Potion (+20 HP), XP Boost (1.5× for 1hr), Name Change Token
- **Level milestone rewards** — Shadow/Celestial/Dragon sets granted free at levels 10, 20, 30

### 👥 Social
- **Friends** — search by username, send/accept/decline/remove friend requests
- **Leaderboard** — real-time global ranking of public players by XP (Supabase Realtime)

### 🏆 Achievements
10 achievements auto-tracked after task completions and store purchases:

| Icon | Name | Requirement |
|------|------|-------------|
| ⚔️ | First Blood | Complete 1 task |
| 📜 | Task Master | Complete 500 tasks |
| 🔥 | Creature of Habit | 7-day streak |
| 💥 | On Fire | 30-day streak |
| 🏆 | Century | 100-day streak |
| 🌟 | Max Level | Reach level 50 |
| 🛒 | Shopaholic | Buy 5 items |
| 💎 | Collector | Own 10 unique cosmetics |
| 🦋 | Social Butterfly | Add 5 friends |
| 👑 | Top 10 | Reach leaderboard top 10 |

### ⚙️ Other
- **PWA** — installable on mobile/desktop, works offline via service worker
- **Daily reset** — configurable per user (in Settings); missed dailies cost 10 HP each
- **Data export** — download all your data as JSON
- **Account deletion** — deletes profile + auth user

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS v3 (dark theme) |
| State | Zustand |
| Server state | TanStack Query v5 |
| Routing | React Router v6 |
| Animation | Framer Motion |
| Backend | Supabase (Postgres, Auth, Realtime, Edge Functions) |
| PWA | vite-plugin-pwa (Workbox) |
| Fonts | Cinzel (headings), Inter (body), JetBrains Mono (mono) |

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)

### Installation

```bash
git clone https://github.com/Adnan-Khan15/Habit-RPG.git
cd Habit-RPG
npm install
cp .env.example .env.local
```

Fill in `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

```bash
npm run dev
```

### Database Setup

Run these migration files **in order** in your Supabase SQL Editor:

1. `supabase/migration.sql` — core schema (profiles, tasks, items, inventory, etc.)
2. `supabase/migration-003-rewards.sql` — gold pricing, level gates, milestone tracking
3. `supabase/migration-004-cron-daily-reset.sql` — pg_cron schedule + delete_user RPC
4. `supabase/migration-005-fixes.sql` — xp_boost_until column + inventory unique constraint

### Edge Functions

Deploy with Supabase CLI:

```bash
supabase functions deploy daily-reset
supabase functions deploy check-achievements
```

The `daily-reset` function runs every 30 minutes via pg_cron and handles:
- Missed daily HP penalties
- Streak resets for inactive users
- Updates `last_active_date`

## XP Formula

| Difficulty | Base XP | Gold |
|------------|---------|------|
| Trivial | 10 | 5 |
| Easy | 25 | 10 |
| Medium | 50 | 20 |
| Hard | 100 | 40 |

**XP for next level:** `round(100 × N^1.5 / 10) × 10` where N is current level.  
**Max HP:** `50 + level × 5`  
**Streak bonus:** up to +50% (adds 10% per consecutive day)

## Project Structure

```
src/
├── components/
│   ├── auth/          # Login, Signup, Onboarding
│   ├── character/     # CharacterPanel, PhaserCanvas (SVG), GearSlots
│   ├── layout/        # Sidebar, TopBar, MobileTabBar
│   ├── social/        # FriendsList, FriendCard, LeaderboardTable, LeaderboardRow
│   ├── store/         # StoreGrid, ItemCard
│   ├── tasks/         # TaskList, TaskCard, TaskCreateModal, HabitStreakBadge
│   └── ui/            # Button, Modal, Badge, Avatar, ProgressBar, Toast, etc.
├── hooks/             # useCharacter, useTasks, useStore, useFriends, useLeaderboard, etc.
├── lib/               # xpFormulas, achievementChecker, supabase client
├── pages/             # DashboardLayout, TasksPage, CharacterPage, StorePage, etc.
└── store/             # characterStore, authStore, taskStore, notificationStore
```

## License

MIT
