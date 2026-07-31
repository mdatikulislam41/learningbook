import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Chapter } from '../types/chapter';

const CHAPTERS_KEY = 'CACHED_CHAPTERS';
const CACHE_TIMESTAMP_KEY = 'CACHED_CHAPTERS_TIMESTAMP';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function cacheChapters(chapters: Chapter[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CHAPTERS_KEY, JSON.stringify(chapters));
    await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (e) {
    console.log('Failed to cache chapters:', e);
  }
}

export async function getCachedChapters(): Promise<Chapter[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CHAPTERS_KEY);
    if (!raw) return null;

    const chapters: Chapter[] = JSON.parse(raw);
    const timestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);

    if (!timestamp) {
      await clearChapterCache();
      return null;
    }

    const savedAt = parseInt(timestamp, 10);
    if (Number.isNaN(savedAt) || Date.now() - savedAt > CACHE_TTL_MS) {
      await clearChapterCache();
      return null;
    }

    return chapters;
  } catch (e) {
    console.log('Failed to load cached chapters:', e);
    await clearChapterCache();
    return null;
  }
}

export async function clearChapterCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CHAPTERS_KEY);
    await AsyncStorage.removeItem(CACHE_TIMESTAMP_KEY);
  } catch (e) {
    console.log('Failed to clear chapter cache:', e);
  }
}
