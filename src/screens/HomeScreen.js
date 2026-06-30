import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
   ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Top Card */}
        <View style={styles.topCard}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>RU</Text>
          </View>
          <Text style={styles.appName}>HallMenu RU</Text>
          <Text style={styles.appDesc}>
            Check hall menu and food updates before you go.
          </Text>
        </View>

        {/* Choose Role */}
        <Text style={styles.sectionTitle}>Choose Role</Text>

        {/* Student */}
        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => router.push('/HallList')}
        >
          <View style={styles.roleIcon}>
            <Text style={styles.roleIconText}>𓂃✍︎📚</Text>
          </View>
          <View style={styles.roleInfo}>
            <Text style={styles.roleName}>Student</Text>
            <Text style={styles.roleDesc}>
              View todays menu and food availability of different halls.
            </Text>
          </View>
          <Text style={styles.roleArrow}>›</Text>
        </TouchableOpacity>

        {/* Moderator */}
        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => router.push('/ModeratorRole')}
        >
          <View style={[styles.roleIcon, styles.roleIconMod]}>
            <Text style={styles.roleIconText}>🛡️</Text>
          </View>
          <View style={styles.roleInfo}>
            <Text style={styles.roleName}>Moderator</Text>
            <Text style={styles.roleDesc}>
              Update daily menu, food status, and feast information.
            </Text>
          </View>
          <Text style={styles.roleArrow}>›</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>University of Rajshahi Hall Dining App</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#edeae3' },
  scroll: { padding: 20, paddingBottom: 40 },

  // Top card
  topCard: {
    backgroundColor: '#2d5a3d',
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    alignItems: 'flex-start',
  },
  logoBox: {
    width: 52, height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoText: {
    fontSize: 20, fontWeight: '800', color: '#fff',
  },
  appName: {
    fontSize: 24, fontWeight: '800',
    color: '#fff', marginBottom: 6,
  },
  appDesc: {
    fontSize: 14, color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },

  // Section
  sectionTitle: {
    fontSize: 16, fontWeight: '800',
    color: '#1a1a1a', marginBottom: 12,
  },

  // Role cards
  roleCard: {
    backgroundColor: '#f5f2eb',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d8d4c8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  roleIcon: {
    width: 48, height: 48,
    borderRadius: 14,
    backgroundColor: '#e8ede9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  roleIconMod: {
    backgroundColor: '#f0ede6',
  },
  roleIconText: { fontSize: 22 },
  roleInfo: { flex: 1 },
  roleName: {
    fontSize: 16, fontWeight: '800',
    color: '#1a1a1a', marginBottom: 4,
  },
  roleDesc: {
    fontSize: 13, color: '#6b6b60',
    lineHeight: 18,
  },
  roleArrow: {
    fontSize: 24, color: '#2d5a3d',
    fontWeight: '700', marginLeft: 8,
  },

  footer: {
    textAlign: 'center',
    fontSize: 12, color: '#7a7a6e',
    marginTop: 32,
  },
});