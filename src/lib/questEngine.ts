import { supabase } from './supabase';

interface QuestStep {
  type: 'complete_tasks' | 'complete_dailies' | 'complete_habits' | 'complete_todos' | 'earn_xp' | 'earn_gold' | 'reach_level' | 'reach_streak' | 'spend_gold' | 'equip_items' | 'add_friends';
  count?: number;
  value?: number;
}

interface QuestProgress {
  step_index: number;
  step_progress: number;
}

export type QuestEvent = 'task_completed' | 'task_type_completed' | 'xp_earned' | 'gold_earned' | 'level_up' | 'streak_updated' | 'purchase_made' | 'item_equipped' | 'friend_added';

export async function advanceQuests(
  userId: string,
  event: QuestEvent,
  payload: { type?: string; amount?: number; value?: number }
) {
  const { data: activeQuests } = await supabase
    .from('user_quests')
    .select('*, quest:quest_id(*)')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (!activeQuests) return;

  for (const uq of activeQuests as any[]) {
    const quest = uq.quest;
    const progress = uq.progress as QuestProgress;
    const steps = quest.steps as QuestStep[];
    const currentStep = steps[progress.step_index];

    if (!currentStep) continue;

    let matched = false;
    switch (currentStep.type) {
      case 'complete_tasks':
        if (event === 'task_completed') matched = true;
        break;
      case 'complete_dailies':
        if (event === 'task_type_completed' && payload.type === 'daily') matched = true;
        break;
      case 'complete_habits':
        if (event === 'task_type_completed' && payload.type === 'habit') matched = true;
        break;
      case 'complete_todos':
        if (event === 'task_type_completed' && payload.type === 'todo') matched = true;
        break;
      case 'earn_xp':
        if (event === 'xp_earned') { progress.step_progress += payload.amount ?? 0; matched = true; }
        break;
      case 'earn_gold':
        if (event === 'gold_earned') { progress.step_progress += payload.amount ?? 0; matched = true; }
        break;
      case 'reach_level':
        if (event === 'level_up' || (event === 'task_completed' && (payload.value ?? 0) >= (currentStep.value ?? 1))) matched = true;
        break;
      case 'reach_streak':
        if (event === 'streak_updated' && (payload.value ?? 0) >= (currentStep.value ?? 1)) matched = true;
        break;
      case 'spend_gold':
        if (event === 'purchase_made') { progress.step_progress += payload.amount ?? 0; matched = true; }
        break;
      case 'equip_items':
        if (event === 'item_equipped') matched = true;
        break;
      case 'add_friends':
        if (event === 'friend_added') matched = true;
        break;
    }

    if (matched && !('count' in currentStep)) {
      progress.step_progress++;
    }

    const target = currentStep.count ?? currentStep.value ?? 1;
    if (progress.step_progress >= target) {
      progress.step_index++;
      progress.step_progress = 0;
    }

    const isComplete = progress.step_index >= steps.length;
    const update: any = { progress };
    if (isComplete) {
      update.status = 'completed';
      update.completed_at = new Date().toISOString();
    }

    await supabase.from('user_quests').update(update).eq('id', uq.id);

    if (isComplete) {
      await supabase.from('profiles').update({
        xp: supabase.rpc as any, // placeholder - handle in calling code
      }).eq('id', userId);
    }
  }
}
