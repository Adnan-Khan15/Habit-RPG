import { useState } from 'react';
import { useJournal, type JournalEntry } from '../hooks/useJournal';
import { Button } from '../components/ui/Button';

const MOODS = [
  { value: 1, emoji: '😢', label: 'Bad' },
  { value: 2, emoji: '😕', label: 'Meh' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '😊', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
];

export default function JournalPage() {
  const { todayEntry, entries, saveEntry, isLoading } = useJournal();
  const [selectedMood, setSelectedMood] = useState(todayEntry?.mood ?? 0);
  const [note, setNote] = useState(todayEntry?.note ?? '');
  const [saving, setSaving] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(todayEntry ?? null);

  const handleSave = async () => {
    if (selectedMood === 0) return;
    setSaving(true);
    await saveEntry.mutateAsync({ mood: selectedMood, note });
    setSaving(false);
  };

  const getMoodEmoji = (v: number) => MOODS.find((m) => m.value === v)?.emoji ?? '—';

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-xl font-display text-accent-gold">Daily Journal</h2>

      <div className="card space-y-4">
        <h3 className="text-sm font-semibold text-text-muted uppercase">How are you feeling today?</h3>
        <div className="flex justify-between gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => setSelectedMood(m.value)}
              className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                selectedMood === m.value
                  ? 'border-accent-gold bg-accent-gold/10'
                  : 'border-border bg-bg-card hover:border-text-muted'
              }`}
            >
              <div className="text-2xl mb-1">{m.emoji}</div>
              <div className="text-xs text-text-muted">{m.label}</div>
            </button>
          ))}
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 500))}
          placeholder="Write a note about your day (optional)..."
          className="input-field min-h-[100px] resize-none"
        />
        <p className="text-xs text-text-muted text-right">{note.length}/500</p>

        <Button disabled={selectedMood === 0 || saving} onClick={handleSave} className="w-full">
          {saving ? 'Saving...' : todayEntry ? 'Update Entry' : 'Save Entry'}
        </Button>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-muted uppercase mb-3">Recent Entries</h3>
        {isLoading ? (
          <p className="text-sm text-text-muted">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-text-muted">No entries yet. Start tracking your mood!</p>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {Array.from({ length: 28 }, (_, i) => {
                const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
                const entry = entries.find((e) => e.entry_date === d);
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedEntry(entry ?? null)}
                    className={`aspect-square rounded flex items-center justify-center text-lg transition-all ${
                      entry
                        ? entry.mood >= 4 ? 'bg-accent-green/30' : entry.mood === 3 ? 'bg-accent-gold/30' : 'bg-accent-red/30'
                        : 'bg-bg-primary'
                    } ${selectedEntry?.entry_date === d ? 'ring-2 ring-accent-gold' : ''} hover:ring-1 hover:ring-text-muted`}
                    title={entry ? `${d}: ${entry.note || MOODS.find(m => m.value === entry.mood)?.label}` : d}
                  >
                    {entry ? getMoodEmoji(entry.mood) : ''}
                  </button>
                );
              })}
            </div>
            {selectedEntry && (
              <div className="card border-accent-gold/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{getMoodEmoji(selectedEntry.mood)}</span>
                  <span className="text-sm text-text-muted">{selectedEntry.entry_date}</span>
                  <span className="text-xs text-text-muted">— {MOODS.find(m => m.value === selectedEntry.mood)?.label}</span>
                </div>
                {selectedEntry.note ? (
                  <p className="text-sm text-text-primary whitespace-pre-wrap">{selectedEntry.note}</p>
                ) : (
                  <p className="text-sm text-text-muted italic">No note written</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
