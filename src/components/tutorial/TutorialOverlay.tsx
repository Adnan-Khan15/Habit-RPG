import { useTutorial } from '../../hooks/useTutorial';

const STEP_CONTENT: Record<string, { title: string; description: string }> = {
  welcome: {
    title: 'Welcome, Hero! ⚔️',
    description: 'Welcome to Habit RPG! Turn your real-life tasks into an RPG adventure. Complete tasks to earn XP and gold, level up, and unlock cosmetics.',
  },
  first_task: {
    title: 'Create Your First Task',
    description: 'Click the "New Task" button to create a habit. Habits can be positive (things you want to do) or negative (things you want to avoid).',
  },
  complete_task: {
    title: 'Complete a Task',
    description: 'Click the circle icon next to any task to complete it. You\'ll earn XP and gold instantly!',
  },
  stats_overview: {
    title: 'Your Stats',
    description: 'The top bar shows your gold 🪙, level ⚡, and HP ❤️. Level up by earning XP from completing tasks.',
  },
  store_visit: {
    title: 'Visit the Store',
    description: 'Head to the Store to buy cosmetic gear for your character. You start with the Iron Set unlocked!',
  },
  equip_item: {
    title: 'Equip Your Gear',
    description: 'After buying an item, click "Equip" to wear it. Your character sprite updates in real-time!',
  },
  social: {
    title: 'Go Social',
    description: 'Add friends, compete on the leaderboard, and stay motivated together!',
  },
};

export function TutorialOverlay() {
  const { isActive, currentStep, stepIndex, totalSteps, nextStep, skipTutorial } = useTutorial();

  if (!isActive) return null;

  const content = STEP_CONTENT[currentStep];
  if (!content) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-bg-card border border-border rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        <div className="flex justify-center gap-1 mb-4">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i <= stepIndex ? 'bg-accent-gold' : 'bg-border'}`}
            />
          ))}
        </div>

        <h2 className="text-lg font-display text-accent-gold text-center mb-2">{content.title}</h2>
        <p className="text-sm text-text-primary text-center mb-6">{content.description}</p>

        <div className="flex gap-3">
          <button
            onClick={skipTutorial}
            className="flex-1 px-4 py-2 text-sm text-text-muted hover:text-text-primary border border-border rounded-lg transition-colors"
          >
            Skip
          </button>
          <button
            onClick={nextStep}
            className="flex-1 px-4 py-2 text-sm font-medium bg-accent-gold text-bg-primary rounded-lg hover:bg-accent-gold/90 transition-colors"
          >
            {stepIndex < totalSteps - 1 ? 'Next' : 'Finish'}
          </button>
        </div>
      </div>
    </div>
  );
}
