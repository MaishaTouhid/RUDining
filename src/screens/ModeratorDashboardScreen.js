import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getTodayKey } from '../data/date';

export default function ModeratorDashboardScreen() {
  const router = useRouter();
  const { hallId, hallName, role, moderatorName } = useLocalSearchParams();
  const today = getTodayKey();
  const isDining = role === 'dining';
  const accentColor = isDining ? '#2d6a4f' : '#7e57c2';

  const DINING_ITEMS = [
    { label: 'Quick Status (Item-wise)', desc: 'Quickly update food availability status', icon: '⚡', route: '/QuickStatus' },
    { label: 'Update Dining Menu', desc: "Add or edit today's full dining menu", icon: '🍽️', route: '/MenuEditor' },
    { label: 'Available Food Menu', desc: 'Live view — tap "Serve" to reduce count', icon: '🥘', route: '/AvailableFood' },
    { label: 'Post Notice', desc: 'Announce delays, changes or updates', icon: '📢', route: '/NoticeEditor' },
    { label: 'Add Feast', desc: 'Schedule a special feast event', icon: '🎉', route: '/FeastEditor' },
    { label: 'Daily Reset', desc: 'Duplicate yesterday or clear for today', icon: '🔄', route: '/DailyReset' },

  ];

  const CANTEEN_ITEMS = [
    { label: 'Quick Canteen Status', desc: 'Quickly update canteen item availability', icon: '⚡', route: '/CanteenQuickStatus' },
    { label: 'Update Canteen Menu', desc: "Add or edit today's canteen items", icon: '🍛', route: '/CanteenMenuEditor' },
    { label: 'Available Food Menu', desc: 'Live view — tap "Serve" to reduce count', icon: '🥘', route: '/AvailableFood' },
    { label: 'Post Notice', desc: 'Announce delays, changes or updates', icon: '📢', route: '/NoticeEditor' },
    { label: 'Add Feast', desc: 'Schedule a special canteen feast', icon: '🎉', route: '/FeastEditor' },
    { label: 'Daily Reset', desc: 'Duplicate yesterday or clear for today', icon: '🔄', route: '/DailyReset' },

  ];

  const MENU_ITEMS = isDining ? DINING_ITEMS : CANTEEN_ITEMS;

  function navigate(route) {
    router.push({ pathname: route, params: { hallId, hallName, role, moderatorName } });
  }

  function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive',
        onPress: async () => {
          try { await signOut(auth); } catch {}
          router.replace('/Home');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.topCard, { backgroundColor: accentColor }]}>
          <View style={styles.topCardRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.hallName} numberOfLines={2}>{hallName}</Text>
              <Text style={styles.roleText}>
                {hallId} • {isDining ? '🍽️ Dining' : '🛒 Canteen'} Moderator
              </Text>
              {moderatorName ? (
                <View style={styles.modBadge}>
                  <Text style={styles.modBadgeText}>👤 {moderatorName}</Text>
                </View>
              ) : null}
              <Text style={styles.dateText}>📅 {today}</Text>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutBtnText}>⏻ Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {MENU_ITEMS.map((item, idx) => (
          <Pressable
            key={idx}
            style={({ pressed }) => [
              styles.menuCard,
              item.primary && { backgroundColor: accentColor, borderColor: accentColor },
              pressed && {
                backgroundColor: accentColor + '18',
                borderColor: accentColor,
              },
            ]}
            onPress={() => navigate(item.route)}
          >
            <View style={[styles.iconBox, item.primary && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={[styles.menuLabel, item.primary && { color: '#fff' }]}>{item.label}</Text>
              <Text style={[styles.menuDesc, item.primary && { color: 'rgba(255,255,255,0.8)' }]}>{item.desc}</Text>
            </View>
            <Text style={[styles.menuArrow, item.primary && { color: 'rgba(255,255,255,0.6)' }]}>›</Text>
          </Pressable>
        ))}

        <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/Home')}>
          <Text style={styles.homeBtnText}>🏠 Back to Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutLink}>
          <Text style={styles.logoutLinkText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f0e8' },
  scroll: { padding: 16, paddingBottom: 40 },
  topCard: { borderRadius: 18, padding: 20, marginBottom: 20 },
  topCardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  hallName: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4, lineHeight: 28 },
  roleText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 10 },
  modBadge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 6,
  },
  modBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  dateText: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6, marginLeft: 12,
  },
  logoutBtnText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  menuCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e8e0d5',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
    overflow: 'hidden',
  },
  iconBox: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#f0ede8',
    alignItems: 'center', justifyContent: 'center', marginRight: 14, flexShrink: 0,
  },
  menuIcon: { fontSize: 20 },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '800', color: '#1a1a1a', marginBottom: 2 },
  menuDesc: { fontSize: 12, color: '#888' },
  menuArrow: { fontSize: 22, color: '#ccc', fontWeight: '700' },
  homeBtn: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    alignItems: 'center', marginTop: 8, marginBottom: 12, borderWidth: 1, borderColor: '#e8e0d5',
  },
  homeBtnText: { fontSize: 15, fontWeight: '700', color: '#555' },
  logoutLink: { alignItems: 'center', paddingVertical: 4 },
  logoutLinkText: { fontSize: 14, color: '#e53935', fontWeight: '600' },
});


