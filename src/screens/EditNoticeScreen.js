import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getNotices, updateNotice, deleteNotice } from '../data/repository';

const NOTICE_TYPES = ['delay', 'shortage', 'closure', 'update', 'other'];

export default function EditNoticeScreen() {
  const router = useRouter();
  const { hallId, hallName, role, moderatorName } = useLocalSearchParams();

  // 'list' = showing all notices as cards, 'edit' = showing the form for one notice
  const [mode, setMode] = useState('list');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [noticeList, setNoticeList] = useState([]);

  // Fields for whichever notice is currently being edited
  const [noticeId, setNoticeId] = useState(null);
  const [type, setType] = useState('delay');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [expiresIn, setExpiresIn] = useState('6');

  useEffect(() => { fetchAllNotices(); }, []);

  async function fetchAllNotices() {
    setLoading(true);
    try {
      const all = await getNotices(String(role));
      const hallNotices = all.filter(n => n.hallId === String(hallId));
      // getNotices already sorts newest first
      setNoticeList(hallNotices);
    } catch (e) {
      Alert.alert('Error', 'Could not load notices.');
    }
    setLoading(false);
  }

  function openEdit(notice) {
    setNoticeId(notice.id);
    setType(notice.noticeType || 'delay');
    setTitle(notice.title || '');
    setMessage(notice.message || '');
    setExpiresIn(String(notice.expiresIn || 6));
    setMode('edit');
  }

  function backToList() {
    setMode('list');
    setNoticeId(null);
  }

  async function handleSave() {
    if (!message.trim()) { Alert.alert('Error', 'Please enter a message.'); return; }
    setSaving(true);
    try {
      await updateNotice(String(noticeId), {
        noticeType: type, title: title.trim(),
        message: message.trim(), expiresIn: Number(expiresIn) || 6,
      });
      Alert.alert('✅ Updated!', 'Notice updated successfully.', [
        { text: 'OK', onPress: async () => { await fetchAllNotices(); backToList(); } },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not save changes. Try again.');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete(notice) {
    Alert.alert('Delete Notice', `Delete "${notice.title || 'this notice'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          setDeletingId(notice.id);
          try {
            await deleteNotice(String(notice.id));
            setNoticeList(prev => prev.filter(n => n.id !== notice.id));
            if (noticeId === notice.id) backToList();
          } catch (e) {
            Alert.alert('Error', 'Could not delete notice. Try again.');
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
          <Text style={styles.pageTitle}>Notices</Text>
          <Text style={styles.pageSub}>Hall: {hallId} • {role === 'dining' ? 'Dining' : 'Canteen'}</Text>

          {noticeList.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No notices posted yet for this hall.</Text>
            </View>
          ) : (
            noticeList.map(n => (
              <View key={n.id} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle}>{n.title || 'Untitled notice'}</Text>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{(n.noticeType || 'other').toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.cardMsg} numberOfLines={2}>{n.message}</Text>
                <Text style={styles.cardExpiry}>Expires in {n.expiresIn || 6}h</Text>
                <View style={styles.cardBtnRow}>
                  <TouchableOpacity style={styles.cardEditBtn} onPress={() => openEdit(n)}>
                    <Text style={styles.cardEditText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cardDeleteBtn}
                    onPress={() => confirmDelete(n)}
                    disabled={deletingId === n.id}
                  >
                    {deletingId === n.id
                      ? <ActivityIndicator color="#c0392b" size="small" />
                      : <Text style={styles.cardDeleteText}>Delete</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            ))
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

        <Text style={styles.pageTitle}>Edit Notice</Text>
        <Text style={styles.pageSub}>Hall: {hallId} • {role === 'dining' ? 'Dining' : 'Canteen'}</Text>

        <Text style={styles.label}>Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
          {NOTICE_TYPES.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.typeChip, type === t && styles.typeChipActive]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Title</Text>
        <TextInput style={styles.input} placeholder="Enter notice title" placeholderTextColor="#9a9a8e" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Message</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Write your notice here..." placeholderTextColor="#9a9a8e" value={message} onChangeText={setMessage} multiline numberOfLines={4} />

        <Text style={styles.label}>Expires in (hours)</Text>
        <TextInput style={styles.input} value={expiresIn} onChangeText={setExpiresIn} keyboardType="numeric" placeholder="6" placeholderTextColor="#9a9a8e" />

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => confirmDelete({ id: noticeId, title })}
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
  typeScroll: { marginBottom: 16 },
  typeChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#f5f2eb',
    borderWidth: 1, borderColor: '#d8d4c8', marginRight: 8,
  },
  typeChipActive: { backgroundColor: '#e8ede9', borderColor: '#2d5a3d' },
  typeChipText: { fontSize: 13, fontWeight: '600', color: '#6b6b60' },
  typeChipTextActive: { color: '#2d5a3d' },
  input: {
    backgroundColor: '#f5f2eb', borderRadius: 12,
    padding: 14, fontSize: 14, color: '#1a1a1a',
    borderWidth: 1, borderColor: '#d8d4c8', marginBottom: 16,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
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
  typeBadge: { backgroundColor: '#f5ecd4', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  typeBadgeText: { fontSize: 10, fontWeight: '800', color: '#8b6a2f' },
  cardMsg: { fontSize: 13, color: '#4b5563', marginBottom: 8, lineHeight: 18 },
  cardExpiry: { fontSize: 11, color: '#7a7a6e', marginBottom: 12 },
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