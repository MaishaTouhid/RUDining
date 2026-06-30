import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ActivityIndicator, Modal, TextInput, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getModeratorData } from '../data/repository';

export default function ModeratorRoleScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(null);

  // Password confirm modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingRole, setPendingRole] = useState(null);
  const [password, setPassword] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleRolePress(role) {
    setChecking(role);
    try {
      const user = auth.currentUser;

      if (user) {
        const modData = await getModeratorData(user.uid);
        if (modData && modData.role === role) {
          // Session আছে → password confirm modal দেখাও
          setChecking(null);
          setPendingRole(role);
          setPassword('');
          setShowPass(false);
          setModalVisible(true);
          return;
        }
      }

      // Session নেই → সরাসরি login screen
      router.push({ pathname: '/ModeratorLogin', params: { role } });
    } catch {
      router.push({ pathname: '/ModeratorLogin', params: { role } });
    } finally {
      setChecking(null);
    }
  }

  async function handleConfirmPassword() {
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password.');
      return;
    }
    setConfirming(true);
    try {
      const user = auth.currentUser;
      // email বের করো currentUser থেকে
      const email = user.email;

      // password দিয়ে re-authenticate করো
      await signInWithEmailAndPassword(auth, email, password);

      // সফল → modal বন্ধ করো, dashboard-এ যাও
      setModalVisible(false);
      const modData = await getModeratorData(user.uid);
      router.replace({
        pathname: '/ModeratorDashboard',
        params: {
          hallId: modData.hallId,
          hallName: modData.hallName,
          role: modData.role,
          moderatorName: modData.name || '',
        },
      });
    } catch (e) {
      Alert.alert('Wrong Password', 'Password is incorrect. Try again.');
    } finally {
      setConfirming(false);
    }
  }

  function handleModalCancel() {
    setModalVisible(false);
    setPendingRole(null);
    setPassword('');
  }

  const accentColor = pendingRole === 'dining' ? '#2d6a4f' : '#7e57c2';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>🛡️</Text>
        </View>
        <Text style={styles.title}>Moderator Login</Text>
        <Text style={styles.sub}>Select your role to continue</Text>

        {/* Dining */}
        <TouchableOpacity
          style={[styles.roleCard, styles.diningCard]}
          onPress={() => handleRolePress('dining')}
          disabled={!!checking}
          activeOpacity={0.88}
        >
          <Text style={styles.roleCardIcon}>🍽️</Text>
          <View style={styles.roleCardInfo}>
            <Text style={styles.roleCardTitle}>Dining Moderator</Text>
            <Text style={styles.roleCardDesc}>Manage breakfast, lunch & dinner menu</Text>
          </View>
          {checking === 'dining'
            ? <ActivityIndicator size="small" color="#2d6a4f" />
            : <Text style={styles.roleCardArrow}>›</Text>
          }
        </TouchableOpacity>

        {/* Canteen */}
        <TouchableOpacity
          style={[styles.roleCard, styles.canteenCard]}
          onPress={() => handleRolePress('canteen')}
          disabled={!!checking}
          activeOpacity={0.88}
        >
          <Text style={styles.roleCardIcon}>🛒</Text>
          <View style={styles.roleCardInfo}>
            <Text style={styles.roleCardTitle}>Canteen Moderator</Text>
            <Text style={styles.roleCardDesc}>Manage canteen items & availability</Text>
          </View>
          {checking === 'canteen'
            ? <ActivityIndicator size="small" color="#7e57c2" />
            : <Text style={styles.roleCardArrow}>›</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back to Home</Text>
        </TouchableOpacity>
      </View>

      {/* Password Confirm Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleModalCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {/* Header */}
            <View style={[styles.modalHeader, { backgroundColor: accentColor }]}>
              <Text style={styles.modalHeaderIcon}>
                {pendingRole === 'dining' ? '🍽️' : '🛒'}
              </Text>
              <Text style={styles.modalHeaderText}>Confirm Identity</Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalDesc}>
                Enter your password to access the dashboard.
              </Text>

              {/* Password input */}
              <View style={styles.passRow}>
                <TextInput
                  style={styles.passInput}
                  placeholder="Password"
                  placeholderTextColor="#bbb"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPass(v => !v)}
                >
                  <Text style={styles.eyeText}>{showPass ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>

              {/* Buttons */}
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: accentColor }]}
                onPress={handleConfirmPassword}
                disabled={confirming}
              >
                {confirming
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.confirmBtnText}>Confirm →</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleModalCancel}
                disabled={confirming}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f0e8' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconBox: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: '#d8ead2',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  iconText: { fontSize: 34 },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  sub: { fontSize: 14, color: '#888', marginBottom: 36 },
  roleCard: {
    width: '100%', borderRadius: 16, padding: 18, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  diningCard: { backgroundColor: '#fff', borderColor: '#2d6a4f' },
  canteenCard: { backgroundColor: '#fff', borderColor: '#7e57c2' },
  roleCardIcon: { fontSize: 26 },
  roleCardInfo: { flex: 1 },
  roleCardTitle: { fontSize: 16, fontWeight: '800', color: '#1a1a1a', marginBottom: 3 },
  roleCardDesc: { fontSize: 12, color: '#888' },
  roleCardArrow: { fontSize: 24, color: '#ccc', fontWeight: '700' },
  backBtn: { marginTop: 24, paddingVertical: 8 },
  backText: { fontSize: 14, color: '#888', fontWeight: '600' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  modalBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 18,
  },
  modalHeaderIcon: { fontSize: 22 },
  modalHeaderText: {
    fontSize: 16, fontWeight: '800', color: '#fff',
  },
  modalBody: { padding: 20 },
  modalDesc: {
    fontSize: 14, color: '#555', marginBottom: 16, lineHeight: 20,
  },
  passRow: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#e0dbd0',
    borderRadius: 12, marginBottom: 16,
    backgroundColor: '#faf8f5',
  },
  passInput: {
    flex: 1, padding: 14,
    fontSize: 15, color: '#1a1a1a',
  },
  eyeBtn: { padding: 12 },
  eyeText: { fontSize: 18 },
  confirmBtn: {
    borderRadius: 12, padding: 14,
    alignItems: 'center', marginBottom: 10,
  },
  confirmBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  cancelBtn: {
    borderRadius: 12, padding: 12,
    alignItems: 'center',
    backgroundColor: '#f0ede8',
  },
  cancelBtnText: { color: '#888', fontWeight: '700', fontSize: 14 },
});