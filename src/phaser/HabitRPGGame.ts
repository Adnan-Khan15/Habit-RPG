import Phaser from 'phaser';

export function createGameConfig(
  parent: HTMLElement,
  characterClass: string
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width: 200,
    height: 200,
    parent,
    backgroundColor: '#0f0f1a',
    scene: {
      create: function (this: Phaser.Scene) {
        const g = this.add.graphics();
        const color =
          characterClass === 'warrior'
            ? 0xef4444
            : characterClass === 'mage'
            ? 0x7c3aed
            : 0x22c55e;

        g.fillStyle(color);
        g.fillCircle(100, 70, 30);
        g.fillRect(85, 100, 30, 50);
        g.fillRect(68, 110, 17, 35);
        g.fillRect(115, 110, 17, 35);
        g.fillRect(90, 150, 10, 25);
        g.fillRect(100, 150, 10, 25);
      },
    },
    scale: { mode: Phaser.Scale.FIT },
  };
}
