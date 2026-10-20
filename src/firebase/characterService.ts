import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { CharacterSheet, RankingEntry } from '../types/rpg';
import { calculateCharacterScore } from '../utils/dndMath';

const LOCAL_STORAGE_CHAR_KEY = 'codex_rpg_active_char_v2';
const LOCAL_STORAGE_ALL_CHARS = 'codex_rpg_saved_characters_v2';
const LOCAL_STORAGE_RANKINGS = 'codex_rpg_cached_rankings_v2';

export function saveLocalCharacter(char: CharacterSheet) {
  try {
    localStorage.setItem(LOCAL_STORAGE_CHAR_KEY, JSON.stringify(char));
    const all = getLocalCharacters();
    const idx = all.findIndex(c => c.id === char.id);
    if (idx >= 0) {
      all[idx] = char;
    } else {
      all.unshift(char);
    }
    localStorage.setItem(LOCAL_STORAGE_ALL_CHARS, JSON.stringify(all));
  } catch (e) {
    console.error('Erro ao salvar localmente:', e);
  }
}

export function getActiveLocalCharacter(): CharacterSheet | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CHAR_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getLocalCharacters(): CharacterSheet[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ALL_CHARS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveCharacter(
  char: CharacterSheet,
  userUid?: string | null,
  userDisplayName?: string | null,
  userPhoto?: string | null
): Promise<void> {
  // Always save locally first for instant responsiveness & offline resilience
  saveLocalCharacter(char);

  if (!userUid) {
    return; // User is in guest/offline mode
  }

  const path = `characters/${char.id}`;
  try {
    await setDoc(doc(db, 'characters', char.id), {
      ...char,
      userId: userUid,
      userName: userDisplayName || char.userName || 'Aventureiro',
      updatedAt: new Date().toISOString(),
    });

    // Also update global ranking
    const score = calculateCharacterScore(char);
    const rankingPath = `rankings/${char.id}`;
    const rankingDoc: RankingEntry = {
      characterId: char.id,
      characterName: char.nome,
      userId: userUid,
      userName: userDisplayName || char.userName || 'Aventureiro',
      userPhoto: userPhoto || undefined,
      classe: char.classe,
      raca: char.raca,
      nivel: char.nivel,
      experiencia: char.experiencia,
      alquimiaCrafts: char.estatisticas?.pocoesCriadas || 0,
      treinoPontos: char.estatisticas?.treinosCompletados || 0,
      meditacaoMinutos: Math.floor((char.estatisticas?.segundosMeditados || 0) / 60),
      conquistasQtd: char.conquistas?.filter(c => c.desbloqueada).length || 0,
      scoreTotal: score,
      titulo: getTitleForCharacter(char),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'rankings', char.id), rankingDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

function getTitleForCharacter(char: CharacterSheet): string {
  if (char.nivel >= 10) return 'Lenda Viva dos Reinos';
  if (char.estatisticas.pocoesCriadas >= 5) return 'Mestre Alquimista Transmutador';
  if (char.estatisticas.treinosCompletados >= 4) return 'Titã dos Exercícios Físicos';
  if (char.estatisticas.segundosMeditados >= 120) return 'Sábio da Comunhão Cósmica';
  return 'Aventureiro do Codex';
}

export function subscribeToRankings(
  callback: (rankings: RankingEntry[]) => void
): Unsubscribe {
  const q = query(collection(db, 'rankings'), orderBy('scoreTotal', 'desc'), limit(50));

  const unsubscribe = onSnapshot(
    q,
    snapshot => {
      const items: RankingEntry[] = [];
      snapshot.forEach(docSnap => {
        items.push(docSnap.data() as RankingEntry);
      });
      // Cache local
      localStorage.setItem(LOCAL_STORAGE_RANKINGS, JSON.stringify(items));
      callback(items);
    },
    error => {
      // Fallback local on network error
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_RANKINGS);
        if (cached) callback(JSON.parse(cached));
      } catch {
        callback([]);
      }
      handleFirestoreError(error, OperationType.LIST, 'rankings');
    }
  );

  return unsubscribe;
}
