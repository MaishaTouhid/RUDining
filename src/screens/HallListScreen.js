import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HALLS } from "../data/halls";
import { getTodayKey } from "../data/date";
import { getMenu } from "../data/repository";

export default function HallListScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updatedHalls, setUpdatedHalls] = useState(new Set());
  const today = getTodayKey();

  useEffect(() => {
    checkUpdatedHalls();
  }, []);

  async function checkUpdatedHalls() {
    const checks = await Promise.all(
      HALLS.map(async (h) => {
        const menu = await getMenu(h.id, today);
        return menu ? h.id : null;
      }),
    );
    setUpdatedHalls(new Set(checks.filter(Boolean)));
  }

  const filtered = HALLS.filter((h) => {
    const matchType = filter === "all" || h.type === filter;
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.subHeader}>
          <Text style={styles.subTitle}>Hall List</Text>
          <Text style={styles.subDesc}>
            Search halls, filter by type, and check whether todays menu has been
            updated.
          </Text>
        </View>

        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search hall name"
            placeholderTextColor="#9a9a8e"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.filterRow}>
          {["all", "boys", "girls"].map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, filter === f && styles.filterActive]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f && styles.filterTextActive,
                ]}
              >
                {f === "all" ? "All" : f === "boys" ? "Male" : "Female"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick links */}
        <View style={styles.quickLinks}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push("/Feast")}
          >
            <Text style={styles.quickIcon}>🎉✨</Text>
            <Text style={styles.quickTitle}>Feast</Text>
            <Text style={styles.quickDesc}>See feast date, menu, and price</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push("/Notices")}
          >
            <Text style={styles.quickIcon}>🗣📢</Text>
            <Text style={styles.quickTitle}>Notice</Text>
            <Text style={styles.quickDesc}>
              View important hall dining updates
            </Text>
          </TouchableOpacity>
        </View>
        {/* Quick search link */}
        <View style={styles.quickLinks}>
          <TouchableOpacity
            style={[styles.quickCard, { flex: 1 }]}
            onPress={() => router.push('/FoodSearch')}
          >
            <Text style={styles.quickIcon}>🔍</Text>
            <Text style={styles.quickTitle}>Search Food</Text>
            <Text style={styles.quickDesc}>Find any food item across all 17 halls today</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.listTitle}>Available Halls</Text>

        <View style={styles.hallListWrap}>
          {filtered.map((item) => {
            const isUpdated = updatedHalls.has(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.hallCard}
                onPress={() =>
                  router.push({
                    pathname: "/HallDetail",
                    params: { hallId: item.id, hallName: item.name },
                  })
                }
              >
                <View style={styles.hallLeft}>
                  <Text style={styles.hallName}>{item.name}</Text>
                  <Text style={styles.hallDesc}>
                    Tap to view todays dining and canteen menu
                  </Text>
                  <Text style={styles.hallMeals}>Breakfast • Lunch • Dinner</Text>
                </View>

                <View style={styles.hallRight}>
                  <View
                    style={[
                      styles.typeBadge,
                      item.type === "girls"
                        ? styles.typeBadgeGirls
                        : styles.typeBadgeBoys,
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        item.type === "girls"
                          ? styles.typeTextGirls
                          : styles.typeTextBoys,
                      ]}
                    >
                      {item.type === "girls" ? "FEMALE" : "MALE"}
                    </Text>
                  </View>

                  {isUpdated && (
                    <View style={styles.updatedBadge}>
                      <Text style={styles.updatedText}>Updated today</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#edeae3" },
  scrollContent: { paddingBottom: 30 },
  subHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  subTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  subDesc: { fontSize: 13, color: "#6b6b60", lineHeight: 18 },
  searchBox: { marginHorizontal: 16, marginBottom: 10 },
  searchInput: {
    backgroundColor: "#f5f2eb",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#d8d4c8",
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#f5f2eb",
    borderWidth: 1,
    borderColor: "#d8d4c8",
  },
  filterActive: { backgroundColor: "#2d5a3d", borderColor: "#2d5a3d" },
  filterText: { fontSize: 13, fontWeight: "600", color: "#6b6b60" },
  filterTextActive: { color: "#fff" },
  quickLinks: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  quickCard: {
    flex: 1,
    backgroundColor: "#f5f2eb",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#d8d4c8",
  },
  quickIcon: { fontSize: 20, marginBottom: 6 },
  quickTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  quickDesc: { fontSize: 11, color: "#7a7a6e", lineHeight: 15 },
  listTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1a1a1a",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  hallListWrap: { paddingHorizontal: 16 },
  hallCard: {
    backgroundColor: "#f5f2eb",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#d8d4c8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  hallLeft: { flex: 1 },
  hallName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  hallDesc: { fontSize: 12, color: "#6b6b60", marginBottom: 6, lineHeight: 16 },
  hallMeals: { fontSize: 11, color: "#7a7a6e" },
  hallRight: { alignItems: "flex-end", gap: 6 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeBadgeBoys: { backgroundColor: "#e8ede9" },
  typeBadgeGirls: { backgroundColor: "#f0ede6" },
  typeText: { fontSize: 10, fontWeight: "800" },
  typeTextBoys: { color: "#2d5a3d" },
  typeTextGirls: { color: "#8b6a4f" },
  updatedBadge: {
    backgroundColor: "#d4e6d8",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  updatedText: { fontSize: 10, fontWeight: "700", color: "#2d5a3d" },
});