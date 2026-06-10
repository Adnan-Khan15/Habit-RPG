import Phaser from 'phaser';

export class CharacterScene extends Phaser.Scene {
  private characterClass: string = 'warrior';

  constructor() {
    super({ key: 'CharacterScene' });
  }

  init(data: { characterClass: string }) {
    this.characterClass = data.characterClass || 'warrior';
  }

  create() {
    const g = this.add.graphics();
    const color =
      this.characterClass === 'warrior'
        ? 0xef4444
        : this.characterClass === 'mage'
        ? 0x7c3aed
        : 0x22c55e;

    g.fillStyle(color);
    g.fillCircle(100, 70, 30);
    g.fillRect(85, 100, 30, 50);
    g.fillRect(68, 110, 17, 35);
    g.fillRect(115, 110, 17, 35);
    g.fillRect(90, 150, 10, 25);
    g.fillRect(100, 150, 10, 25);
  }
}
