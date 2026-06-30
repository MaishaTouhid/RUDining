import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function SuccessScreen() {
  const router = useRouter();
  const { hallId, hallName, role, moderatorName } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>✓</Text>
        </View>

        <Text style={styles.title}>Success</Text>
        <Text style={styles.desc}>
          Menu saved successfully. Students can now see the updated information.
        </Text>

        <TouchableOpacity
          style={styles.dashBtn}
          onPress={() => router.replace({
            pathname: '/ModeratorDashboard',
            params: { hallId, hallName, role, moderatorName },
          })}
        >
          <Text style={styles.dashBtnText}>Back to Dashboard</Text>
        </TouchableOpacity>

        {/*<TouchableOpacity style={styles.editBtn} onPress={() => router.back()}>
          <Text style={styles.editBtnText}>Edit Again</Text>
        </TouchableOpacity> */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#edeae3' },
  content: {
    flex: 1, alignItems: 'center',
    justifyContent: 'center', padding: 32,
  },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#2d5a3d',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#2d5a3d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  iconText: { fontSize: 32, color: '#fff', fontWeight: '900' },
  title: { fontSize: 26, fontWeight: '900', color: '#1a1a1a', marginBottom: 10 },
  desc: {
    fontSize: 14, color: '#6b6b60',
    textAlign: 'center', lineHeight: 22, marginBottom: 36,
  },
  dashBtn: {
    width: '100%', backgroundColor: '#2d5a3d',
    borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12,
  },
  dashBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  editBtn: {
    width: '100%', backgroundColor: '#f5f2eb',
    borderRadius: 14, padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#d8d4c8',
  },
  editBtnText: { color: '#3a3a30', fontWeight: '700', fontSize: 15 },
});
