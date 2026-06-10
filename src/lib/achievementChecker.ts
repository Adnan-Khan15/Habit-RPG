import type { Profile, UserAchievement } from '../types';

export interface AchievementCheckResult {
  newlyUnlocked: string[];
}

export function checkAchievements(
  profile: Profile,
  existingAchievements: UserAchievement[],
  context: {
    totalTasksCompleted?: number;
    currentStreak?: number;
    longestStreak?: number;
    friendsCount?: number;
    hasPurchased?: boolean;
    shopPurchases?: number;
    leaderboardRank?: number;
  }
): AchievementCheckResult {
  const existing = new Set(existingAchievements.map((a) => a.achievement_key));
  const newlyUnlocked: string[] = [];

  const unlocked = (key: string) => existing.has(key);

  if (!unlocked('first_blood') && (context.totalTasksCompleted ?? profile.total_tasks_completed) >= 1) {
    newlyUnlocked.push('first_blood');
  }

  if (!unlocked('task_master') && (context.totalTasksCompleted ?? profile.total_tasks_completed) >= 500) {
    newlyUnlocked.push('task_master');
  }

  if (!unlocked('century') && (context.longestStreak ?? profile.longest_streak) >= 100) {
    newlyUnlocked.push('century');
  }

  if (!unlocked('on_fire') && (context.longestStreak ?? profile.longest_streak) >= 30) {
    newlyUnlocked.push('on_fire');
  }

  if (!unlocked('creature_of_habit') && (context.currentStreak ?? profile.current_streak) >= 7) {
    newlyUnlocked.push('creature_of_habit');
  }

  if (!unlocked('max_level') && profile.level >= 50) {
    newlyUnlocked.push('max_level');
  }

  if (!unlocked('shopaholic') && (context.shopPurchases ?? 0) >= 5) {
    newlyUnlocked.push('shopaholic');
  }

  if (!unlocked('patron') && context.hasPurchased) {
    newlyUnlocked.push('patron');
  }

  if (!unlocked('social_butterfly') && (context.friendsCount ?? 0) >= 5) {
    newlyUnlocked.push('social_butterfly');
  }

  if (!unlocked('top_10') && context.leaderboardRank !== undefined && context.leaderboardRank <= 10) {
    newlyUnlocked.push('top_10');
  }

  return { newlyUnlocked };
}
