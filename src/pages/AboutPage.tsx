const section = 'mb-8';
const heading = 'text-lg font-display text-accent-gold mb-3';
const subheading = 'text-sm font-semibold text-text-primary mt-4 mb-2';
const text = 'text-sm text-text-muted leading-relaxed';
const tableHead = 'text-left text-xs text-text-muted uppercase px-3 py-2';
const tableCell = 'text-sm text-text-primary px-3 py-2 border-b border-border';

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display text-accent-gold mb-2">Habit RPG</h1>
        <p className="text-sm text-text-muted">Turn your real-life tasks into an RPG adventure</p>
      </div>

      <section className={section}>
        <h2 className={heading}>What is Habit RPG?</h2>
        <p className={text}>
          Habit RPG is a gamified productivity app. You create real-life tasks (habits, dailies, and to-dos),
          complete them to earn <span className="text-accent-purple">XP</span> and{' '}
          <span className="text-accent-gold">gold</span>, level up your character, buy cosmetic gear,
          and compete on the leaderboard. It turns your daily routine into a role-playing game.
        </p>
      </section>

      <section className={section}>
        <h2 className={heading}>Getting Started</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-text-muted">
          <li><span className="text-text-primary">Sign up</span> — create an account with email or Google.</li>
          <li><span className="text-text-primary">Choose your class</span> — Warrior, Mage, or Rogue. This changes your character sprite only, no gameplay stats.</li>
          <li><span className="text-text-primary">Name your hero</span> — pick a display name.</li>
          <li><span className="text-text-primary">Pick starter habits</span> — select at least 3 habits to begin tracking.</li>
          <li><span className="text-text-primary">Start completing tasks</span> — earn XP, gold, and level up!</li>
        </ol>
      </section>

      <section className={section}>
        <h2 className={heading}>Tasks</h2>
        <p className="text-sm text-text-muted mb-3">There are three types of tasks, each serving a different purpose:</p>

        <div className="space-y-4">
          <div className="bg-bg-card rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold text-accent-green mb-1">🔄 Habits</h3>
            <p className="text-xs text-text-muted">
              Things you do repeatedly throughout the day (or want to stop doing).
              Tap the check circle to log a <span className="text-accent-green">positive</span> occurrence,
              or tap the <span className="text-accent-red">-</span> button for negative habits (costs 5 HP).
              Habits reset each day — you can complete them multiple times.
            </p>
          </div>

          <div className="bg-bg-card rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold text-accent-red mb-1">📅 Dailies</h3>
            <p className="text-xs text-text-muted">
              Tasks you need to do once per day. If you miss a daily at reset time,
              your character loses 10 HP per missed daily. Dailies auto-reset each day.
              You can set a custom daily reset time in Settings.
            </p>
          </div>

          <div className="bg-bg-card rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold text-accent-purple mb-1">📌 To-Dos</h3>
            <p className="text-xs text-text-muted">
              One-time tasks with optional due dates. Mark them complete when done — no penalty for missing them.
              Great for projects, assignments, or goals with deadlines.
            </p>
          </div>
        </div>
      </section>

      <section className={section}>
        <h2 className={heading}>XP & Leveling</h2>
        <p className={text}>
          Every time you complete a task, you earn XP based on difficulty. XP is progress toward your next level.
          Leveling up increases your max HP and unlocks new cosmetic items in the store.
        </p>

        <h4 className={subheading}>Base Rewards by Difficulty</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className={tableHead}>Difficulty</th>
                <th className={tableHead}>Base XP</th>
                <th className={tableHead}>Gold</th>
                <th className={tableHead}>Example</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className={tableCell}>Trivial</td><td className={tableCell}>10</td><td className={tableCell}>5</td><td className={tableCell}>Drink water</td></tr>
              <tr><td className={tableCell}>Easy</td><td className={tableCell}>25</td><td className={tableCell}>10</td><td className={tableCell}>Exercise 15 min</td></tr>
              <tr><td className={tableCell}>Medium</td><td className={tableCell}>50</td><td className={tableCell}>20</td><td className={tableCell}>Write a report</td></tr>
              <tr><td className={tableCell}>Hard</td><td className={tableCell}>100</td><td className={tableCell}>40</td><td className={tableCell}>Finish a major project</td></tr>
            </tbody>
          </table>
        </div>

        <h4 className={subheading}>Streak Bonus</h4>
        <p className={text}>
          Consecutive days of completing a habit grant a streak bonus of up to <strong className="text-text-primary">+50% XP</strong>.
          The bonus increases by 10% per day of streak, capping at 50%.
        </p>

        <h4 className={subheading}>Level Formula</h4>
        <p className={text}>
          XP needed for level N: <span className="mono text-accent-purple">100 × N^1.5 / 10 × 10</span> (rounded to nearest 10).
          Max level is 50.
        </p>
      </section>

      <section className={section}>
        <h2 className={heading}>HP & Fainting</h2>
        <p className={text}>
          Your character has HP (hit points). Max HP starts at 55 at level 1 and increases by 5 per level.
        </p>

        <h4 className={subheading}>Losing HP</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-text-muted">
          <li><strong className="text-accent-red">Negative habits</strong> — tapping the <span className="text-accent-red">-</span> on a habit costs 5 HP.</li>
          <li><strong className="text-accent-red">Missed dailies</strong> — each daily not completed before your daily reset costs 10 HP.</li>
        </ul>

        <h4 className={subheading}>Fainting</h4>
        <p className={text}>
          If your HP reaches 0, your character faints. A skull overlay appears on your character sprite and
          all your stats are greyed out. HP recovers over time as you complete tasks (healing is automatic).
        </p>
      </section>

      <section className={section}>
        <h2 className={heading}>Gold & The Store</h2>
        <p className={text}>
          Gold is earned alongside XP from completing tasks. Use gold to buy cosmetic items in the store.
        </p>

        <h4 className={subheading}>Item Sets</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className={tableHead}>Set</th>
                <th className={tableHead}>Rarity</th>
                <th className={tableHead}>Price per piece</th>
                <th className={tableHead}>Level gate</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className={tableCell}>Iron</td><td className={tableCell}>Common</td><td className={tableCell}>80 - 150</td><td className={tableCell}>None</td></tr>
              <tr><td className={tableCell}>Shadow</td><td className={tableCell}>Rare</td><td className={tableCell}>500</td><td className={tableCell}>Level 10</td></tr>
              <tr><td className={tableCell}>Celestial</td><td className={tableCell}>Epic</td><td className={tableCell}>1,000</td><td className={tableCell}>Level 20</td></tr>
              <tr><td className={tableCell}>Dragon</td><td className={tableCell}>Legendary</td><td className={tableCell}>2,000</td><td className={tableCell}>Level 30</td></tr>
            </tbody>
          </table>
        </div>

        <h4 className={subheading}>Level Milestone Rewards</h4>
        <p className={text}>
          The Shadow, Celestial, and Dragon sets are also awarded for <strong className="text-text-primary">free</strong>
          when you reach levels 10, 20, and 30 respectively. You can still buy extra pieces with gold at any time once
          the level gate is met.
        </p>

        <h4 className={subheading}>Consumables</h4>
        <p className={text}>
          HP Potions restore 20 HP. XP Boosts give 1.5x XP for 1 hour. Name Change Tokens let you rename your hero once.
        </p>
      </section>

      <section className={section}>
        <h2 className={heading}>Streaks</h2>
        <p className={text}>
          Your streak increases each day you complete at least one task. The daily-reset edge function checks
          your activity at your configured reset time and resets your streak to 0 if you weren't active the previous day.
          Streaks are displayed on your character panel and leaderboard entry.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-text-muted mt-2">
          <li><span className="text-text-primary">7-day streak</span> — unlocks the <strong>Creature of Habit</strong> achievement.</li>
          <li><span className="text-text-primary">30-day streak</span> — unlocks the <strong>On Fire</strong> achievement.</li>
          <li><span className="text-text-primary">100-day streak</span> — unlocks the <strong>Century</strong> achievement.</li>
        </ul>
      </section>

      <section className={section}>
        <h2 className={heading}>Achievements</h2>
        <p className={text}>
          Ten achievements to unlock, tracked automatically after task completions and store purchases:
        </p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            ['⚔️', 'First Blood', 'Complete your first task'],
            ['📜', 'Task Master', 'Complete 500 total tasks'],
            ['🔥', 'Creature of Habit', '7-day streak'],
            ['💥', 'On Fire', '30-day streak'],
            ['🏆', 'Century', '100-day streak'],
            ['🌟', 'Max Level', 'Reach level 50'],
            ['🛒', 'Shopaholic', 'Buy 5 items from the shop'],
            ['💎', 'Collector', 'Own 10 unique cosmetic items'],
            ['🦋', 'Social Butterfly', 'Add 5 friends'],
            ['👑', 'Top 10', 'Reach leaderboard top 10'],
          ].map(([icon, name, desc]) => (
            <div key={name} className="bg-bg-card rounded-lg border border-border p-3 flex items-center gap-2">
              <span className="text-lg">{icon}</span>
              <div>
                <p className="text-xs font-semibold text-text-primary">{name}</p>
                <p className="text-xs text-text-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={section}>
        <h2 className={heading}>Friends & Leaderboard</h2>
        <p className={text}>
          Add friends by searching their username. Friend requests must be accepted before you appear on
          each other's friends list. The global leaderboard ranks all public players by XP.
          Your profile must have <strong className="text-text-primary">is_public</strong> set to true to appear.
          The leaderboard updates in real-time via Supabase Realtime subscriptions.
        </p>
      </section>

      <section className={section}>
        <h2 className={heading}>Tips & Strategy</h2>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-text-muted">
          <li><strong className="text-text-primary">Start small</strong> — create 3-5 easy habits to build momentum.</li>
          <li><strong className="text-text-primary">Use dailies sparingly</strong> — they punish missed days with HP loss. Only add dailies you're confident you can do every day.</li>
          <li><strong className="text-text-primary">Save gold for sets</strong> — iron gear is cheap but you'll want Shadow (Lv10) and Celestial (Lv20) for the visual upgrade.</li>
          <li><strong className="text-text-primary">Hard tasks are efficient</strong> — one hard task (100 XP) is worth 10 trivial tasks (10 XP each). Use hard difficulty for your most important work.</li>
          <li><strong className="text-text-primary">Maintain your streak</strong> — do at least one task per day to keep your streak alive. Streaks boost XP earnings.</li>
          <li><strong className="text-text-primary">Check achievements</strong> — they give you targets beyond just leveling up.</li>
          <li><strong className="text-text-primary">Set your reset time</strong> — configure it in Settings to match your schedule (e.g., 3 AM if you're a night owl).</li>
        </ul>
      </section>

      <div className="text-center pt-4 pb-8 border-t border-border">
        <p className="text-xs text-text-muted">
          Habit RPG — v1.0.0<br />
          Built with React, Vite, Supabase, Tailwind, and SVG
        </p>
      </div>
    </div>
  );
}
