import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getModeratorData } from '../data/repository';

export default function ModeratorLoginScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const roleLabel = role === 'dining' ? 'Dining' : 'Canteen';
  const roleColor = role === 'dining' ? '#2d6a4f' : '#7e57c2';

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing Info', 'Please enter your email/username and password.');
      return;
    }
    setLoading(true);
    try {
      const fullEmail = email.includes('@') ? email : `${email}@rudining.com`;
      const cred = await signInWithEmailAndPassword(auth, fullEmail, password);
      const modData = await getModeratorData(cred.user.uid);

      if (!modData) {
        Alert.alert('Error', 'Moderator account not found.');
        setLoading(false);
        return;
      }
      if (modData.role !== role) {
        Alert.alert('Wrong Role', `This account is not a ${roleLabel} moderator.`);
        setLoading(false);
        return;
      }

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
      Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header badge */}
          <View style={[styles.roleBadge, { backgroundColor: roleColor }]}>
            <Text style={styles.roleBadgeText}>{role === 'dining' ? '🍽️' : '🛒'} {roleLabel.toUpperCase()} MODERATOR</Text>
          </View>

          <Text style={styles.title}>{roleLabel} Login</Text>
          <Text style={styles.subtitle}>Use your assigned credentials to access the dashboard.</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email or Username</Text>
            <TextInput
              style={styles.input}
              placeholder="dining.hall_id  or email"
              placeholderTextColor="#bbb"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                placeholder="••••••••"
                placeholderTextColor="#bbb"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(v => !v)}>
                <Text style={styles.eyeText}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

           {/* <View style={styles.hintBox}>
              <Text style={styles.hintText}>
                💡 Format: <Text style={{ fontWeight: '700' }}>{roleLabel.toLowerCase()}.hall_id@rudining.com</Text>
              </Text>
            </View> */}

            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: roleColor }, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.loginBtnText}>Login →</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
              <Text style={styles.backLinkText}>← Back to role select</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f0e8' },
  scroll: { padding: 24, paddingBottom: 40 },
  roleBadge: {
    alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 14,
    paddingVertical: 6, marginBottom: 20,
  },
  roleBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
  title: { fontSize: 28, fontWeight: '800', color: '#1a1a1a', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 32, lineHeight: 20 },
  form: {},
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 8 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    fontSize: 15, color: '#1a1a1a', marginBottom: 16,
    borderWidth: 1.5, borderColor: '#e8e0d5',
  },
  passRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  eyeBtn: { padding: 10 },
  eyeText: { fontSize: 18 },
  hintBox: {
    backgroundColor: '#f0f9f4', borderRadius: 10, padding: 12,
    marginBottom: 24, borderWidth: 1, borderColor: '#c8e6c9',
  },
  hintText: { fontSize: 12, color: '#555', lineHeight: 18 },
  loginBtn: {
    borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 16,
  },
  loginBtnDisabled: { opacity: 0.7 },
  loginBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  backLink: { alignItems: 'center', paddingVertical: 8 },
  backLinkText: { fontSize: 14, color: '#888', fontWeight: '600' },
});
