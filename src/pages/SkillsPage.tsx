import { useSkills } from '../hooks/useSkills';
import { useCharacterStore } from '../store/characterStore';

export default function SkillsPage() {
  const profile = useCharacterStore((s) => s.profile);
  const { allSkills, learned, unspentPoints, learnSkill } = useSkills();

  if (!profile) return null;

  const classSkills = allSkills.filter(
    (s: any) => !s.class_restriction || s.class_restriction === profile.character_class
  );

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display text-accent-gold">Skill Tree</h2>
        <div className="text-sm text-accent-purple font-bold mono">
          {unspentPoints} point{unspentPoints !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-3">
        {classSkills.map((skill: any) => {
          const level = learned.get(skill.id) ?? 0;
          const isMaxed = level >= skill.max_level;

          return (
            <div key={skill.id} className="card flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-text-primary">{skill.name}</h3>
                  <span className="text-xs text-text-muted">Lv.{level}/{skill.max_level}</span>
                </div>
                <p className="text-xs text-text-muted mt-1">{skill.description}</p>
                <div className="flex gap-0.5 mt-2">
                  {Array.from({ length: skill.max_level }, (_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${i < level ? 'bg-accent-gold' : 'bg-bg-primary border border-border'}`}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={() => learnSkill.mutate(skill.id)}
                disabled={isMaxed || unspentPoints === 0 || learnSkill.isPending}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                  isMaxed
                    ? 'bg-accent-green/10 text-accent-green border border-accent-green/30'
                    : unspentPoints > 0
                    ? 'bg-accent-gold text-bg-primary hover:bg-accent-gold/90'
                    : 'bg-bg-primary text-text-muted border border-border'
                }`}
              >
                {isMaxed ? 'MAXED' : level === 0 ? 'Learn' : `Upgrade (${unspentPoints})`}
              </button>
            </div>
          );
        })}
      </div>

      {classSkills.length === 0 && (
        <p className="text-sm text-text-muted text-center py-8">No skills available yet.</p>
      )}
    </div>
  );
}
