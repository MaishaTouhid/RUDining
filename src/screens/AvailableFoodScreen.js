import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getMenu, upsertMenu } from '../data/repository';
import { getTodayKey } from '../data/date';

const MEALS = ['breakfast', 'lunch', 'dinner'];
const MEAL_ICONS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };

function getQtyColor(qty) {
  if (qty > 30) return { bg: '#e8f5e9', color: '#2e7d32' };
  if (qty > 10) return { bg: '#fff8e1', color: '#f57f17' };
  return { bg: '#ffebee', color: '#c62828' };
}

export default function AvailableFoodScreen() {
  const router = useRouter();
  const { hallId, hallName, role, moderatorName } = useLocalSearchParams();
  const today = getTodayKey();
  const isDining = role === 'dining';

  const [activeMeal, setActiveMeal] = useState('breakfast');
  const [diningData, setDiningData] = useState({
    breakfast: { items: [] }, lunch: { items: [] }, dinner: { items: [] },
  });
  const [canteenItems, setCanteenItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serving, setServing] = useState(null); // id of item being served

  useEffect(() => { fetchMenu(); }, []);

  async function fetchMenu() {
    setLoading(true);
    const data = await getMenu(String(hallId), today);
    if (data?.dining) {
      setDiningData({
        breakfast: data.dining.breakfast || { items: [] },
        lunch: data.dining.lunch || { items: [] },
        dinner: data.dining.dinner || { items: [] },
      });
    }
    if (data?.canteen?.items) {
      setCanteenItems(data.canteen.items);
    }
    setLoading(false);
  }

  async function handleServe(mealType, itemIdx) {
    const key = `${mealType}-${itemIdx}`;
    setServing(key);
    try {
      if (isDining) {
        const updated = { ...diningData };
        const items = [...updated[mealType].items];
        const item = { ...items[itemIdx] };
        const qty = Number(item.count) || 0;
        if (qty <= 0) {
          Alert.alert('Finished', `${item.name} is already finished!`);
          setServing(null);
          return;
        }
        item.count = qty - 1;
        if (item.count === 0) item.status = 'finished';
        else if (item.count <= 10) item.status = 'limited';
        items[itemIdx] = item;
        updated[mealType] = { ...updated[mealType], items };
        setDiningData(updated);
        await upsertMenu(String(hallId), today, { dining: updated });
        if (item.count === 0) Alert.alert('🔴 Finished!', `${item.name} is now finished.`);
      } else {
        const items = [...canteenItems];
        const item = { ...items[itemIdx] };
        const qty = Number(item.count) || 0;
        if (qty <= 0) {
          Alert.alert('Finished', `${item.name} is already finished!`);
          setServing(null);
          return;
        }
        item.count = qty - 1;
        if (item.count === 0) item.status = 'finished';
        else if (item.count <= 10) item.status = 'limited';
        items[itemIdx] = item;
        setCanteenItems(items);
        await upsertMenu(String(hallId), today, { canteen: { items } });
        if (item.count === 0) Alert.alert('🔴 Finished!', `${item.name} is now finished.`);
      }
    } catch {
      Alert.alert('Error', 'Could not update. Try again.');
    }
    setServing(null);
  }

  function renderItem(item, mealType, idx) {
    const qty = Number(item.count) ?? null;
    const qtyStyle = qty !== null ? getQtyColor(qty) : { bg: '#f5f5f5', color: '#888' };
    const key = `${mealType}-${idx}`;
    const isServing = serving === key;
    const isFinished = item.status === 'finished' || qty === 0;

    return (
      <View key={idx} style={[styles.itemCard, isFinished && styles.itemCardFinished]}>
        <View style={styles.itemLeft}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>৳{item.price || 0}</Text>
        </View>
        <View style={styles.itemRight}>
          <View style={[styles.qtyBadge, { backgroundColor: qtyStyle.bg }]}>
            <Text style={[styles.qtyText, { color: qtyStyle.color }]}>
              {qty !== null ? (isFinished ? 'FINISHED' : `Remaining: ${qty}`) : '—'}
            </Text>
          </View>
          {!isFinished && (
            <TouchableOpacity
              style={[styles.serveBtn, isServing && styles.serveBtnDisabled]}
              onPress={() => handleServe(mealType, idx)}
              disabled={isServing || isFinished}
              activeOpacity={0.8}
            >
              {isServing
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.serveBtnText}>− </Text>
              }
            </TouchableOpacity>
          )}
          {isFinished && (
            <TouchableOpacity
              style={styles.viewDetailBtn}
              onPress={() => router.push({
                pathname: '/FoodDetail',
                params: { hallId, hallName, role, moderatorName, itemName: item.name, itemPrice: String(item.price || 0), mealType },
              })}
            >
              <Text style={styles.viewDetailText}>Details</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={isDining ? '#2d6a4f' : '#7e57c2'} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>{isDining ? '🍽️' : '🍱'} Available Food Menu</Text>
        <Text style={styles.pageSub}>{hallId} • {today} • Live quantity</Text>

        <View style={[styles.infoBanner, { backgroundColor: isDining ? '#d8ead2' : '#ede7f6' }]}>
          <Text style={[styles.infoBannerText, { color: isDining ? '#1b4332' : '#4a148c' }]}>
            Tap -  to reduce count by 1 when a student is served. Status updates automatically.
          </Text>
        </View>

        {isDining ? (
          <>
            <View style={styles.mealTabs}>
              {MEALS.map(m => (
                <TouchableOpacity
                  key={m} onPress={() => setActiveMeal(m)}
                  style={[styles.mealTab, activeMeal === m && styles.mealTabActive]}
                >
                  <Text style={[styles.mealTabText, activeMeal === m && styles.mealTabTextActive]}>
                    {MEAL_ICONS[m]} {m.charAt(0).toUpperCase() + m.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {diningData[activeMeal].items.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>🍽️</Text>
                <Text style={styles.emptyText}>No items for {activeMeal}. Add from Menu Editor.</Text>
              </View>
            ) : (
              diningData[activeMeal].items.map((item, idx) => renderItem(item, activeMeal, idx))
            )}
          </>
        ) : (
          <>
            {canteenItems.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>🍽️</Text>
                <Text style={styles.emptyText}>No canteen items. Add from Canteen Menu Editor.</Text>
              </View>
            ) : (
              canteenItems.map((item, idx) => renderItem(item, 'canteen', idx))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f0e8' },
  scroll: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: '900', color: '#1a1a1a', marginBottom: 4 },
  pageSub: { fontSize: 12, color: '#888', marginBottom: 14 },
  infoBanner: { borderRadius: 12, padding: 12, marginBottom: 16 },
  infoBannerText: { fontSize: 12, lineHeight: 18, fontWeight: '600' },
  mealTabs: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  mealTab: {
    flex: 1, paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e8e0d5', alignItems: 'center',
  },
  mealTabActive: { backgroundColor: '#2d6a4f', borderColor: '#2d6a4f' },
  mealTabText: { fontSize: 11, fontWeight: '700', color: '#888' },
  mealTabTextActive: { color: '#fff' },
  itemCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#e8e0d5',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  itemCardFinished: { opacity: 0.6, backgroundColor: '#f9f6f1' },
  itemLeft: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginBottom: 3 },
  itemPrice: { fontSize: 12, color: '#aaa' },
  itemRight: { alignItems: 'flex-end', gap: 8 },
  qtyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  qtyText: { fontSize: 11, fontWeight: '700' },
  serveBtn: {
    backgroundColor: '#2d6a4f', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  serveBtnDisabled: { opacity: 0.5 },
  serveBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  viewDetailBtn: {
    backgroundColor: '#f5f5f5', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  viewDetailText: { color: '#888', fontWeight: '600', fontSize: 12 },
  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 13, color: '#aaa', textAlign: 'center' },
});
