import { Attributes, CharacterSheet, TemporaryBuff } from '../types/rpg';

export function getAttributeModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function getProficiencyBonus(level: number): number {
  return Math.floor((Math.max(1, level) - 1) / 4) + 2;
}

export const LEVEL_XP_THRESHOLDS: number[] = [
  0,       // L1
  300,     // L2
  900,     // L3
  2700,    // L4
  6500,    // L5
  14000,   // L6
  23000,   // L7
  34000,   // L8
  48000,   // L9
  64000,   // L10
  85000,   // L11
  100000,  // L12
];

export function getLevelFromXp(xp: number): number {
  for (let i = LEVEL_XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_XP_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

export function getEffectiveAttributes(
  base: Attributes,
  buffs: TemporaryBuff[]
): { effective: Attributes; bonusMap: { [K in keyof Attributes]: number } } {
  const now = Date.now();
  const bonusMap: { [K in keyof Attributes]: number } = {
    forca: 0,
    destreza: 0,
    constituicao: 0,
    inteligencia: 0,
    sabedoria: 0,
    carisma: 0,
  };

  buffs.forEach(buff => {
    const expiresAt = buff.criadoEm + buff.duracaoMinutos * 60 * 1000;
    if (expiresAt > now && buff.atributo in bonusMap) {
      const key = buff.atributo as keyof Attributes;
      bonusMap[key] += buff.valor;
    }
  });

  return {
    effective: {
      forca: base.forca + bonusMap.forca,
      destreza: base.destreza + bonusMap.destreza,
      constituicao: base.constituicao + bonusMap.constituicao,
      inteligencia: base.inteligencia + bonusMap.inteligencia,
      sabedoria: base.sabedoria + bonusMap.sabedoria,
      carisma: base.carisma + bonusMap.carisma,
    },
    bonusMap,
  };
}

export function calculateCharacterScore(char: CharacterSheet): number {
  const lvlScore = char.nivel * 500;
  const xpScore = Math.floor(char.experiencia / 2);
  const alchScore = (char.estatisticas?.pocoesCriadas || 0) * 80;
  const trainScore = (char.estatisticas?.treinosCompletados || 0) * 60;
  const medScore = Math.floor((char.estatisticas?.segundosMeditados || 0) / 10) * 15;
  const achScore = (char.conquistas?.filter(c => c.desbloqueada).length || 0) * 120;
  const critsScore = (char.estatisticas?.criticos20 || 0) * 100;

  return lvlScore + xpScore + alchScore + trainScore + medScore + achScore + critsScore;
}

export function getCarryingCapacityKg(forca: number): number {
  return forca * 7.5; // Regra D&D 5e adaptada (15 lbs = ~7.5 kg)
}
