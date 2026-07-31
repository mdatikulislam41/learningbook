import AsyncStorage from '@react-native-async-storage/async-storage';

export type ReadingHistoryItem = {
  id: string;
  pdfUrl: string;
  localFile: string;
  title: string;
  currentPage: number;
  totalPages: number;
  lastReadAt: number;
  type: 'chapter' | 'formula';
};

const STORAGE_KEY = 'READING_HISTORY';
const MAX_ITEMS = 20;

export async function saveReadingHistory(
  item: Omit<ReadingHistoryItem, 'id' | 'lastReadAt'>
): Promise<void> {
  try {
    const existing = await getReadingHistory();

    const newItem: ReadingHistoryItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      lastReadAt: Date.now(),
    };

    const filtered = existing.filter(
      (h) => !(h.pdfUrl === item.pdfUrl && h.type === item.type)
    );

    filtered.unshift(newItem);
    const trimmed = filtered.slice(0, MAX_ITEMS);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.log('Failed to save reading history:', e);
  }
}

export async function getReadingHistory(): Promise<ReadingHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: ReadingHistoryItem[] = JSON.parse(raw);
    return parsed.sort((a, b) => b.lastReadAt - a.lastReadAt);
  } catch (e) {
    console.log('Failed to load reading history:', e);
    return [];
  }
}

export async function clearReadingHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.log('Failed to clear reading history:', e);
  }
}
