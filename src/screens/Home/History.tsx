import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PageLayout from '../../components/PageLayout';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getReadingHistory, clearReadingHistory, type ReadingHistoryItem } from '../../services/readingHistory';

export default function History() {
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  const loadHistory = async () => {
    try {
      const data = await getReadingHistory();
      setHistory(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      loadHistory();
    }, [])
  );

  const handleClear = () => {
    Alert.alert(
      'Clear History',
      'Do you want to delete all reading history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await clearReadingHistory();
            setHistory([]);
          },
        },
      ]
    );
  };

  const handleItemPress = (item: ReadingHistoryItem) => {
    navigation.navigate('Home', {
      screen: 'PdfViewer',
      params: {
        localFile: item.localFile,
        title: item.title,
        type: item.type,
        startPage: item.currentPage,
      },
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <PageLayout>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </PageLayout>
    );
  }

  if (history.length === 0) {
    return (
      <PageLayout>
        <View style={styles.center}>
          <Ionicons name="time-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyText}>No reading history yet</Text>
          <Text style={styles.emptySubtext}>Your recently read books will appear here</Text>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Reading History</Text>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={history}
        contentContainerStyle={{ padding: 16 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => handleItemPress(item)}
          >
            <View style={[styles.iconBox, { backgroundColor: item.type === 'formula' ? '#7C3AED' : '#2563EB' }]}>
              <Ionicons name="time-outline" size={24} color="#fff" />
            </View>
            <View style={styles.info}>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.meta}>Page {item.currentPage} of {item.totalPages}</Text>
              <Text style={styles.time}>{formatDate(item.lastReadAt)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
          </TouchableOpacity>
        )}
      />
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  clearText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
