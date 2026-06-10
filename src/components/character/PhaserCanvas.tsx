import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import type { CharacterClass } from '../../types';

interface PhaserCanvasProps {
  characterClass: CharacterClass;
  isFaint?: boolean;
  onLevelUp?: boolean;
  className?: string;
}

export function PhaserCanvas({ characterClass, isFaint, className = '' }: PhaserCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 200,
      height: 200,
      parent: canvasRef.current,
      backgroundColor: '#0f0f1a',
      scene: {
        create: function (this: Phaser.Scene) {
          const g = this.add.graphics();
          // Draw a simple character placeholder based on class
          g.fillStyle(characterClass === 'warrior' ? 0xef4444 : characterClass === 'mage' ? 0x7c3aed : 0x22c55e);
          g.fillCircle(100, 70, 30); // head
          g.fillRect(85, 100, 30, 50); // body
          g.fillRect(70, 110, 15, 40); // left arm
          g.fillRect(115, 110, 15, 40); // right arm
          g.fillRect(90, 150, 10, 30); // left leg
          g.fillRect(100, 150, 10, 30); // right leg

          if (isFaint) {
            g.fillStyle(0x000000, 0.3);
            g.fillRect(0, 0, 200, 200);
            const text = this.add.text(100, 180, '💀', { fontSize: '24px' });
            text.setOrigin(0.5);
          }
        },
      },
      scale: { mode: Phaser.Scale.FIT },
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [characterClass, isFaint]);

  return (
    <div
      ref={canvasRef}
      className={`rounded-lg overflow-hidden ${className}`}
      style={{ width: 200, height: 200 }}
    >
      <div className="flex items-center justify-center w-full h-full text-text-muted text-xs">
        Rendering character...
      </div>
    </div>
  );
}
