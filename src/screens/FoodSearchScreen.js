import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HALLS } from '../data/halls';
import { getTodayKey } from '../data/date';
import { fetchAllHallsMenu } from '../data/repository';
import { STATUS_CONFIG } from '../data/types';

const MEAL_ICONS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', canteen: '🏪' };

export default function FoodSearchScreen() {
  const router = useRouter();
  const today = getTodayKey();

  const [allItems, setAllItems] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAllMenus(); }, []);

  async function loadAllMenus() {
    setLoading(true);
    try {
      const data = await fetchAllHallsMenu(HALLS, today);
      setAllItems(data);
    } catch (e) {
      setAllItems([]);
    }
    setLoading(false);
  }

  const filteredResults = query.trim()
    ? allItems.filter(item =>
        item.itemName.toLowerCase().includes(query.trim().toLowerCase())
      )
    : [];

  function renderResult({ item }) {
    const s = STATUS_CONFIG[item.status] || STATUS_CONFIG.available;
    const hasCount = item.count !== null && item.count !== undefined && item.count !== '';

    return (
      <TouchableOpacity
        style={styles.resultCard}
        onPress={() => router.push({
          pathname: '/HallDetail',
          params: { hallId: item.hallId, hallName: item.hallName },
        })}
      >
        <View style={styles.resultTop}>
          <Text style={styles.resultItemName}>{item.itemName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
            <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
          </View>
        </View>
        <Text style={styles.resultHall}>{item.hallName}</Text>
        <View style={styles.resultFooter}>
          <Text style={styles.resultMeta}>
            {MEAL_ICONS[item.mealType]} {item.mealType.charAt(0).toUpperCase() + item.mealType.slice(1)}
          </Text>
          <Text style={styles.resultMeta}>
            {hasCount ? `Remaining: ${item.count}` : '—'}
          </Text>
          <Text style={styles.resultPrice}>৳{item.price || 0}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Search Food</Text>
        <Text style={styles.pageSub}>
          {loading ? 'Loading todays menus from all halls...' : 'Type a food name to filter instantly'}
        </Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="e.g. Biryani, Khichuri, Dim..."
          placeholderTextColor="#9a9a8e"
          value={query}
          onChangeText={setQuery}
          editable={!loading}
        />
      </View>

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#2d5a3d" />
          <Text style={styles.loadingText}>Checking all 17 halls...</Text>
        </View>
      )}

      {!loading && query.trim() && filteredResults.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No items found matching {query} today.</Text>
        </View>
      )}

      {!loading && !query.trim() && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🍽️</Text>
          <Text style={styles.emptyText}>Start typing to search food items across all halls.</Text>
        </View>
      )}

      {!loading && filteredResults.length > 0 && (
        <>
          <Text style={styles.resultCount}>{filteredResults.length} item(s) found</Text>
          <FlatList
            data={filteredResults}
            keyExtractor={(item, idx) => `${item.hallId}-${item.mealType}-${idx}`}
            renderItem={renderResult}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
            keyboardShouldPersistTaps="handled"
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#edeae3' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a1a', marginBottom: 4 },
  pageSub: { fontSize: 13, color: '#6b6b60' },
  searchRow: { paddingHorizontal: 16, marginBottom: 16 },
  searchInput: {
    backgroundColor: '#f5f2eb', borderRadius: 12,
    padding: 13, fontSize: 14, color: '#1a1a1a',
    borderWidth: 1, borderColor: '#d8d4c8',
  },
  loadingBox: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { fontSize: 13, color: '#7a7a6e', marginTop: 10 },
  emptyBox: { alignItems: 'center', paddingVertical: 50, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 13, color: '#7a7a6e', textAlign: 'center', lineHeight: 19 },
  resultCount: {
    fontSize: 12, fontWeight: '700', color: '#7a7a6e',
    paddingHorizontal: 16, marginBottom: 10,
  },
  resultCard: {
    backgroundColor: '#f5f2eb', borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: '#d8d4c8',
  },
  resultTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  resultItemName: { fontSize: 15, fontWeight: '800', color: '#1a1a1a', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginLeft: 8 },
  statusText: { fontSize: 10, fontWeight: '800' },
  resultHall: { fontSize: 13, color: '#2d5a3d', fontWeight: '700', marginBottom: 8 },
  resultFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  resultMeta: { fontSize: 12, color: '#7a7a6e' },
  resultPrice: { fontSize: 13, fontWeight: '800', color: '#2d5a3d' },
});