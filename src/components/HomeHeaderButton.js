import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeHeaderButton() {
  const router = useRouter();
  return (
    <TouchableOpacity
     // onPress={() => router.replace('/Home')}
      onPress={() => router.replace('/HallList')}
      style={styles.btn}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text style={styles.icon}>🏠</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { paddingHorizontal: 14, paddingVertical: 6 },
  icon: { fontSize: 20 },
});