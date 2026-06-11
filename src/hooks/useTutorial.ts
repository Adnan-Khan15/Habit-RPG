import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

const TUTORIAL_STEPS = [
  'welcome',
  'first_task',
  'complete_task',
  'stats_overview',
  'store_visit',
  'equip_item',
  'social',
] as const;

export type TutorialStep = typeof TUTORIAL_STEPS[number];

export function useTutorial() {
  const user = useAuthStore((s) => s.profile);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<TutorialStep>('welcome');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    checkTutorial();
  }, [user?.id]);

  const checkTutorial = async () => {
    if (!user) return;
    if (user.total_tasks_completed > 5) return;

    const { data } = await supabase
      .from('tutorial_progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!data) {
      setIsActive(true);
      return;
    }

    const tp = data as any;
    if (tp.completed_at || tp.skipped) return;

    setCurrentStep(tp.current_step as TutorialStep);
    setCompletedSteps(tp.completed_steps ?? []);
    setIsActive(true);
  };

  const nextStep = useCallback(async () => {
    if (!user) return;
    const idx = TUTORIAL_STEPS.indexOf(currentStep);
    if (idx < TUTORIAL_STEPS.length - 1) {
      const next = TUTORIAL_STEPS[idx + 1];
      const newCompleted = [...completedSteps, currentStep];
      setCurrentStep(next);
      setCompletedSteps(newCompleted);
      await supabase.from('tutorial_progress').upsert({
        user_id: user.id,
        current_step: next,
        completed_steps: newCompleted,
      }, { onConflict: 'user_id' });
    } else {
      const newCompleted = [...completedSteps, currentStep];
      setCompletedSteps(newCompleted);
      setIsActive(false);
      await supabase.from('tutorial_progress').upsert({
        user_id: user.id,
        current_step: currentStep,
        completed_steps: newCompleted,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    }
  }, [user, currentStep, completedSteps]);

  const skipTutorial = useCallback(async () => {
    if (!user) return;
    setIsActive(false);
    await supabase.from('tutorial_progress').upsert({
      user_id: user.id,
      current_step: currentStep,
      completed_steps: completedSteps,
      skipped: true,
    }, { onConflict: 'user_id' });
  }, [user, currentStep, completedSteps]);

  const stepIndex = TUTORIAL_STEPS.indexOf(currentStep);

  return {
    isActive,
    currentStep,
    stepIndex,
    totalSteps: TUTORIAL_STEPS.length,
    nextStep,
    skipTutorial,
  };
}
