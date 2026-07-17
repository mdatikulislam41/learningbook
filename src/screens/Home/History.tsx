import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';

type Chapter = {
  id: number;
  title: string;
};

export default function HistoryScreen() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from('chapters')
        .select('id, title')
        .order('chapter', { ascending: true });

      if (cancelled) {
        return;
      }

      if (error) {
        console.log('Supabase error:', error);
        setErrorMessage(error.message);
        setChapters([]);
      } else {
        setChapters((data ?? []) as Chapter[]);
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
        <Text style={{ color: '#DC2626', marginBottom: 8 }}>
          Could not load chapters
        </Text>
        <Text>{errorMessage}</Text>
      </View>
    );
  }

  if (chapters.length === 0) {
    return (
      <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
        <Text>No chapters found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {chapters.map(chapter => (
        <Text key={chapter.id} style={{ marginBottom: 8, fontSize: 16 }}>
          {chapter.title}
        </Text>
      ))}
    </ScrollView>
  );
}
