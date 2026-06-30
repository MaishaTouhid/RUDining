import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { getTodayKey } from "../data/date";

export default function FoodDetailScreen() {
  const {
    hallId,
    itemName,
    itemPrice,
    itemQty,
    itemStatus,
    mealType,
    itemEmoji,
  } = useLocalSearchParams();
  const router = useRouter();
  const today = getTodayKey();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "foodReviews"),
      where("hallId", "==", String(hallId)),
      where("dateKey", "==", today),
      where("itemName", "==", String(itemName)),
      // orderBy('createdAt', 'desc')
    );

    /* const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setReviews(data);
      setLoadingReviews(false);
    }, () => setLoadingReviews(false));
    return () => unsub();
  }, []);
  
   const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null; */

    const unsub = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const aTime = a.createdAt?.seconds || 0;
            const bTime = b.createdAt?.seconds || 0;
            return bTime - aTime;
          });
        setReviews(data);
        setLoadingReviews(false);
      },
      () => setLoadingReviews(false),
    );

    return () => unsub();
  }, []);

  // আগে: প্রতিবার re-render এ calculate হতো
  // এখন: reviews না বদলালে আর calculate হবে না — useMemo cache করে রাখে
  const avgRating = useMemo(() => {
    if (!reviews.length) return null;
    return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(
      1,
    );
  }, [reviews]);

  const submitReview = async () => {
    if (rating === 0) {
      Alert.alert("Select a Rating", "Please select a star rating first.");
      return;
    }
    if (!comment.trim()) {
      Alert.alert("Add a Comment", "Please write a comment.");
      return;
    }
    try {
      await addDoc(collection(db, "foodReviews"), {
        hallId: String(hallId),
        dateKey: today,
        itemName: String(itemName),
        mealType: String(mealType),
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
      });
      setComment("");
      setRating(0);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2500);
    } catch (e) {
      Alert.alert("Error", "Could not submit review. Please try again.");
    }
  };

  const qty = parseInt(itemQty) || 0;
  const qtyColor = qty > 30 ? "#2e7d32" : qty > 10 ? "#f57f17" : "#e53935";
  const qtyBg = qty > 30 ? "#e8f5e9" : qty > 10 ? "#fff8e1" : "#ffebee";

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.emojiBox}>
                <Text style={styles.emoji}>{itemEmoji || "🍽️"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.foodName}>{itemName}</Text>
                <Text style={styles.foodMeta}>
                  {itemPrice ? `৳${itemPrice}` : ""} •{" "}
                  {String(mealType).charAt(0).toUpperCase() +
                    String(mealType).slice(1)}
                </Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.qtyBadge, { backgroundColor: qtyBg }]}>
                    <Text style={[styles.qtyText, { color: qtyColor }]}>
                      {qty > 0 ? `Remaining: ${qty}` : "FINISHED"}
                    </Text>
                  </View>
                  {avgRating && (
                    <View style={styles.avgBadge}>
                      <Text style={styles.avgText}>
                        ⭐ {avgRating} ({reviews.length})
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>⭐ Rate & Review</Text>

            <Text style={styles.label}>Your Rating</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((val) => (
                <TouchableOpacity key={val} onPress={() => setRating(val)}>
                  <Text
                    style={[
                      styles.star,
                      { color: val <= rating ? "#f59e0b" : "#ccc" },
                    ]}
                  >
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Comment</Text>
            <TextInput
              style={styles.textInput}
              value={comment}
              onChangeText={setComment}
              placeholder="Share your thoughts about this food..."
              placeholderTextColor="#aaa"
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={submitReview}>
              <Text style={styles.submitBtnText}>Submit Review</Text>
            </TouchableOpacity>

            {submitted && (
              <Text style={styles.successMsg}>
                Review submitted successfully!
              </Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>All Reviews</Text>

          {loadingReviews ? (
            <ActivityIndicator
              size="small"
              color="#2d5a3d"
              style={{ marginTop: 10 }}
            />
          ) : reviews.length === 0 ? (
            <Text style={styles.noReviews}>No reviews yet. Be the first!</Text>
          ) : (
            reviews.map((r) => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>
                    {r.reviewerName || "Student"}
                  </Text>
                  <Text style={styles.reviewDate}>
                    {r.createdAt?.toDate
                      ? r.createdAt.toDate().toISOString().split("T")[0]
                      : ""}
                  </Text>
                </View>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Text
                      key={i}
                      style={{
                        color: i <= r.rating ? "#f59e0b" : "#ddd",
                        fontSize: 14,
                      }}
                    >
                      ★
                    </Text>
                  ))}
                </View>
                <Text style={styles.reviewComment}>{r.comment}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#edeae3" },
  scroll: { padding: 16, paddingBottom: 40 },
  infoCard: {
    backgroundColor: "#f5f2eb",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#d8d4c8",
  },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  emojiBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#e8e4dc",
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 30 },
  foodName: { fontSize: 18, fontWeight: "800", color: "#1a1a1a" },
  foodMeta: { fontSize: 12, color: "#7a7a6e", marginTop: 3 },
  badgeRow: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
  qtyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  qtyText: { fontSize: 11, fontWeight: "800" },
  avgBadge: {
    backgroundColor: "#fff8e1",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  avgText: { fontSize: 11, fontWeight: "800", color: "#f57f17" },
  card: {
    backgroundColor: "#f5f2eb",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#d8d4c8",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 14,
  },
  label: { fontSize: 12, fontWeight: "700", color: "#6b6b60", marginBottom: 8 },
  starsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  star: { fontSize: 32 },
  textInput: {
    borderWidth: 1.5,
    borderColor: "#d8d4c8",
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: "#333",
    height: 80,
    textAlignVertical: "top",
    backgroundColor: "white",
    marginBottom: 14,
  },
  submitBtn: {
    backgroundColor: "#2d5a3d",
    borderRadius: 14,
    padding: 15,
    alignItems: "center",
  },
  submitBtnText: { color: "white", fontSize: 15, fontWeight: "800" },
  successMsg: {
    textAlign: "center",
    color: "#2d5a3d",
    fontWeight: "700",
    marginTop: 10,
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 10,
  },
  noReviews: { textAlign: "center", padding: 20, color: "#aaa", fontSize: 13 },
  reviewCard: {
    backgroundColor: "#f5f2eb",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#d8d4c8",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  reviewerName: { fontSize: 13, fontWeight: "800", color: "#1a1a1a" },
  reviewDate: { fontSize: 11, color: "#aaa" },
  reviewComment: { fontSize: 13, color: "#444", lineHeight: 20, marginTop: 4 },
});
