import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getFeasts, updateFeast, deleteFeast } from '../data/repository';
import { getTodayKey } from '../data/date';

export default function EditFeastScreen() {
  const router = useRouter();
  const { hallId, hallName, role, moderatorName } = useLocalSearchParams();

  // 'list' = showing all feasts as cards, 'edit' = showing the form for one feast
  const [mode, setMode] = useState('list');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [feastList, setFeastList] = useState([]);

  // Fields for whichever feast is currently being edited
  const [feastId, setFeastId] = useState(null);
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [timeRange, setTimeRange] = useState('');
  const [menu, setMenu] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => { fetchAllFeasts(); }, []);

  async function fetchAllFeasts() {
    setLoading(true);
    try {
      const all = await getFeasts(String(role));
      const hallFeasts = all.filter(f => f.hallId === String(hallId));
      const today = getTodayKey();
      // Upcoming/today feasts first (soonest first), expired feasts after (most recently expired first)
      const upcoming = hallFeasts
        .filter(f => f.date >= today)
        .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
      const expired = hallFeasts
        .filter(f => f.date < today)
        .sort((a, b) => (a.date > b.date ? -1 : a.date < b.date ? 1 : 0));
      setFeastList([...upcoming, ...expired]);
    } catch (e) {
      Alert.alert('Error', 'Could not load feasts.');
    }
    setLoading(false);
  }

  function openEdit(feast) {
    setFeastId(feast.id);
    setDate(feast.date || '');
    setTitle(feast.title || '');
    setTimeRange(feast.timeRange || '');
    setMenu(Array.isArray(feast.menu) ? feast.menu.join(', ') : (feast.menu || ''));
    setPrice(String(feast.price || ''));
    setMode('edit');
  }

  function backToList() {
    setMode('list');
    setFeastId(null);
  }

  async function handleSave() {
    if (!date || !title) { Alert.alert('Error', 'Please enter date and title.'); return; }
    setSaving(true);
    try {
      const menuItems = menu.split(',').map(s => s.trim()).filter(Boolean);
      await updateFeast(String(feastId), {
        date, title: title.trim(), timeRange: timeRange.trim(),
        menu: menuItems, price: Number(price) || 0,
      });
      Alert.alert('✅ Updated!', 'Feast updated successfully.', [
        { text: 'OK', onPress: async () => { await fetchAllFeasts(); backToList(); } },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not save changes. Try again.');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(feast) {
    Alert.alert('Delete Feast', `Delete "${feast.title || 'this feast'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          setDeletingId(feast.id);
          try {
            await deleteFeast(String(feast.id));
            setFeastList(prev => prev.filter(f => f.id !== feast.id));
            if (feastId === feast.id) backToList();
          } catch (e) {
            Alert.alert('Error', 'Could not delete feast. Try again.');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color="#2d5a3d" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  // ── LIST MODE ──────────────────────────────────────────────
  if (mode === 'list') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.pageTitle}>Feasts</Text>
          <Text style={styles.pageSub}>Hall: {hallId} • {role === 'dining' ? 'Dining' : 'Canteen'}</Text>

          {feastList.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No feasts added yet for this hall.</Text>
            </View>
          ) : (
            feastList.map(f => {
              const isExpired = f.date < getTodayKey();
              return (
              <View key={f.id} style={[styles.card, isExpired && styles.cardExpired]}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle}>{f.title || 'Untitled feast'}</Text>
                  <View style={[styles.dateBadge, isExpired && styles.expiredBadge]}>
                    <Text style={[styles.dateBadgeText, isExpired && styles.expiredBadgeText]}>
                      {isExpired ? 'Expired' : f.date}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardMenu}>
                  {Array.isArray(f.menu) ? f.menu.join(', ') : (f.menu || 'No menu listed')}
                  {f.price ? ` • ৳${f.price}` : ''}
                </Text>
                <View style={styles.cardBtnRow}>
                  <TouchableOpacity style={styles.cardEditBtn} onPress={() => openEdit(f)}>
                    <Text style={styles.cardEditText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cardDeleteBtn}
                    onPress={() => confirmDelete(f)}
                    disabled={deletingId === f.id}
                  >
                    {deletingId === f.id
                      ? <ActivityIndicator color="#c0392b" size="small" />
                      : <Text style={styles.cardDeleteText}>Delete</Text>}
                  </TouchableOpacity>
                </View>
              </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── EDIT MODE ──────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={backToList} style={styles.backLink}>
          <Text style={styles.backLinkText}>← Back to list</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Edit Feast</Text>
        <Text style={styles.pageSub}>Hall: {hallId} • {role === 'dining' ? 'Dining' : 'Canteen'}</Text>

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2026-03-20" placeholderTextColor="#9a9a8e" />

        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Eid Special Feast" placeholderTextColor="#9a9a8e" />

        <Text style={styles.label}>Time Range</Text>
        <TextInput style={styles.input} value={timeRange} onChangeText={setTimeRange} placeholder="e.g. 8:00 PM - 9:00 PM" placeholderTextColor="#9a9a8e" />

        <Text style={styles.label}>Menu (comma separated)</Text>
        <TextInput style={[styles.input, styles.textArea]} value={menu} onChangeText={setMenu} placeholder="Polao, Roast, Beef curry, Salad..." placeholderTextColor="#9a9a8e" multiline />

        <Text style={styles.label}>Price (৳)</Text>
        <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="120" placeholderTextColor="#9a9a8e" keyboardType="numeric" />

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => confirmDelete({ id: feastId, title })}
            disabled={saving}
          >
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#edeae3' },
  scroll: { padding: 20, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: '900', color: '#1a1a1a', marginBottom: 4 },
  pageSub: { fontSize: 12, color: '#6b6b60', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#3a3a30', marginBottom: 8 },
  input: {
    backgroundColor: '#f5f2eb', borderRadius: 12,
    padding: 14, fontSize: 14, color: '#1a1a1a',
    borderWidth: 1, borderColor: '#d8d4c8', marginBottom: 16,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  deleteBtn: {
    flex: 1, borderRadius: 14, padding: 16, alignItems: 'center',
    backgroundColor: '#f5f2eb', borderWidth: 1.5, borderColor: '#e8b4b0',
  },
  deleteBtnText: { color: '#c0392b', fontWeight: '800', fontSize: 15 },
  saveBtn: { flex: 1, backgroundColor: '#2d5a3d', borderRadius: 14, padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  backLink: { marginBottom: 12 },
  backLinkText: { fontSize: 14, color: '#2d5a3d', fontWeight: '700' },

  emptyBox: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 13, color: '#7a7a6e', textAlign: 'center' },

  card: {
    backgroundColor: '#f5f2eb', borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: '#d8d4c8',
  },
  cardTopRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 6, gap: 8,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#1a1a1a', flex: 1 },
  cardExpired: { opacity: 0.65 },
  dateBadge: { backgroundColor: '#e8ede9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  dateBadgeText: { fontSize: 11, fontWeight: '700', color: '#2d5a3d' },
  expiredBadge: { backgroundColor: '#e8e4dc' },
  expiredBadgeText: { color: '#7a7a6e' },
  cardMenu: { fontSize: 12, color: '#6b6b60', marginBottom: 12, lineHeight: 17 },
  cardBtnRow: { flexDirection: 'row', gap: 8 },
  cardEditBtn: {
    flex: 1, backgroundColor: '#e8ede9', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  cardEditText: { fontSize: 13, fontWeight: '700', color: '#2d5a3d' },
  cardDeleteBtn: {
    flex: 1, backgroundColor: '#f5e0de', borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  cardDeleteText: { fontSize: 13, fontWeight: '700', color: '#c0392b' },
});