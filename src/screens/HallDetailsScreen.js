import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { subscribeMenu } from '../data/repository';
import { getTodayKey, formatTime } from '../data/date';
import { STATUS_CONFIG } from '../data/types';

const MENU_TYPES = [
  {
    key: 'dining',
    title: 'Hall Dining',
    desc: 'See breakfast, lunch, and dinner menu',
  },
  {
    key: 'canteen',
    title: 'Hall Canteen',
    desc: 'See available canteen food items',
  },
];

export default function HallDetailsScreen() {
  const { hallId, hallName } = useLocalSearchParams();
  const router = useRouter();
  const today = getTodayKey();

  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [activeMeal, setActiveMeal] = useState('breakfast');

  // ─── Real-time menu listener ───────────────────────────
  // subscribeMenu() Firebase এর সাথে live connection খোলে (onSnapshot)।
  // Moderator menu update করলে এই callback automatically fire হয়
  // এবং state নতুন data দিয়ে update হয় — student কে manual refresh করতে হয় না।
  // দ্বিতীয় (error) callback দিয়ে internet/permission সমস্যা handle করা হয়।
  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsub = subscribeMenu(
      String(hallId),
      today,
      (data) => {
        setMenu(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setLoading(false);
        setError('Failed to load the menu. Check your internet connection and try again.');
      }
    );

    // CRITICAL: cleanup — screen বন্ধ হলে listener বন্ধ করো, নাহলে memory leak হবে
    return () => unsub();
  }, [hallId, retryKey]);

  function handleRetry() {
    setRetryKey(prev => prev + 1);
  }

  function toggleExpand(key) {
    setExpanded(prev => prev === key ? null : key);
    if (key === 'dining') setActiveMeal('breakfast');
  }

  function renderDiningContent() {
    const dining = menu?.dining;
    return (
      <View style={styles.expandBody}>
        {/* Meal tabs */}
        <View style={styles.mealTabs}>
          {['breakfast', 'lunch', 'dinner'].map(m => (
            <TouchableOpacity
              key={m}
              style={[styles.mealTab, activeMeal === m && styles.mealTabActive]}
              onPress={() => setActiveMeal(m)}
            >
              <Text style={[styles.mealTabText, activeMeal === m && styles.mealTabTextActive]}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {!dining?.[activeMeal] ? (
          <View style={styles.notUpdated}>
            <View style={styles.notUpdatedBadge}>
              <Text style={styles.notUpdatedText}>NOT UPDATED</Text>
            </View>
            <Text style={styles.notUpdatedDesc}>
              {activeMeal.charAt(0).toUpperCase() + activeMeal.slice(1)} menu has not been updated yet.
            </Text>
            <Text style={styles.noteLabel}>NOTE</Text>
            <Text style={styles.noteText}>No {activeMeal} items added yet.</Text>
          </View>
        ) : (
          <View>
            {dining[activeMeal]?.time ? (
              <Text style={styles.mealTime}>
                Time: {dining[activeMeal].time}
              </Text>
            ) : null}

            {(dining[activeMeal]?.items || []).map((item, idx) => {
              const s = STATUS_CONFIG[item.status] || STATUS_CONFIG.available;
              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.itemRow}
                  activeOpacity={0.7}
                  onPress={() => router.push({
                    pathname: '/FoodDetail',
                    params: {
                      hallId: String(hallId),
                      itemName: item.name,
                      itemPrice: String(item.price || 0),
                      itemQty: String(item.count ?? 0),
                      itemStatus: item.status || 'available',
                      mealType: activeMeal,
                      itemEmoji: '🍽️',
                    }
                  })}
                >
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>
                      ৳{item.price || 0} • Remaining: {item.count ?? '—'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                      <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {dining[activeMeal]?.note ? (
              <View style={styles.noteBox}>
                <Text style={styles.noteLabel}>NOTE</Text>
                <Text style={styles.noteText}>{dining[activeMeal].note}</Text>
              </View>
            ) : null}
          </View>
        )}
      </View>
    );
  }

  function renderCanteenContent() {
    const items = menu?.canteen?.items || [];
    return (
      <View style={styles.expandBody}>
        {items.length === 0 ? (
          <View style={styles.notUpdated}>
            <View style={styles.notUpdatedBadge}>
              <Text style={styles.notUpdatedText}>NOT UPDATED</Text>
            </View>
            <Text style={styles.notUpdatedDesc}>
              Canteen menu has not been updated yet.
            </Text>
            <Text style={styles.noteLabel}>NOTE</Text>
            <Text style={styles.noteText}>No canteen items added yet.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.mealTime}>All day items</Text>
            {items.map((item, idx) => {
              const s = STATUS_CONFIG[item.status] || STATUS_CONFIG.available;
              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.itemRow}
                  activeOpacity={0.7}
                  onPress={() => router.push({
                    pathname: '/FoodDetail',
                    params: {
                      hallId: String(hallId),
                      itemName: item.name,
                      itemPrice: String(item.price || 0),
                      itemQty: String(item.count ?? 0),
                      itemStatus: item.status || 'available',
                      mealType: 'canteen',
                      itemEmoji: '🏪',
                    }
                  })}
                >
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>
                      ৳{item.price || 0} • Remaining: {item.count ?? '—'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                      <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Hall info card */}
        <View style={styles.infoCard}>
          <Text style={styles.hallName}>{hallName}</Text>
          <Text style={styles.infoRow}>Hall ID: {hallId}</Text>
          <Text style={styles.infoRow}>Date: {today}</Text>
          <Text style={styles.infoRow}>
            Last updated: {menu?.updatedAt
              ? formatTime(menu.updatedAt?.toDate?.() || menu.updatedAt)
              : 'Not updated today'}
          </Text>
          <Text style={styles.infoRow}>
            Verified by: {menu?.diningUpdatedBy || 'Not verified yet'}
          </Text>
        </View>

        {expanded === null && (
          <Text style={styles.selectLabel}>Select Menu Type</Text>
        )}

        {MENU_TYPES.map(type => (
          <View key={type.key}>
            <TouchableOpacity
              style={[
                styles.menuTypeCard,
                expanded === type.key && styles.menuTypeCardActive,
              ]}
              onPress={() => toggleExpand(type.key)}
            >
              <View style={styles.menuTypeLeft}>
                <Text style={styles.menuTypeTitle}>{type.title}</Text>
                <Text style={styles.menuTypeDesc}>{type.desc}</Text>
              </View>
              <Text style={styles.menuTypeChevron}>
                {expanded === type.key ? '∧' : '∨'}
              </Text>
            </TouchableOpacity>

            {expanded === type.key && (
              type.key === 'dining'
                ? renderDiningContent()
                : renderCanteenContent()
            )}
          </View>
        ))}

        {expanded === null && (
          <Text style={styles.tapHint}>Tap any option to view menu details</Text>
        )}

      </ScrollView>

      {loading && !error && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2d5a3d" />
        </View>
      )}

      {error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorIcon}>📡</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
            <Text style={styles.retryBtnText}>আবার চেষ্টা করুন</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#edeae3' },
  scroll: { padding: 16, paddingBottom: 40 },

  infoCard: {
    backgroundColor: '#f5f2eb',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#d8d4c8',
  },
  hallName: {
    fontSize: 18, fontWeight: '800',
    color: '#1a1a1a', marginBottom: 10,
  },
  infoRow: {
    fontSize: 12, color: '#6b6b60', marginBottom: 4,
  },

  selectLabel: {
    fontSize: 14, fontWeight: '700',
    color: '#1a1a1a', marginBottom: 10,
  },

  menuTypeCard: {
    backgroundColor: '#f5f2eb',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d8d4c8',
  },
  menuTypeCardActive: {
    borderColor: '#2d5a3d',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },
  menuTypeLeft: { flex: 1 },
  menuTypeTitle: {
    fontSize: 15, fontWeight: '800',
    color: '#1a1a1a', marginBottom: 3,
  },
  menuTypeDesc: {
    fontSize: 12, color: '#6b6b60',
  },
  menuTypeChevron: {
    fontSize: 16, color: '#7a7a6e', fontWeight: '700',
  },

  expandBody: {
    backgroundColor: '#f5f2eb',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#2d5a3d',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    padding: 14,
    marginBottom: 10,
  },

  mealTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  mealTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#e8e4dc',
    borderWidth: 1,
    borderColor: '#d8d4c8',
  },
  mealTabActive: {
    backgroundColor: '#2d5a3d',
    borderColor: '#2d5a3d',
  },
  mealTabText: {
    fontSize: 12, fontWeight: '700', color: '#6b6b60',
  },
  mealTabTextActive: { color: '#fff' },

  mealTime: {
    fontSize: 12, color: '#7a7a6e', marginBottom: 10,
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e4dc',
  },
  itemLeft: { flex: 1 },
  itemName: {
    fontSize: 14, fontWeight: '700',
    color: '#1a1a1a', marginBottom: 2,
  },
  itemPrice: {
    fontSize: 11, color: '#7a7a6e',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10, fontWeight: '800',
  },
  chevron: {
    fontSize: 18, color: '#2d5a3d', fontWeight: '700',
  },

  noteBox: {
    marginTop: 10,
    backgroundColor: '#edeae3',
    borderRadius: 8,
    padding: 10,
  },
  noteLabel: {
    fontSize: 10, fontWeight: '800',
    color: '#7a7a6e', marginBottom: 3,
    letterSpacing: 0.5,
  },
  noteText: {
    fontSize: 12, color: '#6b6b60',
  },

  notUpdated: { paddingVertical: 10 },
  notUpdatedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8e4dc',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  notUpdatedText: {
    fontSize: 10, fontWeight: '800', color: '#7a7a6e',
  },
  notUpdatedDesc: {
    fontSize: 12, color: '#6b6b60', marginBottom: 10,
  },

  tapHint: {
    textAlign: 'center',
    fontSize: 12, color: '#7a7a6e',
    marginTop: 16,
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(237,234,227,0.7)',
  },

  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#edeae3',
    padding: 32,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#6b6b60',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: '#2d5a3d',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});